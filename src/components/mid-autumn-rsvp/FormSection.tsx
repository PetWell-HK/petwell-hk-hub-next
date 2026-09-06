import type { ReactNode } from "react";

export function FormSection({
  step,
  title,
  required,
  description,
  children,
}: {
  step: number;
  title: string;
  required?: boolean;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-2.5">
      <div className="space-y-1">
        <h2 className="flex items-baseline gap-2 text-lg font-semibold tracking-tight">
          <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
            {step}
          </span>
          {title}
          {required && <span className="text-destructive">*</span>}
        </h2>
        {description && (
          <p className="pl-8 text-sm leading-relaxed text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="pl-0 sm:pl-8">{children}</div>
    </section>
  );
}
