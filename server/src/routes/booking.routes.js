const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/booking.controller");

// POST /api/bookings - Create a new reservation
router.post("/", bookingController.createBooking);

// GET /api/bookings/user/:userId - View my reservations
router.get("/user/:userId", bookingController.getUserBookings);

module.exports = router;