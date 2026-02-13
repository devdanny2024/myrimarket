const express = require("express");
const cors = require("cors");

const {
  getCategories,
  getProducts,
  saveProducts,
  saveCategories,
} = require("./store");

const app = express();

app.use(
  cors({
    origin: process.env.WEB_ORIGIN ?? true,
    credentials: true,
  })
);
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "myri-api", ts: new Date().toISOString() });
});

// Public catalog
app.get("/categories", (_req, res) => {
  res.json(getCategories());
});

app.get("/products", (req, res) => {
  const { categoryId, q } = req.query;
  let items = getProducts().filter((p) => p.isActive);

  if (typeof categoryId === "string" && categoryId.trim()) {
    items = items.filter((p) => p.categoryId === categoryId);
  }

  if (typeof q === "string" && q.trim()) {
    const needle = q.toLowerCase();
    items = items.filter(
      (p) =>
        (p.title ?? "").toLowerCase().includes(needle) ||
        (p.shortDescription ?? "").toLowerCase().includes(needle)
    );
  }

  // Sort newest first
  items.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));

  res.json(items);
});

app.get("/products/:id", (req, res) => {
  const item = getProducts().find((p) => p.id === req.params.id);
  if (!item || !item.isActive) return res.status(404).json({ error: "Not found" });
  res.json(item);
});

function requireAdmin(req, res, next) {
  const token = req.header("x-admin-token");
  if (!process.env.ADMIN_TOKEN) {
    return res.status(500).json({ error: "ADMIN_TOKEN not configured" });
  }
  if (token !== process.env.ADMIN_TOKEN) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  return next();
}

// Admin: products
app.post("/admin/products", requireAdmin, (req, res) => {
  const products = getProducts();
  const p = req.body;
  if (!p?.id || !p?.title) return res.status(400).json({ error: "id and title are required" });
  if (products.some((x) => x.id === p.id)) {
    return res.status(409).json({ error: "Product id already exists" });
  }
  const now = new Date().toISOString();
  const next = {
    ...p,
    isActive: p.isActive ?? true,
    createdAt: p.createdAt ?? now,
  };
  products.push(next);
  saveProducts(products);
  res.json(next);
});

app.put("/admin/products/:id", requireAdmin, (req, res) => {
  const products = getProducts();
  const idx = products.findIndex((p) => p.id === req.params.id);
  if (idx < 0) return res.status(404).json({ error: "Not found" });
  products[idx] = { ...products[idx], ...req.body, id: req.params.id };
  saveProducts(products);
  res.json(products[idx]);
});

app.delete("/admin/products/:id", requireAdmin, (req, res) => {
  const products = getProducts();
  const next = products.filter((p) => p.id !== req.params.id);
  saveProducts(next);
  res.json({ ok: true });
});

// Admin: categories
app.put("/admin/categories", requireAdmin, (req, res) => {
  const categories = Array.isArray(req.body) ? req.body : null;
  if (!categories) return res.status(400).json({ error: "Expected array" });
  saveCategories(categories);
  res.json({ ok: true, count: categories.length });
});

const port = Number(process.env.PORT ?? 4001);
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`[myri-api] listening on http://localhost:${port}`);
});
