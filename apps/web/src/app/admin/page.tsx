"use client";

import { useEffect, useState } from "react";
import { fetchReviewedProducts, type Product } from "@/lib/api";

function getToken() {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem("myri_admin_token") ?? "";
}

export default function AdminPage() {
  const [token, setToken] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function load(t: string) {
    try {
      setError(null);
      setProducts(await fetchReviewedProducts(t));
    } catch (e: any) {
      setError(e?.message ?? "Failed to fetch reviewed products");
    }
  }

  useEffect(() => {
    const t = getToken();
    if (!t) {
      window.location.href = "/admin/login";
      return;
    }
    setToken(t);
    load(t);
  }, []);

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-semibold text-slate-900">Admin Dashboard</h1>
      <p className="mt-1 text-slate-600">Reviewed products from Supabase.</p>

      {error ? <div className="mt-4 rounded-md bg-red-50 p-3 text-red-600">{error}</div> : null}

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-left text-xs text-slate-500">
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Price (NGN)</th>
              <th className="px-4 py-3">Weighted score</th>
              <th className="px-4 py-3">Published</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t border-slate-100">
                <td className="px-4 py-3">{p.title}</td>
                <td className="px-4 py-3">{p.priceNgn ?? 0}</td>
                <td className="px-4 py-3">{p.weightedScore ?? "-"}</td>
                <td className="px-4 py-3">{p.reviewedAt ? "Yes" : "No"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
