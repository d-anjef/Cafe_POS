import { Link, useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import "../../styles/Navbar.css"; 

export default function Navbar({ user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation(); // Hook to listen to the current URL
  const { cartCount } = useCart();

  // --- HIDE LOGIC ---
  // List all routes where the User Navbar should NOT appear
  const hideOnPaths = ["/kds", "/dashboard", "/manage-menu", "/manage-tables", "/tables"];
  
  // If the current URL is in our list, return null (renders nothing)
  if (hideOnPaths.includes(location.pathname)) {
    return null;
  }

  const isAdmin = user && ["BRAND_ADMIN", "MANAGER"].includes(user.role);
  const isStaff = user && ["KITCHEN", "WAITER"].includes(user.role);
  const isCustomer = user && user.role === "user";

  const handleLogoutClick = () => {
    onLogout();
    navigate("/login");
  };

  return (
    <nav className="luxury-navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo gold-text">
          LUXE CAFE <span className="leaf-icon">🌿</span>
        </Link>

        <div className="nav-links">
          {isCustomer && (
            <>
              <Link to="/" className="nav-item">Home</Link>
              <Link to="/menu" className="nav-item">Menu</Link>
              <Link to="/cart" className="nav-item cart-link">
                Cart <span className="cart-count">{cartCount}</span>
              </Link>
              <Link to="/order-history" className="nav-item">Orders</Link>
            </>
          )}

          {/* These links show on the top-bar only if NOT in Admin Layout */}
          {isAdmin && (
            <>
              <Link to="/dashboard" className="nav-item admin-highlight">Dashboard</Link>
              <Link to="/manage-menu" className="nav-item">Manage Menu</Link>
            </>
          )}

          {(isAdmin || isStaff) && (
            <Link to="/kds" className="nav-item kds-link">Kitchen (KDS)</Link>
          )}
        </div>

        <div className="nav-user-actions">
          <div className="user-badge">
            <span className="role-dot"></span>
            <span className="user-name">{user?.name?.split(' ')[0]}</span>
            <span className="role-text">({user?.role})</span>
          </div>
          <button onClick={handleLogoutClick} className="logout-btn-nav">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}