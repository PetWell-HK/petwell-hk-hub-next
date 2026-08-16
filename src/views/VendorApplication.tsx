"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  Loader2,
  MapPin,
  Percent,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { useSEO } from "@/hooks/useSEO";
import { useAuth } from "@/contexts/AuthContext";
import { createContactUsReport } from "@/services/reportService";
import { syncVendorApplicationToNotion } from "@/services/vendorApplicationService";
import { cn } from "@/lib/utils";

const vendorEventCover = "/assets/vendor-event-cover.jpg";
const vendorEventFloorPlan = "/assets/vendor-event-floor-plan.jpg";

type JoinType = "booth" | "sponsor" | "both";
type StepId = "overview" | "brand" | "contact" | "booth" | "terms";

const JOIN_OPTIONS: { value: JoinType; title: string; desc: string }[] = [
  {
    value: "booth",
    title: "親身參與開檔",
    desc: "於活動現場設置實體攤位，直接接觸毛孩家長。",
  },
  {
    value: "sponsor",
    title: "贊助試用品或禮物",
    desc: "只贊助試用品／禮物，無需親身出席。",
  },
  {
    value: "both",
    title: "開檔及贊助",
    desc: "現場設置攤位，同時贊助試用品／禮物。",
  },
];

const EVENT_TIMES = [
  "9月25日（五）16:00–20:00",
  "9月26日（六）15:00–21:00",
  "9月27日（日）15:00–21:00",
];

const EVENT_TAGLINE = "毛孩沉浸台式中秋節 — PetWell × AquaBeat 聯乘活動，帶你同毛孩一齊體驗台式夜市文化。";

const EVENT_HIGHLIGHTS = [
  "夜市美食區：台式燒肉卡集章挑戰，寵物友善美味",
  "許願天燈區：寵物友善 LED 環保氫氣球天燈，一同寄託中秋願望",
  "特色打卡區：復刻十分車站、彩虹眷村、西門町彩虹地等台灣經典景點",
  "品牌互動區：健康諮詢服務、產品試用體驗",
];

const TERMS = [
  "申請者於市集內售賣的所有產品須與申請表格附上之資料相符。如因任何欺騙／侵權／犯罪成份所引起的追究，參加者需自行承擔所有賠償及責任。",
  "申請者於現場不可制作食物、烹煮、加熱或燃點。",
  "如有任何違法經營，一切法律責任由參加者自行承擔。",
  "借用任何物資（桌椅等）須完好無損歸還；如有任何損壞，須照價賠償。",
  "PetWell 或 AquaBeat 擁有挑選入圍名單及攤位位置的最終決定權。",
  "遞交的照片及市集期間所拍攝的照片可作宣傳用途，不作另行通知。",
  "所收集的資料只用於籌備及宣傳市集，不會轉交予第三方。",
  "因惡劣天氣、政府政策等不可抗力因素取消活動，雙方互不追究責任；全數退還按金，不作其他賠償。",
  "確認參與日期後，須準時出席；未經許可缺席之定義包括：未有於活動開始後合理時間內到場開檔、全日缺席、未經 PetWell 或 AquaBeat 事前書面同意而缺席。",
  "未經同意缺席，每日收取 HK$500 行政及場地費。",
  "PetWell 或 AquaBeat 有權從按金或拆帳款項直接扣除；如不足扣除，參加者須於收到通知後 7 個工作日內補回。",
  "參加者須自行管理安全、貨物及私人財物；PetWell 及 AquaBeat 概不負責。",
  "因參加者行為引起公眾損傷或設施毀壞，一切責任由參加者自行承擔。",
  "不得高聲叫賣，須保持攤位整潔；騷擾場內人士者有權被即時趕離，不獲任何賠償。",
];

const CONFIRMATION_TEXT =
  "本人已細閱並明白以上所有條款及細則，並確認本人所遞交之資料均屬真確無誤，並同意遵守 PetWell 或 AquaBeat 所訂定的一切規定。若本人違反相關條款及細則，本人同意 PetWell 或 AquaBeat 有權取消本人之參加資格及要求本人即時離場，並須承擔及繳付一切相關賠償及費用。";

