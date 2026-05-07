import React, { useEffect, useState } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";

const ActiveBill = () => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRequested, setIsRequested] = useState(false);
  const navigate = useNavigate();
  
  // Get session info
  const activeTable = JSON.parse(localStorage.getItem("activeTable"));
  const user = JSON.parse(localStorage.getItem("cafeUser"));

  useEffect(() => {
    const fetchActiveBill = async () => {
      if (!activeTable) return;
      try {
        // Fetch the active session bill
        const res = await API.get(`/orders/active-table/${activeTable._id}`);
        setOrder(res.data);
      } catch (err) {
        console.error("No active bill found");
      } finally {
        setLoading(false);
      }
    };

    fetchActiveBill();

    // Socket listener: If Admin releases table, clear user session automatically
    const socket = io("http://localhost:5000");
    socket.on("tableStatusUpdate", (data) => {
      if (data._id === activeTable?._id && data.status === "available") {
        localStorage.removeItem("activeTable");
        navigate("/order-history");
        window.location.reload();
      }
    });

    return () => socket.disconnect();
  }, [activeTable, navigate]);

  const handleRequestCheckout = async () => {
    try {
      // 1. Send checkout request to Admin (Updates order status to 'bill_requested')
      await API.patch(`/orders/${order._id}/status`, { status: "bill_requested" });
      
      // 2. You can also trigger a notification for the admin panel via Socket here
      
      setIsRequested(true);
      alert("Checkout request sent! Please proceed to the counter for payment.");
    } catch (err) {
      alert("Error sending request. Please call a waiter.");
    }
  };

  if (loading) return <div className="luxury-loader">Generating Bill...</div>;
  if (!order) return (
    <div className="container gold-text mt-5 text-center">
      <h3>No active orders found.</h3>
      <button className="gold-button mt-3" onClick={() => navigate("/menu")}>Back to Menu</button>
    </div>
  );

  return (
    <div className="active-bill-page luxury-bg container py-5">
      <div className="bill-card shadow-lg p-4" style={{ background: '#111', borderRadius: '15px', border: '1px solid #d4af37' }}>
        <div className="text-center mb-4">
          <h2 className="gold-text">Table {activeTable.tableNumber} Bill</h2>
          <p className="text-muted small">Session ID: {order._id.slice(-6).toUpperCase()}</p>
        </div>

        <div className="bill-items border-bottom border-secondary mb-3">
          {order.items.map((item, i) => (
            <div key={i} className="bill-row d-flex justify-content-between py-2 text-white">
              <span>{item.name} <small className="text-muted">x{item.quantity}</small></span>
              <span className="gold-text">Rs. {item.price * item.quantity}</span>
            </div>
          ))}
        </div>

        <div className="bill-total d-flex justify-content-between align-items-center mb-4">
          <h4 className="text-white">Grand Total</h4>
          <h3 className="gold-text">Rs. {order.totalPrice}</h3>
        </div>

        {isRequested ? (
          <div className="alert alert-warning bg-transparent border-warning gold-text text-center">
            ⏳ Waiting for counter to process payment...
          </div>
        ) : (
          <div className="action-btns d-grid gap-2">
            <button className="gold-button btn-lg" onClick={handleRequestCheckout}>
              💳 REQUEST CHECKOUT & EXIT
            </button>
            <button className="btn btn-outline-secondary text-white border-secondary" onClick={() => navigate("/menu")}>
              🍴 ADD MORE ITEMS
            </button>
          </div>
        )}
      </div>

      <div className="text-center mt-4">
        <small className="text-muted">Please show this screen at the counter for quick payment.</small>
      </div>
    </div>
  );
};

export default ActiveBill;