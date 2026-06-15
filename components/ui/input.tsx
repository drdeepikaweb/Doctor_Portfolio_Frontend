import type * as React from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 shadow-sm transition placeholder:text-slate-400 focus:border-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-100",
        className,
      )}
      {...props}
    />
  );
}