const BOOTH_DETAILS = [
  "包括：1 張桌子（約 150cm 長 x 80cm 闊 x 75cm 高）及 2 張椅子。",
];

const DEPOSIT_INFO = [
  "入選檔主須於確認後繳交按金：HK$1,000。",
  "如無違約，按金將於最後參與日結束後 14 個工作日內無息退還。",
];

const COLLABORATION_INFO = [
  "是次市集豁免固定租金，採用收入分成形式進行合作。",
  "拆帳比例：檔主 75% ／ AquaBeat 25%。",
  "所有場內交易必須使用 AquaBeat 指定之電子支付系統，並由主辦單位提供電子支付機予檔主使用。",
  "主辦單位將於每日活動結束後，根據檔主當日營業記錄進行清算及點數。",
  "如檔主拒絕、拖延或未能配合每日清算及點數安排，主辦單位有權暫停或延後相關拆帳結算，並可視乎情況作違約處理。",
  "所有收入分成及最終結算，均以主辦單位每日清算及點數紀錄為最終及具有約束力之依據。",
  "拆帳款項將於檔主最後參與日完結後 14 個工作日內支付予檔主。",
];

const ELECTRICITY_TERMS = [
  "如參加者選擇需要電力，相關電費須於簽約時連同按金一併支付。",
  "每檔電位價格：$500（拉電）+ $700。",
  "參加者須確保所有用電設備符合安全標準。如因違規、超負荷或不當使用導致任何損壞或安全事故，一切責任及損失概由參加者自行承擔。",
  "所有拉電工程將由 Aquabeat 或 Aquabeat 指定之承辦商統一安排。",
  "參加者須配合指定之拉電、測試及通電時間，不得自行更改、拖延或要求即時臨時加電。",
  "參加者嚴禁自行拉電、改線、分線、加插拖板、或接駁未經 Aquabeat 批准之任何電力設備。",
  "參加者須確保其所有電器、電線及設備符合安全標準。",
  "如因參加者設備、操作不當或違規用電而引致跳掣、停電、火警、設備損壞或人身傷害，一切法律責任、賠償及損失概由參加者自行承擔，Aquabeat 概不負責。",
];

const STEP_LABELS: Record<StepId, string> = {
  overview: "活動概要及參與方式",
  brand: "品牌及產品",
  contact: "聯絡資料",
  booth: "攤位配置",
  terms: "條款確認",
};

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

type FormState = z.infer<typeof applicationSchema>;

const TermsList = ({ items }: { items: string[] }) => (
  <ul className="space-y-2 text-sm leading-relaxed text-muted-foreground">
    {items.map((item) => (
      <li key={item} className="pl-4 relative before:absolute before:left-0 before:content-['•'] before:text-foreground/40">
        {item}
      </li>
    ))}
  </ul>
);

