import { fetchProduct } from "@/lib/api";
import { discountPercent, formatBtc, formatNgn } from "@/lib/format";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await fetchProduct(id);

  const pct = discountPercent(product.priceNgn, product.compareAtNgn ?? null);

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-semibold text-slate-900">{product.title}</h1>
      <p className="mt-2 text-slate-600">{product.shortDescription}</p>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex flex-wrap items-baseline gap-3">
          <div className="text-2xl font-semibold text-slate-900">
            {formatNgn(product.priceNgn)}
          </div>
          {product.compareAtNgn && product.compareAtNgn > product.priceNgn ? (
            <div className="text-lg text-slate-500 line-through">
              {formatNgn(product.compareAtNgn)}
            </div>
          ) : null}
          {pct ? (
            <div className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">
              Save {pct}%
            </div>
          ) : null}
        </div>

        {product.btcEnabled && typeof product.priceBtc === "number" ? (
          <div className="mt-2 text-sm text-slate-600">
            BTC price: <span className="font-medium">{formatBtc(product.priceBtc)}</span>
          </div>
        ) : null}

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button className="h-11 rounded-md bg-slate-900 px-4 text-sm font-medium text-white">
            Pay with Naira
          </button>
          <button className="h-11 rounded-md border border-slate-200 bg-white px-4 text-sm font-medium text-slate-900">
            Pay with BTC
          </button>
        </div>

        <div className="mt-6 text-xs text-slate-500">
          Admin can adjust prices and slashed compare-at prices from the Admin
          dashboard.
        </div>
      </div>
    </main>
  );
}
