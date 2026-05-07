const Booking = require("../models/Booking");

// 1. Create a Reservation
exports.createBooking = async (req, res) => {
  try {
    const { userId, branchId, tableId, bookingDate, timeSlot, numberOfGuests } = req.body;

    // Check if table is already booked for that specific time
    const existing = await Booking.findOne({
      tableId,
      bookingDate,
      timeSlot,
      status: "confirmed"
    });

    if (existing) {
      return res.status(400).json({ error: "Table already reserved for this slot." });
    }

    const booking = new Booking({
      userId, branchId, tableId, bookingDate, timeSlot, numberOfGuests
    });

    await booking.save();
    res.status(201).json({ message: "Luxury Table Reserved", booking });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 2. Get User's Booking History
exports.getUserBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ userId: req.params.userId })
            .populate("tableId")
            .sort({ bookingDate: -1 });
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};