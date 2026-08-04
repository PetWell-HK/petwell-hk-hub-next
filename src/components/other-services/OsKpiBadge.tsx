import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type OsKpiBadgeProps = {
  children: ReactNode;
  className?: string;
  variant?: "enterprise" | "merchant";
  title?: string;
};

const OsKpiBadge = ({ children, className, variant = "enterprise" }: OsKpiBadgeProps) => (
  <span
    className={cn(
      "inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
      variant === "enterprise"
        ? "border-primary/25 bg-primary/10 text-primary"
        : "border-border bg-muted/60 text-foreground/80",
      className,
    )}
  >
    {children}
  </span>
);

export default OsKpiBadge;
