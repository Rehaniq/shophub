import "dotenv/config";
import express from "express";
import cors from "cors";
import pool from "./db.js";
import productRoutes from "./routes/productRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/products", productRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "ShopHub API is running" });
});

app.get("/api/db-test", async (req, res) => {
  try {
    const result = await pool.query("SELECT COUNT(*) FROM products");
    res.json({ connected: true, products: result.rows[0].count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ connected: false, error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});