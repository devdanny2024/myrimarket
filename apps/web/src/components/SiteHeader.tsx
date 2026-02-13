import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-center gap-2 font-semibold text-slate-900">
          <div className="h-8 w-8 rounded-md bg-slate-900" aria-hidden />
          <span>Myri</span>
        </Link>

        <nav className="flex items-center gap-2">
          <Link href="#features" className="text-sm text-slate-600 hover:text-slate-900">
            Features
          </Link>
          <Link href="#about" className="text-sm text-slate-600 hover:text-slate-900">
            About
          </Link>
          <Link
            href="#contact"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            Contact
          </Link>
        </nav>
      </div>
    </header>
  );
}
