"use client";

import { useEffect, useMemo, useState } from "react";

import type { Product } from "@/lib/api";
import { API_BASE } from "@/lib/api";
import { formatNgn } from "@/lib/format";

function getToken() {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem("myri_admin_token") ?? "";
}

export default function AdminPage() {
  const [token, setToken] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const headers = useMemo(() => ({ "x-admin-token": token }), [token]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/products`, { cache: "no-store" });
      const data = (await res.json()) as Product[];
      setProducts(data);
    } catch (e) {
      setError("Failed to load products");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const t = getToken();
    setToken(t);
    // If no token, move user to admin login
    if (!t) {
      window.location.href = "/admin/login";
      return;
    }
    load();
  }, []);

  async function updateProduct(id: string, patch: Partial<Product>) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/admin/products/${id}`, {
        method: "PUT",
        headers: { "content-type": "application/json", ...headers },
        body: JSON.stringify(patch),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error ?? "Update failed");
      }
      await load();
    } catch (e: any) {
      setError(e?.message ?? "Update failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Admin</h1>
          <p className="mt-1 text-slate-600">Manage products and prices.</p>
        </div>

        <div className="w-full max-w-md">
          <label className="text-xs text-slate-500">Admin token</label>
          <div className="mt-1 flex gap-2">
            <input
              className="h-10 flex-1 rounded-md border border-slate-200 bg-white px-3 text-sm"
              placeholder="Set ADMIN_TOKEN in API, paste it here"
              value={token}
              onChange={(e) => {
                setToken(e.target.value);
                window.localStorage.setItem("myri_admin_token", e.target.value);
              }}
            />
            <button
              className="h-10 rounded-md bg-slate-900 px-4 text-sm font-medium text-white"
              onClick={() => load()}
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-4 py-3 text-sm font-medium text-slate-900">
          Products
        </div>

        {error ? <div className="p-4 text-sm text-red-600">{error}</div> : null}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-left text-xs text-slate-500">
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Compare-at</th>
                <th className="px-4 py-3">Active</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-t border-slate-100">
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900">{p.title}</div>
                    <div className="text-xs text-slate-500">{p.id}</div>
                  </td>
                  <td className="px-4 py-3">
                    <input
                      className="h-9 w-32 rounded-md border border-slate-200 px-2"
                      defaultValue={p.priceNgn}
                      onBlur={(e) =>
                        updateProduct(p.id, { priceNgn: Number(e.target.value) })
                      }
                    />
                    <div className="text-xs text-slate-500">{formatNgn(p.priceNgn)}</div>
                  </td>
                  <td className="px-4 py-3">
                    <input
                      className="h-9 w-32 rounded-md border border-slate-200 px-2"
                      defaultValue={p.compareAtNgn ?? ""}
                      onBlur={(e) =>
                        updateProduct(p.id, {
                          compareAtNgn: e.target.value
                            ? Number(e.target.value)
                            : null,
                        })
                      }
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      defaultChecked={p.isActive}
                      onChange={(e) => updateProduct(p.id, { isActive: e.target.checked })}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <button
                      className="rounded-md border border-slate-200 px-3 py-2 text-xs"
                      onClick={() => updateProduct(p.id, p)}
                      disabled={loading}
                    >
                      Save
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {loading ? (
          <div className="border-t border-slate-200 p-4 text-xs text-slate-500">
            Working...
          </div>
        ) : null}
      </div>
    </main>
  );
}
