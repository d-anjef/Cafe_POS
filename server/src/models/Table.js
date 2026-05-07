//server/src/models/Table.js
const mongoose = require("mongoose");

const tableSchema = new mongoose.Schema({
  branchId: { type: mongoose.Schema.Types.ObjectId, ref: "Branch", required: true },
  tableNumber: { type: String, required: true },
  capacity: { type: Number },
  
  // High-end feature: Tracking live occupancy as per prompt
 status: { 
    type: String, 
    enum: ["available", "occupied", "reserved", "bill_requested"], // Added bill_requested
    default: "available" 
  },
  currentOrderId: { // NEW FIELD: Links the table to the live order
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Order", 
    default: null 
  },
  
  // Links the current active user to this table
  currentSessionUser: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    default: null 
  },
  
  qrCodeUrl: { type: String } // Unique URL for this table
}, { timestamps: true });

module.exports = mongoose.model("Table", tableSchema);