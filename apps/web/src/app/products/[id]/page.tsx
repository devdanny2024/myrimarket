import { fetchProduct } from "@/lib/api";
import Image from "next/image";
import { VariantPurchaseCard } from "@/components/VariantPurchaseCard";

export const dynamic = "force-dynamic";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await fetchProduct(id);

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <div className="relative mb-6 aspect-[16/9] overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
        <Image
          src={product.image || `/products/${product.id}.svg`}
          alt={product.title}
          fill
          className="object-contain p-6"
        />
      </div>
      <h1 className="text-3xl font-semibold text-slate-900">{product.title}</h1>
      <p className="mt-2 text-slate-600">{product.shortDescription}</p>
      <VariantPurchaseCard product={product} />
    </main>
  );
}
