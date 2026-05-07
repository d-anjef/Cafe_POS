const Table = require("../models/Table");

exports.getTables = async (req, res) => {
  try {
    const { branchId } = req.query;
    const tables = await Table.find({ branchId })
      .populate("currentSessionUser", "name")
      .populate("currentOrderId") // Pull the bill items directly into the table object
      .sort({ tableNumber: 1 });
    res.json(tables);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.occupyTable = async (req, res) => {
  try {
    const { tableId, userId } = req.body;
    const table = await Table.findById(tableId);

    if (!table) return res.status(404).json({ error: "Table not found" });

    table.status = "occupied";
    table.currentSessionUser = userId;
    await table.save();

    const updatedTable = await Table.findById(tableId).populate("currentSessionUser", "name");

    // REAL-TIME: Emit to Admin/Staff Panel
    const io = req.app.get('socketio');
    if (io) {
      io.emit('tableStatusUpdate', updatedTable);
    }

    res.json({ message: "Session started", table: updatedTable });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.releaseTable = async (req, res) => {
  try {
    const { tableId, orderId } = req.body;
    const io = req.app.get('socketio');

    // 1. Update Table to available and clear the order session
    const updatedTable = await Table.findByIdAndUpdate(
      tableId,
      { status: "available", currentOrderId: null, currentSessionUser: null },
      { new: true }
    );

    // 2. Mark the order as completed
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { status: "completed" },
      { new: true }
    );

    // 3. Notify the User and the Branch
    if (io) {
      // Notify the User specifically to end their session
      io.to(updatedOrder.userId.toString()).emit("payment_confirmed", {
        orderId: updatedOrder._id,
        message: "Payment Received! Your session has ended. Thank you!"
      });

      // Update the Admin's floor plan across all terminals
      io.to(updatedTable.branchId.toString()).emit("tableStatusUpdate", updatedTable);
    }

    res.json({ success: true, message: "Table released and session ended." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.createTable = async (req, res) => {
  try {
    const { branchId, tableNumber, capacity } = req.body;
    
    // Check if table already exists for this branch
    const existing = await Table.findOne({ branchId, tableNumber });
    if (existing) return res.status(400).json({ error: "Table number already exists" });

    const table = new Table({
      branchId,
      tableNumber,
      capacity,
      qrCodeUrl: `https://yourdomain.com/menu?tableNumber=${tableNumber}&branchId=${branchId}`
    });

    await table.save();
    res.status(201).json(table);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteTable = async (req, res) => {
  try {
    await Table.findByIdAndDelete(req.params.id);
    res.json({ message: "Table deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateTablePosition = async (req, res) => {
  try {
    const { id } = req.params;
    const { positionX, positionY } = req.body;
    
    const table = await Table.findByIdAndUpdate(
      id, 
      { positionX, positionY }, 
      { new: true }
    );

    // Emit socket update so the Live Floor Map moves instantly
    const io = req.app.get('socketio');
    if (io) io.emit('tableStatusUpdate', table);

    res.json(table);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateTableStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updatedTable = await Table.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedTable) {
      return res.status(404).json({ error: "Table not found" });
    }

    // REAL-TIME: Notify the Admin Dashboard to change color/pulse
    const io = req.app.get('socketio');
    if (io) {
      io.emit('tableStatusUpdate', updatedTable);
    }

    res.json(updatedTable);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.sendBillToUser = async (req, res) => {
  try {
    const { orderId, userId, billDetails } = req.body;
    const io = req.app.get('socketio');

    if (io) {
      // Emit specifically to that user's private room
      io.to(userId).emit("receive_bill", {
        orderId,
        billDetails, // Includes subtotal, sc, vat, grandTotal
        message: "Your bill is ready for payment."
      });
    }

    res.json({ success: true, message: "Bill sent to customer" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};