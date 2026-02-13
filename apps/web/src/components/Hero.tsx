import Link from "next/link";

import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-slate-50">
      <div className="grid gap-8 p-8 md:grid-cols-2 md:items-center md:p-12">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl">
            Buy digital products in Nigeria.
          </h1>
          <p className="mt-4 max-w-prose text-slate-600">
            Pay with <span className="font-medium">Naira</span> or{' '}
            <span className="font-medium">BTC</span>. Get instant delivery and
            real discounts (showing original prices too).
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button>
              <Link href="#new-arrivals" className="text-inherit no-underline">
                To shop
              </Link>
            </Button>
            <Button variant="outline">
              <Link href="#about" className="text-inherit no-underline">
                Read more
              </Link>
            </Button>
          </div>
        </div>

        <div className="relative aspect-[4/3] rounded-2xl bg-slate-100">
          <div className="absolute inset-0 grid place-items-center text-slate-400">
            Hero image area (digital products)
          </div>
        </div>
      </div>

      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
        <div className="h-2 w-2 rounded-full bg-slate-900" />
        <div className="h-2 w-2 rounded-full bg-slate-300" />
        <div className="h-2 w-2 rounded-full bg-slate-300" />
      </div>
    </section>
  );
}
