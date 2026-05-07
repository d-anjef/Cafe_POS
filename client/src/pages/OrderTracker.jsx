import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import "../styles/OrderTracker.css"; // We'll define simple styles below

const socket = io("http://localhost:5000");

export default function OrderTracker({ order, userId }) {
  const [status, setStatus] = useState(order.status);

  // Status mapping for progress percentage
  const statusMap = {
    "pending": 20,
    "in-progress": 50,
    "ready": 100,
    "completed": 100
  };

  useEffect(() => {
    if (userId) {
      // Join private user room for updates
      socket.emit("join-user-room", userId);

      // Listen for updates specifically for this user
      socket.on("order-status-updated", (data) => {
        if (data.orderId === order._id) {
          setStatus(data.status);
          
          // Optional: Add a small toast or sound if status is "ready"
          if (data.status === "ready") {
            new Audio("https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3").play();
          }
        }
      });

      return () => socket.off("order-status-updated");
    }
  }, [userId, order._id]);

  return (
    <div className="tracker-card">
      <div className="tracker-header">
        <h4>Order #{order._id.slice(-6)}</h4>
        <span className={`status-badge ${status}`}>{status.toUpperCase()}</span>
      </div>

      <div className="progress-container">
        <div 
          className="progress-bar" 
          style={{ width: `${statusMap[status] || 0}%` }}
        ></div>
      </div>

      <div className="status-labels">
        <span className={status === "pending" ? "active" : ""}>Received</span>
        <span className={status === "in-progress" ? "active" : ""}>Cooking</span>
        <span className={status === "ready" ? "active" : ""}>Ready!</span>
      </div>
    </div>
  );
}