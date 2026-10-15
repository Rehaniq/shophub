import { useEffect, useState } from "react";
import { api } from "../api.js";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api("/products")
      .then(setProducts)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h1>ShopHub</h1>
      <ul>
        {products.map((p) => (
          <li key={p.id}>
            {p.name} - {Number(p.price)} kr
          </li>
        ))}
      </ul>
    </div>
  );
}