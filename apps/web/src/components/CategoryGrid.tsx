import Link from "next/link";

import type { Category } from "@/lib/api";

const iconEmoji: Record<string, string> = {
  sparkles: "✨",
  music: "🎵",
  gamepad: "🎮",
  "message-circle": "💬",
  tv: "📺",
  "credit-card": "💳",
};

export function CategoryGrid({ categories }: { categories: Category[] }) {
  return (
    <section className="mt-10">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/?categoryId=${encodeURIComponent(c.id)}`}
            className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm transition hover:shadow"
          >
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-xl">
              {iconEmoji[c.icon ?? ""] ?? "🛍️"}
            </div>
            <div className="text-sm font-medium text-slate-900">{c.name}</div>
          </Link>
        ))}
      </div>
    </section>
  );
}
