import React, { useState, useEffect } from "react";
import API from "../../api/axios";
import "../../styles/MenuManager.css";

export default function MenuManager({ user }) {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    categoryId: "", // Changed from 'category' string to 'categoryId' ObjectId
    image: "https://via.placeholder.com/150",
    isAvailable: true
  });

  // 1. Fetch Categories first to populate the dropdown
  const fetchCategories = async () => {
    try {
      const res = await API.get(`/menu/categories/${user?.branchId}`);
      setCategories(res.data);
      // Set the first category as default if available
      if (res.data.length > 0) {
        setFormData(prev => ({ ...prev, categoryId: res.data[0]._id }));
      }
    } catch (err) {
      console.error("Failed to fetch categories", err);
    }
  };

  // 2. Fetch menu items for this branch
  const fetchMenu = async () => {
    try {
      setLoading(true);
      // Matches: router.get("/branch/:branchId") in menu.routes.js
      const res = await API.get(`/menu/branch/${user?.branchId}`); 
      setItems(res.data);
    } catch (err) {
      console.error("Failed to fetch menu", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    if (user?.branchId) {
      fetchCategories();
      fetchMenu();
    }
  }, [user]);

  // 3. Submit with Multi-Tenant IDs and proper categoryId
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { 
        ...formData, 
        brandId: user.brandId, 
        branchId: user.branchId 
      };
      
      // Matches: router.post("/items") in menu.routes.js
      await API.post("/menu/items", payload);
      alert("✨ Luxury Item Added Successfully!");
      
      setFormData({ 
        name: "", 
        description: "", 
        price: "", 
        categoryId: categories[0]?._id || "", 
        image: "https://via.placeholder.com/150", 
        isAvailable: true 
      });
      fetchMenu();
    } catch (err) {
      alert("Error adding item: " + (err.response?.data?.error || "Check if category exists"));
    }
  };

  if (loading) return <div className="luxury-loader">Loading Menu...</div>;

  return (
    <div className="menu-manager-container luxury-bg">
      <header className="admin-header">
        <h2 className="gold-text">Menu Orchestration</h2>
        <p className="subtitle">Branch Management: {user?.branchId}</p>
      </header>
      
      <div className="manager-grid">
        {/* Add Item Form */}
        <section className="form-section luxury-card">
          <h3>Create New Delicacy</h3>
          <form onSubmit={handleSubmit} className="luxury-form">
            <input 
              type="text" placeholder="Item Name" required
              value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
            <textarea 
              placeholder="Exquisite Description" required
              value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
            <div className="row">
              <input 
                type="number" placeholder="Price (NPR)" required
                value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})}
              />
              <select 
                value={formData.categoryId} 
                onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                required
              >
                <option value="" disabled>Select Category</option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <button type="submit" className="gold-btn">Publish to Menu</button>
          </form>
        </section>

        {/* Live Branch Preview */}
        <section className="list-section">
          <h3 className="gold-text">Live Branch Menu ({items.length} items)</h3>
          <div className="menu-list-grid">
            {items.length === 0 ? (
              <p className="no-data">No items found. Create categories and items to see them here.</p>
            ) : (
              items.map(item => (
                <div key={item._id} className="luxury-item-card">
                  <div className="item-info">
                    <h4>{item.name}</h4>
                    <span className="category-badge">{item.categoryId?.name}</span>
                    <p className="price">NPR {item.price}</p>
                    <p className="item-desc">{item.description}</p>
                  </div>
                  <button className="status-toggle">
                    {item.isAvailable ? "Available" : "Sold Out"}
                  </button>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}