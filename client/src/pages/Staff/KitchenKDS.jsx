import React, { useEffect, useState } from "react";
import API from "../../api/axios";
import "../../styles/KDS.css";
import io from "socket.io-client";

// Initialize socket outside the component to prevent multiple connections
const socket = io("http://localhost:5000"); 

export default function KitchenKDS({ branchId, onLogout }) {
  const [orders, setOrders] = useState([]);

  const fetchActiveOrders = async () => {
    try {
      const res = await API.get(`/orders/active/${branchId}`);
      // Ensure data is sorted by newest first
      setOrders(res.data);
    } catch (err) {
      console.error("KDS Fetch Error", err);
    }
  };

  useEffect(() => {
    if (branchId) {
      fetchActiveOrders();

      socket.emit("join-branch", branchId);

      socket.on("new-order", (newOrder) => {
        const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3");
        audio.play().catch(e => console.log("Audio play blocked by browser"));

        setOrders((prevOrders) => [newOrder, ...prevOrders]);
      });

      return () => {
        socket.off("new-order");
      };
    }
  }, [branchId]);

  const markReady = async (orderId) => {
    try {
      await API.patch(`/orders/${orderId}/status`, { status: "ready" });
      setOrders((prev) => prev.filter((o) => o._id !== orderId));
    } catch (err) {
      alert("Failed to update order status on server.");
    }
  };

  return (
    <div className="kds-container luxury-bg">
      <header className="kds-header">
        <h1 className="gold-text">KITCHEN ORCHESTRATION</h1>
        <div className="kds-status-bar">
          <span className="pulse-dot"></span>
          <p className="kds-subtitle">Live Connection Active • Branch: {branchId}</p>
        </div>
        <button onClick={onLogout} className="kds-logout-btn">EXIT KITCHEN</button>
      </header>

      <div className="kds-grid">
        {orders.length === 0 ? (
          <div className="no-orders luxury-card">
            <div className="empty-state-content">
              <span className="leaf-icon">🌿</span>
              <p className="gold-text">All delicacies have been served.</p>
              <p className="subtitle">Awaiting new orders...</p>
            </div>
          </div>
        ) : (
          orders.map((order) => {
            const orderTime = new Date(order.createdAt);
            const minutesAgo = Math.floor((new Date() - orderTime) / 60000);
            const isLate = minutesAgo > 10; 

            return (
              <div key={order._id} className={`order-ticket luxury-card ${isLate ? 'late-priority' : ''}`}>
                <div className="ticket-header">
                  <div className="table-info">
                    <span className="label">TABLE</span>
                    <span className="table-num gold-text">
                      {/* Fixed: Handle populated table object */}
                      {order.tableId?.tableNumber || "Dine-In"}
                    </span>
                  </div>
                  <div className="time-info">
                    <span className="timer">{minutesAgo}m ago</span>
                  </div>
                </div>

                <div className="ticket-items scroll-list">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="item-row">
                      <span className="qty gold-text">{item.quantity}×</span>
                      <span className="item-name-text">
                        {/* Fixed: Check populated menuItemId first, then name field */}
                        {item.menuItemId?.name || item.name || "Item"}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="ticket-footer">
                  <button className="ready-btn gold-btn" onClick={() => markReady(order._id)}>
                    MARK AS READY
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}