import { useEffect, useState } from "react";
import { fetchOrders, updateOrderStatus, updatePaymentStatus } from "../services/orderService";

export default function Orders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const loadOrders = async () => {
      const data = await fetchOrders();
      setOrders(data);
    };
    loadOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    await updateOrderStatus(orderId, newStatus);
    const data = await fetchOrders();
    setOrders(data);
  };

  const handlePaymentChange = async (orderId, newStatus) => {
    await updatePaymentStatus(orderId, newStatus);
    const data = await fetchOrders();
    setOrders(data);
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Orders</h2>
      {orders.map(order => (
        <div key={order._id} style={{ border: "1px solid #ccc", marginBottom: "1rem", padding: "1rem" }}>
          <p><strong>Order ID:</strong> {order._id}</p>
          <p><strong>Status:</strong> {order.orderStatus}</p>
          <p><strong>Payment:</strong> {order.paymentStatus}</p>
          <p><strong>Items:</strong></p>
          <ul>
            {order.items.map(item => (
              <li key={item.menuItemId}>{item.name} x {item.quantity}</li>
            ))}
          </ul>
          <button onClick={() => handleStatusChange(order._id, "READY")}>Set Ready</button>
          <button onClick={() => handlePaymentChange(order._id, "PAID")}>Set Paid</button>
        </div>
      ))}
    </div>
  );
}
