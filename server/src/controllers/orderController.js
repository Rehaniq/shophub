import pool from "../db.js";

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

// POST /api/orders
// Body: { "items": [ { "productId": 1, "quantity": 2 }, ... ] }
export const createOrder = async (req, res) => {
  const { items } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "Cart is empty" });
  }

  // Validate the input and merge duplicate products
  const wanted = new Map();
  for (const item of items) {
    const productId = Number(item.productId);
    const quantity = Number(item.quantity);
    if (!Number.isInteger(productId) || !Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({ message: "Invalid product or quantity" });
    }
    wanted.set(productId, (wanted.get(productId) || 0) + quantity);
  }

  // A transaction needs ONE dedicated connection from the pool
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    let totalCents = 0;
    const lines = [];

    for (const [productId, quantity] of wanted) {
      // FOR UPDATE locks the row until the transaction ends,
      // so two customers can't buy the last item at the same time
      const result = await client.query(
        "SELECT id, name, price, stock FROM products WHERE id = $1 FOR UPDATE",
        [productId]
      );
      const product = result.rows[0];

      if (!product) {
        throw new HttpError(400, `Product ${productId} does not exist`);
      }
      if (product.stock < quantity) {
        throw new HttpError(
          400,
          `Not enough stock for "${product.name}" (only ${product.stock} left)`
        );
      }

      // Work in cents to avoid decimal rounding problems
      const priceCents = Math.round(Number(product.price) * 100);
      totalCents += priceCents * quantity;
      lines.push({ productId, quantity, price: product.price });
    }

    const orderResult = await client.query(
      "INSERT INTO orders (user_id, total) VALUES ($1, $2) RETURNING *",
      [req.user.id, (totalCents / 100).toFixed(2)]
    );
    const order = orderResult.rows[0];

    for (const line of lines) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, quantity, price)
         VALUES ($1, $2, $3, $4)`,
        [order.id, line.productId, line.quantity, line.price]
      );
      await client.query(
        "UPDATE products SET stock = stock - $1 WHERE id = $2",
        [line.quantity, line.productId]
      );
    }

    await client.query("COMMIT");
    res.status(201).json(order);
  } catch (err) {
    await client.query("ROLLBACK");
    if (err instanceof HttpError) {
      return res.status(err.status).json({ message: err.message });
    }
    console.error(err);
    res.status(500).json({ message: "Server error" });
  } finally {
    client.release();
  }
};

// GET /api/orders/my
export const getMyOrders = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT o.id, o.total, o.status, o.created_at,
              COALESCE(
                json_agg(
                  json_build_object(
                    'product_id', oi.product_id,
                    'name', p.name,
                    'quantity', oi.quantity,
                    'price', oi.price
                  )
                ) FILTER (WHERE oi.id IS NOT NULL),
                '[]'
              ) AS items
       FROM orders o
       LEFT JOIN order_items oi ON oi.order_id = o.id
       LEFT JOIN products p ON p.id = oi.product_id
       WHERE o.user_id = $1
       GROUP BY o.id
       ORDER BY o.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};