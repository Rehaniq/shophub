import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";

const money = (n) => Number(n).toLocaleString("sv-SE");

const formatDate = (value) =>
  new Date(value).toLocaleString("sv-SE", {
    dateStyle: "medium",
    timeStyle: "short",
  });

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    api("/orders/my")
      .then((data) => {
        if (!cancelled) setOrders(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <p className="message">Loading...</p>;

  return (
    <div className="container">
      <h1>My orders</h1>

      {error && <p className="message error">{error}</p>}

      {!error && orders.length === 0 && (
        <>
          <p className="message">You haven't placed any orders yet.</p>
          <p className="message">
            <Link to="/">Start shopping</Link>
          </p>
        </>
      )}

      <div className="order-list">
        {orders.map((order) => (
          <div key={order.id} className="order-card">
            <div className="order-header">
              <div>
                <strong>Order #{order.id}</strong>
                <span className="muted order-date">{formatDate(order.created_at)}</span>
              </div>
              <span className={`status status-${order.status}`}>{order.status}</span>
            </div>

            <ul className="order-items">
              {order.items.map((item) => (
                <li key={item.product_id}>
                  <Link to={`/product/${item.product_id}`}>{item.name}</Link>
                  <span className="muted">
                    {item.quantity} × {money(item.price)} kr
                  </span>
                  <span>{money(item.quantity * item.price)} kr</span>
                </li>
              ))}
            </ul>

            <div className="order-total">
              <span>Total</span>
              <strong>{money(order.total)} kr</strong>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}