import axios from "axios";

const API_URL = "http://localhost:5000/api";

export const getTables = async (brandId, branchId) => {
  try {
    const res = await axios.get(`${API_URL}/branches/${branchId}/tables`);
    return res.data;
  } catch (err) {
    console.error("Error fetching tables:", err);
    return [];
  }
};
