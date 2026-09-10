import type { InputHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-md border border-border bg-white px-4 text-sm outline-none transition placeholder:text-primary/45 focus:border-primary focus:ring-4 focus:ring-moss/40",
        className
      )}
      {...props}
    />
  );
}
