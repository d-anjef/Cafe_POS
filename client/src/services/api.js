import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:5000/api", // your backend API
  headers: {
    "Content-Type": "application/json",
  },
});

// Optional: attach token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
