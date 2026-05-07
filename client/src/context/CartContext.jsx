import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import API from "../api/axios";

const CartContext = createContext();

export const CartProvider = ({ children, user }) => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);

  // --- 1. FETCH CART FROM SERVER ---
  const fetchCart = useCallback(async (userId) => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await API.get(`/orders/cart/${userId}`);
      const items = res.data?.items || [];
      
      // Normalize data to ensure IDs and prices are always accessible
      const normalizedItems = items.map(item => ({
        ...item,
        _id: item.menuItemId?._id || item._id,
        price: item.price || item.menuItemId?.price || 0,
        name: item.name || item.menuItemId?.name || "Item",
        quantity: Number(item.quantity) || 1
      }));
      setCart(normalizedItems);
    } catch (err) {
      console.error("Cart Sync Error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Sync cart when user logs in/out
  useEffect(() => {
    if (user?._id) {
      fetchCart(user._id);
    } else {
      setCart([]);
    }
  }, [user?._id, fetchCart]);

  // --- 2. ADD TO CART (With Backend Sync) ---
  const addToCart = async (currentUser, item, quantity = 1) => {
    const existing = cart.find((i) => (i.menuItemId?._id || i._id) === item._id);
    let newItems;
    
    // Optimistic UI Update
    if (existing) {
      newItems = cart.map((i) =>
        (i.menuItemId?._id || i._id) === item._id 
          ? { ...i, quantity: i.quantity + quantity } 
          : i
      );
    } else {
      newItems = [...cart, { 
        ...item, 
        quantity, 
        _id: item._id,
        price: item.price,
        name: item.name
      }];
    }
    setCart(newItems);

    if (currentUser?._id) {
      try {
        await API.post(`/orders/cart/${currentUser._id}`, {
          menuItemId: item._id,
          quantity: existing ? existing.quantity + quantity : quantity,
          branchId: currentUser.branchId || currentUser.branch?._id,
          brandId: currentUser.brandId // Essential for schema validation
        });
      } catch (err) {
        console.error("Failed to sync cart with server", err);
      }
    }
  };

  // --- 3. REMOVE FROM CART ---
  const removeFromCart = async (userId, itemId) => {
    setCart(prev => prev.filter(i => {
      const currentId = i.menuItemId?._id || i.menuItemId || i._id;
      return currentId !== itemId;
    }));

    if (userId && itemId) {
      try {
        await API.delete(`/orders/cart/${userId}/${itemId}`);
      } catch (err) {
        console.error("Failed to remove from server cart:", err);
        fetchCart(userId); // Re-fetch to fix UI if sync failed
      }
    }
  };

  const clearCart = () => setCart([]);

  // --- 4. STATS (Memoized for Performance) ---
  const cartCount = useMemo(() => 
    cart.reduce((total, i) => total + (Number(i.quantity) || 0), 0), 
  [cart]);

  const cartTotal = useMemo(() => 
    cart.reduce((total, i) => total + (Number(i.price) * Number(i.quantity) || 0), 0), 
  [cart]);

  // --- 5. PLACE ORDER (With QR Table Integration) ---

const placeOrder = async (currentUser) => {
  if (!currentUser?._id) return { success: false, message: "Login required" };
  setLoading(true);

  try {
    const savedTable = JSON.parse(localStorage.getItem("activeTable"));
    
    // If at a table, use the persistent session endpoint
    const endpoint = savedTable ? "/orders/dine-in" : `/orders/checkout/${currentUser._id}`;
    
    const orderData = {
      userId: currentUser._id,
      items: cart,
      tableId: savedTable?._id,
      branchId: savedTable?.branchId || currentUser.branchId,
      brandId: currentUser.brandId,
    };

    const res = await API.post(endpoint, orderData);
    
    if (res.status === 200 || res.status === 201) {
      setCart([]); 
      return { success: true, isSession: !!savedTable };
    }
    return { success: false };
  } catch (err) {
    return { success: false };
  } finally {
    setLoading(false);
  }
};
  return (
    <CartContext.Provider value={{ 
      cart, 
      cartCount, 
      cartTotal, 
      addToCart, 
      removeFromCart, 
      fetchCart, 
      clearCart, 
      placeOrder, 
      loading 
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);