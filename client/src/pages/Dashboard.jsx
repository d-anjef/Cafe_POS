import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import "../styles/Dashboard.css";

export default function Dashboard({ user }) {
  const navigate = useNavigate();
  const [firstTableId, setFirstTableId] = useState(null);

  // Automatically fetch the first available table for this branch
  useEffect(() => {
    const fetchTables = async () => {
      try {
        const res = await api.get(`/tables?branchId=${user?.branchId}`);
        if (res.data && res.data.length > 0) {
          setFirstTableId(res.data[0]._id);
        }
      } catch (err) {
        console.error("Could not fetch tables for testing", err);
      }
    };
    if (user?.branchId) fetchTables();
  }, [user]);

  const sendMockOrder = async () => {
    if (!firstTableId) {
      return alert("No tables found in database. Please seed your database first!");
    }

    const mockOrder = {
      userId: user?._id,
      branchId: user?.branchId,
      tableId: firstTableId, // Dynamic ID!
      items: [
        { name: "Saffron Gold Latte", quantity: 2, price: 12 },
        { name: "Truffle Croissant", quantity: 1, price: 18 }
      ],
      totalAmount: 42,
      status: "in-progress" 
    };

    try {
      await api.post("/orders", mockOrder);
      alert("Test Ticket Sent! Check the KDS screen.");
    } catch (err) {
      console.error("Order failed", err);
      alert("Mock Order Failed. Ensure backend is running.");
    }
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Admin Command Center</h1>
        <p>Branch ID: <span style={{color: '#D4AF37'}}>{user?.branchId || "Global"}</span></p>
      </header>

      <div className="dashboard-grid">
        {/* KDS Testing */}
        <div className="dashboard-card">
          <h3>KDS Integration Test</h3>
          <p>Sends a test order to the kitchen display to verify real-time connection.</p>
          <button 
            className="test-btn" 
            onClick={sendMockOrder}
            disabled={!firstTableId}
          >
            {firstTableId ? "Push Test Order" : "No Tables Found"}
          </button>
        </div>

        {/* Quick Links */}
        <div className="dashboard-card">
          <h3>Quick Access</h3>
          <div className="btn-group">
            <button onClick={() => navigate("/kds")} className="secondary-btn">Kitchen View (KDS)</button>
            <button onClick={() => navigate("/menu")} className="secondary-btn">Live Menu</button>
            <button onClick={() => navigate("/dine-in")} className="secondary-btn">Table Layout</button>
          </div>
        </div>
      </div>
    </div>
  );
}