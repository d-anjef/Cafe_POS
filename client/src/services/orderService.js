import axios from "axios";
import API from "../api/axios";

// Standard Axios instance for patch/finalize
export const api = axios.create({
  baseURL: "http://localhost:5000/api", 
  headers: { "Content-Type": "application/json" },
});

// Fetch all orders for a branch (Manager/Staff View)
export const fetchOrders = async (branchId) => {
  try {
    if (!branchId || branchId === "undefined") return [];
    // Hits the router.get("/") in order.routes.js
    const response = await API.get(`/orders`, { params: { branchId } });
    return response.data;
  } catch (error) {
    console.error("Fetch Orders Error:", error);
    return [];
  }
};

// Update order status (KDS/Kitchen)
export const updateOrderStatus = async (orderId, status) => {
  try {
    const { data } = await api.patch(`/orders/${orderId}/status`, { status }); 
    return data;
  } catch (err) { console.error(err); }
};

// Update payment status (POS)
export const updatePaymentStatus = async (orderId, paymentStatus) => {
  try {
    const { data } = await api.patch(`/orders/${orderId}/payment`, { paymentStatus });
    return data;
  } catch (err) { console.error(err); }
};

// Create new order (Staff Manual Entry)
export const createOrder = async (orderData) => {
  // Use /dine-in to trigger table locking and KDS notification
  const response = await API.post("/orders/dine-in", orderData);
  return response.data;
};

// Finalize Order (POS Settlement)
export const finalizeOrder = async (orderId, paymentMethod) => {
  try {
    // Matches: router.post("/finalize/:orderId", ...)
    const { data } = await api.post(`/orders/finalize/${orderId}`, { paymentMethod });
    return data;
  } catch (err) {
    console.error("Finalize Error:", err);
  }
};

// client/src/services/orderService.js

export const addItemsToOrder = async (orderId, items) => {
  try {
    const response = await API.put(`/orders/${orderId}/add-items`, { items });
    return response.data;
  } catch (error) {
    console.error("Error adding items:", error);
    throw error;
  }
};

// Also ensure fetchOrders is generic enough or add this:
export const fetchUserOrders = async (userId) => {
  const response = await API.get(`/orders/user/${userId}`);
  return response.data;
};