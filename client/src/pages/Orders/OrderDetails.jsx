import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchOrders } from "../../services/orderService";

export default function OrderDetails() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const loadOrder = async () => {
      const orders = await fetchOrders(); // fetch all or by branch
      const o = orders.find((o) => o._id === orderId);
      setOrder(o);
    };
    loadOrder();
  }, [orderId]);

  if (!order) return <p>Loading...</p>;

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Order Details</h2>
      <p><strong>Order ID:</strong> {order._id}</p>
      <p><strong>Status:</strong> {order.orderStatus}</p>
      <p><strong>Payment:</strong> {order.paymentStatus}</p>
      <p><strong>Items:</strong></p>
      <ul>
        {order.items.map((item) => (
          <li key={item.menuItemId}>{item.name} x {item.quantity}</li>
        ))}
      </ul>
      <p><strong>Total:</strong> ${order.totalAmount}</p>
    </div>
  );
}