const EventOverview = () => (
  <div className="space-y-6">
    <p className="text-sm leading-relaxed text-muted-foreground">{EVENT_TAGLINE}</p>

    <div className="grid gap-3 sm:grid-cols-2">
      <div className="rounded-md border border-border bg-muted/20 p-4">
        <div className="flex gap-3">
          <CalendarDays className="h-5 w-5 shrink-0 text-primary" aria-hidden />
          <div>
            <p className="text-sm font-semibold text-foreground">日期</p>
            <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
              2026年9月25–27日
              <br />
              （星期五至日）
            </p>
          </div>
        </div>
      </div>
      <div className="rounded-md border border-border bg-muted/20 p-4">
        <div className="flex gap-3">
          <MapPin className="h-5 w-5 shrink-0 text-primary" aria-hidden />
          <div>
            <p className="text-sm font-semibold text-foreground">地點</p>
            <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
              觀塘海濱活動空間02
            </p>
          </div>
        </div>
      </div>
      <div className="rounded-md border border-border bg-muted/20 p-4 sm:col-span-2">
        <div className="flex gap-3">
          <Clock className="h-5 w-5 shrink-0 text-primary" aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-foreground">每日時間</p>
            <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
              {EVENT_TIMES.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <div className="rounded-md border border-border bg-muted/20 p-4 sm:col-span-2">
        <div className="flex gap-3">
          <Percent className="h-5 w-5 shrink-0 text-primary" aria-hidden />
          <div>
            <p className="text-sm font-semibold text-foreground">費用模式</p>
            <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
              免固定租金 · 現場銷售額 25% 分帳（贊助形式除外）
            </p>
          </div>
        </div>
      </div>
    </div>

    <div>
      <p className="text-sm font-semibold text-foreground mb-3">活動亮點</p>
      <ul className="space-y-2.5">
        {EVENT_HIGHLIGHTS.map((h) => (
          <li
            key={h}
            className="flex gap-2.5 text-sm text-muted-foreground leading-relaxed"
          >
            <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary" aria-hidden />
            <span>{h}</span>
          </li>
        ))}
      </ul>
    </div>

    <p className="text-sm text-foreground/80 border-t border-border pt-4 leading-relaxed">
      約 20 檔 · 額滿即止 · 開檔／贊助均可
      <br />
      <span className="text-muted-foreground">
        57K+ IG 曝光 · 10K App 用戶 · 280K 網站曝光
      </span>
    </p>
  </div>
);

const Field = ({
  id,
  label,
  required,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) => (
  <div className="space-y-2">
    <Label htmlFor={id} className="text-sm font-medium text-foreground">
      {label}
      {required && <span className="text-destructive ml-0.5">*</span>}
    </Label>
    {hint && <p className="text-xs text-muted-foreground -mt-1">{hint}</p>}
    {children}
    {error && <p className="text-xs text-destructive">{error}</p>}
  </div>
);

const VendorApplication = () => {
  const navigate = useNavigate();
  const { isAuthenticated, userInfo } = useAuth();
  const [joinType, setJoinType] = useState<JoinType | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [stepError, setStepError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [form, setForm] = useState<FormState>({
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

  const stepIds = useMemo<StepId[]>(() => {
    const ids: StepId[] = ["overview", "brand", "contact"];
    if (!isSponsorOnly && joinType) ids.push("booth");
    ids.push("terms");
    return ids;
  }, [isSponsorOnly, joinType]);

  const activeStepId = stepIds[currentStep] ?? "overview";
  const progressValue = stepIds.length > 0 ? ((currentStep + 1) / stepIds.length) * 100 : 0;

  const set = (k: keyof FormState, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setFieldErrors((e) => ({ ...e, [k]: undefined }));
  };

  useEffect(() => {
    if (currentStep >= stepIds.length) {
      setCurrentStep(Math.max(0, stepIds.length - 1));
    }
  }, [currentStep, stepIds.length]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentStep]);

  const validateStep = useCallback(
    (stepId: StepId): boolean => {
      setStepError(null);
      setFieldErrors({});

      if (stepId === "overview") {
        if (!joinType) {
          setStepError("請選擇參與方式");
          return false;
        }
        return true;
      }

      if (stepId === "brand") {
        const errors: Partial<Record<keyof FormState, string>> = {};
        if (!form.brandName.trim()) errors.brandName = "請填寫攤位／品牌名稱";
        if (!form.productDesc.trim()) errors.productDesc = "請填寫販售內容／贊助物品說明";
        if (Object.keys(errors).length > 0) {
          setFieldErrors(errors);
          return false;
        }
        return true;
      }

      if (stepId === "contact") {
        const parsed = applicationSchema.pick({
          contactName: true,
          phone: true,
          email: true,
        }).safeParse(form);
        if (!parsed.success) {
          const errors: Partial<Record<keyof FormState, string>> = {};
          for (const issue of parsed.error.issues) {
            const key = issue.path[0];
            if (typeof key === "string") errors[key as keyof FormState] = issue.message;
          }
          setFieldErrors(errors);
          return false;
        }
        return true;
      }

      if (stepId === "terms") {
        if (!agreed) {
          setStepError("請閱讀並同意活動條款及細則");
          return false;
        }
        return true;
      }

      return true;
    },
    [agreed, form, joinType],
  );

  const goNext = () => {
    if (!validateStep(activeStepId)) return;
    setCurrentStep((s) => Math.min(s + 1, stepIds.length - 1));
  };

  const goBack = () => {
    setStepError(null);
    setFieldErrors({});
    setCurrentStep((s) => Math.max(s - 1, 0));
  };

  const handleSubmit = async () => {
    if (!validateStep("terms") || !joinType) return;

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
      await Promise.all([
        createContactUsReport({
          reporterId: isAuthenticated === true ? userInfo?.userId ?? null : null,
          message,
          contact: {
            reporterName: data.contactName,
            reporterEmail: data.email.trim().toLowerCase(),
            reporterPhone: data.phone.trim(),
          },
        }),
        syncVendorApplicationToNotion({
          joinType,
          joinLabel,
          brandName: data.brandName,
          brandIntro: data.brandIntro || undefined,
          productDesc: data.productDesc,
          contactName: data.contactName,
          phone: data.phone.trim(),
          email: data.email.trim().toLowerCase(),
          ig: data.ig || undefined,
          electricity: data.electricity || undefined,
          equipment: data.equipment || undefined,
          isSponsorOnly,
          unitLabel,
        }),
      ]);
      navigate("/vendor-application/thank-you", { replace: true });
    } catch (error) {
      console.error("Failed to submit vendor application:", error);
      toast.error("暫時未能提交，請稍後再試", { duration: 3000 });
      setSubmitting(false);
    }
  };

  const isLastStep = currentStep === stepIds.length - 1;

  return (
    <div className="min-h-screen bg-[hsl(30_20%_97%)]">
      <Header />

      <div className="border-b border-border bg-background">
        <img
          src={vendorEventCover}
          alt="PetWell x Aquabeat 觀塘寵物市集｜檔主招募 09-2026"
          className="block w-full h-auto"
          width={1024}
          height={576}
          fetchPriority="high"
        />
        <div className="container mx-auto max-w-2xl px-4 py-5 md:py-6">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1.5">
            官方申請表格
          </p>
          <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-foreground">
            PetWell × AquaBeat 觀塘寵物市集
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">檔主及贊助招募 · 2026年9月</p>
        </div>
      </div>

      <main className="container mx-auto max-w-2xl px-4 py-8 md:py-10">
        <div className="rounded-lg border border-border bg-background shadow-sm">
          <div className="border-b border-border px-6 py-5 md:px-8">
            <h2 className="text-lg font-semibold text-foreground">{STEP_LABELS[activeStepId]}</h2>
            {activeStepId === "overview" && (
              <p className="mt-1 text-sm text-muted-foreground">
                請先了解活動詳情，並選擇參與方式。
              </p>
            )}
            {activeStepId === "brand" && (
              <p className="mt-1 text-sm text-muted-foreground">
                告訴我們你的{unitLabel}及將會提供嘅產品或贊助內容。
              </p>
            )}
            {activeStepId === "contact" && (
              <p className="mt-1 text-sm text-muted-foreground">
                我們會透過以下方式聯絡你確認申請結果。
              </p>
            )}
            {activeStepId === "booth" && (
              <p className="mt-1 text-sm text-muted-foreground">
                如需要現場供電，請說明用途；如不需要可留空或填「不需要」。
              </p>
            )}
            {activeStepId === "terms" && (
              <p className="mt-1 text-sm text-muted-foreground">
                提交前請細閱條款及細則，並確認資料真確。
              </p>
            )}
          </div>

          <div className="px-6 py-6 md:px-8 md:py-7 space-y-5">
            {activeStepId === "overview" && (
              <>
                <EventOverview />
                <div className="space-y-4 border-t border-border pt-6">
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      參與方式<span className="text-destructive ml-0.5">*</span>
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      請選擇你想以哪種形式參與今次市集。
                    </p>
                  </div>
                  <RadioGroup
                    value={joinType ?? ""}
                    onValueChange={(v) => {
                      setJoinType(v as JoinType);
                      setStepError(null);
                    }}
                    className="space-y-3"
                  >
                    {JOIN_OPTIONS.map((opt) => (
                      <label
                        key={opt.value}
                        htmlFor={`join-${opt.value}`}
                        className={cn(
                          "flex cursor-pointer items-start gap-3 rounded-md border px-4 py-3.5 transition-colors",
                          joinType === opt.value
                            ? "border-primary bg-primary/[0.03]"
                            : "border-border hover:border-primary/30",
                        )}
                      >
                        <RadioGroupItem
                          value={opt.value}
                          id={`join-${opt.value}`}
                          className="mt-0.5"
                        />
                        <div>
                          <p className="font-medium text-sm">{opt.title}</p>
                          <p className="text-sm text-muted-foreground mt-0.5">{opt.desc}</p>
                        </div>
                      </label>
                    ))}
                  </RadioGroup>
                  <p className="text-xs text-muted-foreground">
                    選擇「親身參與開檔」需按現場銷售額繳付 25% 分帳；純贊助形式無需分帳。
                  </p>
                </div>
              </>
            )}

            {activeStepId === "brand" && (
              <>
                <Field
                  id="brandName"
                  label="攤位名稱 / 品牌名稱"
                  required
                  error={fieldErrors.brandName}
                >
                  <Input
                    id="brandName"
                    value={form.brandName}
                    onChange={(e) => set("brandName", e.target.value)}
                    maxLength={120}
                    className="bg-background"
                  />
                </Field>
                <Field
                  id="brandIntro"
                  label="攤位 / 品牌簡介"
                  hint="選填，約 50 字"
                  error={fieldErrors.brandIntro}
                >
                  <Textarea
                    id="brandIntro"
                    value={form.brandIntro}
                    onChange={(e) => set("brandIntro", e.target.value)}
                    maxLength={500}
                    rows={3}
                    className="bg-background resize-none"
                  />
                </Field>
                <Field
                  id="productDesc"
                  label="販售內容 / 贊助物品說明"
                  required
                  hint="請簡述主要商品／服務，或贊助之試用品／禮物詳情"
                  error={fieldErrors.productDesc}
                >
                  <Textarea
                    id="productDesc"
                    value={form.productDesc}
                    onChange={(e) => set("productDesc", e.target.value)}
                    maxLength={1000}
                    rows={4}
                    className="bg-background resize-none"
                  />
                </Field>
                <Field id="ig" label="Instagram / 網址" hint="選填" error={fieldErrors.ig}>
                  <Input
                    id="ig"
                    value={form.ig}
                    onChange={(e) => set("ig", e.target.value)}
                    placeholder="@yourbrand 或 https://"
                    maxLength={255}
                    className="bg-background"
                  />
                </Field>
              </>
            )}

            {activeStepId === "contact" && (
              <>
                <Field
                  id="contactName"
                  label="聯絡人姓名"
                  required
                  error={fieldErrors.contactName}
                >
                  <Input
                    id="contactName"
                    value={form.contactName}
                    onChange={(e) => set("contactName", e.target.value)}
                    maxLength={80}
                    className="bg-background"
                  />
                </Field>
                <Field
                  id="phone"
                  label="聯絡電話（WhatsApp）"
                  required
                  error={fieldErrors.phone}
                >
                  <Input
                    id="phone"
                    type="tel"
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    maxLength={40}
                    placeholder="例如：9123 4567"
                    className="bg-background"
                  />
                </Field>
                <Field id="email" label="電郵地址" required error={fieldErrors.email}>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    maxLength={255}
                    className="bg-background"
                  />
                </Field>
              </>
            )}

            {activeStepId === "booth" && (
              <>
                <Field
                  id="electricity"
                  label="電力需求"
                  hint="例：需要 1 個插座，用作 LED 燈箱；如不需要請填「不需要」"
                >
                  <Textarea
                    id="electricity"
                    value={form.electricity}
                    onChange={(e) => set("electricity", e.target.value)}
                    maxLength={500}
                    rows={3}
                    className="bg-background resize-none"
                  />
                </Field>
                <Field
                  id="equipment"
                  label="設備及瓦數"
                  hint="例：LED 燈箱 30W、電子磅 10W（每檔上限 500W）"
                >
                  <Textarea
                    id="equipment"
                    value={form.equipment}
                    onChange={(e) => set("equipment", e.target.value)}
                    maxLength={500}
                    rows={3}
                    className="bg-background resize-none"
                  />
                </Field>
              </>
            )}

            {activeStepId === "terms" && (
              <>
                <Accordion type="multiple" className="w-full">
                  <AccordionItem value="general">
                    <AccordionTrigger className="text-sm font-medium py-3">
                      一般條款及細則
                    </AccordionTrigger>
                    <AccordionContent>
                      <TermsList items={TERMS} />
                    </AccordionContent>
                  </AccordionItem>
                  {!isSponsorOnly && (
                    <>
                      <AccordionItem value="booth">
                        <AccordionTrigger className="text-sm font-medium py-3">
                          攤位詳情
                        </AccordionTrigger>
                        <AccordionContent>
                          <TermsList items={BOOTH_DETAILS} />
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="deposit">
                        <AccordionTrigger className="text-sm font-medium py-3">
                          按金
                        </AccordionTrigger>
                        <AccordionContent>
                          <TermsList items={DEPOSIT_INFO} />
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="collab">
                        <AccordionTrigger className="text-sm font-medium py-3">
                          合作模式及分帳
                        </AccordionTrigger>
                        <AccordionContent>
                          <TermsList items={COLLABORATION_INFO} />
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="electricity">
                        <AccordionTrigger className="text-sm font-medium py-3">
                          電力使用條款
                        </AccordionTrigger>
                        <AccordionContent>
                          <TermsList items={ELECTRICITY_TERMS} />
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="floorplan">
                        <AccordionTrigger className="text-sm font-medium py-3">
                          場地平面圖
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="rounded-md border overflow-hidden bg-white">
                            <img
                              src={vendorEventFloorPlan}
                              alt="活動場地平面圖"
                              className="w-full h-auto"
                              loading="lazy"
                            />
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">
                            攤位位置以主辦方最終編排為準。
                          </p>
                        </AccordionContent>
                      </AccordionItem>
                    </>
                  )}
                </Accordion>

                <div className="rounded-md border border-border bg-muted/30 p-4 text-sm leading-relaxed text-muted-foreground">
                  {CONFIRMATION_TEXT}
                </div>

                <label className="flex items-start gap-3 cursor-pointer">
                  <Checkbox
                    checked={agreed}
                    onCheckedChange={(v) => {
                      setAgreed(v === true);
                      if (v) setStepError(null);
                    }}
                    className="mt-0.5"
                  />
                  <span className="text-sm leading-relaxed">
                    我已閱讀並同意以上活動條款及細則
                    <span className="text-destructive">*</span>
                  </span>
                </label>
              </>
            )}

            {stepError && (
              <p className="text-sm text-destructive" role="alert">
                {stepError}
              </p>
            )}
          </div>

          <div
            className="flex items-center justify-between gap-3 border-t border-border px-6 py-4 md:px-8"
            aria-label={`第 ${currentStep + 1} 步，共 ${stepIds.length} 步：${STEP_LABELS[activeStepId]}`}
          >
            <Button
              type="button"
              variant="ghost"
              onClick={goBack}
              disabled={currentStep === 0 || submitting}
              className="gap-1 text-muted-foreground"
            >
              <ChevronLeft className="h-4 w-4" />
              上一步
            </Button>

            {isLastStep ? (
              <Button type="button" onClick={handleSubmit} disabled={submitting} className="min-w-[120px]">
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    提交中
                  </>
                ) : (
                  "提交申請"
                )}
              </Button>
            ) : (
              <Button type="button" onClick={goNext} className="gap-1 min-w-[120px]">
                下一步
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="border-t border-border/60 px-6 pb-4 pt-3 md:px-8">
            <div className="flex items-center justify-between gap-4 text-xs text-muted-foreground/80">
              <span>
                第 {currentStep + 1} 步，共 {stepIds.length} 步
              </span>
              <span>{STEP_LABELS[activeStepId]}</span>
            </div>
            <div
              className="mt-2 h-0.5 w-full overflow-hidden rounded-full bg-border"
              role="progressbar"
              aria-valuenow={currentStep + 1}
              aria-valuemin={1}
              aria-valuemax={stepIds.length}
              aria-label="申請進度"
            >
              <div
                className="h-full rounded-full bg-muted-foreground/25 transition-[width] duration-300 ease-out"
                style={{ width: `${progressValue}%` }}
              />
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-start gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5" />
          <p>
            此表格由 PetWell 官方發布。你所提供的資料只會用於是次市集籌備及聯絡用途，不會轉交予第三方。
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default VendorApplication;
