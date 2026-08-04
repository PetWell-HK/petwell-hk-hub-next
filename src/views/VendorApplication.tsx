"use client";

import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { CalendarDays, Clock, MapPin, Sparkles, Store, Gift, Zap, Plug } from "lucide-react";
import { toast } from "sonner";
import { useSEO } from "@/hooks/useSEO";
import { useAuth } from "@/contexts/AuthContext";
import { createContactUsReport } from "@/services/reportService";
const vendorEventCover = "/assets/vendor-event-cover.jpg";
const vendorEventFloorPlan = "/assets/vendor-event-floor-plan.jpg";

type JoinType = "booth" | "sponsor" | "both";

const JOIN_OPTIONS: { value: JoinType; icon: string; title: string; desc: string }[] = [
  {
    value: "booth",
    icon: "🏪",
    title: "親身參與開檔",
    desc: "喺活動現場設置實體攤位，直接接觸毛孩家長。",
  },
  {
    value: "sponsor",
    icon: "🎁",
    title: "贊助免費試用品或禮物",
    desc: "只贊助試用品／禮物，唔需要親身出席活動。",
  },
  {
    value: "both",
    icon: "🏪🎁",
    title: "親身參與開檔 + 贊助免費試用品或禮物",
    desc: "現場設置攤位，同時贊助試用品／禮物。",
  },
];

const EVENT_HIGHLIGHTS = [
  "夜市美食區：台式燒肉卡集章挑戰，寵物友善美味",
  "許願天燈區：寵物友善 LED 環保氫氣球天燈，一同寄託中秋願望",
  "特色打卡區：復刻十分車站、彩虹眷村、西門町彩虹地等台灣經典景點",
  "品牌互動區：健康諮詢服務、產品試用體驗",
];

const EVENT_TIMES = [
  "9月25日（五）16:00–20:00",
  "9月26日（六）15:00–19:00",
  "9月27日（日）15:00–19:00",
];

const TERMS = [
  "報名須經 PetWell 審核，確認後會以電郵／WhatsApp 通知，並發出付款或確認指示。",
  "攤位以先到先得方式分配，約 20 檔，額滿即止；主辦方保留最終攤位編排及審批權。",
  "確認後如需取消，須於活動前 14 日通知；逾期取消恕不退回任何費用。",
  "檔主須自行負責貨品運送、保險及現場人手安排，並遵守場地及相關法例規定。",
  "現場嚴禁販售活體動物、藥物、處方糧或任何未經批准之商品。",
  "所有攤位須保持場地清潔，活動結束後須即時清走所有物資及垃圾。",
  "如遇 8 號或以上颱風訊號、黑色暴雨警告或政府指示，活動或會延期或取消，主辦方會另行公佈安排。",
  "主辦方有權於宣傳物料、社交媒體及網站使用活動現場相片及檔主品牌資料作推廣用途。",
];

const BOOTH_DETAILS = [
  "攤位面積約 6 呎 x 3 呎，包一張長枱及兩張摺椅。",
  "枱布、貨架、易拉架、宣傳物料等由檔主自行準備。",
  "入場佈置時間為活動開始前 90 分鐘，撤場須於活動結束後 60 分鐘內完成。",
  "現場設有共用寵物友善通道，攤位不可阻塞通道或走火通道。",
];

const ELECTRICITY_TERMS = [
  "電力供應數量有限，須於報名時申請，並以主辦方最終確認為準。",
  "每檔標準供電上限為 500W；超過須另行申請並可能需額外收費。",
  "檔主須自備符合安全標準之拖板及電線（最少 3 米），並須妥善以膠紙固定。",
  "嚴禁使用明火、燒烤爐、高溫電熱器具或未經申報之高瓦數電器。",
  "如未經申請自行接駁電源，主辦方有權即時要求停止使用。",
];

