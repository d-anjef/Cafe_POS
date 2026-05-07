const express = require("express");
const router = express.Router();
const orderController = require("../orders/order.controller"); 

// --- CUSTOMER CART ---
router.get("/cart/:userId", orderController.getCart);
router.post("/cart/:userId", orderController.updateCart);
router.delete("/cart/:userId/:menuItemId", orderController.removeFromCart);
router.delete("/cart/clear/:userId", orderController.clearUserCart);

// --- CHECKOUT & DINE-IN ---
router.post("/checkout/:userId", orderController.checkout); // For Cart Checkout
router.post("/dine-in", orderController.handleDineInOrder); // For Manual/QR Order

// --- STAFF & ADMIN ---
router.get("/", orderController.getOrdersByBranch); // FIXES the 404 for fetchOrders
router.get("/active/:branchId", orderController.getActiveOrders);
router.patch("/:orderId/status", orderController.updateOrderStatus);
router.patch("/:orderId/payment", orderController.updatePaymentStatus);
router.get("/analytics/:branchId", orderController.getAnalytics);
router.post("/finalize/:orderId", orderController.finalizeOrder);
router.put("/:orderId/add-items", orderController.addItemsToExistingOrder);
router.get("/user/:userId", orderController.getOrdersByUser); // FIX: For User Display
router.put("/:orderId/add-items", orderController.addItemsToExistingOrder); // FIX: For Admin Add Items

module.exports = router;