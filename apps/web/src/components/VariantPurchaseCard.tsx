"use client";

import { useMemo, useState } from "react";
import { discountPercent, formatNgn } from "@/lib/format";
import { PayWithPaystackButton } from "@/components/PayWithPaystackButton";
import type { Product } from "@/lib/api";

export function VariantPurchaseCard({ product }: { product: Product }) {
  const variants = product.variants ?? [];
  const [variantId, setVariantId] = useState(variants[0]?.id ?? "");

  const selected = useMemo(
    () => variants.find((v) => v.id === variantId) ?? variants[0],
    [variants, variantId]
  );

  const display = selected
    ? {
        ...product,
        priceNgn: selected.priceNgn,
        compareAtNgn: selected.compareAtNgn ?? null,
      }
    : product;

  const pct = discountPercent(display.priceNgn, display.compareAtNgn ?? null);

  return (
    <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
      {variants.length ? (
        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium text-slate-700">Choose variant</label>
          <select
            className="h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"
            value={variantId}
            onChange={(e) => setVariantId(e.target.value)}
          >
            {variants.map((v) => (
              <option key={v.id} value={v.id}>
                {v.label} — {formatNgn(v.priceNgn)}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      <div className="flex flex-wrap items-baseline gap-3">
        <div className="text-2xl font-semibold text-slate-900">{formatNgn(display.priceNgn)}</div>
        {display.compareAtNgn && display.compareAtNgn > display.priceNgn ? (
          <div className="text-lg text-slate-500 line-through">{formatNgn(display.compareAtNgn)}</div>
        ) : null}
        {pct ? <div className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">Save {pct}%</div> : null}
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <PayWithPaystackButton product={display} />
        <button className="h-11 rounded-md border border-slate-200 bg-white px-4 text-sm font-medium text-slate-900" disabled>
          BTC disabled for now
        </button>
      </div>

      {product.sourceUrl ? (
        <p className="mt-4 text-xs text-slate-500">Source: {product.sourceVendor ?? "Plati vendor"}</p>
      ) : null}
    </div>
  );
}
