import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import "./AdminLayout.css"; 

export default function AdminLayout({ user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Helper to highlight active link in the sidebar
  const isActive = (path) => location.pathname === path ? "active-link" : "";

  // Helper to format the header title nicely (e.g., /manage-tables becomes "MANAGE TABLES")
  const getHeaderTitle = () => {
    const path = location.pathname.replace("/", "").replace("-", " ");
    return path.toUpperCase() || "DASHBOARD";
  };

  return (
    <div className="admin-layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <h2>🌿 LUXE CAFE</h2>
          <div className="manager-info">
            <small>Manager Portal</small>
            <span className="branch-tag">{user?.branch?.name || "Main Branch"}</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <ul>
            <li className={isActive("/dashboard")}>
              <Link to="/dashboard">📊 Dashboard</Link>
            </li>
            
            <li className={isActive("/manage-tables")}>
              <Link to="/manage-tables">📝 Live Orders</Link>
            </li>

            {/* Links to the TableManager component for adding/deleting tables */}
            <li className={isActive("/tables")}>
              <Link to="/tables">🪑 Table Setup</Link>
            </li>

            <li className={isActive("/manage-menu")}>
              <Link to="/manage-menu">🍴 Menu Editor</Link>
            </li>

            <li className={isActive("/kds")}>
              <Link to="/kds">🍳 Kitchen (KDS)</Link>
            </li>

            <li className="logout-li">
              <button 
                onClick={() => { onLogout(); navigate("/login"); }} 
                className="sidebar-logout"
              >
                Logout
              </button>
            </li>
          </ul>
        </nav>
      </aside>

      <main className="main-content">
        <header className="admin-header">
          <div className="header-left">
            <h3 className="gold-text">{getHeaderTitle()}</h3>
          </div>
          <div className="user-profile">
            <span>Welcome, <strong>{user?.name || "Manager"}</strong></span>
          </div>
        </header>
        
        <div className="outlet-container">
          {/* This is where TableManager, OrdersManagement, etc. will render */}
          <Outlet /> 
        </div>
      </main>
    </div>
  );
}