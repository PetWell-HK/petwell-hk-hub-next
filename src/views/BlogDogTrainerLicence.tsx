"use client";

import { useMemo, useState } from "react";
import AppLink from "@/components/AppLink";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { MessageCircle, Facebook, Link2, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
const heroImage = "/assets/blog-dog-trainer-licence.jpg";
import BlogAdSense from "@/components/BlogAdSense";

const faqItems = [
  {
    question: "香港訓犬師不需要牌照，是否等於不受任何法律保障？",
    answer:
      "基本上是的。若訓練過程中你的寵物受傷，目前並沒有針對訓練師的行業規管機制，主要需透過民事途徑追究。因此選擇有認證的訓練師，同時簽訂書面服務合約，是保障自己和毛孩的重要步驟。",
  },
  {
    question: "ICA 的 QSSD 認證和 IACP 有什麼關係？",
    answer:
      "QSSD 由 ICA 及 MINSEN（香港）共同主辦，獲 IACP（國際專業練狗協會）認可。持有 QSSD 證書的人士可申請轉換或同時持有 IACP 的國際證書，兩者互認。",
  },
  {
    question: "ERB 的犬隻訓練員課程真的免費嗎？",
    answer:
      "是的，ERB 資助課程對符合資格的學員全免費用。以信義會 GTC 為例，課程全日制約 8 週，132 小時，適合有意入行的人士。",
  },
  {
    question: "如果我想成為訓練師，應該考哪個資格？",
    answer:
      "如果你希望以香港市場為主，ICA QSSD 的本地認受性較高；如果你有意在國際市場發展，CPDT-KA 的認受性更廣。兩者並不互斥，可以先考 QSSD 再進修 CPDT-KA。",
  },
];

const licenceTableData = [
  {
    type: "動物售賣商牌照（ATL）",
    target: "出售貓狗的寵物店",
    requirement: "強制，無牌屬違法",
  },
  {
    type: "甲類繁育狗隻牌照（DBLA）",
    target: "繁育 4 隻或以下雌犬並出售者",
    requirement: "強制",
  },
  {
    type: "乙類繁育狗隻牌照（DBLB）",
    target: "繁育 5 隻或以上雌犬並出售者",
    requirement: "強制",
  },
];

const BlogDogTrainerLicence = () => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const pageUrl = "https://petwellhk.com/blog/hong-kong-dog-trainer-licence-guide";

  const structuredData = useMemo(
    () => [
      {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: "香港寵物訓練師需要牌照嗎？2026年完整指南",
        description:
          "香港法律上不需要寵物訓練師持牌——但這對你的毛孩有什麼影響？PetWell 為你解析業界認證、漁農署規管範圍及選師貼士。",
        author: { "@type": "Organization", name: "PetWell HK" },
        publisher: { "@type": "Organization", name: "PetWell HK" },
        datePublished: "2026-03-06",
        dateModified: "2026-03-06",
        url: pageUrl,
        image: heroImage,
      },
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqItems.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: { "@type": "Answer", text: item.answer },
        })),
      },
    ],
    []
  );


  const handleCopyLink = () => {
    navigator.clipboard.writeText(pageUrl);
    setCopied(true);
    toast({ title: "已複製連結！", duration: 3000 });
    setTimeout(() => setCopied(false), 2000);
  };

  const shareWhatsApp = () => {
    window.open(
      `https://wa.me/?text=${encodeURIComponent("香港寵物訓練師需要牌照嗎？2026年完整指南 " + pageUrl)}`,
      "_blank"
    );
  };

  const shareFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`,
      "_blank"
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">

      <main className="flex-1 pb-24">
        {/* Hero */}
        <section className="relative">
          <div className="w-full bg-white flex justify-center">
            <img
              src={heroImage}
              alt="香港訓犬師認證 — 專業寵物訓練香港指南"
              className="max-h-[420px] w-auto object-contain"
            />
          </div>
          <div className="container mx-auto px-4 py-10 md:py-14">
            <p className="text-sm text-muted-foreground mb-3 font-medium tracking-wide uppercase">
              PetWell 主人專區
            </p>
            <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-4" style={{ fontFamily: "'DM Serif Display', serif" }}>
              香港寵物訓練師需要牌照嗎？2026年完整指南
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
              原來任何人都可以自稱「訓練師」——這對你的毛孩意味著什麼？
            </p>
          </div>
        </section>

        <BlogAdSense placement="top" />

        {/* Body */}
        <article className="container mx-auto px-4 max-w-3xl">
          {/* Callout Box */}
          <div className="rounded-xl border-l-4 border-primary bg-[hsl(var(--accent))] p-6 md:p-8 mb-10">
            <p className="font-bold text-lg mb-2">🔔 核心事實</p>
            <p className="text-base leading-relaxed">
              香港法律目前並無規定寵物訓練師或訓犬師必須持有官方牌照。任何人，不論有沒有受過正式訓練，都可以合法地以「訓犬師」身份收費提供服務。
            </p>
          </div>

          {/* Intro */}
          <div className="prose prose-lg max-w-none mb-10 space-y-5">
            <p>
              你有沒有試過，花了幾千元請訓練師，但狗狗的行為問題一點都沒改善？
            </p>
            <p>
              在 PetWell，我們每星期都收到類似的訊息。很多主人事後才發現，原來香港的寵物訓練師根本不需要任何牌照就可以執業——這個現實，比想像中更值得每一位毛孩家長了解。
            </p>
          </div>

          {/* Section: 無牌照制度 */}
          <h2 className="text-2xl md:text-3xl font-bold mb-4 mt-12">香港現時無強制牌照制度</h2>
          <p className="text-base leading-relaxed mb-8 text-muted-foreground">
            香港的寵物訓練行業屬於自我規管模式，政府沒有設立發牌制度，也沒有統一的執業標準。這意味著市面上的訓練師質素參差，從接受過國際認證的專業人士，到完全沒有任何訓練背景的人，都有可能在你面前說「我係專業訓練師」。
          </p>

          {/* Section: 漁農署 */}
          <h2 className="text-2xl md:text-3xl font-bold mb-4 mt-12">漁農署管的是什麼？</h2>
          <p className="text-base leading-relaxed mb-6 text-muted-foreground">
            很多人以為漁農自然護理署（漁農署）會規管訓練師，其實不然。漁農署的牌照制度只覆蓋動物買賣和繁育：
          </p>

          {/* Table */}
          <div className="overflow-x-auto mb-6 rounded-lg border">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted">
                  <th className="text-left p-3 font-semibold">牌照類別</th>
                  <th className="text-left p-3 font-semibold">適用對象</th>
                  <th className="text-left p-3 font-semibold">法律要求</th>
                </tr>
              </thead>
              <tbody>
                {licenceTableData.map((row, i) => (
                  <tr key={i} className="border-t">
                    <td className="p-3 font-medium">{row.type}</td>
                    <td className="p-3 text-muted-foreground">{row.target}</td>
                    <td className="p-3 text-muted-foreground">{row.requirement}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4 mb-10">
            <p className="text-sm">
              <strong>⚠️ 重要提示：</strong>如果你的業務同時涉及訓練服務加上出售或繁育動物，售賣部分依然受法律規管，不能因為「主業是訓練」而豁免申請牌照。
            </p>
          </div>

          {/* Section: 自願性認證 */}
          <h2 className="text-2xl md:text-3xl font-bold mb-4 mt-12">業界認可的自願性認證</h2>
          <p className="text-base leading-relaxed mb-6 text-muted-foreground">
            雖然沒有法律強制，但有責任感的訓練師通常會主動考取業界認證。以下是香港現時主要的幾個資格：
          </p>

          <div className="space-y-8 mb-10">
            {/* Cert 1 */}
            <div>
              <h3 className="text-xl font-bold mb-2">1. ICA 馴犬師服務質素標準（QSSD）</h3>
              <p className="text-muted-foreground mb-3">由國際認證機構（ICA）主辦，設有四個級別：</p>
              <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                <li><strong>Cert CC 馴犬師：</strong>具備訓練犬隻提升特殊技能的能力</li>
                <li><strong>Cert PT 練狗師：</strong>能訓練犬隻掌握一般技巧</li>
                <li><strong>Cert DH 領犬師：</strong>具備處理及操控犬隻的實戰經驗</li>
                <li><strong>Cert PS 媬姆師：</strong>專注犬隻日常照護</li>
              </ul>
              <p className="text-sm text-muted-foreground mt-2">申請費用 HKD 1,500，每兩年重新評審，獲國際專業練狗協會（IACP）認可。</p>
            </div>

            {/* Cert 2 */}
            <div>
              <h3 className="text-xl font-bold mb-2">2. 香港訓犬師培訓協會（HKACE）訓犬員畢業證書</h3>
              <p className="text-muted-foreground">完成課程並通過考核後可獲 HKACE 頒發的畢業證書，表現優秀者可進一步申請 IACP 國際認可資格。</p>
            </div>

            {/* Cert 3 */}
            <div>
              <h3 className="text-xl font-bold mb-2">3. 僱員再培訓局（ERB）犬隻訓練員證書</h3>
              <p className="text-muted-foreground">由信義會 GTC 等機構提供的 ERB 資助課程，全日制約 132 小時（8 週），費用全免，適合有意轉行的人士入門。</p>
            </div>

            {/* Cert 4 */}
            <div>
              <h3 className="text-xl font-bold mb-2">4. CPDT-KA 國際認可訓犬師資格</h3>
              <p className="text-muted-foreground">由美國認證專業訓犬師委員會（CCPDT）頒發，是國際認受性最高的訓犬師資格之一。香港目前只有極少數訓練師持有此資格，是全球含金量最高的業界認證。</p>
            </div>

            {/* Cert 5 */}
            <div>
              <h3 className="text-xl font-bold mb-2">5. SPCA 領犬員訓練班</h3>
              <p className="text-muted-foreground">由香港愛護動物協會提供，完成課程後可獲訓練班證書及愛協領犬員資格卡（一年有效），每年須完成至少 9 次愛協領犬員服務以續期。</p>
            </div>

            {/* Cert 6 */}
            <div>
              <h3 className="text-xl font-bold mb-2">6. 青年會／香港青年協會 犬隻行為訓練及護理證書</h3>
              <p className="text-muted-foreground">強調以科學為基礎的人道訓練方法，費用約 HKD 3,400–3,800，適合有志成為訓練師的人士系統性入門。</p>
            </div>
          </div>

          {/* Section: 分辨訓練師 */}
          <h2 className="text-2xl md:text-3xl font-bold mb-4 mt-12">作為主人，你如何分辨靠譜的訓練師？</h2>
          <ul className="space-y-3 mb-10">
            {[
              ["直接問資格", "詢問訓練師持有哪些認證，並要求查看實物證書或登記編號"],
              ["了解訓練方法", "現代動物行為科學一致推崇正向強化（Positive Reinforcement），應避免使用懲罰、恐嚇或痛楚作為訓練手段"],
              ["查看真實評價", "在 Google、Facebook 或本地寵物群組搜尋訓練師名字"],
              ["要求免費諮詢", "正規訓練師通常願意先了解你的狗狗情況，再制定個人化訓練計劃"],
              ["觀察訓練師與狗的互動", "第一堂課時留意狗狗是否放鬆而非焦慮"],
            ].map(([title, desc], i) => (
              <li key={i} className="flex gap-3 items-start">
                <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <span>
                  <strong>{title}：</strong>
                  <span className="text-muted-foreground">{desc}</span>
                </span>
              </li>
            ))}
          </ul>


          {/* FAQ Section */}
          <h2 className="text-2xl md:text-3xl font-bold mb-6 mt-14">常見問題 FAQ</h2>
          <Accordion type="single" collapsible className="mb-12">
            {faqItems.map((item, i) => (
              <AccordionItem key={i} value={`faq-${i}`}>
                <AccordionTrigger className="text-left text-base font-medium">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {/* Social Share */}
          <div className="border-t pt-8 mb-10">
            <p className="text-sm font-semibold mb-4">分享這篇文章</p>
            <div className="flex gap-3">
              <Button variant="outline" size="sm" onClick={shareWhatsApp}>
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </Button>
              <Button variant="outline" size="sm" onClick={shareFacebook}>
                <Facebook className="w-4 h-4" />
                Facebook
              </Button>
              <Button variant="outline" size="sm" onClick={handleCopyLink}>
                <Link2 className="w-4 h-4" />
                {copied ? "已複製！" : "複製連結"}
              </Button>
            </div>
          </div>

          <BlogAdSense placement="bottom" />

          {/* Author Tag */}
          <div className="border-t pt-6 text-sm text-muted-foreground">
            PetWell 團隊 | 更新於 2026 年 3 月
          </div>
        </article>
      </main>

      {/* Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur border-t p-3 md:p-4">
        <div className="container mx-auto flex justify-center">
          <AppLink href="/about">
            <Button size="lg" className="w-full max-w-md text-base font-semibold">
              聯絡 PetWell 了解更多
            </Button>
          </AppLink>
        </div>
      </div>

    </div>
  );
};

export default BlogDogTrainerLicence;
