const { getPrisma } = require("./db");

async function getCategories() {
  const prisma = getPrisma();
  return prisma.category.findMany({ orderBy: { name: "asc" } });
}

async function getProducts({ categoryId, q } = {}) {
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

  return prisma.product.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
}

async function getProduct(id) {
  const prisma = getPrisma();
  return prisma.product.findFirst({ where: { id, isActive: true } });
}

async function upsertProduct(id, patch) {
  const prisma = getPrisma();
  return prisma.product.upsert({
    where: { id },
    update: {
      ...patch,
      id,
    },
    create: {
      id,
      title: patch.title ?? "Untitled",
      categoryId: patch.categoryId,
      shortDescription: patch.shortDescription ?? null,
      image: patch.image ?? null,
      priceNgn: Number(patch.priceNgn ?? 0),
      compareAtNgn: patch.compareAtNgn ?? null,
      btcEnabled: Boolean(patch.btcEnabled ?? false),
      priceBtc: patch.priceBtc ?? null,
      compareAtBtc: patch.compareAtBtc ?? null,
      badge: patch.badge ?? null,
      isActive: patch.isActive ?? true,
    },
  });
}

async function createProduct(p) {
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
  const prisma = getPrisma();
  return prisma.product.update({
    where: { id },
    data: {
      ...patch,
      id,
      priceNgn:
        patch.priceNgn !== undefined ? Number(patch.priceNgn) : undefined,
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
  const prisma = getPrisma();
  await prisma.product.delete({ where: { id } });
  return { ok: true };
}

async function replaceCategories(categories) {
  const prisma = getPrisma();
  // Simple replace: delete all then insert (acceptable for small catalog)
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
  const prisma = getPrisma();
  return prisma.order.update({
    where: { id },
    data: {
      ...patch,
    },
  });
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
