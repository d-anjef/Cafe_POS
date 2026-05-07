// client/src/services/menuService.js
import { api } from "./api"; 

/**
 * Fetch all menu items for a specific branch
 * Matches Backend: GET /api/menu/branch/:branchId
 */
export const fetchMenuItems = async (branchId) => {
  try {
    // We change the URL to match your backend route structure
    const { data } = await api.get(`/menu/branch/${branchId}`);
    return data;
  } catch (err) {
    console.error("Menu Service Error:", err.response?.data || err.message);
    return [];
  }
};

// If you need to fetch by brand and branch specifically
export const getMenuItems = async (brandId, branchId) => {
  try {
    // Note: Ensure your backend actually has this specific route 
    // Otherwise, just use fetchMenuItems above.
    const res = await api.get(`/menu/branch/${branchId}`);
    return res.data;
  } catch (err) {
    console.error("Error fetching menu:", err);
    return [];
  }
};