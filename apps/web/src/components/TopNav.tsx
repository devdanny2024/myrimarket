"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import type { Category } from "@/lib/api";
import { cn } from "@/lib/utils";

export function TopNav({ categories }: { categories: Category[] }) {
  const [currency, setCurrency] = useState<"NGN" | "BTC">("NGN");

  const categoryLinks = useMemo(() => categories.slice(0, 6), [categories]);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-slate-900" aria-hidden />
          <span className="font-semibold text-slate-900">Myri Market</span>
        </Link>

        <nav className="hidden items-center gap-5 text-sm text-slate-700 md:flex">
          {categoryLinks.map((c) => (
            <Link
              key={c.id}
              href={`/categories/${encodeURIComponent(c.slug)}`}
              className="hover:text-slate-900"
            >
              {c.name}
            </Link>
          ))}
          <Link href="#" className="text-slate-500 hover:text-slate-900">
            More
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 md:flex">
            <span className="text-xs text-slate-500">Currency</span>
            <div className="flex rounded-md border border-slate-200 p-1">
              <button
                className={cn(
                  "rounded px-2 py-1 text-xs",
                  currency === "NGN" ? "bg-slate-900 text-white" : "text-slate-600"
                )}
                onClick={() => {
                  setCurrency("NGN");
                  window.dispatchEvent(new CustomEvent("myri:currency", { detail: "NGN" }));
                }}
              >
                NGN
              </button>
              <button
                className={cn(
                  "rounded px-2 py-1 text-xs",
                  currency === "BTC" ? "bg-slate-900 text-white" : "text-slate-600"
                )}
                onClick={() => {
                  setCurrency("BTC");
                  window.dispatchEvent(new CustomEvent("myri:currency", { detail: "BTC" }));
                }}
              >
                BTC
              </button>
            </div>
          </div>

          <Link href="#" className="text-sm text-slate-600 hover:text-slate-900">
            Login / Register
          </Link>
        </div>
      </div>
    </header>
  );
}
