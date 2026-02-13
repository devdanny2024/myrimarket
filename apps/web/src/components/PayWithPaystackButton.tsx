"use client";

import { useState } from "react";

import { API_BASE, type Product } from "@/lib/api";

export function PayWithPaystackButton({ product }: { product: Product }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function pay() {
    setLoading(true);
    setError(null);
    try {
      const email = window.prompt("Enter your email for receipt:");
      if (!email) return;

      const res = await fetch(`${API_BASE}/paystack/initialize`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email,
          productId: product.id,
          amountNgn: product.priceNgn,
        }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j?.error ?? "Paystack init failed");

      if (j.authorization_url) {
        window.location.href = j.authorization_url;
        return;
      }
      throw new Error("Missing authorization_url");
    } catch (e: any) {
      setError(e?.message ?? "Payment failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        className="h-11 w-full rounded-md bg-slate-900 px-4 text-sm font-medium text-white"
        onClick={pay}
        disabled={loading}
      >
        {loading ? "Redirecting..." : "Pay with Paystack (NGN)"}
      </button>
      {error ? <div className="mt-2 text-xs text-red-600">{error}</div> : null}
    </div>
  );
}
