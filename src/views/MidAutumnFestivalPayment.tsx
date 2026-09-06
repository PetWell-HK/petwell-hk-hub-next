"use client";

import AppLink from "@/components/AppLink";
import { useAppNavigate } from "@/hooks/useAppNavigate";
import { useAppSearchParams } from "@/hooks/useAppSearchParams";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, MessageCircle, Upload } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { formatHkd, type QuoteLine } from "@/lib/midAutumnFestivalPricing";
import {
  MID_AUTUMN_CONFIRMED_PATH,
  MID_AUTUMN_REGISTRATION_PATH,
  PAYMENT_DETAILS,
} from "@/data/midAutumnFestival2026";
import {
  fetchBooking,
  submitPaymentProof,
  type MidAutumnBooking,
} from "@/services/midAutumnRegistration";

const MAX_RECEIPT_BYTES = 5 * 1024 * 1024;
const RECEIPT_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];

function lineAmount(line: QuoteLine): string {
  switch (line.kind) {
    case "item":
    case "bundle":
      return formatHkd(line.price);
    case "gift":
      return "贈送";
    case "discount":
      return `−${formatHkd(line.amount)}`;
    default: {
      const _exhaustive: never = line;
      return _exhaustive;
    }
  }
}

function lineLabel(line: QuoteLine): string {
  switch (line.kind) {
    case "item":
    case "bundle":
    case "gift":
      return line.label;
    case "discount":
      return `${line.label}（${line.code}）`;
    default: {
      const _exhaustive: never = line;
      return _exhaustive;
    }
  }
}

function formatRemain(ms: number): string {
  if (ms <= 0) return "00:00:00";
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds].map((n) => String(n).padStart(2, "0")).join(":");
}

