import { cn } from "@/lib/utils";

export function EventEndedNotice({
  kicker = "活動已結束",
  title = "今次中秋活動已經完結",
  body = "報名已經截止，我們不再接收新申請。多謝支持，期待下個活動。",
  className,
}: {
  kicker?: string;
  title?: string;
  body?: string;
  className?: string;
}) {
  return (
    <section className={cn("rounded-2xl border border-border bg-muted/40 px-5 py-8 text-center", className)}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">{kicker}</p>
      <h2 className="mt-3 text-2xl font-semibold tracking-tight">{title}</h2>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">{body}</p>
    </section>
  );
}
