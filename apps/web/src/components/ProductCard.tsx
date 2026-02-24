import Image from "next/image";
import Link from "next/link";

import type { Product } from "@/lib/api";
import { discountPercent, formatBtc, formatNgn } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export function ProductCard({
  product,
  currency,
}: {
  product: Product;
  currency: "NGN" | "BTC";
}) {
  const price = currency === "BTC" ? product.priceBtc ?? null : product.priceNgn;
  const compareAt =
    currency === "BTC" ? product.compareAtBtc ?? null : product.compareAtNgn ?? null;

  const pct =
    typeof price === "number" && typeof compareAt === "number"
      ? discountPercent(price, compareAt)
      : null;

  return (
    <Link
      href={`/products/${product.id}`}
      className={cn(
        "group block overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
      )}
    >
      <div className="relative aspect-[4/3] bg-slate-50">
        <Image
          src={product.image || `/products/${product.id}.svg`}
          alt={product.title}
          fill
          className="object-contain p-6"
        />
        <div className="absolute left-3 top-3 flex gap-2">
          {product.badge ? <Badge>{product.badge}</Badge> : null}
          {pct ? <Badge variant="secondary">-{pct}%</Badge> : null}
        </div>
      </div>

      <div className="space-y-2 p-4">
        <div className="text-sm font-semibold text-slate-900 line-clamp-2">
          {product.title}
        </div>
        <div className="text-xs text-slate-600 line-clamp-2">
          {product.shortDescription}
        </div>

        <div className="flex items-baseline gap-2">
          <div className="text-base font-semibold text-slate-900">
            {currency === "BTC"
              ? typeof price === "number"
                ? formatBtc(price)
                : "—"
              : formatNgn(price as number)}
          </div>
          {typeof compareAt === "number" && typeof price === "number" && compareAt > price ? (
            <div className="text-sm text-slate-500 line-through">
              {currency === "BTC" ? formatBtc(compareAt) : formatNgn(compareAt)}
            </div>
          ) : null}
        </div>

        <div className="text-xs text-slate-500">Pay with NGN or BTC</div>
      </div>
    </Link>
  );
}
