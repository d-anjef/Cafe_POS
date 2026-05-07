import React from "react";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import "../styles/Cart.css";

export default function CartPage({ user }) {
  // Use placeOrder from context instead of local API call
  const { cart, cartTotal, removeFromCart, placeOrder, loading } = useCart();
  const navigate = useNavigate();

  const handleCheckout = async () => {
    if (cart.length === 0) return alert("Your selection is empty.");

    // Retrieve active table if exists for DINE_IN logic
    const activeTable = JSON.parse(localStorage.getItem("activeTable"));
    const tableId = activeTable?._id || null;

    // Call the unified placeOrder function from CartContext
    const result = await placeOrder(user, tableId);
    
    if (result.success) {
      alert("✨ Order Placed Successfully! Sending to Kitchen...");
      navigate("/order-history");
    } else {
      alert(result.message || "Failed to place order. Please try again.");
    }
  };

  if (loading) return <div className="luxury-loader">Syncing your selection...</div>;

  return (
    <div className="cart-page luxury-bg">
      <div className="cart-container">
        <h1 className="gold-text">Votre Panier (Your Selection)</h1>
        
        {cart.length === 0 ? (
          <div className="empty-cart-msg">
            <p>Your tray is empty. Explore our menu for artisan delights.</p>
            <button onClick={() => navigate("/menu")} className="gold-btn">View Menu</button>
          </div>
        ) : (
          <div className="cart-content-grid">
            {/* List of Items */}
            <div className="cart-items-list">
              {cart.map((item) => (
                <div key={item._id} className="cart-item-card luxury-card">
                  <div className="item-meta">
                    <h3>{item.name}</h3>
                    <p className="item-price">Rs. {item.price} x {item.quantity}</p>
                  </div>
                  <div className="item-actions">
                    <span className="subtotal">Rs. {item.price * item.quantity}</span>
                    <button   onClick={() => { // Determine the correct ID to send to the backend
                     const idToRemove = item.menuItemId?._id || item.menuItemId || item._id;
                     removeFromCart(user._id, idToRemove);
                     }} 
                     className="remove-link"
                     > Remove </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="cart-summary luxury-card">
              <h3>Order Summary</h3>
              <hr className="gold-hr" />
              <div className="summary-row">
                <span>Subtotal</span>
                <span>Rs. {cartTotal}</span>
              </div>
              <div className="summary-row">
                <span>Service Charge</span>
                <span>Complementary</span>
              </div>
              <div className="total-row gold-text">
                <span>Total</span>
                <span>Rs. {cartTotal}</span>
              </div>
              
              <button 
                onClick={handleCheckout} 
                className="checkout-btn gold-button"
                disabled={loading}
              >
                {loading ? "PROCESSING..." : "CONFIRM ORDER"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}