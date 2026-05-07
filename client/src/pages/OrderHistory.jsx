import React, { useEffect, useState, useMemo } from "react";
import API from "../api/axios";
import "../styles/OrderHistory.css"; 
import io from "socket.io-client";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Receipt, Bell, CheckCircle, Clock, ShieldCheck } from "lucide-react"; 
import PaymentQR from "../assets/qr-code.png";

// Initialize socket
const socket = io("http://localhost:5000");

export default function OrderHistory({ user }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeBill, setActiveBill] = useState(null);
  const [showPaymentQR, setShowPaymentQR] = useState(false);

  // GENERATE UNIQUE 4-DIGIT CODE
  // This code changes only when a new bill is received
  const verificationCode = useMemo(() => {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }, [activeBill]);

  const fetchOrders = async () => {
    if (!user?._id) return;
    try {
      const res = await API.get(`/orders/user/${user._id}`);
      setOrders(res.data || []);
    } catch (err) { setError("Unable to retrieve your orders."); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchOrders();

    if (user?._id) {
      socket.emit("join-user-room", user._id);
      
      socket.on("order-status-updated", (data) => {
        setOrders((prev) => prev.map((o) => o._id === data.orderId ? { ...o, status: data.status } : o));
      });

      socket.on("receive_bill", (data) => {
        setActiveBill(data);
        new Audio("https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3").play().catch(() => {});
      });

      socket.on("payment_confirmed", (data) => {
        setActiveBill(null);
        setShowPaymentQR(false);
        fetchOrders();
        alert("✨ Payment Verified! Thank you for dining with us.");
      });

      return () => {
        socket.off("order-status-updated");
        socket.off("receive_bill");
        socket.off("payment_confirmed");
      };
    }
  }, [user?._id]);

  const handleRequestBill = async (orderId, tableId) => {
    try {
      const tId = typeof tableId === 'object' ? tableId._id : tableId;
      await Promise.all([
        API.patch(`/orders/${orderId}/status`, { status: "bill_requested" }),
        API.patch(`/tables/${tId}/status`, { status: "bill_requested" })
      ]);
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: "bill_requested" } : o));
    } catch (err) { alert("Error requesting bill."); }
  };

  const downloadReceipt = (order) => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.setTextColor(212, 175, 55); 
    doc.text("GARDEN & CAFE", 105, 20, { align: "center" });
    autoTable(doc, {
      startY: 55,
      head: [["Item Name", "Price", "Qty", "Subtotal"]],
      body: order.items.map(item => [item.name, `Rs. ${item.price}`, item.quantity, `Rs. ${(item.price * item.quantity).toFixed(2)}`]),
      theme: 'grid',
      headStyles: { fillColor: [212, 175, 55], textColor: [0, 0, 0] } 
    });
    doc.save(`Receipt_${order._id.slice(-6)}.pdf`);
  };

  if (loading) return <div className="luxury-loader gold-text">Synchronizing...</div>;

  return (
    <div className="order-history-page luxury-bg">
      <div className="history-container">
        <header className="history-header">
          <h1 className="gold-text">Your Orders</h1>
        </header>
        <div className="orders-list">
          {orders.length === 0 ? (
            <div className="text-center text-muted mt-5">No orders found.</div>
          ) : (
            orders.map((order) => {
              const isActive = !["completed", "cancelled"].includes(order.status);
              const isBillRequested = order.status === "bill_requested";
              const total = order.items.reduce((sum, i) => sum + (i.price * i.quantity), 0);
              
              return (
                <div key={order._id} className={`order-card luxury-card ${isActive ? 'active-order' : ''}`}>
                  <div className="order-header">
                    <span className="order-id">#{order._id.slice(-6)}</span>
                    <span className={`status-badge ${order.status?.toLowerCase()}`}>{order.status}</span>
                  </div>
                  
                  <div className="order-footer">
                    <h4 className="gold-text">Total: Rs. {total.toFixed(2)}</h4>
                    <div className="footer-actions">
                      <button className="icon-btn receipt" onClick={() => downloadReceipt(order)}><Receipt size={20}/></button>
                      {order.orderType === "dine-in" && isActive && (
                        <button className={`request-bill-btn ${isBillRequested ? 'pending' : ''}`} onClick={() => handleRequestBill(order._id, order.tableId)} disabled={isBillRequested}>
                          {isBillRequested ? <><Clock size={16}/> Waiter Notified</> : <><Bell size={16}/> Request Bill</>}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* LUXURY BILL NOTIFICATION MODAL WITH VERIFICATION CODE */}
      {activeBill && (
        <div className="pos-modal-overlay">
          <div className="pos-modal-content luxury-card animate-slide-up" style={{ maxWidth: '400px', width: '90%' }}>
            <div className="text-center mb-4">
              <ShieldCheck size={40} className="gold-text mb-2" />
              <h2 className="gold-text">Settle Payment</h2>
              <small className="text-muted">Table: {activeBill.billDetails.tableNumber}</small>
            </div>

            {!showPaymentQR ? (
              <>
                <div className="bill-details-box bg-dark p-3 rounded mb-4" style={{ border: '1px solid #333' }}>
                  <div className="d-flex justify-content-between mb-2"><span>Subtotal</span><span>Rs. {activeBill.billDetails.subtotal}</span></div>
                  <div className="d-flex justify-content-between h4 gold-text pt-2 border-top"><strong>Total</strong><strong>Rs. {activeBill.billDetails.total}</strong></div>
                </div>

                {/* 2-STEP CODE DISPLAY */}
                <div className="verification-box text-center p-3 mb-4" style={{ border: '2px dashed #d4af37', borderRadius: '15px', background: 'rgba(212, 175, 55, 0.05)' }}>
                  <small className="text-muted d-block mb-1">VERIFICATION CODE</small>
                  <h1 className="gold-text m-0" style={{ letterSpacing: '10px', fontSize: '3rem' }}>{verificationCode}</h1>
                  <p className="small text-warning mt-2">Show this code to staff to confirm payment</p>
                </div>

                <button className="gold-button w-100 py-3 mb-2" onClick={() => setShowPaymentQR(true)}>💳 VIEW QR CODE</button>
                <button className="btn btn-link text-muted w-100" onClick={() => setActiveBill(null)}>Close</button>
              </>
            ) : (
              <div className="text-center py-2">
                <h5 className="mb-3 text-white">Scan to Pay</h5>
                <img src={PaymentQR} alt="QR" className="mb-3 bg-white p-2 rounded shadow-sm" style={{ width: '180px', height: '180px', objectFit: 'contain' }} />
                <div className="bg-dark p-2 rounded mb-3"><span className="gold-text">CODE: {verificationCode}</span></div>
                <p className="text-muted small px-3">After scanning, give the code above to the staff.</p>
                <button className="btn btn-link text-gold" onClick={() => setShowPaymentQR(false)}>Back to Bill</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}