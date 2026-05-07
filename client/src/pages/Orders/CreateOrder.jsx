// src/pages/CreateOrder.jsx
import { useEffect, useState } from "react";
import { fetchTables } from "../services/tableService";
import { fetchMenuItems } from "../services/menuService";
import { createOrder } from "../services/orderService";

export default function CreateOrder({ branchId, brandId, userId }) {
  const [tables, setTables] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);

  // Load tables
  useEffect(() => {
    const loadTables = async () => {
      const data = await fetchTables(branchId);
      setTables(data);
    };
    loadTables();
  }, [branchId]);

  // Load menu items
  useEffect(() => {
    const loadMenu = async () => {
      const data = await fetchMenuItems(branchId);
      setMenuItems(data);
    };
    loadMenu();
  }, [branchId]);

  // Add item to cart
  const addToCart = (item) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.menuItemId === item._id);
      if (existing) {
        return prev.map((i) =>
          i.menuItemId === item._id ? { ...i, quantity: i.quantity + 1 } : i
        );
      } else {
        return [...prev, { menuItemId: item._id, name: item.name, quantity: 1, price: item.price }];
      }
    });
  };

  // Remove item from cart
  const removeFromCart = (itemId) => {
    setCart((prev) => prev.filter((i) => i.menuItemId !== itemId));
  };

  // Handle order placement
  const handleCheckout = async () => {
    if (cart.length === 0) return alert("Add items to cart first!");

    const orderData = {
      brandId,
      branchId,
      userId,
      tableId: selectedTable || null, // null for delivery
      items: cart,
      totalAmount: cart.reduce((sum, i) => sum + i.price * i.quantity, 0),
      orderStatus: "PREPARING",
      paymentStatus: "PENDING",
      orderType: selectedTable ? "DINE_IN" : "DELIVERY",
    };

    const order = await createOrder(orderData);
    if (order?._id) {
      alert("Order placed successfully!");
      setCart([]);
      setSelectedTable(null);
    } else {
      alert("Failed to place order");
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Create Order</h2>

      {/* Select Table */}
      <div style={{ marginBottom: "1rem" }}>
        <label>
          Select Table (optional):
          <select
            value={selectedTable || ""}
            onChange={(e) => setSelectedTable(e.target.value)}
          >
            <option value="">Delivery</option>
            {tables.map((table) => (
              <option key={table._id} value={table._id}>
                {table.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Menu Items */}
      <h3>Menu</h3>
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
        {menuItems.map((item) => (
          <div key={item._id} style={{ border: "1px solid #ccc", padding: "1rem", width: "200px" }}>
            <h4>{item.name}</h4>
            <p>${item.price.toFixed(2)}</p>
            <button onClick={() => addToCart(item)}>Add to Cart</button>
          </div>
        ))}
      </div>

      {/* Cart */}
      <h3 style={{ marginTop: "2rem" }}>Cart</h3>
      {cart.length === 0 ? (
        <p>No items in cart</p>
      ) : (
        <ul>
          {cart.map((item) => (
            <li key={item.menuItemId}>
              {item.name} x {item.quantity} (${(item.price * item.quantity).toFixed(2)})
              <button onClick={() => removeFromCart(item.menuItemId)} style={{ marginLeft: "1rem" }}>Remove</button>
            </li>
          ))}
        </ul>
      )}

      {cart.length > 0 && (
        <div style={{ marginTop: "1rem" }}>
          <p>
            <strong>Total: ${cart.reduce((sum, i) => sum + i.price * i.quantity, 0).toFixed(2)}</strong>
          </p>
          <button onClick={handleCheckout}>Place Order</button>
        </div>
      )}
    </div>
  );
}
