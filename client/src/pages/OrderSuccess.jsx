import { Link, useParams } from "react-router-dom";

export default function OrderSuccess() {
  const { id } = useParams();

  return (
    <div className="container">
      <div className="success-card">
        <div className="success-icon">✓</div>
        <h1>Thank you for your order!</h1>
        <p>
          Your order number is <strong>#{id}</strong>.
        </p>
        <Link to="/" className="btn btn-link">
          Continue shopping
        </Link>
      </div>
    </div>
  );
}