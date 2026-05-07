const Order = require("../models/Order");
const MenuItem = require("../models/MenuItem");
const Table = require("../models/Table");
const mongoose = require("mongoose");

exports.getCart = async (req, res) => {
  try {
    const order = await Order.findOne({ userId: req.params.userId, status: "pending" }).populate("items.menuItemId");
    res.json(order || { items: [], totalPrice: 0 });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.updateCart = async (req, res) => {
  try {
    const { menuItemId, quantity, branchId, brandId } = req.body;
    const itemData = await MenuItem.findById(menuItemId);
    let order = await Order.findOne({ userId: req.params.userId, status: "pending" });
    if (!order) {
      order = new Order({
        userId: req.params.userId, branchId, brandId,
        items: [{ menuItemId, name: itemData.name, price: itemData.price, quantity }],
        totalPrice: itemData.price * quantity,
      });
    } else {
      const index = order.items.findIndex((i) => i.menuItemId.toString() === menuItemId);
      if (index > -1) order.items[index].quantity = quantity;
      else order.items.push({ menuItemId, name: itemData.name, price: itemData.price, quantity });
      order.totalPrice = order.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    }
    await order.save();
    res.json(order);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.removeFromCart = async (req, res) => {
  try {
    const { userId, menuItemId } = req.params;
    const order = await Order.findOne({ userId, status: "pending" });
    if (order) {
      order.items = order.items.filter((i) => i.menuItemId.toString() !== menuItemId);
      order.totalPrice = order.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
      await order.save();
    }
    res.json(order);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.checkout = async (req, res) => {
  try {
    const { userId } = req.params;
    const { tableId, orderType } = req.body;
    const order = await Order.findOne({ userId, status: "pending" });
    if (!order) return res.status(400).json({ error: "Cart empty" });
    order.status = "in-progress";
    order.tableId = tableId;
    await order.save();

   if (tableId) {
  await Table.findByIdAndUpdate(tableId, { 
    status: "occupied", 
    currentSessionUser: userId,
    currentOrderId: newOrder._id // CRITICAL: Save the order ID to the table
  })}
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// --- ADDING THE MISSING DINE-IN HANDLER ---
// server/src/orders/order.controller.js

// server/src/orders/order.controller.js

exports.handleDineInOrder = async (req, res) => {
  try {
    const { tableId, items, branchId, brandId, userId } = req.body;

    // 1. Check for an existing unpaid session for this table
    let activeOrder = await Order.findOne({ 
      tableId, 
      paymentStatus: "unpaid",
      status: { $ne: "completed" } 
    });

    if (activeOrder) {
      // 2. SESSION EXISTS: Add new items to the running bill
      items.forEach(newItem => {
        const existingItem = activeOrder.items.find(
          item => item.menuItemId.toString() === (newItem._id || newItem.menuItemId).toString()
        );

        if (existingItem) {
          existingItem.quantity += (newItem.quantity || 1);
        } else {
          activeOrder.items.push({
            menuItemId: newItem._id || newItem.menuItemId,
            name: newItem.name,
            price: newItem.price,
            quantity: newItem.quantity || 1
          });
        }
      });

      activeOrder.totalPrice = activeOrder.items.reduce((sum, i) => sum + (i.price * i.quantity), 0);
      await activeOrder.save();
      return res.status(200).json({ message: "Order updated", order: activeOrder });
    }

    // 3. NO SESSION: Create the first order of the session
    const newOrder = new Order({
      userId, branchId, brandId, tableId,
      orderType: "dine-in",
      items: items.map(i => ({
        menuItemId: i._id,
        name: i.name,
        price: i.price,
        quantity: i.quantity || 1
      })),
      totalPrice: items.reduce((sum, i) => sum + (i.price * i.quantity), 0),
      paymentStatus: "unpaid",
      status: "in-progress"
    });

    await newOrder.save();
    res.status(201).json({ message: "New session started", order: newOrder });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId, status: { $ne: "pending" } }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getActiveOrders = async (req, res) => {
  try {
    const orders = await Order.find({ branchId: req.params.branchId, status: { $in: ["in-progress", "ready"] } }).populate('tableId');
    res.json(orders);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const updated = await Order.findByIdAndUpdate(req.params.orderId, { status: req.body.status }, { new: true });
    res.json(updated);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// server/src/orders/order.controller.js

exports.finalizeOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);

    // 1. Mark order paid and release table (as done previously)
    order.status = "completed";
    order.paymentStatus = "paid";
    await order.save();
    
    await Table.findByIdAndUpdate(order.tableId, { 
      status: "available", 
      currentSessionUser: null, 
      currentOrderId: null 
    });

    // 2. SEND NOTIFICATION TO USER
    const io = req.app.get('socketio');
    if (io) {
      // Direct message to the specific user's socket room
      io.to(order.userId.toString()).emit("payment_confirmed", {
        message: "Payment received! Thank you for dining with us.",
        orderId: order._id
      });
      
      // Update the Admin map globally
      io.emit("tableStatusUpdate", { _id: order.tableId, status: "available" });
    }

    res.json({ success: true });
  } catch (err) { /* error handling */ }
};

exports.getAnalytics = async (req, res) => {
  try {
    const orders = await Order.find({ branchId: req.params.branchId, status: "completed" });
    const revenue = orders.reduce((sum, o) => sum + o.totalPrice, 0);
    res.json({ summary: { grandTotal: revenue, totalOrders: orders.length } });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.clearUserCart = async (req, res) => {
  try {
    await Order.findOneAndDelete({ userId: req.params.userId, status: "pending" });
    res.json({ message: "Cleared" });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getOrdersByBranch = async (req, res) => {
    try {
      const orders = await Order.find({ branchId: req.query.branchId }).sort({ createdAt: -1 });
      res.json(orders);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// Added this to prevent the payment patch crash
exports.updatePaymentStatus = async (req, res) => {
    try {
      const updated = await Order.findByIdAndUpdate(req.params.orderId, { paymentStatus: req.body.paymentStatus }, { new: true });
      res.json(updated);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getOrdersByBranch = async (req, res) => {
    try {
      const { branchId } = req.query; // Note: using req.query for branchId
      if (!branchId) return res.status(400).json({ error: "Branch ID is required" });
      
      const orders = await Order.find({ 
        branchId, 
        status: { $ne: "pending" } 
      }).sort({ createdAt: -1 });

      // If no orders found, return empty array instead of 404
      res.json(orders || []); 
    } catch (err) { 
      res.status(500).json({ error: err.message }); 
    }
};

// 1. FOR ADMIN: Add items to an existing bill
exports.addItemsToExistingOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { items } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: "Order not found" });

    items.forEach(newItem => {
      const existingItemIndex = order.items.findIndex(
        (i) => i.menuItemId.toString() === newItem.menuItemId
      );

      if (existingItemIndex > -1) {
        order.items[existingItemIndex].quantity += newItem.quantity;
      } else {
        order.items.push(newItem);
      }
    });

    // Recalculate total
    order.totalPrice = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    await order.save();

    // Notify Customer & Kitchen via Socket
    const io = req.app.get('socketio');
    if (io) {
      io.to(order.branchId.toString()).emit("orderStatusUpdate", order);
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 2. FOR USER: Get all orders for the logged-in user
exports.getOrdersByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const orders = await Order.find({ userId })
      .populate("tableId")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// server/src/controllers/table.controller.js
exports.updateTableStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updatedTable = await Table.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedTable) return res.status(404).json({ error: "Table not found" });

    // Emit socket update so Admin Dashboard sees the pulse effect
    const io = req.app.get('socketio');
    if (io) {
      io.emit('tableStatusUpdate', updatedTable);
    }

    res.json(updatedTable);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};