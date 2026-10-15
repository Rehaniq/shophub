import { useEffect, useState } from "react";
import { api } from "../api.js";

const emptyForm = {
  name: "",
  description: "",
  price: "",
  category: "",
  image_url: "",
  stock: "",
};

const money = (n) => Number(n).toLocaleString("sv-SE");

export default function Admin() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let cancelled = false;

    api("/products")
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
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setFormError("");
  };

  const startEdit = (product) => {
    setEditingId(product.id);
    setFormError("");
    setNotice("");
    setForm({
      name: product.name,
      description: product.description || "",
      price: String(Number(product.price)),
      category: product.category || "",
      image_url: product.image_url || "",
      stock: String(product.stock),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setNotice("");

    const price = Number(form.price);
    const stock = form.stock === "" ? 0 : Number(form.stock);

    if (!form.name.trim()) {
      setFormError("Name is required");
      return;
    }
    if (form.price === "" || Number.isNaN(price) || price < 0) {
      setFormError("Enter a valid price");
      return;
    }
    if (!Number.isInteger(stock) || stock < 0) {
      setFormError("Stock must be a whole number, 0 or more");
      return;
    }

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price,
      category: form.category.trim(),
      image_url: form.image_url.trim(),
      stock,
    };

    setSaving(true);
    try {
      if (editingId) {
        const updated = await api(`/products/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        setProducts((prev) => prev.map((p) => (p.id === editingId ? updated : p)));
        setNotice(`Updated "${updated.name}"`);
      } else {
        const created = await api("/products", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        setProducts((prev) => [...prev, created]);
        setNotice(`Added "${created.name}"`);
      }
      resetForm();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (product) => {
    if (!window.confirm(`Delete "${product.name}"?`)) return;

    setNotice("");
    setError("");
    try {
      await api(`/products/${product.id}`, { method: "DELETE" });
      setProducts((prev) => prev.filter((p) => p.id !== product.id));
      if (editingId === product.id) resetForm();
      setNotice(`Deleted "${product.name}"`);
    } catch (err) {
      // For example the 409 message when the product is part of existing orders
      setError(err.message);
    }
  };

  return (
    <div className="container">
      <h1>Admin: products</h1>

      <form className="admin-form" onSubmit={handleSubmit}>
        <h2>{editingId ? `Edit product #${editingId}` : "Add a product"}</h2>

        {formError && <p className="message error form-error">{formError}</p>}

        <div className="admin-fields">
          <label>
            Name
            <input name="name" value={form.name} onChange={handleChange} required />
          </label>

          <label>
            Category
            <input name="category" value={form.category} onChange={handleChange} />
          </label>

          <label>
            Price (kr)
            <input
              name="price"
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Stock
            <input
              name="stock"
              type="number"
              min="0"
              step="1"
              value={form.stock}
              onChange={handleChange}
            />
          </label>

          <label className="wide">
            Image URL
            <input name="image_url" value={form.image_url} onChange={handleChange} />
          </label>

          <label className="wide">
            Description
            <textarea
              name="description"
              rows="3"
              value={form.description}
              onChange={handleChange}
            />
          </label>
        </div>

        <div className="admin-form-actions">
          <button className="btn" type="submit" disabled={saving}>
            {saving ? "Saving..." : editingId ? "Save changes" : "Add product"}
          </button>
          {editingId && (
            <button type="button" className="btn btn-secondary" onClick={resetForm}>
              Cancel
            </button>
          )}
        </div>
      </form>

      {notice && <p className="message success">{notice}</p>}
      {error && <p className="message error">{error}</p>}
      {loading && <p className="message">Loading...</p>}

      {!loading && (
        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th></th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className={editingId === p.id ? "editing" : ""}>
                  <td>
                    <img src={p.image_url} alt="" />
                  </td>
                  <td>{p.name}</td>
                  <td>{p.category}</td>
                  <td>{money(p.price)} kr</td>
                  <td>{p.stock}</td>
                  <td className="admin-actions">
                    <button className="link-button" onClick={() => startEdit(p)}>
                      Edit
                    </button>
                    <button className="link-danger" onClick={() => handleDelete(p)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}