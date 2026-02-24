const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const { getSupabaseAdmin } = require("./supabase");
const { slugify } = require("./slugify");
const { getPaystack } = require("./paystack");

const app = express();
app.use(cors({ origin: process.env.WEB_ORIGIN ?? true, credentials: true }));
app.use(express.json({ limit: "2mb" }));

function requireAdmin(req, res, next) {
  const token = req.header("x-admin-token");
  if (!process.env.ADMIN_TOKEN) return res.status(500).json({ error: "ADMIN_TOKEN not configured" });
  if (token !== process.env.ADMIN_TOKEN) return res.status(401).json({ error: "Unauthorized" });
  return next();
}

function requireIngestionKey(req, res, next) {
  const key = req.header("x-ingestion-key");
  if (!process.env.INGESTION_API_KEY) return res.status(500).json({ error: "INGESTION_API_KEY not configured" });
  if (key !== process.env.INGESTION_API_KEY) return res.status(401).json({ error: "Unauthorized" });
  return next();
}

async function upsertRadarProducts(payload) {
  const supabase = getSupabaseAdmin();
  const runDate = payload?.runDate ?? new Date().toISOString().slice(0, 10);
  const products = payload?.topProducts ?? [];

  const { data: runRow, error: runErr } = await supabase
    .from("sync_runs")
    .insert({
      source: "product-radar",
      run_date: runDate,
      status: "running",
      total_candidates: products.length,
      payload,
    })
    .select("id")
    .single();
  if (runErr) throw runErr;

  for (const p of products) {
    const categorySlug = slugify(p.category || "general");
    const categoryName = p.category || "General";

    await supabase.from("categories").upsert({ slug: categorySlug, name: categoryName }, { onConflict: "slug" });

    const { data: category } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", categorySlug)
      .single();

    const { data: source } = await supabase
      .from("sources")
      .upsert(
        {
          name: p.source || "Unknown source",
          source_type: p.sourceType || "unknown",
          status: p.sourceStatus || "unknown",
          country: p.country || "NG",
        },
        { onConflict: "name" }
      )
      .select("id")
      .single();

    const productSlug = slugify(p.name);

    const { data: product, error: productErr } = await supabase
      .from("products")
      .upsert(
        {
          slug: productSlug,
          title: p.name,
          category_id: category?.id,
          source_id: source?.id,
          short_description: `Sourced via Product Radar (${runDate})`,
          source_url: p.productUrl,
          weighted_score: p.weightedScore,
          is_published: false,
        },
        { onConflict: "slug" }
      )
      .select("id")
      .single();

    if (productErr) throw productErr;

    const scorePayload = {
      product_id: product.id,
      sync_run_id: runRow.id,
      trend_velocity: p.scoreBreakdown?.trendVelocity ?? p.trendVelocity,
      margin_potential: p.scoreBreakdown?.marginPotential ?? p.marginPotential,
      supplier_reliability: p.scoreBreakdown?.supplierReliability ?? p.supplierReliability,
      delivery_fit: p.scoreBreakdown?.deliveryFit ?? p.deliveryFit,
      repeat_potential: p.scoreBreakdown?.repeatPotential ?? p.repeatPotential,
      weighted_score: p.weightedScore,
      rank: p.rank,
    };

    const { error: scoreErr } = await supabase.from("scores").insert(scorePayload);
    if (scoreErr) throw scoreErr;
  }

  await supabase.from("sync_runs").update({ status: "success", finished_at: new Date().toISOString() }).eq("id", runRow.id);

  return { runId: runRow.id, inserted: products.length };
}

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "myri-api", ts: new Date().toISOString() });
});

app.get("/categories", async (_req, res) => {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.from("categories").select("id,name,slug").order("name");
    if (error) throw error;
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message || "Failed" });
  }
});

app.get("/products", async (req, res) => {
  try {
    const supabase = getSupabaseAdmin();
    const reviewedOnly = req.query.reviewedOnly !== "false";

    let query = supabase
      .from("products")
      .select("id,slug,title,short_description,image_url,price_ngn,compare_at_ngn,is_active,is_published,reviewed_at,source_url,weighted_score,category:categories(id,name,slug)")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (req.query.categorySlug) {
      const { data: c } = await supabase.from("categories").select("id").eq("slug", req.query.categorySlug).single();
      if (c?.id) query = query.eq("category_id", c.id);
    }

    if (reviewedOnly) query = query.not("reviewed_at", "is", null).eq("is_published", true);

    const { data, error } = await query;
    if (error) throw error;

    res.json(
      (data || []).map((p) => ({
        id: p.slug || p.id,
        dbId: p.id,
        title: p.title,
        categoryId: p.category?.id,
        categoryName: p.category?.name,
        shortDescription: p.short_description,
        image: p.image_url,
        priceNgn: p.price_ngn,
        compareAtNgn: p.compare_at_ngn,
        isActive: p.is_active,
        reviewedAt: p.reviewed_at,
        sourceUrl: p.source_url,
        weightedScore: p.weighted_score,
      }))
    );
  } catch (e) {
    res.status(500).json({ error: e.message || "Failed" });
  }
});

