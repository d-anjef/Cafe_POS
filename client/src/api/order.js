import API from "./axios";

export const placeOrder = async (orderData) => {
  const response = await API.post("/orders", orderData);
  return response.data;
};

export const fetchUserOrders = async (userId) => {
  const response = await API.get(`/orders/user/${userId}`);
  return response.data;
};