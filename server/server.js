// server/server.js
require("dotenv").config();
const app = require("./src/app");
const connectDB = require("./src/config/db");
const http = require("http");
const { Server } = require("socket.io");

// Connect to MongoDB
connectDB();

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: "*", // In production, replace with your frontend URL
    methods: ["GET", "POST"]
  }
});

// Make io accessible to our routes
app.set("socketio", io);
io.on("connection", (socket) => {
  // Existing join-branch for kitchen
  socket.on("join-branch", (branchId) => {
    socket.join(branchId);
  });

  // NEW: Personal room for the user to get status updates
  socket.on("join-user-room", (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined their private notification room`);
  });
});
// Start server using 'server.listen' instead of 'app.listen'
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Garden & Cafe Server (with Sockets) running on port ${PORT}`);
});