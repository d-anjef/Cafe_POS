import axios from "axios";

const API_URL = "http://localhost:5000/api/orders";

export const getCart = async (userId) => {
  try {
    const { data } = await axios.get(`${API_URL}/cart/${userId}`);
    return data;
  } catch (err) {
    console.error(err.response?.data || err.message);
    return { items: [], totalPrice: 0 };
  }
};

export const addToCart = async (userId, item) => {
  try {
    const { data } = await axios.post(`${API_URL}/cart/${userId}`, item);
    return data;
  } catch (err) {
    console.error(err.response?.data || err.message);
    return { items: [], totalPrice: 0 };
  }
};

export const removeFromCart = async (userId, menuItemId) => {
  try {
    const { data } = await axios.delete(`${API_URL}/cart/${userId}/${menuItemId}`);
    return data;
  } catch (err) {
    console.error(err.response?.data || err.message);
    return { items: [], totalPrice: 0 };
  }
};

export const checkoutCart = async (userId) => {
  try {
    const { data } = await axios.post(`${API_URL}/cart/checkout/${userId}`);
    return data;
  } catch (err) {
    console.error(err.response?.data || err.message);
    return null;
  }
};
