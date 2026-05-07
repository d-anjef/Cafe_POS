import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/orderService";
import "../styles/DineIn.css";

export default function CreateOrder({ user }) {
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isReserving, setIsReserving] = useState(false); // Toggle for Reservation
  const [bookingDetails, setBookingDetails] = useState({ date: "", time: "", guests: 2 });
  
  const navigate = useNavigate();
  const branchId = user?.branchId;

  useEffect(() => {
    const loadTables = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/tables?branchId=${branchId}`);
        setTables(response.data);
      } catch (err) {
        console.error("Failed to load tables", err);
      } finally {
        setLoading(false);
      }
    };
    if (branchId) loadTables();
  }, [branchId]);

  // Instant Check-in logic
  const handleCheckIn = async () => {
    try {
      await api.post(`/tables/occupy`, { tableId: selectedTable._id, userId: user._id });
      localStorage.setItem("activeTable", JSON.stringify(selectedTable));
      navigate("/menu");
    } catch (err) {
      alert("Table occupied or connection error.");
    }
  };

  // NEW: Reservation logic for Phase 3
  const handleReservation = async () => {
    if (!bookingDetails.date || !bookingDetails.time) return alert("Please select Date and Time");
    try {
      const res = await api.post(`/bookings`, {
        userId: user._id,
        branchId: branchId,
        tableId: selectedTable._id,
        bookingDate: bookingDetails.date,
        timeSlot: bookingDetails.time,
        numberOfGuests: bookingDetails.guests
      });
      alert(`Success! Table ${selectedTable.tableNumber} reserved for ${bookingDetails.date}`);
      navigate("/order-history");
    } catch (err) {
      alert(err.response?.data?.error || "Reservation failed");
    }
  };

  const handleAction = () => {
    if (!selectedTable) return alert("Select a table first");
    isReserving ? handleReservation() : handleCheckIn();
  };

  if (loading) return <div className="dinein-container">Loading Tables...</div>;

  return (
    <div className="dinein-container">
      <div className="dinein-header">
        <h2>{isReserving ? "Luxury Reservation" : "Dine-In Experience"}</h2>
        <p>Experience the art of fine dining.</p>
        
        {/* Toggle between Instant Dine and Reserve */}
        <div className="mode-toggle">
          <button 
            className={!isReserving ? "active" : ""} 
            onClick={() => setIsReserving(false)}
          >DINE NOW</button>
          <button 
            className={isReserving ? "active" : ""} 
            onClick={() => setIsReserving(true)}
          >BOOK FOR LATER</button>
        </div>
      </div>

      <div className="table-grid">
        {tables.map((table) => (
          <div
            key={table._id}
            className={`table-card ${table.status === "occupied" ? "occupied" : ""} ${
              selectedTable?._id === table._id ? "selected" : ""
            }`}
            onClick={() => table.status === "available" && setSelectedTable(table)}
          >
            <div className="table-icon">🪑</div>
            <h3>Table {table.tableNumber}</h3>
            <span>{table.status}</span>
          </div>
        ))}
      </div>

      {/* NEW: Inputs for Reservation Mode */}
      {isReserving && selectedTable && (
        <div className="booking-form">
          <input 
            type="date" 
            onChange={(e) => setBookingDetails({...bookingDetails, date: e.target.value})} 
          />
          <select onChange={(e) => setBookingDetails({...bookingDetails, time: e.target.value})}>
            <option value="">Select Time</option>
            <option value="18:00">06:00 PM</option>
            <option value="19:00">07:00 PM</option>
            <option value="20:00">08:00 PM</option>
          </select>
          <input 
            type="number" 
            placeholder="Guests" 
            onChange={(e) => setBookingDetails({...bookingDetails, guests: e.target.value})} 
          />
        </div>
      )}

      <div className="action-area">
        <button
          className="start-session-btn"
          disabled={!selectedTable}
          onClick={handleAction}
        >
          {isReserving ? "Confirm Reservation" : `Enter Table ${selectedTable?.tableNumber}`}
        </button>
      </div>
    </div>
  );
}