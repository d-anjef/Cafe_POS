import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { CartProvider } from "./context/CartContext";

// Layout Components
import Navbar from "./components/layout/Navbar";
import AdminLayout from "./components/layout/AdminLayout";

// Public Pages
import Login from "./pages/Login";
import Register from "./pages/Register";

// Customer Pages
import Home from "./pages/Home";
import Menu from "./pages/Menu";
import CartPage from "./pages/CartPage";
import OrderHistory from "./pages/OrderHistory";
import Profile from "./pages/Profile";
import ActiveBill from "./pages/ActiveBill";

// Staff/Manager Pages
import KitchenKDS from "./pages/Staff/KitchenKDS"; 
import ManagerDashboard from "./pages/Staff/ManagerDashboard";
import OrdersManagement from "./pages/OrdersManagement";
import MenuManager from "./pages/Admin/MenuManager";
import TableManager from "./pages/Admin/TableManager";

export default function App() {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("cafeUser");
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch (e) {
        console.error("Error parsing user data", e);
      }
    }
    setInitializing(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem("cafeUser", JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.clear();
    window.location.href = "/login"; 
  };

  if (initializing) return <div className="luxury-loader">Loading Luxe Cafe...</div>;

  const isManagement = user && ["BRAND_ADMIN", "MANAGER"].includes(user.role);

  return (
    <CartProvider user={user}>
      <Router>
        <div className="app-container">
          <Navbar user={user} onLogout={handleLogout} />

          <main className="content-area">
            <Routes>

              {/* AUTH ROUTES */}
              <Route path="/login" element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/" />} />
              <Route path="/register" element={!user ? <Register onLogin={handleLogin} /> : <Navigate to="/" />} />

              {!user ? (
                <Route path="*" element={<Navigate to="/login" replace />} />
              ) : (
                <>
                  {/* ROLE BASED HOME REDIRECT */}
                  <Route 
                    path="/" 
                    element={
                      user.role === "KITCHEN" ? <Navigate to="/kds" /> :
                      ["BRAND_ADMIN", "MANAGER"].includes(user.role) ? <Navigate to="/dashboard" /> :
                      <Home user={user} />
                    } 
                  />

                  {/* CUSTOMER ROUTES */}
                  <Route path="/menu" element={<Menu user={user} />} />
                  <Route path="/cart" element={<CartPage user={user} />} />
                  <Route path="/order-history" element={<OrderHistory user={user} />} />
                  <Route path="/profile" element={<Profile user={user} />} />
                  <Route path="/active-bill" element={<ActiveBill user={user} />} />

                  {/* ADMIN & MANAGER ROUTES */}
                  <Route element={isManagement ? <AdminLayout user={user} onLogout={handleLogout} /> : <Navigate to="/" />}>
                    <Route path="/dashboard" element={<ManagerDashboard branchId={user.branchId || user.branch?._id} />} />
                    <Route path="/manage-menu" element={<MenuManager user={user} />} />
                    
                    {/* LIVE ORDERS: Floor Map & Payment Processing */}
                    <Route path="/manage-tables" element={<OrdersManagement user={user} />} />
                    
                    {/* TABLE SETUP: Adding and Deleting physical tables */}
                    <Route path="/tables" element={<TableManager user={user} />} />
                  </Route>

                  {/* KITCHEN ROUTE */}
                  <Route 
                    path="/kds" 
                    element={
                      (user.role === "KITCHEN" || user.role === "BRAND_ADMIN") 
                        ? <KitchenKDS branchId={user.branchId || user.branch?._id} onLogout={handleLogout} /> 
                        : <Navigate to="/" />
                    } 
                  />

                  {/* FALLBACK */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </>
              )}

            </Routes>
          </main>
        </div>
      </Router>
    </CartProvider>
  );
}