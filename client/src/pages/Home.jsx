import { useEffect, useState } from "react";
import { api } from "../api.js";
import ProductCard from "../components/ProductCard.jsx";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load the category list once
  useEffect(() => {
    api("/products/categories").then(setCategories).catch(() => { });
  }, []);

  // Wait 300ms after the user stops typing before searching
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Load products whenever the search or category changes
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    const params = new URLSearchParams();
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (category) params.set("category", category);
    const query = params.toString();

    api(`/products${query ? `?${query}` : ""}`)
      .then((data) => {
        if (!cancelled) setProducts(data);
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
  }, [debouncedSearch, category]);

  return (
    <div className="container">
      <header className="page-header">
        <h1>ShopHub</h1>
        <input
          type="search"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </header>

      <div className="filters">
        <button
          className={category === "" ? "chip active" : "chip"}
          onClick={() => setCategory("")}
        >
          All
        </button>
        {categories.map((c) => (
          <button
            key={c}
            className={category === c ? "chip active" : "chip"}
            onClick={() => setCategory(c)}
          >
            {c}
          </button>
        ))}
      </div>

      {error && <p className="message error">{error}</p>}
      {loading && <p className="message">Loading...</p>}
      {!loading && !error && products.length === 0 && (
        <p className="message">No products found.</p>
      )}

      <div className="grid">
        {!loading && products.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
    </div>
  );
}