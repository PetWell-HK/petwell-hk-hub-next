"use client";

import AppLink from "@/components/AppLink";
import { useAppSearchParams } from "@/hooks/useAppSearchParams";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Home, MessageCircle } from "lucide-react";
import { formatHkd } from "@/lib/midAutumnFestivalPricing";
import {
  MID_AUTUMN_REGISTRATION_PATH,
  PAYMENT_DETAILS,
} from "@/data/midAutumnFestival2026";
import { fetchBooking, type MidAutumnBooking } from "@/services/midAutumnRegistration";
const festivalCover = "/assets/blog-mid-autumn-pet-hk/cover.jpg";

const WA_URL =
  `https://wa.me/${PAYMENT_DETAILS.whatsapp}?text=` +
  encodeURIComponent("你好，我想查詢毛孩沉浸式台灣中秋祭的報名。");

const MidAutumnFestivalConfirmed = () => {
  const [params] = useAppSearchParams();
  const ref = params.get("ref") ?? "";
  const [booking, setBooking] = useState<MidAutumnBooking | null>(null);
  const [loading, setLoading] = useState(Boolean(ref));

  useEffect(() => {
    if (!ref) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    fetchBooking(ref)
      .then((loaded) => {
        if (!cancelled) setBooking(loaded);
      })
      .catch((error) => {
        console.error("Failed to load mid-autumn booking:", error);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [ref]);

  const paid = booking?.status === "paid";
  const free = booking?.status === "registered";

  return (
    <div className="min-h-[100dvh] bg-background">
      <img
        src={festivalCover}
        alt="毛孩沉浸式台灣中秋祭"
        className="block h-auto w-full"
        width={1600}
        height={900}
      />
      <section className="container mx-auto max-w-xl px-4 py-12 md:py-16">
        <div className="rounded-lg border border-border bg-background p-8 text-center shadow-sm md:p-10">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <CheckCircle2 className="h-8 w-8 text-primary" />
          </div>
          <h1 className="mb-3 text-2xl font-bold md:text-3xl">
            {loading ? "正在載入報名" : paid ? "已收到付款證明" : "感謝報名"}
          </h1>
          <p className="mb-2 text-muted-foreground">
            {loading
              ? "請稍候，正在核對報名編號。"
              : paid
              ? "核對付款後，將以電郵發送入場確認信及工作坊時段。請帶備確認信及手帶資料到場。"
              : free
                ? "免費手帶已預留。入場確認將發送至登記電郵。如需加購工作坊，可隨時再次選購早鳥套餐。"
                : "我們已收到報名資料。如有工作坊預約，請確保已完成付款。"}
          </p>
          {booking && (
            <p className="mb-8 text-sm text-muted-foreground">
              報名編號 {booking.id}
              {booking.quote.total > 0 ? ` · ${formatHkd(booking.quote.total)}` : ""}
            </p>
          )}
          {!booking && <div className="mb-8" />}

          <div className="mb-6 grid gap-3">
            <Button asChild size="lg" variant="outline" className="w-full gap-2">
              <a href={WA_URL} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="h-5 w-5" />
                WhatsApp 聯絡我們
              </a>
            </Button>
            <Button asChild variant="ghost" className="gap-2 text-muted-foreground">
              <AppLink href="/">
                <Home className="h-4 w-4" />
                返回主頁
              </AppLink>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            如需更改時段或加購工作坊，可
            <AppLink href={MID_AUTUMN_REGISTRATION_PATH} className="mx-1 font-medium text-foreground underline-offset-2 hover:underline">
              重新報名
            </AppLink>
            或聯絡 WhatsApp 客服。
          </p>
        </div>
      </section>
      </div>
  );
};

export default MidAutumnFestivalConfirmed;
