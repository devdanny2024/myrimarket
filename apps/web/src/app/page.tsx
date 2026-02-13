import { fetchCategories, fetchProducts } from "@/lib/api";
import type { Product } from "@/lib/api";

import { CategoryGrid } from "@/components/CategoryGrid";
import { Hero } from "@/components/Hero";
import { ProductCard } from "@/components/ProductCard";
import { TopNav } from "@/components/TopNav";

export const dynamic = "force-static";

function getCurrencyFromSearchParams(searchParams?: {
  currency?: string;
}): "NGN" | "BTC" {
  return searchParams?.currency === "BTC" ? "BTC" : "NGN";
}

export default async function Home({
  searchParams,
}: {
  searchParams?: Promise<{ categoryId?: string; currency?: string }>;
}) {
  const sp = searchParams ? await searchParams : undefined;
  const categories = await fetchCategories();
  const products = await fetchProducts({ categoryId: sp?.categoryId });
  const currency = getCurrencyFromSearchParams(sp);

  const newArrivals: Product[] = products.slice(0, 8);

  return (
    <div className="min-h-screen bg-slate-50">
      <TopNav categories={categories} />

      <main className="mx-auto max-w-6xl px-4 py-8">
        <Hero />

        <CategoryGrid categories={categories} />

        <section id="new-arrivals" className="mt-14">
          <div className="text-center">
            <div className="text-xs text-slate-500">Hurry up to buy</div>
            <h2 className="mt-2 text-3xl font-semibold text-slate-900">
              New Arrivals
            </h2>
            <p className="mt-2 text-slate-600">
              Digital products, instant delivery, real discounts.
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {newArrivals.map((p) => (
              <ProductCard key={p.id} product={p} currency={currency} />
            ))}
          </div>
        </section>

        <section id="about" className="mt-16 rounded-2xl border border-slate-200 bg-white p-8">
          <h3 className="text-xl font-semibold text-slate-900">About Myri Market</h3>
          <p className="mt-2 text-slate-600">
            We sell digital products in Nigeria. Customers can pay with Naira or BTC.
            Products show slashed “compare-at” pricing to highlight your discounts.
            Admins can manage catalog and pricing from the Admin dashboard.
          </p>
        </section>
      </main>
    </div>
  );
}
