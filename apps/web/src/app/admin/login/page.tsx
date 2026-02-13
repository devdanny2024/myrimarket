"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { API_BASE } from "@/lib/api";

export default function AdminLoginPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/admin/login`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error ?? "Login failed");
      }
      window.localStorage.setItem("myri_admin_token", token);
      router.push("/admin");
    } catch (e: any) {
      setError(e?.message ?? "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-3xl font-semibold text-slate-900">Admin Login</h1>
      <p className="mt-2 text-slate-600">Enter your admin token.</p>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
        <label className="text-xs text-slate-500">Admin token</label>
        <input
          className="mt-1 h-11 w-full rounded-md border border-slate-200 px-3 text-sm"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="ADMIN_TOKEN"
        />

        {error ? <div className="mt-3 text-sm text-red-600">{error}</div> : null}

        <button
          className="mt-4 h-11 w-full rounded-md bg-slate-900 text-sm font-medium text-white"
          onClick={submit}
          disabled={loading || !token}
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </div>
    </main>
  );
}
