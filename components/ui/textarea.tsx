import type * as React from "react";
import { cn } from "@/lib/utils";

export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-32 w-full rounded-md border border-slate-300 bg-white px-3 py-3 text-sm text-slate-950 shadow-sm transition placeholder:text-slate-400 focus:border-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-100",
        className,
      )}
      {...props}
    />
  );
}
