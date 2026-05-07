// src/services/authService.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api", // backend URL
  headers: {
    "Content-Type": "application/json",
  },
});

// Add JWT token automatically if exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Login
export const loginUser = async (email, password) => {
  try {
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("token", data.token);
    return data.user; // { email, role, _id, brandId, branchId }
  } catch (err) {
    console.error(err.response?.data || err.message);
    throw err.response?.data || { error: "Login failed" };
  }
};

// Register (role and branch/brand handled by backend)
export const registerUser = async (userData) => {
  try {
    const { data } = await api.post("/auth/register", userData);
    localStorage.setItem("token", data.token);
    return data.user;
  } catch (err) {
    console.error(err.response?.data || err.message);
    throw err.response?.data || { error: "Registration failed" };
  }
};
