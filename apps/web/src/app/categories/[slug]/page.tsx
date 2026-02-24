import { notFound } from "next/navigation";
import { ProductCard } from "@/components/ProductCard";
import { fetchCategories, fetchProducts } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const categories = await fetchCategories();
  const category = categories.find((c) => c.slug === slug);
  if (!category) return notFound();

  const products = await fetchProducts({ categorySlug: slug });

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-semibold text-slate-900">{category.name}</h1>
      <p className="mt-1 text-slate-600">Reviewed and published products in this category.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} currency="NGN" />
        ))}
      </div>
    </main>
  );
}