const applicationSchema = z.object({
  brandName: z.string().trim().min(1, "請填寫攤位／品牌名稱").max(120),
  brandIntro: z.string().trim().max(500).optional().or(z.literal("")),
  productDesc: z.string().trim().min(1, "請填寫販售內容／贊助物品說明").max(1000),
  contactName: z.string().trim().min(1, "請填寫聯絡人姓名").max(80),
  phone: z.string().trim().min(6, "請填寫有效電話").max(40),
  email: z.string().trim().email("請填寫有效電郵").max(255),
  ig: z.string().trim().max(255).optional().or(z.literal("")),
  electricity: z.string().trim().max(500).optional().or(z.literal("")),
  equipment: z.string().trim().max(500).optional().or(z.literal("")),
});

const SectionHeading = ({ step, title, hint }: { step: number; title: string; hint?: string }) => (
  <div className="mb-4">
    <div className="flex items-center gap-3">
      <span className="w-7 h-7 shrink-0 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center">
        {step}
      </span>
      <h2 className="text-lg md:text-xl font-bold">{title}</h2>
    </div>
    {hint && <p className="text-sm text-muted-foreground mt-2 ml-10">{hint}</p>}
  </div>
);

const VendorApplication = () => {
  const navigate = useNavigate();
  const { isAuthenticated, userInfo } = useAuth();
  const [joinType, setJoinType] = useState<JoinType | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    brandName: "",
    brandIntro: "",
    productDesc: "",
    contactName: "",
    phone: "",
    email: "",
    ig: "",
    electricity: "",
    equipment: "",
  });

  useSEO({
    title: "PetWell x Aquabeat 觀塘寵物市集｜檔主招募 09-2026",
    description:
      "2026年9月25-27日觀塘海濱活動空間02，毛孩沉浸台式中秋節。PetWell × AquaBeat 聯乘寵物市集檔主及贊助招募，約20檔，額滿即止。",
    canonicalUrl: "https://petwellhk.com/vendor-application",
  });

  const isSponsorOnly = joinType === "sponsor";
  const unitLabel = isSponsorOnly ? "品牌" : "攤位";

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const steps = useMemo(() => {
    const base = ["參與形式", "活動條款", `${unitLabel}資料`];
    if (!isSponsorOnly) base.push("電力需求", "設備及瓦數需求");
    return base;
  }, [isSponsorOnly, unitLabel]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinType) {
      toast.error("請先揀選參與形式", { duration: 3000 });
      return;
    }
    if (!agreed) {
      toast.error("請閱讀並同意活動條款", { duration: 3000 });
      return;
    }
    const parsed = applicationSchema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "請檢查表格", { duration: 3000 });
      return;
    }

    const data = parsed.data;
    const joinLabel = JOIN_OPTIONS.find((o) => o.value === joinType)?.title ?? "";
    const message = [
      "[Vendor Application] PetWell x Aquabeat 觀塘寵物市集 09-2026",
      `參與形式: ${joinLabel}`,
      `${unitLabel}名稱: ${data.brandName}`,
      data.brandIntro ? `${unitLabel}簡介: ${data.brandIntro}` : null,
      `販售內容 / 贊助物品: ${data.productDesc}`,
      data.ig ? `IG / 網址: ${data.ig}` : null,
      isSponsorOnly ? null : `電力需求: ${data.electricity || "不需要"}`,
      isSponsorOnly ? null : `設備及瓦數: ${data.equipment || "不適用"}`,
    ]
      .filter(Boolean)
      .join("\n");

    setSubmitting(true);
    try {
      await createContactUsReport({
        reporterId: isAuthenticated === true ? userInfo?.userId ?? null : null,
        message,
        contact: {
          reporterName: data.contactName,
          reporterEmail: data.email.trim().toLowerCase(),
          reporterPhone: data.phone.trim(),
        },
      });
      navigate("/vendor-application/thank-you", { replace: true });
    } catch (error) {
      console.error("Failed to submit vendor application:", error);
      toast.error("暫時未能提交，請稍後再試", { duration: 3000 });
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero / Event info */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-background border-b">
        <div className="w-full overflow-hidden">
          <img
            src={vendorEventCover}
            alt="PetWell x Aquabeat 觀塘寵物市集｜檔主招募 09-2026"
            className="w-full h-auto object-cover"
            fetchPriority="high"
          />
        </div>
        <div className="container mx-auto px-4 py-12 md:py-16 max-w-4xl">
          <Badge variant="outline" className="mb-4 gap-1 border-primary/30 text-primary">
            <Store className="w-3 h-3" /> 檔主招募
          </Badge>
          <h1 className="text-2xl md:text-4xl font-bold leading-tight mb-3">
            🐾 PetWell x Aquabeat 觀塘寵物市集 | 檔主招募 09-2026
          </h1>
          <p className="text-base md:text-lg text-muted-foreground mb-8">
            【 毛孩沉浸台式中秋節 】 PetWell × AquaBeat 聯乘活動，帶你同毛孩一齊體驗台式夜市文化！
          </p>

          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            <Card className="p-4">
              <div className="flex items-start gap-3">
                <CalendarDays className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="font-semibold">日期</p>
                  <p className="text-sm text-muted-foreground">📅 2026年9月25-27日（星期五至日）</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="font-semibold">地點</p>
                  <p className="text-sm text-muted-foreground">📍 觀塘海濱活動空間02</p>
                </div>
              </div>
            </Card>
            <Card className="p-4 sm:col-span-2">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="font-semibold mb-1">時間</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {EVENT_TIMES.map((t) => (
                      <li key={t}>⏰ {t}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
          </div>

          <Card className="p-5 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-primary" />
              <p className="font-semibold">活動亮點</p>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {EVENT_HIGHLIGHTS.map((h) => (
                <li key={h} className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </Card>

          <p className="text-sm md:text-base font-medium text-foreground/80">
            約20檔 • 額滿即止 • 開檔 / Sponsor 均可 | 57K+ IG曝光 | 10K App用戶 | 280K 網站曝光
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-10 md:py-14 max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: participation type */}
          <Card className="p-6 md:p-8">
            <SectionHeading step={1} title="參與形式 *" hint="請揀選你想以邊種形式參與今次市集。" />
            <div className="grid gap-3">
              {JOIN_OPTIONS.map((opt) => {
                const active = joinType === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setJoinType(opt.value)}
                    aria-pressed={active}
                    className={`text-left rounded-xl border-2 p-4 transition-colors ${
                      active
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/40 hover:bg-muted/40"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-xl leading-none mt-0.5">{opt.icon}</span>
                      <div className="flex-1">
                        <p className="font-semibold">{opt.title}</p>
                        <p className="text-sm text-muted-foreground mt-1">{opt.desc}</p>
                      </div>
                      <span
                        className={`w-5 h-5 shrink-0 rounded-full border-2 mt-0.5 ${
                          active ? "border-primary bg-primary" : "border-muted-foreground/40"
                        }`}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
            {joinType && (
              <p className="text-xs text-muted-foreground mt-4">
                你需要填寫：{steps.join(" → ")}
              </p>
            )}
          </Card>

          {/* Step 2: terms */}
          <Card className="p-6 md:p-8">
            <SectionHeading step={2} title="活動條款及細則" />
            <ul className="space-y-2 text-sm text-muted-foreground mb-5">
              {TERMS.map((t) => (
                <li key={t} className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>

            <div className="rounded-lg bg-muted/50 p-4 mb-4">
              <p className="font-semibold text-sm mb-2 flex items-center gap-2">
                <Store className="w-4 h-4 text-primary" /> 攤位詳情
              </p>
              <ul className="space-y-1.5 text-sm text-muted-foreground">
                {BOOTH_DETAILS.map((d) => (
                  <li key={d} className="flex gap-2">
                    <span className="text-primary">•</span>
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-lg bg-muted/50 p-4 mb-5">
              <p className="font-semibold text-sm mb-2 flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" /> 電力使用條款
              </p>
              <ul className="space-y-1.5 text-sm text-muted-foreground">
                {ELECTRICITY_TERMS.map((d) => (
                  <li key={d} className="flex gap-2">
                    <span className="text-primary">•</span>
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mb-5">
              <p className="font-semibold text-sm mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" /> 場地平面圖
              </p>
              <div className="rounded-lg border overflow-hidden bg-white">
                <img
                  src={vendorEventFloorPlan}
                  alt="活動場地平面圖"
                  className="w-full h-auto"
                  loading="lazy"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">攤位位置以主辦方最終編排為準。</p>
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <Checkbox
                checked={agreed}
                onCheckedChange={(v) => setAgreed(v === true)}
                className="mt-0.5"
              />
              <span className="text-sm">我已閱讀並同意以上活動條款及細則 *</span>
            </label>
          </Card>

          {/* Step 3: brand / booth info */}
          <Card className="p-6 md:p-8">
            <SectionHeading step={3} title={`${unitLabel}資料`} />
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="brandName">攤位名稱 / 品牌名稱 *</Label>
                <Input
                  id="brandName"
                  value={form.brandName}
                  onChange={(e) => set("brandName", e.target.value)}
                  maxLength={120}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="brandIntro">攤位/品牌簡介 (約50字)</Label>
                <Textarea
                  id="brandIntro"
                  value={form.brandIntro}
                  onChange={(e) => set("brandIntro", e.target.value)}
                  maxLength={500}
                  rows={3}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="productDesc">販售內容說明 / 贊助物品說明 *</Label>
                <p className="text-xs text-muted-foreground">
                  請簡述主要商品／服務內容，或贊助之試用品/禮物詳情
                </p>
                <Textarea
                  id="productDesc"
                  value={form.productDesc}
                  onChange={(e) => set("productDesc", e.target.value)}
                  maxLength={1000}
                  rows={4}
                  required
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="contactName">聯絡人姓名 *</Label>
                  <Input
                    id="contactName"
                    value={form.contactName}
                    onChange={(e) => set("contactName", e.target.value)}
                    maxLength={80}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone">聯絡電話 (WhatsApp) *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    maxLength={40}
                    required
                  />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email">電郵 *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    maxLength={255}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ig">IG / 網址（選填）</Label>
                  <Input
                    id="ig"
                    value={form.ig}
                    onChange={(e) => set("ig", e.target.value)}
                    placeholder="@yourbrand 或 https://"
                    maxLength={255}
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Steps 4 & 5: only for booth participants */}
          {!isSponsorOnly && (
            <>
              <Card className="p-6 md:p-8">
                <SectionHeading
                  step={4}
                  title="電力需求"
                  hint="如需要現場供電，請說明用途及所需插座數量；如不需要請填「不需要」。"
                />
                <Textarea
                  id="electricity"
                  value={form.electricity}
                  onChange={(e) => set("electricity", e.target.value)}
                  maxLength={500}
                  rows={3}
                  placeholder="例：需要 1 個插座，用作 LED 燈箱"
                />
              </Card>

              <Card className="p-6 md:p-8">
                <SectionHeading
                  step={5}
                  title="設備及瓦數需求"
                  hint="請列出會使用嘅電器及各自瓦數（每檔上限 500W）。"
                />
                <div className="flex items-start gap-2 text-sm text-muted-foreground mb-3">
                  <Plug className="w-4 h-4 text-primary mt-0.5" />
                  <span>例：LED 燈箱 30W、電子磅 10W、雪櫃 120W</span>
                </div>
                <Textarea
                  id="equipment"
                  value={form.equipment}
                  onChange={(e) => set("equipment", e.target.value)}
                  maxLength={500}
                  rows={3}
                />
              </Card>
            </>
          )}

          {isSponsorOnly && (
            <Card className="p-5 flex items-start gap-3">
              <Gift className="w-5 h-5 text-primary mt-0.5" />
              <p className="text-sm text-muted-foreground">
                你揀選咗「贊助免費試用品或禮物」，唔需要填寫電力需求同設備及瓦數需求。我哋會另行同你安排收件方式。
              </p>
            </Card>
          )}

          <Button type="submit" disabled={submitting} size="lg" className="w-full">
            {submitting ? "提交中…" : "提交報名"}
          </Button>
        </form>
      </section>

      <Footer />
    </div>
  );
};

export default VendorApplication;
