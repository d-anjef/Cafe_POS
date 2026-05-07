import React, { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../api/axios"; 
import { useCart } from "../context/CartContext";
import TableGrid from "../components/ui/TableGrid";
import "../styles/Menu.css";

const Menu = ({ user }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { addToCart, cartCount } = useCart();
  
  const [menuItems, setMenuItems] = useState([]);
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTable, setActiveTable] = useState(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const fallbackImg = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500";

  useEffect(() => {
    // 1. Sync Active Session from LocalStorage
    const savedTable = localStorage.getItem("activeTable");
    if (savedTable) setActiveTable(JSON.parse(savedTable));

    // 2. Load Tables and Menu
    const loadContent = async () => {
      // Use branchId from user, or from the active table if user is browsing
      const currentBranchId = user?.branchId || JSON.parse(savedTable)?.branchId;
      
      if (!currentBranchId) {
          // If no branch, we can't load anything. 
          // In a real scenario, you'd fetch all tables if brandId exists.
          setLoading(false);
          return;
      }

      try {
        const [menuRes, tableRes] = await Promise.all([
          API.get(`/menu/branch/${currentBranchId}`),
          API.get(`/tables?branchId=${currentBranchId}`)
        ]);
        setMenuItems(menuRes.data);
        setTables(tableRes.data);
      } catch (err) {
        console.error("Menu Load Error:", err);
      } finally {
        setLoading(false);
      }
    };
    loadContent();
  }, [user, location]);

  const handleTableSelect = async (tableId) => {
    const selected = tables.find(t => t._id === tableId);
    if (selected.status === 'occupied' && selected.currentSessionUser?._id !== user._id) {
      alert("Table occupied."); return;
    }
    try {
      await API.post("/tables/occupy", { tableId, userId: user._id });
      const tableData = { _id: selected._id, tableNumber: selected.tableNumber, branchId: selected.branchId };
      localStorage.setItem("activeTable", JSON.stringify(tableData));
      setActiveTable(tableData);
      window.location.reload(); // Refresh to lock in the branch and menu
    } catch (err) { alert("Selection failed."); }
  };

  const filteredItems = useMemo(() => {
    return menuItems.filter(item => {
      const matchesCategory = activeCategory === "All" || item.categoryId?.name === activeCategory;
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [menuItems, activeCategory, searchQuery]);

  if (loading) return <div className="luxury-loader">Consulting the Chef...</div>;

  return (
    <div className="menu-page-wrapper luxury-bg">
      {!activeTable ? (
        <div className="table-selection-overlay container">
          <h1 className="gold-text">Welcome</h1>
          <p className="subtitle">Please select your table to see the menu</p>
          <TableGrid tables={tables} onSelectTable={handleTableSelect} />
        </div>
      ) : (
        <>
          <div className="session-banner animate-slide-down">
            <div className="banner-content">
              <span className="live-dot pulse"></span>
              <span className="table-badge">TABLE {activeTable.tableNumber}</span>
            </div>
            <button className="view-bill-btn" onClick={() => navigate('/order-history')}>Live Bill</button>
          </div>

          <div className="menu-main container">
            <div className="menu-header">
                <input type="text" placeholder="Search..." onChange={(e) => setSearchQuery(e.target.value)} className="menu-search" />
            </div>
            
            <div className="menu-grid">
              {filteredItems.map(item => (
                <div key={item._id} className="food-card luxury-card">
                  <img src={item.image || fallbackImg} onError={(e) => e.target.src = fallbackImg} alt={item.name} />
                  <div className="food-body">
                    <h3 className="gold-text">{item.name}</h3>
                    <p>Rs. {item.price}</p>
                    <button className="order-btn" onClick={() => addToCart(user, item, 1)}>Add to Round</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {cartCount > 0 && activeTable && (
        <button className="floating-cart-btn" onClick={() => navigate('/cart')}>
          <span className="count-badge">{cartCount}</span> Send to Kitchen
        </button>
      )}
    </div>
  );
};

export default Menu;