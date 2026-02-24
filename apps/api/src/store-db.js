const { getPrisma } = require("./db");

const useMemory = !process.env.DATABASE_URL;

const memory = {
  categories: [
    { id: "cat_templates", name: "Templates", slug: "templates", icon: "🧩" },
    { id: "cat_courses", name: "Courses", slug: "courses", icon: "🎓" },
    { id: "cat_assets", name: "Design Assets", slug: "assets", icon: "🎨" },
    { id: "cat_tools", name: "Tools", slug: "tools", icon: "🛠️" },
  ],
  products: [
    {
      id: "prod_1",
      title: "CV Template Pack (ATS-ready)",
      categoryId: "cat_templates",
      shortDescription: "Clean, modern, ATS-friendly CV templates (DOCX + Google Docs).",
      image: null,
      priceNgn: 3500,
      compareAtNgn: 7000,
      btcEnabled: true,
      priceBtc: 0.00005,
      compareAtBtc: null,
      badge: "Best Seller",
      isActive: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: "prod_2",
      title: "Instagram Reel Caption Kit",
      categoryId: "cat_assets",
      shortDescription: "100+ captions + hooks to boost engagement.",
      image: null,
      priceNgn: 2000,
      compareAtNgn: 5000,
      btcEnabled: false,
      priceBtc: null,
      compareAtBtc: null,
      badge: "Hot",
      isActive: true,
      createdAt: new Date().toISOString(),
    },
  ],
  orders: [],
};

async function getCategories() {
  if (useMemory) {
    return [...memory.categories].sort((a, b) => a.name.localeCompare(b.name));
  }
  const prisma = getPrisma();
  return prisma.category.findMany({ orderBy: { name: "asc" } });
}

async function getProducts({ categoryId, q } = {}) {
  if (useMemory) {
    let items = memory.products.filter((p) => p.isActive);
    if (categoryId) items = items.filter((p) => p.categoryId === categoryId);
    if (q) {
      const term = q.toLowerCase();
      items = items.filter(
        (p) =>
          p.title.toLowerCase().includes(term) ||
          (p.shortDescription || "").toLowerCase().includes(term)
      );
    }
    return items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  const prisma = getPrisma();
  const where = {
    isActive: true,
    ...(categoryId ? { categoryId } : {}),
    ...(q
      ? {
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { shortDescription: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  return prisma.product.findMany({ where, orderBy: { createdAt: "desc" } });
}

async function getProduct(id) {
  if (useMemory) {
    return memory.products.find((p) => p.id === id && p.isActive) || null;
  }
  const prisma = getPrisma();
  return prisma.product.findFirst({ where: { id, isActive: true } });
}

async function createProduct(p) {
  if (useMemory) {
    if (memory.products.some((x) => x.id === p.id)) {
      throw new Error("Duplicate product id");
    }
    const item = {
      id: p.id,
      title: p.title,
      categoryId: p.categoryId,
      shortDescription: p.shortDescription ?? null,
      image: p.image ?? null,
      priceNgn: Number(p.priceNgn ?? 0),
      compareAtNgn: p.compareAtNgn ?? null,
      btcEnabled: Boolean(p.btcEnabled ?? false),
      priceBtc: p.priceBtc ?? null,
      compareAtBtc: p.compareAtBtc ?? null,
      badge: p.badge ?? null,
      isActive: p.isActive ?? true,
      createdAt: p.createdAt ?? new Date().toISOString(),
    };
    memory.products.unshift(item);
    return item;
  }

  const prisma = getPrisma();
  return prisma.product.create({
    data: {
      id: p.id,
      title: p.title,
      categoryId: p.categoryId,
      shortDescription: p.shortDescription ?? null,
      image: p.image ?? null,
      priceNgn: Number(p.priceNgn ?? 0),
      compareAtNgn: p.compareAtNgn ?? null,
      btcEnabled: Boolean(p.btcEnabled ?? false),
      priceBtc: p.priceBtc ?? null,
      compareAtBtc: p.compareAtBtc ?? null,
      badge: p.badge ?? null,
      isActive: p.isActive ?? true,
      createdAt: p.createdAt ? new Date(p.createdAt) : undefined,
    },
  });
}

async function updateProduct(id, patch) {
  if (useMemory) {
    const idx = memory.products.findIndex((p) => p.id === id);
    if (idx < 0) throw new Error("Record not found");
    const current = memory.products[idx];
    const next = {
      ...current,
      ...patch,
      priceNgn: patch.priceNgn !== undefined ? Number(patch.priceNgn) : current.priceNgn,
      compareAtNgn:
        patch.compareAtNgn !== undefined
          ? patch.compareAtNgn === null
            ? null
            : Number(patch.compareAtNgn)
          : current.compareAtNgn,
    };
    memory.products[idx] = next;
    return next;
  }

  const prisma = getPrisma();
  return prisma.product.update({
    where: { id },
    data: {
      ...patch,
      id,
      priceNgn: patch.priceNgn !== undefined ? Number(patch.priceNgn) : undefined,
      compareAtNgn:
        patch.compareAtNgn !== undefined
          ? patch.compareAtNgn === null
            ? null
            : Number(patch.compareAtNgn)
          : undefined,
    },
  });
}

async function deleteProduct(id) {
  if (useMemory) {
    const idx = memory.products.findIndex((p) => p.id === id);
    if (idx >= 0) memory.products.splice(idx, 1);
    return { ok: true };
  }
  const prisma = getPrisma();
  await prisma.product.delete({ where: { id } });
  return { ok: true };
}

async function replaceCategories(categories) {
  if (useMemory) {
    memory.categories = categories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      icon: c.icon ?? null,
    }));
    return { ok: true, count: memory.categories.length };
  }
  const prisma = getPrisma();
  await prisma.category.deleteMany({});
  await prisma.category.createMany({
    data: categories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      icon: c.icon ?? null,
    })),
  });
  return { ok: true, count: categories.length };
}

async function createOrder(o) {
  if (useMemory) {
    const item = {
      id: o.id,
      productId: o.productId,
      email: o.email,
      currency: o.currency,
      amount: Number(o.amount),
      status: o.status,
      paystackRef: o.paystackRef ?? null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    memory.orders.push(item);
    return item;
  }
  const prisma = getPrisma();
  return prisma.order.create({
    data: {
      id: o.id,
      productId: o.productId,
      email: o.email,
      currency: o.currency,
      amount: Number(o.amount),
      status: o.status,
      paystackRef: o.paystackRef ?? null,
    },
  });
}

async function updateOrder(id, patch) {
  if (useMemory) {
    const idx = memory.orders.findIndex((o) => o.id === id);
    if (idx < 0) return null;
    memory.orders[idx] = { ...memory.orders[idx], ...patch, updatedAt: new Date().toISOString() };
    return memory.orders[idx];
  }
  const prisma = getPrisma();
  return prisma.order.update({ where: { id }, data: { ...patch } });
}

module.exports = {
  getCategories,
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  replaceCategories,
  createOrder,
  updateOrder,
};
