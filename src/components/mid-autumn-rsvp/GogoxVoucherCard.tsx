"use client";

import { useEffect, useState } from "react";
import { Check, Copy, Ticket } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { GOGOX_VOUCHER } from "@/data/midAutumnFestival2026";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

const gogoxLogo = "/assets/media-logos/gogox.jpg";

type Lang = "zh" | "en";

const COPY: Record<
  Lang,
  {
    audience: string;
    title: string;
    body: string;
    terms: string;
    reveal: string;
    modalTitle: string;
    modalDesc: string;
    codeLabel: string;
    how: string;
    steps: string[];
    copy: string;
    copied: string;
    copyOk: string;
    copyFail: string;
  }
> = {
  zh: {
    audience: "入場人士都用得",
    title: `寵物專車兩程各減 $${GOGOX_VOUCHER.rewardAmount}`,
    body: "唔使先報名。帶毛孩去觀塘海濱 call 車，喺 GOGOX App 輸入優惠碼即可。",
    terms: `只限寵物專車 · 預約時選寵物友善司機 · 有效至 ${GOGOX_VOUCHER.expiryLabelZh}`,
    reveal: "顯示優惠碼",
    modalTitle: "GOGOX 優惠碼",
    modalDesc: "複製後喺 GOGOX App 預約寵物專車時輸入。",
    codeLabel: "優惠碼",
    how: "使用方法",
    steps: ["打開 GOGOX App", "預約寵物專車，並選寵物友善司機", "結帳時貼上優惠碼"],
    copy: "複製優惠碼",
    copied: "已複製",
    copyOk: `已複製優惠碼 ${GOGOX_VOUCHER.code}`,
    copyFail: `複製失敗，請手動複製 ${GOGOX_VOUCHER.code}`,
  },
  en: {
    audience: "Open to all visitors",
    title: `$${GOGOX_VOUCHER.rewardAmount} off × ${GOGOX_VOUCHER.rewardTrips} pet rides`,
    body: "No registration needed. Book a pet ride to the waterfront in the GOGOX app, then enter the promo code at checkout.",
    terms: `Pet rides only · Choose a pet-friendly driver · Valid until ${GOGOX_VOUCHER.expiryLabelEn}`,
    reveal: "Show promo code",
    modalTitle: "GOGOX promo code",
    modalDesc: "Copy it, then enter it when you book a pet ride in the GOGOX app.",
    codeLabel: "Promo code",
    how: "How to use",
    steps: [
      "Open the GOGOX app",
      "Book a pet ride and choose a pet-friendly driver",
      "Paste the code at checkout",
    ],
    copy: "Copy code",
    copied: "Copied",
    copyOk: `Copied ${GOGOX_VOUCHER.code}`,
    copyFail: `Could not copy — please copy ${GOGOX_VOUCHER.code} manually`,
  },
};

export function GogoxVoucherCard({
  lang = "zh",
  className,
}: {
  lang?: Lang;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const t = COPY[lang];

  useEffect(() => {
    if (!open) setCopied(false);
  }, [open]);

  useEffect(() => {
    if (!copied) return;
    const id = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(id);
  }, [copied]);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(GOGOX_VOUCHER.code);
      setCopied(true);
      toast.success(t.copyOk);
    } catch {
      toast.error(t.copyFail);
    }
  };

  return (
    <section
      id="gogox"
      className={cn(
        "not-prose overflow-hidden rounded-xl border border-stone-200 bg-white scroll-mt-24",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3 border-b border-stone-100 px-4 py-3">
        <img
          src={gogoxLogo}
          alt="GOGOX"
          width={160}
          height={64}
          className="h-8 w-auto object-contain object-left"
        />
        <p className="shrink-0 text-xs text-stone-500">{t.audience}</p>
      </div>

      <div className="grid sm:grid-cols-[minmax(0,1fr)_auto]">
        <div className="px-4 py-4">
          <p className="text-[15px] font-semibold leading-snug text-stone-900">{t.title}</p>
          <p className="mt-1.5 text-sm leading-relaxed text-stone-600">{t.body}</p>
          <p className="mt-3 text-xs leading-relaxed text-stone-500">{t.terms}</p>
        </div>

        <div className="flex items-center border-t border-dashed border-stone-200 bg-[#FFFBEA] px-4 py-3 sm:min-w-[13.5rem] sm:border-l sm:border-t-0">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={open}
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-[#0057B8] px-3 text-sm font-semibold text-white shadow-[0_1px_0_rgba(0,0,0,0.08)] transition-colors hover:bg-[#004a9c] active:scale-[0.98]"
          >
            <Ticket className="h-4 w-4" />
            {t.reveal}
          </button>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] max-w-[22rem] gap-0 overflow-y-auto overflow-x-hidden rounded-2xl border-stone-200 p-0 sm:max-w-sm">
          <div className="border-b border-stone-100 px-5 py-4">
            <img
              src={gogoxLogo}
              alt="GOGOX"
              width={160}
              height={64}
              className="h-7 w-auto object-contain object-left"
            />
            <DialogTitle className="mt-3 text-lg font-semibold tracking-tight text-stone-900">
              {t.modalTitle}
            </DialogTitle>
            <DialogDescription className="mt-1.5 text-sm leading-relaxed text-stone-500">
              {t.modalDesc}
            </DialogDescription>
          </div>

          <div className="px-5 py-5">
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-stone-400">
              {t.codeLabel}
            </p>
            <div className="mt-2 rounded-xl border border-dashed border-[#0057B8]/35 bg-[#FFFBEA] px-4 py-4 text-center">
              <p className="font-mono text-[1.65rem] font-semibold leading-none tracking-[0.18em] text-[#0057B8]">
                {GOGOX_VOUCHER.code}
              </p>
            </div>

            <button
              type="button"
              onClick={() => void copyCode()}
              className="mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-[#0057B8] text-sm font-semibold text-white transition-colors hover:bg-[#004a9c] active:scale-[0.98]"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? t.copied : t.copy}
            </button>

            <p className="mt-5 text-[11px] font-medium uppercase tracking-[0.16em] text-stone-400">
              {t.how}
            </p>
            <ol className="mt-2 space-y-1.5 text-sm leading-relaxed text-stone-600">
              {t.steps.map((step, index) => (
                <li key={step} className="flex gap-2.5">
                  <span className="mt-px inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-stone-100 text-[11px] font-semibold text-stone-500">
                    {index + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
            <p className="mt-4 text-xs leading-relaxed text-stone-400">{t.terms}</p>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