app.get("/products/:id", async (req, res) => {
  try {
    const supabase = getSupabaseAdmin();
    const id = req.params.id;
    const { data, error } = await supabase
      .from("products")
      .select("id,slug,title,short_description,image_url,price_ngn,compare_at_ngn,is_active,reviewed_at,is_published,source_url,weighted_score,category:categories(id,name,slug)")
      .or(`slug.eq.${id},id.eq.${id}`)
      .single();
    if (error) throw error;

    if (!data.is_active || !data.is_published || !data.reviewed_at) {
      return res.status(404).json({ error: "Not found" });
    }

    res.json({
      id: data.slug || data.id,
      dbId: data.id,
      title: data.title,
      categoryId: data.category?.id,
      shortDescription: data.short_description,
      image: data.image_url,
      priceNgn: data.price_ngn,
      compareAtNgn: data.compare_at_ngn,
      isActive: data.is_active,
      reviewedAt: data.reviewed_at,
      sourceUrl: data.source_url,
      weightedScore: data.weighted_score,
    });
  } catch (e) {
    res.status(404).json({ error: e.message || "Not found" });
  }
});

app.post("/admin/login", (req, res) => {
  if (req.body?.token !== process.env.ADMIN_TOKEN) return res.status(401).json({ error: "Invalid token" });
  res.json({ ok: true });
});

app.get("/admin/reviewed-products", requireAdmin, async (_req, res) => {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("products")
      .select("id,slug,title,reviewed_at,is_published,weighted_score,price_ngn")
      .not("reviewed_at", "is", null)
      .order("reviewed_at", { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message || "Failed" });
  }
});

app.put("/admin/products/:id/review", requireAdmin, async (req, res) => {
  try {
    const supabase = getSupabaseAdmin();
    const { isPublished = true, priceNgn = 0, compareAtNgn = null } = req.body || {};
    const { data, error } = await supabase
      .from("products")
      .update({
        reviewed_at: new Date().toISOString(),
        is_published: Boolean(isPublished),
        price_ngn: Number(priceNgn),
        compare_at_ngn: compareAtNgn == null ? null : Number(compareAtNgn),
      })
      .eq("id", req.params.id)
      .select("id,slug,title,reviewed_at,is_published,price_ngn,compare_at_ngn")
      .single();
    if (error) throw error;
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message || "Failed" });
  }
});

app.post("/ingestion/product-radar/upsert", requireIngestionKey, async (req, res) => {
  try {
    const result = await upsertRadarProducts(req.body || {});
    res.json({ ok: true, ...result });
  } catch (e) {
    res.status(500).json({ error: e.message || "Ingestion failed" });
  }
});

app.post("/cron/daily-sync", requireIngestionKey, async (_req, res) => {
  try {
    const base = path.join(__dirname, "..", "..", "..", "modules", "product-radar", "reports");
    const days = fs.existsSync(base) ? fs.readdirSync(base).sort().reverse() : [];
    if (!days.length) return res.status(400).json({ error: "No product-radar reports found" });
    const reportPath = path.join(base, days[0], "product-radar-report.json");
    const payload = JSON.parse(fs.readFileSync(reportPath, "utf8"));
    const result = await upsertRadarProducts(payload);
    res.json({ ok: true, reportPath, ...result });
  } catch (e) {
    res.status(500).json({ error: e.message || "Daily sync failed" });
  }
});

app.post("/paystack/initialize", async (req, res) => {
  try {
    const { email, productId, amountNgn } = req.body ?? {};
    if (!email || !productId || !amountNgn) return res.status(400).json({ error: "email, productId, amountNgn required" });
    const paystack = getPaystack();
    const amountKobo = Math.round(Number(amountNgn) * 100);
    const orderId = crypto.randomBytes(12).toString("hex");
    const init = await paystack.transaction.initialize({ email, amount: amountKobo, metadata: { orderId, productId } });
    res.json({ ok: true, orderId, reference: init?.data?.reference, authorization_url: init?.data?.authorization_url });
  } catch (e) {
    res.status(500).json({ error: e.message || "Paystack initialize failed" });
  }
});

const port = Number(process.env.PORT ?? 4001);
if (require.main === module) {
  app.listen(port, () => console.log(`[myri-api] listening on http://localhost:${port}`));
}

module.exports = app;
