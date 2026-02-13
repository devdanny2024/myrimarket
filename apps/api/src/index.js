const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const crypto = require("crypto");

const {
  getCategories,
  getProducts,
  saveProducts,
  saveCategories,
} = require("./store");
const { getPaystack } = require("./paystack");
const { createOrder, updateOrder } = require("./orders");

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

// Static uploads (for product images)
const UPLOAD_DIR = path.join(__dirname, "..", "uploads");
app.use("/uploads", express.static(UPLOAD_DIR));

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

// Simple admin login check
app.post("/admin/login", (req, res) => {
  const token = req.body?.token;
  if (!process.env.ADMIN_TOKEN) {
    return res.status(500).json({ error: "ADMIN_TOKEN not configured" });
  }
  if (token !== process.env.ADMIN_TOKEN) {
    return res.status(401).json({ error: "Invalid token" });
  }
  return res.json({ ok: true });
});

// Admin: upload product images
const fs = require("fs");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });
const { makeUploader } = require("./upload");
const upload = makeUploader(UPLOAD_DIR);

app.post("/admin/upload", requireAdmin, upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file" });
  const url = `/uploads/${req.file.filename}`;
  res.json({ ok: true, url });
});

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

// Paystack: initialize NGN payment
app.post("/paystack/initialize", async (req, res) => {
  try {
    const { email, productId, amountNgn } = req.body ?? {};
    if (!email || !productId || !amountNgn) {
      return res.status(400).json({ error: "email, productId, amountNgn are required" });
    }

    const product = getProducts().find((p) => p.id === productId);
    if (!product || !product.isActive) {
      return res.status(404).json({ error: "Product not found" });
    }

    const amountKobo = Math.round(Number(amountNgn) * 100);
    const orderId = crypto.randomBytes(12).toString("hex");

    createOrder({
      id: orderId,
      productId,
      email,
      currency: "NGN",
      amount: Number(amountNgn),
      status: "initialized",
    });

    const paystack = getPaystack();
    const init = await paystack.transaction.initialize({
      email,
      amount: amountKobo,
      metadata: {
        orderId,
        productId,
      },
    });

    // init.data.authorization_url
    updateOrder(orderId, {
      status: "pending",
      paystackRef: init?.data?.reference,
    });

    return res.json({
      ok: true,
      orderId,
      reference: init?.data?.reference,
      authorization_url: init?.data?.authorization_url,
    });
  } catch (e) {
    return res.status(500).json({ error: e?.message ?? "Paystack initialize failed" });
  }
});

// Paystack: verify
app.get("/paystack/verify/:reference", async (req, res) => {
  try {
    const reference = req.params.reference;
    const paystack = getPaystack();
    const result = await paystack.transaction.verify(reference);
    const status = result?.data?.status;
    const meta = result?.data?.metadata ?? {};

    const orderId = meta.orderId;
    if (orderId) {
      updateOrder(orderId, {
        status: status === "success" ? "paid" : status,
        paystackRef: reference,
      });
    }

    res.json({ ok: true, status, data: result?.data });
  } catch (e) {
    res.status(500).json({ error: e?.message ?? "Verify failed" });
  }
});

const port = Number(process.env.PORT ?? 4001);
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`[myri-api] listening on http://localhost:${port}`);
});
