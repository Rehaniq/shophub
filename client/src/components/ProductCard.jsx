import { Link } from "react-router-dom";

export default function ProductCard({ product }) {
  const price = Number(product.price).toLocaleString("sv-SE");
  const soldOut = product.stock === 0;

  return (
    <Link to={`/product/${product.id}`} className="card">
      <img src={product.image_url} alt={product.name} loading="lazy" />
      <div className="card-body">
        <span className="card-category">{product.category}</span>
        <h3>{product.name}</h3>
        <div className="card-footer">
          <strong>{price} kr</strong>
          {soldOut && <span className="badge">Sold out</span>}
        </div>
      </div>
    </Link>
  );
}