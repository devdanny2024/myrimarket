import Link from "next/link";
import { fetchCategories } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const categories = await fetchCategories();

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-semibold text-slate-900">Categories</h1>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {categories.map((c) => (
          <Link key={c.id} href={`/categories/${c.slug}`} className="rounded-xl border border-slate-200 bg-white p-4 hover:border-slate-300">
            <div className="text-lg font-medium text-slate-900">{c.name}</div>
            <div className="text-sm text-slate-500">/{c.slug}</div>
          </Link>
        ))}
      </div>
    </main>
  );
}
