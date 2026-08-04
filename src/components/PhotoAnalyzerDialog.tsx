import { useEffect, useRef, useState } from "react";
import {
  Camera,
  Upload,
  Loader2,
  ShieldAlert,
  ArrowLeft,
  Sparkles,
  Mail,
  CheckCircle2,
  ChevronDown,
  AlertTriangle,
  ShieldCheck,
  ScanLine,
  Check,
  Minus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { APP_STORE_URL, PLAY_STORE_URL } from "@/components/AppDownloadCTA";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { gradeOf, tierOf } from "@/components/nutrition/nutritionTheme";

type Step = "choose" | "extracting" | "confirm" | "scoring" | "result" | "email-done";

interface ExtractResult {
  is_food_label: boolean;
  reject_reason: string | null;
  brand_name: string | null;
  product_name: string | null;
  food_type: "dry_food" | "wet_food" | "snack" | "unknown";
  raw_data: {
    protein_percent: number | null;
    fat_percent: number | null;
    fiber_percent: number | null;
    moisture_percent: number | null;
    ash_percent: number | null;
  };
  ingredients_text: string;
  label_text_zh: string;
}

interface ScoreReport {
  product_info: { brand_name: string | null; product_name: string | null; food_type: string };
  calculated_data?: {
    dmb_protein_percent: number;
    dmb_fat_percent: number;
    dmb_carbs_percent: number;
    fat_to_protein_ratio: number;
  };
  ingredient_analysis?: {
    first_ingredient: string;
    is_first_ingredient_named_meat: boolean;
    has_unnamed_meat_or_byproducts: boolean;
    has_high_gi_carbs_or_fillers: boolean;
    has_artificial_preservatives: boolean;
    has_artificial_colors_or_sugars: boolean;
  };
  scoring: {
    core_nutrition_score: number;
    ingredient_quality_score: number;
    red_flag_deductions: number;
    total_score: number;
    dfa_star_equivalent: number;
  };
  evaluation_report?: { pros: string[]; cons: string[]; summary: string };
}

const STEPS = [
  { key: "upload", label: "上傳" },
  { key: "read", label: "讀取" },
  { key: "review", label: "核對" },
  { key: "result", label: "結果" },
] as const;

function stepIndex(step: Step): number {
  switch (step) {
    case "choose":
      return 0;
    case "extracting":
      return 1;
    case "confirm":
      return 2;
    case "scoring":
    case "result":
    case "email-done":
      return 3;
    default: {
      const _exhaustive: never = step;
      return _exhaustive;
    }
  }
}

function verdictOf(score: number) {
  const t = tierOf(score);
  if (score >= 75) return { label: "可安心餵飼", tone: "safe" as const, ring: t.ring, chip: t.chip };
  if (score >= 60) return { label: "可用但需留意", tone: "caution" as const, ring: t.ring, chip: t.chip };
  return { label: "不建議餵飼", tone: "risk" as const, ring: t.ring, chip: t.chip };
}

function gradeOfScore(s: number): string {
  return gradeOf(s);
}

function StepProgress({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {STEPS.map((s, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={s.key} className="flex flex-1 flex-col gap-1.5">
            <div className="flex items-center gap-1">
              <div
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold transition-all",
                  done && "bg-primary text-primary-foreground",
                  active && !done && "border-2 border-primary bg-primary/10 text-primary",
                  !done && !active && "border border-[hsl(var(--nutrition-line))] bg-white text-muted-foreground",
                )}
              >
                {done ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : i + 1}
              </div>
              {i < STEPS.length - 1 ? (
                <div className={cn("h-0.5 flex-1 rounded-full", i < current ? "bg-primary" : "bg-[hsl(var(--nutrition-line))]")} aria-hidden="true" />
              ) : null}
            </div>
            <span className={cn("text-center text-[10px] font-semibold uppercase tracking-wider", active ? "text-foreground" : "text-muted-foreground")}>
              {s.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function AnimatedScoreRing({ score, ringClass }: { score: number; ringClass: string }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const start = performance.now();
    const dur = 900;
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(score * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [score]);

  const size = 148;
  const r = (size - 10) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (display / 100) * c;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }} aria-hidden="true">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={8} className="stroke-muted fill-none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={8}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className={cn("fill-none transition-all", ringClass)}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
        <div className="nutrition-display text-4xl font-semibold tabular-nums">{display}</div>
        <div className="mt-1.5 text-xs text-muted-foreground">/ 100 · {gradeOfScore(score)}</div>
      </div>
    </div>
  );
}

type FindingTone = "risk" | "caution" | "safe";

function FindingRow({
  tone,
  title,
  summary,
  detail,
  tip,
  defaultOpen,
}: {
  tone: FindingTone;
  title: string;
  summary: string;
  detail?: string;
  tip?: string;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(!!defaultOpen);
  const hasMore = Boolean(detail || tip);

  const toneStyles: Record<FindingTone, string> = {
    risk: "border-red-200/80 bg-red-50/50",
    caution: "border-amber-200/80 bg-amber-50/50",
    safe: "border-emerald-200/80 bg-emerald-50/50",
  };

  const iconStyles: Record<FindingTone, string> = {
    risk: "text-red-600",
    caution: "text-amber-600",
    safe: "text-emerald-600",
  };

  const Icon = tone === "safe" ? Check : tone === "risk" ? AlertTriangle : Minus;

  return (
    <div className={cn("nutrition-panel overflow-hidden !rounded-xl", toneStyles[tone])}>
      <button
        type="button"
        onClick={() => hasMore && setOpen((v) => !v)}
        className={cn("flex w-full items-start gap-3 p-4 text-left", !hasMore && "cursor-default")}
        aria-expanded={hasMore ? open : undefined}
      >
        <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", iconStyles[tone])} aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium text-foreground">{title}</div>
          <div className="mt-0.5 text-sm text-muted-foreground leading-relaxed">{summary}</div>
        </div>
        {hasMore ? (
          <ChevronDown
            className={cn("h-4 w-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")}
            aria-hidden="true"
          />
        ) : null}
      </button>
      {open && hasMore ? (
        <div className="space-y-3 border-t border-border/60 px-4 pb-4 pt-3">
          {detail ? (
            <div>
              <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">點解重要</div>
              <p className="mt-1 text-sm leading-relaxed text-foreground/85">{detail}</p>
            </div>
          ) : null}
          {tip ? (
            <div>
              <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">獸醫貼士</div>
              <p className="mt-1 text-sm leading-relaxed text-foreground/85">{tip}</p>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function LoadingStep({ title, subtitle, tasks }: { title: string; subtitle: string; tasks: string[] }) {
  return (
    <div className="mx-auto max-w-sm py-8">
      <div className="nutrition-panel p-6 text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" aria-hidden="true" />
        <h2 className="nutrition-display mt-5 text-xl">{title}</h2>
        <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>
      </div>
      <div className="mt-5 space-y-2">
        {tasks.map((task, i) => (
          <div
            key={task}
            className={cn(
              "nutrition-panel flex items-center gap-3 px-4 py-3",
              i === 0 && "border-primary/25 bg-primary/5",
            )}
          >
            {i === 0 ? (
              <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-primary" aria-hidden="true" />
            ) : (
              <div className="h-3.5 w-3.5 shrink-0 rounded-full border border-[hsl(var(--nutrition-line))] bg-white" aria-hidden="true" />
            )}
            <span className={cn("text-sm", i === 0 ? "font-medium text-foreground" : "text-muted-foreground")}>{task}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

async function compressImage(file: File): Promise<string> {
  const dataUrl = await fileToDataUrl(file);
  const img = new Image();
  await new Promise<void>((res, rej) => {
    img.onload = () => res();
    img.onerror = rej;
    img.src = dataUrl;
  });
  const maxDim = 1600;
  let { width, height } = img;
  if (width > maxDim || height > maxDim) {
    const ratio = Math.min(maxDim / width, maxDim / height);
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }
  const c = document.createElement("canvas");
  c.width = width;
  c.height = height;
  c.getContext("2d")!.drawImage(img, 0, 0, width, height);
  return c.toDataURL("image/jpeg", 0.85);
}

const NUTRIENT_FIELDS = [
  { key: "protein_percent" as const, label: "蛋白" },
  { key: "fat_percent" as const, label: "脂肪" },
  { key: "fiber_percent" as const, label: "纖維" },
  { key: "moisture_percent" as const, label: "水分" },
  { key: "ash_percent" as const, label: "灰分" },
];

export function PhotoAnalyzerDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [step, setStep] = useState<Step>("choose");
  const [imageUrl, setImageUrl] = useState("");
  const [extract, setExtract] = useState<ExtractResult | null>(null);
  const [report, setReport] = useState<ScoreReport | null>(null);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const uploadRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setStep("choose");
    setImageUrl("");
    setExtract(null);
    setReport(null);
    setEmail("");
    setError("");
  };

  const close = () => {
    onOpenChange(false);
    setTimeout(reset, 300);
  };

  const handleFile = async (file: File) => {
    setError("");
    setStep("extracting");
    try {
      const dataUrl = await compressImage(file);
      setImageUrl(dataUrl);
      const { data, error: e } = await supabase.functions.invoke("analyze-pet-food-label", {
        body: { action: "extract", imageDataUrl: dataUrl },
      });
      if (e) throw e;
      const r = data as ExtractResult;
      if (!r.is_food_label) {
        setError(r.reject_reason || "呢張相似乎唔係寵物糧食標籤，請重試。");
        setStep("choose");
        return;
      }
      setExtract(r);
      setStep("confirm");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "";
      setError("分析失敗，請重試。" + (msg ? ` (${msg})` : ""));
      setStep("choose");
    }
  };

  const handleConfirm = async () => {
    if (!extract) return;
    setStep("scoring");
    try {
      const { data, error: e } = await supabase.functions.invoke("analyze-pet-food-label", {
        body: { action: "score", payload: extract },
      });
      if (e) throw e;
      setReport(data as ScoreReport);
      setStep("result");
    } catch {
      setError("評分失敗，請重試。");
      setStep("confirm");
    }
  };

  const submitEmail = async () => {
    if (!email || !email.includes("@")) {
      toast({ title: "請輸入有效電郵", variant: "destructive" });
      return;
    }
    try {
      await supabase.functions.invoke("analyze-pet-food-label", {
        body: { action: "score", payload: extract, email },
      });
      setStep("email-done");
    } catch {
      toast({ title: "提交失敗，請重試", variant: "destructive" });
    }
  };

  const updateRaw = (key: keyof ExtractResult["raw_data"], val: string) => {
    if (!extract) return;
    const n = val === "" ? null : Number(val);
    setExtract({
      ...extract,
      raw_data: { ...extract.raw_data, [key]: Number.isNaN(n as number) ? null : n },
    });
  };

  const v = report ? verdictOf(report.scoring.total_score) : null;
  const ia = report?.ingredient_analysis;
  const cd = report?.calculated_data;

  const redFlags: Array<{ title: string; summary: string; detail: string; tip: string }> = [];
  const watchOuts: Array<{ title: string; summary: string; detail: string; tip: string }> = [];
  const goodPoints: Array<{ title: string; summary: string; detail: string; tip: string }> = [];

  if (ia) {
    if (ia.has_artificial_preservatives) {
      redFlags.push({
        title: "含人工防腐劑",
        summary: "偵測到 BHA / BHT / Ethoxyquin 或類似成份。",
        detail: "呢類化學防腐劑長期食用可能同肝腎壓力有關，係國際獸醫營養學界普遍會建議避免嘅成份。",
        tip: "揀用維他命 E（Mixed Tocopherols）或迷迭香萃取作為天然防腐嘅配方會更安全。",
      });
    }
    if (ia.has_artificial_colors_or_sugars) {
      redFlags.push({
        title: "含人工色素或添加糖",
        summary: "配方入面出現色素或糖分，對毛孩並無營養價值。",
        detail: "人工色素只係為咗吸引主人購買，對寵物可能引起腸胃或行為敏感；糖分長期過量會增加肥胖及糖尿風險。",
        tip: "選擇成份表越短越樸實嘅產品，成份純度反而更重要。",
      });
    }
    if (ia.has_unnamed_meat_or_byproducts) {
      watchOuts.push({
        title: "含未命名肉源或副產品",
        summary: "例如「meat meal」、「animal fat」等冇註明係咩肉類。",
        detail: "未命名肉源代表原料來源不透明，品質和穩定性難以追蹤，敏感體質嘅毛孩可能會出現皮膚或腸胃反應。",
        tip: "認住成份表以「Chicken」、「Salmon」等具體肉類為首個成份嘅配方。",
      });
    }
    if (ia.has_high_gi_carbs_or_fillers) {
      watchOuts.push({
        title: "含高 GI 碳水或填充料",
        summary: "例如粟米、麥、白米、麥芽糊精。",
        detail: "呢啲成份可以令飽足感上升，但同時會令血糖起伏較大，長期依賴會增加肥胖或糖尿風險。",
        tip: "揀用番薯、鷹嘴豆、燕麥等低升糖指數碳水源會更理想。",
      });
    }
    if (ia.is_first_ingredient_named_meat) {
      goodPoints.push({
        title: "首個成份係優質肉源",
        summary: `${ia.first_ingredient || "已命名肉類"} 排列第一，蛋白質基礎理想。`,
        detail: "AAFCO 建議犬貓糧首個成份最好係命名肉類，代表配方以動物性蛋白為主，較符合肉食性動物需求。",
        tip: "呢類配方特別適合活躍犬貓，可以維持肌肉健康。",
      });
    }
  }

  if (cd) {
    if (cd.dmb_protein_percent >= 28) {
      goodPoints.push({
        title: `蛋白質水平充足（乾物基 ${cd.dmb_protein_percent.toFixed(1)}%）`,
        summary: "達到 AAFCO 成犬／成貓維持量以上。",
        detail: "蛋白質提供必需胺基酸，維持毛髮、肌肉和免疫系統。乾物基（DMB）換算比包裝上嘅「原始 %」更能反映真實濃度。",
        tip: "老年或腎臟指數偏高嘅毛孩，記得同獸醫討論適合嘅蛋白質範圍。",
      });
    }
    if (cd.fat_to_protein_ratio >= 90) {
      watchOuts.push({
        title: `脂蛋白比偏高（FPR ${cd.fat_to_protein_ratio.toFixed(0)}%）`,
        summary: "脂肪相對於蛋白比例過高，暗示廉價脂肪替代蛋白。",
        detail: "健康乾糧一般 FPR 在 40–75% 之間；長期過高可能導致胰臟壓力和體重上升。",
        tip: "如你嘅毛孩體型偏胖或曾患胰臟炎，應優先揀 FPR 較低嘅配方。",
      });
    }
  }

  const currentStep = stepIndex(step);

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) close();
        else onOpenChange(v);
      }}
    >
      <DialogContent className="nutrition-analyzer max-h-[92vh] max-w-lg gap-0 overflow-y-auto border border-[hsl(var(--nutrition-line))] p-0 sm:max-w-[580px] sm:rounded-2xl">
        <DialogHeader className="sr-only">
          <DialogTitle>寵物糧營養分析</DialogTitle>
          <DialogDescription>PetWell 糧食標籤即時評分</DialogDescription>
        </DialogHeader>

        {/* Header */}
        <div className="sticky top-0 z-10 border-b border-[hsl(var(--nutrition-line))] bg-[hsl(var(--nutrition-canvas))]/95 px-5 py-4 backdrop-blur supports-[backdrop-filter]:bg-[hsl(var(--nutrition-canvas))]/90">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <ScanLine className="h-4 w-4 text-primary" aria-hidden="true" />
              <span className="text-sm font-semibold tracking-tight">糧食標籤分析</span>
            </div>
            <span className="rounded-full border border-[hsl(var(--nutrition-line))] bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              PetWell
            </span>
          </div>
          <StepProgress current={currentStep} />
        </div>

        <div className="px-5 pb-6 pt-5 md:px-6">
          {/* Step 1: Upload */}
          {step === "choose" && (
            <div className="mx-auto max-w-sm space-y-5">
              <div className="text-center">
                <h2 className="nutrition-display text-2xl">掃描營養標籤</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  對準保證分析同成份表，AI 會讀取並計分。
                </p>
              </div>

              {error ? (
                <div className="flex gap-2.5 rounded-xl border border-red-200/80 bg-red-50/60 p-3 text-sm text-red-800">
                  <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  {error}
                </div>
              ) : null}

              <div className="nutrition-scanner-zone">
                <span className="nutrition-scanner-zone__corner nutrition-scanner-zone__corner--tl" aria-hidden="true" />
                <span className="nutrition-scanner-zone__corner nutrition-scanner-zone__corner--tr" aria-hidden="true" />
                <span className="nutrition-scanner-zone__corner nutrition-scanner-zone__corner--bl" aria-hidden="true" />
                <span className="nutrition-scanner-zone__corner nutrition-scanner-zone__corner--br" aria-hidden="true" />
                <div className="flex flex-col items-center gap-4 py-2">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                    <Camera className="h-7 w-7 text-primary" aria-hidden="true" />
                  </div>
                  <p className="text-sm font-medium text-foreground">選擇上傳方式</p>
                  <div className="grid w-full grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => cameraRef.current?.click()}
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary text-sm font-semibold text-primary-foreground transition-transform active:scale-[0.98]"
                    >
                      <Camera className="h-4 w-4" aria-hidden="true" />
                      影相
                    </button>
                    <button
                      type="button"
                      onClick={() => uploadRef.current?.click()}
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[hsl(var(--nutrition-line))] bg-white text-sm font-semibold transition-colors hover:border-primary/30"
                    >
                      <Upload className="h-4 w-4" aria-hidden="true" />
                      上載
                    </button>
                  </div>
                </div>
              </div>

              <input
                ref={cameraRef}
                type="file"
                accept="image/*"
                capture="environment"
                hidden
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              />
              <input
                ref={uploadRef}
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              />

              <p className="flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                中立分析，唔收品牌贊助
              </p>
            </div>
          )}

          {/* Step 2: Extracting */}
          {step === "extracting" && (
            <LoadingStep
              title="讀取標籤中"
              subtitle="大約需要 10–20 秒"
              tasks={["辨識保證分析數值", "提取成份表文字", "核對產品資訊"]}
            />
          )}

          {/* Step 3: Confirm */}
          {step === "confirm" && extract && (
            <div className="space-y-5">
              <div>
                <h2 className="nutrition-display text-xl">核對讀取結果</h2>
                <p className="mt-1.5 text-sm text-muted-foreground">如有錯漏可直接修改，確認後開始評分。</p>
              </div>

              {error ? (
                <div className="flex gap-2.5 rounded-lg border border-red-200/80 bg-red-50/50 p-3 text-sm text-red-800">
                  <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  {error}
                </div>
              ) : null}

              {imageUrl ? (
                <div className="nutrition-panel overflow-hidden p-2">
                  <img src={imageUrl} alt="上傳嘅營養標籤" className="max-h-44 w-full rounded-lg object-contain" />
                </div>
              ) : null}

              <div className="nutrition-panel p-4">
                <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">AI 讀到嘅內容</div>
                <p className="mt-1.5 max-h-28 overflow-y-auto whitespace-pre-wrap text-sm leading-relaxed text-foreground/85">
                  {extract.label_text_zh}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="brand" className="text-xs text-muted-foreground">
                    品牌
                  </Label>
                  <Input
                    id="brand"
                    value={extract.brand_name ?? ""}
                    onChange={(e) => setExtract({ ...extract, brand_name: e.target.value })}
                    className="h-10"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="product" className="text-xs text-muted-foreground">
                    產品
                  </Label>
                  <Input
                    id="product"
                    value={extract.product_name ?? ""}
                    onChange={(e) => setExtract({ ...extract, product_name: e.target.value })}
                    className="h-10"
                  />
                </div>
              </div>

              <div>
                <div className="mb-2 text-sm font-medium">保證分析（As-Fed %）</div>
                <div className="grid grid-cols-5 gap-2">
                  {NUTRIENT_FIELDS.map(({ key, label }) => (
                    <div key={key} className="space-y-1">
                      <Label className="text-[10px] text-muted-foreground">{label}</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={extract.raw_data[key] ?? ""}
                        onChange={(e) => updateRaw(key, e.target.value)}
                        className="h-9 px-2 text-center text-sm tabular-nums"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <Button variant="outline" onClick={() => { setError(""); setStep("choose"); }} className="h-11 gap-1.5 rounded-full border-[hsl(var(--nutrition-line))] bg-white">
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                  重新上傳
                </Button>
                <Button onClick={handleConfirm} className="nutrition-scan-cta h-11 flex-1 gap-2 rounded-full border-0">
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                  確認並評分
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Scoring */}
          {step === "scoring" && (
            <LoadingStep
              title="計算評分中"
              subtitle="分析營養比例同成份質素"
              tasks={["換算乾物質基準", "評估配方質素", "生成評測報告"]}
            />
          )}

          {/* Step 4: Result */}
          {step === "result" && report && v && (
            <div className="space-y-6">
              <div className="nutrition-panel p-6 text-center">
                <AnimatedScoreRing score={report.scoring.total_score} ringClass={v.ring} />
                <div className={cn("mt-4 inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold", v.chip)}>
                  {v.label}
                </div>
                <h2 className="nutrition-display mt-4 text-xl">{report.product_info.brand_name || "未命名品牌"}</h2>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {report.product_info.product_name || "未命名產品"}
                </p>
                <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
                  {report.evaluation_report?.summary ||
                    `此配方符合基本營養標準${watchOuts.length ? `，但含 ${watchOuts.length} 個需要留意嘅成份` : ""}${redFlags.length ? `，並偵測到 ${redFlags.length} 個高風險成份` : ""}。`}
                </p>
              </div>

              {/* Quick stats row */}
              <div className="nutrition-panel grid grid-cols-3 divide-x divide-[hsl(var(--nutrition-line))] overflow-hidden p-0">
                <div className="px-3 py-4 text-center">
                  <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">蛋白</div>
                  <div className="nutrition-display mt-1 text-lg tabular-nums">
                    {cd ? `${cd.dmb_protein_percent.toFixed(0)}%` : "—"}
                  </div>
                </div>
                <div className="px-3 py-4 text-center">
                  <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">添加劑風險</div>
                  <div className="nutrition-display mt-1 text-lg">
                    {redFlags.length === 0 ? "低" : redFlags.length === 1 ? "中" : "高"}
                  </div>
                </div>
                <div className="px-3 py-4 text-center">
                  <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">營養平衡</div>
                  <div className="nutrition-display mt-1 text-lg">
                    {report.scoring.core_nutrition_score >= 30
                      ? "良好"
                      : report.scoring.core_nutrition_score >= 20
                        ? "尚可"
                        : "偏差"}
                  </div>
                </div>
              </div>

              {/* Findings */}
              {redFlags.length + watchOuts.length + goodPoints.length > 0 ? (
                <div>
                  <h3 className="mb-3 text-sm font-semibold">成份剖析</h3>
                  <div className="space-y-2">
                    {redFlags.map((c, i) => (
                      <FindingRow
                        key={`rf-${i}`}
                        tone="risk"
                        title={c.title}
                        summary={c.summary}
                        detail={c.detail}
                        tip={c.tip}
                        defaultOpen={i === 0}
                      />
                    ))}
                    {watchOuts.map((c, i) => (
                      <FindingRow
                        key={`wo-${i}`}
                        tone="caution"
                        title={c.title}
                        summary={c.summary}
                        detail={c.detail}
                        tip={c.tip}
                      />
                    ))}
                    {goodPoints.map((c, i) => (
                      <FindingRow
                        key={`gp-${i}`}
                        tone="safe"
                        title={c.title}
                        summary={c.summary}
                        detail={c.detail}
                        tip={c.tip}
                      />
                    ))}
                  </div>
                </div>
              ) : null}

              {/* Recommendation */}
              <div className="nutrition-panel p-4">
                <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">建議</div>
                <p className="mt-1.5 text-sm leading-relaxed">
                  {v.tone === "risk"
                    ? "建議考慮換一款首個成份為命名肉類、無人工防腐劑嘅配方，並留意毛孩換糧後嘅腸胃反應。"
                    : v.tone === "caution"
                      ? "此配方基礎可以，但可以留意毛孩有冇痕癢、軟便或體重變化，作為換糧與否嘅參考。"
                      : "此配方營養結構理想，可繼續餵飼，定期覆核毛孩體重同毛髮狀態即可。"}
                </p>
              </div>

              {/* Save report */}
              <div className="nutrition-panel p-4">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-primary" aria-hidden="true" />
                  <span className="text-sm font-semibold">儲存報告</span>
                </div>
                <p className="mt-1.5 text-sm text-muted-foreground">留低電郵，我哋會將完整報告 send 俾你。</p>
                <div className="mt-3 flex gap-2">
                  <Input
                    type="email"
                    placeholder="you@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-10 flex-1"
                  />
                  <Button onClick={submitEmail} className="h-10 shrink-0 px-4">
                    傳送
                  </Button>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">唔會發垃圾郵件，隨時可以取消訂閱。</p>
              </div>

              {/* App CTA */}
              <div className="nutrition-panel p-4 text-center">
                <p className="text-sm font-semibold">用 App 比較更多糧食</p>
                <p className="mt-1 text-xs text-muted-foreground">即刻同其他相似產品比較蛋白質、成份同性價比。</p>
                <div className="mt-3 flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" asChild>
                    <a href={APP_STORE_URL} target="_blank" rel="noopener noreferrer">
                      App Store
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1" asChild>
                    <a href={PLAY_STORE_URL} target="_blank" rel="noopener noreferrer">
                      Google Play
                    </a>
                  </Button>
                </div>
              </div>

              <p className="text-center text-[11px] leading-relaxed text-muted-foreground">
                本評分僅供教育參考，最終健康建議請以獸醫意見為準。
              </p>
            </div>
          )}

          {/* Email done */}
          {step === "email-done" && (
            <div className="mx-auto flex max-w-sm flex-col items-center py-10 text-center">
              <div className="nutrition-panel flex h-16 w-16 items-center justify-center rounded-full p-0">
                <CheckCircle2 className="h-8 w-8 text-emerald-600" aria-hidden="true" />
              </div>
              <h2 className="nutrition-display mt-5 text-2xl">已收到</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                我哋會將完整報告於 24 小時內電郵至 <span className="font-medium text-foreground">{email}</span>。
              </p>
              <Button onClick={close} variant="outline" className="mt-6 h-10">
                關閉
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
