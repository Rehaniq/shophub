import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api.js";
import { useCart } from "../context/CartContext.jsx";

export default function ProductPage() {
  const { id } = useParams();
  const { addItem } = useCart();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    api(`/products/${id}`)
      .then((data) => {
        if (!cancelled) {
          setProduct(data);
          setQuantity(1);
        }
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
  }, [id]);

  const handleAdd = () => {
    addItem(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) return <p className="message">Loading...</p>;
  if (error) {
    return (
      <div className="container">
        <p className="message error">{error}</p>
        <p className="message">
          <Link to="/">Back to shop</Link>
        </p>
      </div>
    );
  }

  const soldOut = product.stock === 0;

  return (
    <div className="container">
      <Link to="/" className="back-link">
        ← Back to shop
      </Link>

      <div className="detail">
        <img src={product.image_url} alt={product.name} className="detail-img" />

        <div className="detail-info">
          <span className="card-category">{product.category}</span>
          <h1>{product.name}</h1>
          <p className="detail-price">{Number(product.price).toLocaleString("sv-SE")} kr</p>
          <p>{product.description}</p>
          <p className="stock">
            {soldOut ? "Sold out" : `${product.stock} in stock`}
          </p>

          {!soldOut && (
            <div className="detail-actions">
              <div className="qty">
                <button onClick={() => setQuantity((q) => Math.max(1, q - 1))}>−</button>
                <span>{quantity}</span>
                <button onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}>
                  +
                </button>
              </div>
              <button className="btn" onClick={handleAdd}>
                {added ? "Added ✓" : "Add to cart"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}