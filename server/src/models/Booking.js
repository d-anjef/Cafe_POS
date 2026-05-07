const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  branchId: { type: mongoose.Schema.Types.ObjectId, ref: "Branch", required: true },
  tableId: { type: mongoose.Schema.Types.ObjectId, ref: "Table", required: true },
  numberOfGuests: { type: Number, required: true },
  bookingDate: { type: Date, required: true }, // The day of the visit
  timeSlot: { type: String, required: true },  // e.g., "18:00"
  status: { 
    type: String, 
    enum: ["pending", "confirmed", "cancelled", "completed"], 
    default: "confirmed" 
  }
}, { timestamps: true });

module.exports = mongoose.model("Booking", bookingSchema);