import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchMenuItems } from "../services/menuService";
import { useCart } from "../context/CartContext"; // Added to support quick-add
import "../styles/Home.css";

export default function Home({ user }) {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState(""); // Advanced Search
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false); // Success Animation State

  const branchId = user?.branchId || user?.branch?._id;

  useEffect(() => {
    const loadData = async () => {
      if (!branchId) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const items = await fetchMenuItems(branchId);
        setMenuItems(items || []);
        const uniqueCategories = [...new Set(items.map(item => item.categoryId?.name || "Uncategorized"))];
        setCategories(uniqueCategories);
      } catch (err) {
        console.error("Error loading home data:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [branchId]);

  // Advanced Filtering: Category + Search
  const filteredItems = menuItems.filter(item => {
    const matchesCategory = selectedCategory ? item.categoryId?.name === selectedCategory : true;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  }).slice(0, 6); // Keep Home page uncluttered

  const handleQuickAdd = (item) => {
    addToCart(user, item, 1);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000); // Animation duration
  };

  if (loading && branchId) return <div className="luxury-loader gold-text">Gathering fresh ingredients...</div>;

  return (
    <div className="home-wrapper luxury-bg">
      {/* --- SUCCESS TOAST ANIMATION --- */}
      {showToast && (
        <div className="luxury-toast">
          <span className="toast-icon">✨</span>
          <p>Exquisite choice added to your collection.</p>
        </div>
      )}

      {/* --- HERO SECTION --- */}
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <span className="hero-tagline">Est. 2024 • Artisan Experience</span>
          <h1 className="hero-title">L'Art de la Gastronomie</h1>
          <p className="hero-subtitle">Savor artisan coffee and hand-crafted delicacies in our curated sanctuary.</p>
          
          {/* ADVANCED FEATURE: IN-HERO SEARCH */}
          <div className="hero-search-container">
            <input 
              type="text" 
              placeholder="Search our selection..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="hero-search-input"
            />
          </div>

          <div className="hero-actions">
            <button className="gold-button" onClick={() => navigate('/menu')}>Explore Menu</button>
            <button className="outline-button" onClick={() => navigate('/menu')}>Book a Table</button>
          </div>
        </div>
      </section>

      {/* --- MENU HIGHLIGHTS --- */}
      <section className="menu-section container">
        <header className="section-header">
          <h2 className="gold-text">Signature Selections</h2>
          <p className="subtitle">Discover our highly-rated delicacies</p>
        </header>

        <div className="category-tabs">
          <button 
            onClick={() => setSelectedCategory(null)}
            className={!selectedCategory ? "tab-active" : "tab-inactive"}
          >
            All Specials
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={selectedCategory === cat ? "tab-active" : "tab-inactive"}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="menu-grid">
          {filteredItems.length > 0 ? (
            filteredItems.map(item => (
              <div key={item._id} className="food-card luxury-card animate-in">
                <div className="food-info">
                  <div className="item-header">
                    <h3 className="food-name gold-text">{item.name}</h3>
                    <span className="food-price">Rs. {item.price}</span>
                  </div>
                  <p className="food-desc">{item.description}</p>
                  <div className="food-footer">
                    <button className="details-btn" onClick={() => navigate('/menu')}>Details</button>
                    <button className="add-btn-small" onClick={() => handleQuickAdd(item)}>
                      Add to Cart +
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="no-results gold-text">No items match your search criteria.</p>
          )}
        </div>
      </section>

      {/* --- LUXE FOOTER FEATURE --- */}
      <section className="features-row">
          <div className="feature-item">
              <span className="feature-icon">🌿</span>
              <h4>Organic Sourcing</h4>
          </div>
          <div className="feature-item">
              <span className="feature-icon">☕</span>
              <h4>Master Roasters</h4>
          </div>
          <div className="feature-item">
              <span className="feature-icon">✨</span>
              <h4>Cozy Ambiance</h4>
          </div>
      </section>
    </div>
  );
}