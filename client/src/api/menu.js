import API from "./axios";

export const getMenuItems = async (branchId) => {
  // Assuming your route is /api/menu/:branchId
  const response = await API.get(`/menu/${branchId}`);
  return response.data;
};

export const getCategories = async () => {
  const response = await API.get("/menu/categories");
  return response.data;
};