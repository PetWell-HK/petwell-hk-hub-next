"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatHkd, formatPercentOff, quotePercentOff, quoteSavings, type PriceQuote } from "@/lib/midAutumnFestivalPricing";

export function FestivalTicketBar({
  quote,
  submitting,
  locked,
  onSubmit,
}: {
  quote: PriceQuote;
  submitting: boolean;
  locked?: boolean;
  onSubmit: () => void;
}) {
  const savings = quoteSavings(quote);
  const offPct = quotePercentOff(quote);
  const paid = quote.total > 0;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 shadow-[0_-12px_40px_-18px_hsl(24_40%_20%/0.18)] backdrop-blur-md">
      <div className="container mx-auto flex max-w-2xl items-center gap-4 px-4 py-3">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            {paid ? "合計" : "免費入場"}
          </p>
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0">
            <AnimatePresence mode="wait">
              <motion.p
                key={paid ? quote.total : "free"}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ type: "spring", stiffness: 380, damping: 28 }}
                className="text-2xl font-semibold tabular-nums tracking-tight"
              >
                {paid ? formatHkd(quote.total) : "免費"}
              </motion.p>
            </AnimatePresence>
            {paid && offPct > 0 && (
              <span className="text-sm text-primary">
                {formatPercentOff(quote.originalTotal, quote.total)}
                {savings > 0 ? ` · 節省 ${formatHkd(savings)}` : ""}
              </span>
            )}
            {!paid && <span className="text-sm text-muted-foreground">送全家福電子相片 + 嫦娥服租借</span>}
          </div>
        </div>
        <Button
          type="button"
          onClick={onSubmit}
          disabled={submitting}
          className="h-11 min-w-[9.5rem] shrink-0 px-5 active:scale-[0.98]"
        >
          {locked ? (
            "即將開放"
          ) : submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              提交中
            </>
          ) : paid ? (
            "確認並付款"
          ) : (
            "提交報名"
          )}
        </Button>
      </div>
    </div>
  );
}
