let prisma;

function getPrisma() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL not configured");
  }

  if (!prisma) {
    // Lazy require so server can still run in memory fallback mode
    // when DATABASE_URL is intentionally not set.
    // eslint-disable-next-line global-require
    const { PrismaClient } = require("@prisma/client");
    prisma = new PrismaClient();
  }

  return prisma;
}

module.exports = { getPrisma };
