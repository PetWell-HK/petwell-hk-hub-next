"use client";

import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ShieldCheck,
  Sparkles,
  AlertTriangle,
  Beef,
  Flame,
  Wheat,
  Droplets,
  Info,
  MessageCircle,
  Check,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useSEO } from "@/hooks/useSEO";
import { cn } from "@/lib/utils";
import {
  NutritionGradeBadge,
  NutritionScoreRing,
  ratingToScore,
  tierOfDetail,
} from "@/components/nutrition/nutritionTheme";

type Species = "cat" | "dog";

interface NutritionProduct {
  id: string;
  brand: string;
  name: string;
  species: Species;
  form: "dry" | "wet" | "freeze-dried" | "raw" | "treat";
  foodType: string;
  grainInfo: string;
  origin: string;
  rating: number;
  totalRecipes: number;
  summary: string;
  pros: string[];
  cons: string[];
  repRecipe: string;
  nutrition: {
    protein: number | null;
    fat: number | null;
    fiber: number | null;
    dryProtein: number | null;
    dryFat: number | null;
    dryCarbs: number | null;
    dryFiber: number | null;
  };
  ingredientsOverview: {
    total: number | null;
    allergen: number | null;
    indigest: number | null;
    uncertain: number | null;
    hasOrganicMinerals: boolean | null;
    hasProbiotics: boolean | null;
  };
  sourceUrl: string;
}

