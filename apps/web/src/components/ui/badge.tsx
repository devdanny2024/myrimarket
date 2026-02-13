import * as React from "react";

import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "outline";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
        variant === "default" && "bg-slate-900 text-slate-50 border-slate-900",
        variant === "secondary" &&
          "bg-slate-100 text-slate-900 border-slate-200",
        variant === "outline" && "bg-transparent text-slate-900 border-slate-200",
        className
      )}
      {...props}
    />
  );
}
