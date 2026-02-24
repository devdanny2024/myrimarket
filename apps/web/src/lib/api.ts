export const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:4001";

export type Category = {
  id: string;
  name: string;
  slug: string;
  icon?: string;
};

export type ProductVariant = {
  id: string;
  label: string;
  priceNgn: number;
  compareAtNgn?: number | null;
};

export type Product = {
  id: string;
  dbId?: string;
  title: string;
  categoryId?: string;
  categoryName?: string;
  shortDescription?: string;
  image?: string;
  priceNgn: number;
  compareAtNgn?: number | null;
  priceBtc?: number | null;
  compareAtBtc?: number | null;
  isActive?: boolean;
  reviewedAt?: string | null;
  sourceUrl?: string;
  sourceVendor?: string;
  weightedScore?: number;
  badge?: string | null;
  variants?: ProductVariant[];
};

export async function fetchCategories(): Promise<Category[]> {
  const res = await fetch(`${API_BASE}/categories`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch categories");
  return res.json();
}

export async function fetchProducts(opts?: { categorySlug?: string; reviewedOnly?: boolean }): Promise<Product[]> {
  const params = new URLSearchParams();
  if (opts?.categorySlug) params.set("categorySlug", opts.categorySlug);
  if (opts?.reviewedOnly === false) params.set("reviewedOnly", "false");
  const url = `${API_BASE}/products${params.toString() ? `?${params}` : ""}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
}

export async function fetchProduct(idOrSlug: string): Promise<Product> {
  const res = await fetch(`${API_BASE}/products/${idOrSlug}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Product not found");
  return res.json();
}

export async function fetchReviewedProducts(adminToken: string): Promise<Product[]> {
  const res = await fetch(`${API_BASE}/admin/reviewed-products`, {
    cache: "no-store",
    headers: { "x-admin-token": adminToken },
  });
  if (!res.ok) throw new Error("Failed to fetch reviewed products");
  return res.json();
}
