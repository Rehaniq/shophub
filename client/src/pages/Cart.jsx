import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";

const money = (n) => n.toLocaleString("sv-SE");

export default function Cart() {
  const { items, updateQuantity, removeItem, clearCart, totalPrice } = useCart();

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

      <div className="cart-summary">
        <button className="link-danger" onClick={clearCart}>
          Clear cart
        </button>
        <div className="cart-total">
          <span>Total</span>
          <strong>{money(totalPrice)} kr</strong>
        </div>
        <button className="btn" disabled title="Checkout comes on Day 3">
          Checkout
        </button>
      </div>
    </div>
  );
}