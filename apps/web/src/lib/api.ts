export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:4001";

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
  const res = await fetch(`${API_BASE}/categories`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch categories");
  return res.json();
}

export async function fetchProducts(opts?: {
  categoryId?: string;
  q?: string;
}): Promise<Product[]> {
  const params = new URLSearchParams();
  if (opts?.categoryId) params.set("categoryId", opts.categoryId);
  if (opts?.q) params.set("q", opts.q);
  const url = `${API_BASE}/products${params.toString() ? `?${params}` : ""}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
}

export async function fetchProduct(id: string): Promise<Product> {
  const res = await fetch(`${API_BASE}/products/${id}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Product not found");
  return res.json();
}