const MidAutumnFestivalPayment = () => {
  const [params] = useAppSearchParams();
  const navigate = useAppNavigate();
  const { isAuthenticated, userInfo } = useAuth();
  const ref = params.get("ref") ?? "";

  const [booking, setBooking] = useState<MidAutumnBooking | null>(null);
  const [missing, setMissing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(Date.now());
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [paymentReference, setPaymentReference] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!ref) {
      setMissing(true);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetchBooking(ref)
      .then((loaded) => {
        if (cancelled) return;
        if (!loaded) {
          setMissing(true);
          setLoading(false);
          return;
        }
        if (loaded.status === "paid" || loaded.status === "registered") {
          navigate(`${MID_AUTUMN_CONFIRMED_PATH}?ref=${encodeURIComponent(loaded.id)}`, { replace: true });
          return;
        }
        setBooking(loaded);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Failed to load mid-autumn booking:", error);
        if (!cancelled) {
          setMissing(true);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [navigate, ref]);

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const remainMs = booking ? Date.parse(booking.payBy) - now : 0;
  const overdue = remainMs <= 0;
  const deadlineLabel = useMemo(() => {
    if (!booking) return "";
    return new Date(booking.payBy).toLocaleString("zh-HK", {
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, [booking]);

  const onFile = (next: File | null) => {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setFile(null);
    if (!next) return;
    if (next.size > MAX_RECEIPT_BYTES) {
      toast.error("請上傳小於 5MB 的圖片");
      return;
    }
    if (next.type && !RECEIPT_TYPES.includes(next.type) && !next.type.startsWith("image/")) {
      toast.error("請上傳 JPG、PNG、WEBP 或 HEIC 圖片");
      return;
    }
    setFile(next);
    setPreview(URL.createObjectURL(next));
  };

  const handleSubmit = async () => {
    if (!booking) return;
    if (!file) {
      toast.error("請上傳付款截圖");
      return;
    }
    setSubmitting(true);
    try {
      const paid = await submitPaymentProof({
        booking,
        file,
        paymentReference,
        reporterId: isAuthenticated === true ? userInfo?.userId ?? null : null,
      });
      navigate(`${MID_AUTUMN_CONFIRMED_PATH}?ref=${encodeURIComponent(paid.id)}`, { replace: true });
    } catch (error) {
      console.error("Failed to submit payment proof:", error);
      toast.error("上傳失敗，請稍後再試或 WhatsApp 聯絡我們", { duration: 4000 });
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[hsl(30_20%_97%)]">
      <main className="container mx-auto max-w-xl px-4 py-10 md:py-14">
        {loading && (
          <div className="rounded-lg border border-border bg-background p-8 text-center shadow-sm">
            <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
            <p className="mt-3 text-sm text-muted-foreground">正在載入報名資料</p>
          </div>
        )}

        {!loading && missing && (
          <div className="rounded-lg border border-border bg-background p-8 text-center shadow-sm">
            <h1 className="text-xl font-semibold">找不到此報名紀錄</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              付款連結可能已過期或編號不正確。請重新報名，或 WhatsApp 聯絡我們並提供報名編號。
            </p>
            <Button asChild className="mt-6">
              <AppLink href={MID_AUTUMN_REGISTRATION_PATH}>返回報名頁</AppLink>
            </Button>
          </div>
        )}

        {!loading && booking && (
          <div className="rounded-lg border border-border bg-background shadow-sm">
            <div className="border-b border-border px-6 py-5 md:px-8">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                付款確認
              </p>
              <h1 className="mt-1 text-xl font-semibold">請於 24 小時內付款</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                工作坊名額已暫時保留。請儘快完成付款並上傳收據。
              </p>
            </div>

            <div className="space-y-6 px-6 py-6 md:px-8">
              <div
                className={
                  overdue
                    ? "rounded-md border border-destructive/30 bg-destructive/[0.04] px-4 py-4 text-center"
                    : "rounded-md border border-primary/30 bg-primary/[0.04] px-4 py-4 text-center"
                }
              >
                <p className="text-xs text-muted-foreground">剩餘時間</p>
                <p className="mt-1 font-mono text-3xl font-semibold tabular-nums tracking-wide">
                  {formatRemain(remainMs)}
                </p>
                <p className={overdue ? "mt-1 text-sm font-medium text-destructive" : "mt-1 text-sm font-medium text-primary"}>
                  {overdue ? "時間已到，請儘快" : "請儘快"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">截止 {deadlineLabel}</p>
              </div>

              <div className="rounded-2xl border border-border bg-muted/15 px-4 py-4 sm:px-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  應付金額
                </p>
                <div className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <p className="text-3xl font-semibold tabular-nums tracking-tight text-foreground">
                    {formatHkd(booking.quote.total)}
                  </p>
                  {booking.quote.discountAmount > 0 && booking.quote.subtotal > booking.quote.total && (
                    <p className="text-base text-muted-foreground line-through tabular-nums">
                      {formatHkd(booking.quote.subtotal)}
                    </p>
                  )}
                  {booking.quote.discountAmount > 0 && (
                    <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-sm font-semibold text-primary">
                      已減 {formatHkd(booking.quote.discountAmount)}
                    </span>
                  )}
                </div>
                <p className="mt-1.5 text-xs text-muted-foreground">報名編號 {booking.id}</p>
                <ul className="mt-4 space-y-2 border-t border-border/80 pt-3 text-sm">
                  {booking.quote.lines.map((line, index) => (
                    <li
                      key={`${line.kind}-${index}`}
                      className={
                        line.kind === "discount"
                          ? "flex justify-between gap-3 font-medium text-primary"
                          : "flex justify-between gap-3"
                      }
                    >
                      <span className={line.kind === "discount" ? undefined : "text-muted-foreground"}>
                        {lineLabel(line)}
                      </span>
                      <span className="tabular-nums">{lineAmount(line)}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <p className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm leading-relaxed">
                <MessageCircle className="h-4 w-4 shrink-0 text-primary" />
                <span>有問題或上傳有困難，可</span>
                <a
                  href={
                    `https://wa.me/${PAYMENT_DETAILS.whatsapp}?text=` +
                    encodeURIComponent(
                      `你好，我想查詢毛孩沉浸式台灣中秋祭付款。報名編號 ${booking.id}`,
                    )
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-primary underline underline-offset-2"
                >
                  WhatsApp {PAYMENT_DETAILS.whatsappDisplay}
                </a>
                <span>，並註明報名編號。</span>
              </p>

              <div className="space-y-4 rounded-md border border-border bg-muted/20 p-4 text-sm">
                <p className="font-semibold">付款方法</p>

                <div>
                  <p className="font-medium">1. 銀行轉帳</p>
                  <dl className="mt-2 grid grid-cols-[7.5rem_1fr] gap-x-3 gap-y-1.5">
                    <dt className="text-muted-foreground">Account Name</dt>
                    <dd>{PAYMENT_DETAILS.accountName}</dd>
                    <dt className="text-muted-foreground">Bank Code</dt>
                    <dd>{PAYMENT_DETAILS.bankCode}</dd>
                    <dt className="text-muted-foreground">Branch Code</dt>
                    <dd>{PAYMENT_DETAILS.branchCode}</dd>
                    <dt className="text-muted-foreground">Bank Name</dt>
                    <dd>{PAYMENT_DETAILS.bankName}</dd>
                    <dt className="text-muted-foreground">Account Number</dt>
                    <dd className="font-medium tabular-nums">{PAYMENT_DETAILS.accountNumber}</dd>
                  </dl>
                </div>

                <div>
                  <p className="font-medium">2. PayMe</p>
                  <a
                    href={PAYMENT_DETAILS.paymeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-block font-medium text-primary underline underline-offset-2"
                  >
                    {PAYMENT_DETAILS.paymeUrl}
                  </a>
                </div>

                <p>
                  付完請回覆「已付款」並上傳截圖。名額有限，確認收款後先算正式報名成功。
                </p>
                <p className="text-xs text-muted-foreground">
                  付款備註請填寫報名編號 {booking.id}，以便核對。
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentReference" className="text-sm font-medium">
                  付款參考號碼或轉帳時間
                  <span className="ml-1 font-normal text-muted-foreground">（選填）</span>
                </Label>
                <p className="text-xs text-muted-foreground">例如：PayMe 12:30 / 參考號碼 123456</p>
                <Input
                  id="paymentReference"
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                  className="bg-background"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="receipt" className="text-sm font-medium">
                  上傳已付款截圖
                  <span className="ml-0.5 text-destructive">*</span>
                </Label>
                <label
                  htmlFor="receipt"
                  className="flex cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-border bg-muted/10 px-4 py-8 text-center transition-colors hover:border-primary/40"
                >
                  <Upload className="mb-2 h-5 w-5 text-muted-foreground" />
                  <span className="text-sm font-medium">點擊上傳付款截圖</span>
                  <span className="mt-1 text-xs text-muted-foreground">JPG / PNG / WEBP / HEIC，最大 5MB</span>
                  <input
                    id="receipt"
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => onFile(e.target.files?.[0] ?? null)}
                  />
                </label>
                {preview && (
                  <img
                    src={preview}
                    alt="付款證明預覽"
                    className="mt-2 max-h-56 w-full rounded-md border border-border object-contain bg-muted/20"
                  />
                )}
              </div>

              <Button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="min-h-11 w-full"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    上傳中
                  </>
                ) : (
                  "確認已付款"
                )}
              </Button>
            </div>
          </div>
        )}
      </main>
      </div>
  );
};

export default MidAutumnFestivalPayment;
