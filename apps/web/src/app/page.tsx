import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function Home() {
  let apiStatus: string = "unknown";

  try {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 800);

    const res = await fetch("http://localhost:4001/health", {
      cache: "no-store",
      signal: controller.signal,
    });

    clearTimeout(t);
    apiStatus = res.ok ? "ok" : `error (${res.status})`;
  } catch {
    apiStatus = "unreachable";
  }

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-5xl px-6 py-16">
        <div className="flex items-center gap-4">
          <Image
            src="/myri-logo.svg"
            alt="MYRI"
            width={180}
            height={56}
            priority
          />
          <div className="text-sm text-muted-foreground">
            API status: <span className="font-medium">{apiStatus}</span>
          </div>
        </div>

        <h1 className="mt-10 text-4xl font-semibold tracking-tight">
          Myri site (Next.js + shadcn/ui)
        </h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          Monorepo scaffold: <code className="font-mono">apps/web</code> on port
          3000 and <code className="font-mono">apps/api</code> on port 4001.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button>
            <Link href="/" aria-label="Refresh" className="text-inherit no-underline">
              Refresh
            </Link>
          </Button>
          <Button variant="outline">
            <a
              href="http://localhost:4001/health"
              target="_blank"
              rel="noreferrer"
              className="text-inherit no-underline"
            >
              Open API /health
            </a>
          </Button>
        </div>
      </div>
    </main>
  );
}
