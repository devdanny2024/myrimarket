export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:4001";

// Frontend-only preview mode:
// If no real API base is configured (e.g. Vercel env vars not set),
// return mock data so the UI can render without a backend.
const BACKEND_ENABLED =
  !!process.env.NEXT_PUBLIC_API_BASE &&
  !process.env.NEXT_PUBLIC_API_BASE.includes("localhost") &&
  !process.env.NEXT_PUBLIC_API_BASE.includes("127.0.0.1");

const MOCK_CATEGORIES: Category[] = [
  { id: "cat_templates", name: "Templates", slug: "templates", icon: "📄" },
  { id: "cat_courses", name: "Courses", slug: "courses", icon: "🎓" },
  { id: "cat_assets", name: "Design Assets", slug: "assets", icon: "🎨" },
  { id: "cat_tools", name: "Tools", slug: "tools", icon: "🧰" },
];

const MOCK_PRODUCTS: Product[] = [
  {
    id: "prod_1",
    title: "CV Template Pack (ATS-ready)",
    categoryId: "cat_templates",
    shortDescription: "Clean, modern, ATS-friendly CV templates (DOCX + Google Docs).",
    priceNgn: 3500,
    compareAtNgn: 7000,
    btcEnabled: true,
    priceBtc: 0.00005,
    badge: "Best Seller",
    isActive: true,
  },
  {
    id: "prod_2",
    title: "Instagram Reel Caption Kit",
    categoryId: "cat_assets",
    shortDescription: "100+ captions + hooks to boost engagement.",
    priceNgn: 2000,
    compareAtNgn: 5000,
    btcEnabled: false,
    badge: "Hot",
    isActive: true,
  },
  {
    id: "prod_3",
    title: "Mini-course: Sell Digital Products",
    categoryId: "cat_courses",
    shortDescription: "A practical starter course to launch your first digital product.",
    priceNgn: 9500,
    compareAtNgn: 15000,
    btcEnabled: true,
    priceBtc: 0.00012,
    badge: null,
    isActive: true,
  },
  {
    id: "prod_4",
    title: "Notion Business Dashboard",
    categoryId: "cat_tools",
    shortDescription: "Track sales, tasks, and inventory with a clean Notion template.",
    priceNgn: 4500,
    compareAtNgn: 9000,
    btcEnabled: false,
    badge: "New",
    isActive: true,
  },
];

export type Category = {
  id: string;
  name: string;
  slug: string;
  icon?: string;
};

export type Product = {
  id: string;
  title: string;
  categoryId: string;
  shortDescription?: string;
  image?: string;
  priceNgn: number;
  compareAtNgn?: number | null;
  btcEnabled?: boolean;
  priceBtc?: number | null;
  compareAtBtc?: number | null;
  badge?: string | null;
  isActive?: boolean;
  createdAt?: string;
};

export async function fetchCategories(): Promise<Category[]> {
  if (!BACKEND_ENABLED) return MOCK_CATEGORIES;

  const res = await fetch(`${API_BASE}/categories`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch categories");
  return res.json();
}

export async function fetchProducts(opts?: {
  categoryId?: string;
  q?: string;
}): Promise<Product[]> {
  if (!BACKEND_ENABLED) {
    let items = [...MOCK_PRODUCTS];
    if (opts?.categoryId) items = items.filter((p) => p.categoryId === opts.categoryId);
    if (opts?.q) {
      const q = opts.q.toLowerCase();
      items = items.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          (p.shortDescription ?? "").toLowerCase().includes(q),
      );
    }
    return items;
  }

  const params = new URLSearchParams();
  if (opts?.categoryId) params.set("categoryId", opts.categoryId);
  if (opts?.q) params.set("q", opts.q);
  const url = `${API_BASE}/products${params.toString() ? `?${params}` : ""}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
}

export async function fetchProduct(id: string): Promise<Product> {
  if (!BACKEND_ENABLED) {
    const p = MOCK_PRODUCTS.find((x) => x.id === id) ?? MOCK_PRODUCTS[0];
    if (!p) throw new Error("Product not found");
    return p;
  }

  const res = await fetch(`${API_BASE}/products/${id}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Product not found");
  return res.json();
}
