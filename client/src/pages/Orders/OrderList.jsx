import { useEffect, useState } from "react";
import { fetchOrders } from "../../services/orderService";
import { Link } from "react-router-dom";

export default function OrderList() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const loadOrders = async () => {
      const data = await fetchOrders();
      setOrders(data);
    };
    loadOrders();
  }, []);

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Orders List</h2>
      {orders.length === 0 && <p>No orders found</p>}
      <ul>
        {orders.map((order) => (
          <li key={order._id}>
            <Link to={`/orders/${order._id}`}>
              {order._id} - {order.orderStatus} - {order.paymentStatus}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