function MacroBar({
  label,
  value,
  max,
  icon: Icon,
}: {
  label: string;
  value: number | null;
  max: number;
  icon: typeof Beef;
}) {
  const pct = value == null ? 0 : Math.min(100, (value / max) * 100);
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Icon className="h-3.5 w-3.5 text-primary/70" aria-hidden="true" />
          {label}
        </div>
        <span className="nutrition-display text-base tabular-nums">{value == null ? "—" : `${value}%`}</span>
      </div>
      <div className="nutrition-macro-bar">
        <div className="nutrition-macro-bar__fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-10">
      <Skeleton className="mb-8 h-8 w-36 rounded-full" />
      <div className="nutrition-panel p-8">
        <div className="flex gap-6">
          <Skeleton className="h-36 w-36 shrink-0 rounded-full" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-9 w-3/4" />
            <Skeleton className="h-6 w-40" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NutritionProduct() {
  const { id } = useParams<{ id: string }>();
  const [products, setProducts] = useState<NutritionProduct[] | null>(null);
  const [err, setErr] = useState(false);

  useEffect(() => {
    fetch("/data/nutrition-products.json")
      .then((r) => r.json())
      .then(setProducts)
      .catch(() => setErr(true));
  }, []);

  const food = useMemo(() => products?.find((p) => p.id === id) ?? null, [products, id]);

  useSEO({
    title: food ? `${food.brand} ${food.name}｜PetWell 糧食評測` : "糧食評測｜PetWell HK",
    description: food ? `PetWell 中立分析：${food.brand} ${food.name} 嘅營養評分、成份重點同注意事項。` : "PetWell 糧食評測。",
    canonicalUrl: `https://petwellhk.com/nutrition/${id ?? ""}`,
  });

  if (err) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="nutrition-page flex flex-1 items-center justify-center py-20 text-sm text-muted-foreground">
          載入失敗，請刷新頁面。
        </main>
        <Footer />
      </div>
    );
  }

  if (!products) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="nutrition-page flex-1">
          <DetailSkeleton />
        </main>
        <Footer />
      </div>
    );
  }

  if (!food) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="nutrition-page container mx-auto flex-1 px-4 py-20 text-center">
          <div className="nutrition-panel mx-auto max-w-md p-10">
            <p className="nutrition-display text-2xl">搵唔到呢款糧</p>
            <p className="mt-2 text-sm text-muted-foreground">可能已經下架或者連結有誤。</p>
            <Button asChild variant="outline" className="mt-6 rounded-full">
              <Link to="/nutrition">
                <ArrowLeft className="h-4 w-4" aria-hidden="true" /> 返回評測列表
              </Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const score = ratingToScore(food.rating);
  const t = tierOfDetail(score);
  const n = food.nutrition;
  const io = food.ingredientsOverview;
  const fpr = n.protein && n.fat ? Math.round((n.fat / n.protein) * 100) : null;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="nutrition-page flex-1 pb-16">
        <div className="container mx-auto max-w-4xl px-4">
          <div className="pt-5">
            <Link
              to="/nutrition"
              className="inline-flex items-center gap-1.5 rounded-full border border-[hsl(var(--nutrition-line))] bg-white px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/30 hover:text-primary"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              返回評測列表
            </Link>
          </div>

          {/* Report header */}
          <header className={cn("nutrition-report-header nutrition-reveal -mx-4 mt-5 px-4 py-10 md:py-12", t.glow)}>
            <div className="mx-auto flex max-w-4xl flex-col items-center gap-8 sm:flex-row sm:items-start">
              <div className={cn("rounded-full bg-white p-2", t.glow)}>
                <NutritionScoreRing score={score} size={148} showNumeric />
              </div>
              <div className="min-w-0 flex-1 text-center sm:text-left">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">{food.brand}</p>
                <h1 className="nutrition-display mt-2 text-3xl leading-tight md:text-4xl">{food.name}</h1>
                <div className="mt-4 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                  <NutritionGradeBadge score={score} className="!px-2.5 !py-0.5 !text-xs" />
                  {food.foodType ? <Badge variant="secondary" className="font-normal">{food.foodType}</Badge> : null}
                  {food.grainInfo ? <Badge variant="secondary" className="font-normal">{food.grainInfo}</Badge> : null}
                  {food.totalRecipes ? (
                    <Badge variant="secondary" className="font-normal">{food.totalRecipes} 款配方</Badge>
                  ) : null}
                </div>
                {food.summary ? (
                  <p className="mx-auto mt-5 max-w-prose text-[15px] leading-relaxed text-muted-foreground sm:mx-0">
                    {food.summary}
                  </p>
                ) : null}
              </div>
            </div>
          </header>

          <div className="nutrition-reveal nutrition-reveal-delay-1 grid gap-5 py-8 md:grid-cols-2 md:py-10">
            <section className="nutrition-panel p-6">
              <div className="mb-1 flex items-center gap-2">
                <Info className="h-4 w-4 text-primary" aria-hidden="true" />
                <h2 className="text-sm font-semibold uppercase tracking-widest">營養重點</h2>
              </div>
              <p className="mb-6 text-xs text-muted-foreground">以乾物質基準 (DMB) 換算，方便公平比較。</p>
              <div className="space-y-5">
                <MacroBar label="蛋白質" value={n.dryProtein ?? n.protein} max={60} icon={Beef} />
                <MacroBar label="脂肪" value={n.dryFat ?? n.fat} max={40} icon={Flame} />
                <MacroBar label="碳水化合物" value={n.dryCarbs} max={60} icon={Wheat} />
                <MacroBar label="纖維" value={n.dryFiber ?? n.fiber} max={15} icon={Droplets} />
              </div>
              {fpr != null ? (
                <div className="mt-6 flex items-center justify-between border-t border-[hsl(var(--nutrition-line))] pt-5">
                  <div>
                    <div className="text-sm font-semibold">脂肪／蛋白比 (FPR)</div>
                    <div className="text-xs text-muted-foreground">數值越低，肉源質素越可靠</div>
                  </div>
                  <div className="nutrition-display text-2xl tabular-nums">{fpr}%</div>
                </div>
              ) : null}
            </section>

            <section className="nutrition-panel p-6">
              <div className="mb-1 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
                <h2 className="text-sm font-semibold uppercase tracking-widest">成份概覽</h2>
              </div>
              <p className="mb-6 text-xs text-muted-foreground">數字越低通常代表配方越乾淨。</p>
              <div className="grid grid-cols-2 gap-3">
                <Stat label="成份總數" value={io.total} />
                <Stat label="潛在致敏" value={io.allergen} warn={!!(io.allergen && io.allergen > 3)} />
                <Stat label="難消化" value={io.indigest} warn={!!(io.indigest && io.indigest > 2)} />
                <Stat label="標示模糊" value={io.uncertain} warn={!!(io.uncertain && io.uncertain > 2)} />
                <Flag label="有機礦物質" ok={!!io.hasOrganicMinerals} />
                <Flag label="含益生菌" ok={!!io.hasProbiotics} />
              </div>
              {food.repRecipe ? (
                <div className="mt-6 border-t border-[hsl(var(--nutrition-line))] pt-5">
                  <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">代表配方</div>
                  <p className="mt-1.5 text-sm leading-relaxed">{food.repRecipe}</p>
                </div>
              ) : null}
            </section>

            {food.pros.length > 0 ? (
              <section className="nutrition-panel border-emerald-200/80 bg-emerald-50/30 p-6 md:col-span-1">
                <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-widest">
                  <Check className="h-4 w-4 text-emerald-700" aria-hidden="true" />
                  值得欣賞
                </h2>
                <ul className="space-y-3">
                  {food.pros.map((p, i) => (
                    <li key={i} className="flex gap-3 text-sm leading-relaxed text-foreground/90">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-emerald-600" aria-hidden="true" />
                      {p}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {food.cons.length > 0 ? (
              <section className="nutrition-panel border-red-200/70 bg-red-50/25 p-6 md:col-span-1">
                <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-widest">
                  <AlertTriangle className="h-4 w-4 text-red-600" aria-hidden="true" />
                  需要留意
                </h2>
                <ul className="space-y-3">
                  {food.cons.map((c, i) => (
                    <li key={i} className="flex gap-3 text-sm leading-relaxed text-foreground/90">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-red-500" aria-hidden="true" />
                      {c}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </div>

          <footer className="border-t border-[hsl(var(--nutrition-line))] py-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="flex items-start gap-3 text-xs leading-relaxed text-muted-foreground md:text-sm">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary/70" aria-hidden="true" />
                <p>
                  <span className="font-semibold text-foreground/85">中立聲明：</span>
                  PetWell 冇收品牌費，評分只根據公開營養標籤。最終請以獸醫建議為準。
                </p>
              </div>
              <a
                href="https://wa.me/85255954078"
                target="_blank"
                rel="noreferrer"
                className="inline-flex shrink-0 items-center gap-1.5 text-xs font-medium text-primary hover:underline"
              >
                <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
                發現錯漏？話我知
              </a>
            </div>
          </footer>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function Stat({ label, value, warn }: { label: string; value: number | null; warn?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-xl border px-3 py-3",
        warn ? "border-amber-200 bg-amber-50/80" : "border-[hsl(var(--nutrition-line))] bg-[hsl(var(--nutrition-canvas))]",
      )}
    >
      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="nutrition-display mt-0.5 text-xl tabular-nums">{value ?? "—"}</div>
    </div>
  );
}

function Flag({ label, ok }: { label: string; ok: boolean }) {
  return (
    <div
      className={cn(
        "flex items-center justify-between rounded-xl border px-3 py-3",
        ok ? "border-emerald-200 bg-emerald-50/80" : "border-[hsl(var(--nutrition-line))] bg-[hsl(var(--nutrition-canvas))]",
      )}
    >
      <div className="text-xs font-medium">{label}</div>
      <div className={cn("text-sm font-semibold", ok ? "text-emerald-700" : "text-muted-foreground")}>{ok ? "有" : "—"}</div>
    </div>
  );
}
