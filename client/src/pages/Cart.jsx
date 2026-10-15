import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";

const money = (n) => n.toLocaleString("sv-SE");

export default function Cart() {
  const { items, updateQuantity, removeItem, clearCart, totalPrice } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleCheckout = async () => {
    // Logged out: send to login and come back to the cart afterwards
    if (!user) {
      navigate("/login", { state: { from: "/cart" } });
      return;
    }

    setError("");
    setSubmitting(true);
    try {
      // Send only IDs and quantities. The server decides the prices.
      const order = await api("/orders", {
        method: "POST",
        body: JSON.stringify({
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        }),
      });
      clearCart();
      navigate(`/order-success/${order.id}`, { replace: true });
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container">
        <h1>Your cart</h1>
        <p className="message">Your cart is empty.</p>
        <p className="message">
          <Link to="/">Continue shopping</Link>
        </p>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>Your cart</h1>

      <div className="cart-list">
        {items.map((item) => (
          <div key={item.productId} className="cart-row">
            <img src={item.image_url} alt={item.name} />
            <div className="cart-info">
              <Link to={`/product/${item.productId}`}>{item.name}</Link>
              <span className="muted">{money(item.price)} kr each</span>
            </div>

            <div className="qty">
              <button onClick={() => updateQuantity(item.productId, item.quantity - 1)}>−</button>
              <span>{item.quantity}</span>
              <button onClick={() => updateQuantity(item.productId, item.quantity + 1)}>+</button>
            </div>

            <strong className="cart-line-total">{money(item.price * item.quantity)} kr</strong>

            <button className="link-danger" onClick={() => removeItem(item.productId)}>
              Remove
            </button>
          </div>
        ))}
      </div>

      {error && <p className="message error cart-error">{error}</p>}

      <div className="cart-summary">
        <button className="link-danger" onClick={clearCart}>
          Clear cart
        </button>
        <div className="cart-total">
          <span>Total</span>
          <strong>{money(totalPrice)} kr</strong>
        </div>
        <button className="btn" onClick={handleCheckout} disabled={submitting}>
          {submitting ? "Placing order..." : user ? "Checkout" : "Log in to checkout"}
        </button>
      </div>
    </div>
  );
}