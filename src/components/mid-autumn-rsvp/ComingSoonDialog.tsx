"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

export function ComingSoonDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[20rem] gap-0 overflow-hidden rounded-2xl border-primary/20 p-0 sm:max-w-sm [&>button]:hidden">
        <div className="px-6 pb-6 pt-8 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-primary">
            報名
          </p>
          <DialogTitle className="review-display mt-3 text-4xl tracking-tight">
            即將開放
          </DialogTitle>
          <DialogDescription className="mt-3 text-sm leading-relaxed">
            活動報名即將開放，敬請期待。
          </DialogDescription>
          <Button type="button" className="mt-6 w-full" onClick={() => onOpenChange(false)}>
            知道了
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
