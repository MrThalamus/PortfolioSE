import clsx from "clsx";
import { ReactNode } from "react";

export function Badge({
  children,
  variant = "default",
  className,
}: {
  children: ReactNode;
  variant?: "default" | "accent" | "live" | "video" | "repo";
  className?: string;
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded border px-2 py-0.5 font-mono text-xs",
        {
          "border-border-default bg-background-elevated text-foreground-muted":
            variant === "default",
          "border-accent/40 bg-accent-soft text-accent": variant === "accent",
          "border-emerald-500/40 bg-emerald-500/10 text-emerald-500": variant === "live",
          "border-sky-500/40 bg-sky-500/10 text-sky-500": variant === "video",
          "border-amber-500/40 bg-amber-500/10 text-amber-500": variant === "repo",
        },
        className
      )}
    >
      {children}
    </span>
  );
}
