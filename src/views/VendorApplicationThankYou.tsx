"use client";

import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Instagram, MessageCircle, Home, CheckCircle2 } from "lucide-react";
import { useSEO } from "@/hooks/useSEO";
const vendorEventCover = "/assets/vendor-event-cover.jpg";

const IG_URL = "https://www.instagram.com/petwell_hk/";
const WA_URL =
  "https://wa.me/85255954078?text=" +
  encodeURIComponent("你好，我想查詢 PetWell x Aquabeat 觀塘寵物市集檔主報名事宜。");

const VendorApplicationThankYou = () => {
  useSEO({
    title: "多謝報名｜PetWell x Aquabeat 觀塘寵物市集",
    description:
      "你的檔主／贊助報名已成功提交。如有任何問題，歡迎 DM PetWell Instagram 或 WhatsApp 聯絡我們。",
    canonicalUrl: "https://petwellhk.com/vendor-application/thank-you",
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <img
        src={vendorEventCover}
        alt="PetWell x Aquabeat 觀塘寵物市集"
        className="block w-full h-auto"
        width={1024}
        height={576}
      />

      <section className="container mx-auto px-4 py-12 md:py-16 max-w-xl">
        <Card className="p-8 md:p-10 text-center">
          <div className="mx-auto mb-5 w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-primary" />
          </div>

          <h1 className="text-2xl md:text-3xl font-bold mb-3">多謝你嘅報名！</h1>
          <p className="text-muted-foreground mb-2">
            我哋已收到你嘅申請，團隊會盡快審核，並以電郵／WhatsApp 聯絡你確認詳情。
          </p>
          <p className="text-sm text-muted-foreground mb-8">
            如有任何問題，歡迎隨時 DM 我哋，我哋好樂意幫手解答。
          </p>

          <div className="grid gap-3 mb-6">
            <Button asChild size="lg" className="w-full gap-2">
              <a href={IG_URL} target="_blank" rel="noopener noreferrer">
                <Instagram className="w-5 h-5" />
                Instagram DM @petwell_hk
              </a>
            </Button>
            <Button asChild size="lg" variant="outline" className="w-full gap-2">
              <a href={WA_URL} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="w-5 h-5" />
                WhatsApp 聯絡我們
              </a>
            </Button>
          </div>

          <Button asChild variant="ghost" className="gap-2 text-muted-foreground">
            <Link to="/">
              <Home className="w-4 h-4" />
              返回主頁
            </Link>
          </Button>
        </Card>
      </section>

      <Footer />
    </div>
  );
};

export default VendorApplicationThankYou;
