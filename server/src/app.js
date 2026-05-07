//server/src/app.js
const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require("./users/auth.routes");
const menuRoutes = require("./routes/menu.routes");

app.use("/api/auth", authRoutes);
app.use("/api/branches", require("./tenants/branch.routes"));
app.use("/api/brands", require("./tenants/brand.routes"));
app.use("/api/tables", require("./routes/table.routes"));
app.use("/api/menu", require("./routes/menu.routes"));
app.use("/api/orders", require("./routes/order.routes"));
app.use("/api/bookings", require("./routes/booking.routes"));




// Test
app.get("/", (req, res) => {
  res.send("🌿 Garden & Cafe API Running");
});

module.exports = app;
