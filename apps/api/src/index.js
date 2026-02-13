const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const crypto = require("crypto");

const {
  getCategories,
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  replaceCategories,
  createOrder,
  updateOrder,
} = require("./store-db");
const { getPaystack } = require("./paystack");

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
app.get("/categories", async (_req, res) => {
  try {
    res.json(await getCategories());
  } catch (e) {
    res.status(500).json({ error: e?.message ?? "Failed" });
  }
});

app.get("/products", async (req, res) => {
  try {
    const { categoryId, q } = req.query;
    const items = await getProducts({
      categoryId: typeof categoryId === "string" ? categoryId : undefined,
      q: typeof q === "string" ? q : undefined,
    });
    res.json(items);
  } catch (e) {
    res.status(500).json({ error: e?.message ?? "Failed" });
  }
});

app.get("/products/:id", async (req, res) => {
  try {
    const item = await getProduct(req.params.id);
    if (!item) return res.status(404).json({ error: "Not found" });
    res.json(item);
  } catch (e) {
    res.status(500).json({ error: e?.message ?? "Failed" });
  }
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
app.post("/admin/products", requireAdmin, async (req, res) => {
  try {
    const p = req.body;
    if (!p?.id || !p?.title || !p?.categoryId) {
      return res.status(400).json({ error: "id, title, categoryId are required" });
    }
    const created = await createProduct(p);
    res.json(created);
  } catch (e) {
    const msg = e?.message ?? "Create failed";
    if (msg.toLowerCase().includes("unique") || msg.toLowerCase().includes("duplicate")) {
      return res.status(409).json({ error: msg });
    }
    res.status(500).json({ error: msg });
  }
});

app.put("/admin/products/:id", requireAdmin, async (req, res) => {
  try {
    const updated = await updateProduct(req.params.id, req.body ?? {});
    res.json(updated);
  } catch (e) {
    const msg = e?.message ?? "Update failed";
    if (msg.toLowerCase().includes("record") && msg.toLowerCase().includes("not found")) {
      return res.status(404).json({ error: "Not found" });
    }
    res.status(500).json({ error: msg });
  }
});

app.delete("/admin/products/:id", requireAdmin, async (req, res) => {
  try {
    await deleteProduct(req.params.id);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e?.message ?? "Delete failed" });
  }
});

// Admin: categories
app.put("/admin/categories", requireAdmin, async (req, res) => {
  try {
    const categories = Array.isArray(req.body) ? req.body : null;
    if (!categories) return res.status(400).json({ error: "Expected array" });
    const result = await replaceCategories(categories);
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e?.message ?? "Update failed" });
  }
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

    await createOrder({
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
    await updateOrder(orderId, {
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
      await updateOrder(orderId, {
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
