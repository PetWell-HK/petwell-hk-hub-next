import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Camera,
  ShieldCheck,
  Beef,
  Sparkles,
  Ban,
  ChevronRight,
  Search,
  Cat,
  Dog,
  SlidersHorizontal,
  X,
  ScanLine,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useSEO } from "@/hooks/useSEO";
import { cn } from "@/lib/utils";
import { PhotoAnalyzerDialog } from "@/components/PhotoAnalyzerDialog";
import {
  NutritionGradeBadge,
  NutritionScoreRing,
  ratingToScore,
  tierOf,
} from "@/components/nutrition/nutritionTheme";

type Species = "cat" | "dog";
type FormFilter = "all" | "dry" | "wet" | "freeze-dried" | "treat";

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

const FORM_META: Record<FormFilter, { label: string; short: string }> = {
  all: { label: "全部", short: "全部" },
  dry: { label: "乾糧", short: "乾糧" },
  wet: { label: "濕糧", short: "濕糧" },
  "freeze-dried": { label: "凍乾／生食", short: "凍乾" },
  treat: { label: "零食", short: "零食" },
};

const METHOD_DIMENSIONS = [
  { points: "40%", title: "核心營養", icon: Beef, description: "乾物質基準換算，公平對比每款糧。" },
  { points: "60%", title: "配方質素", icon: Sparkles, description: "評估肉源、副產品同碳水來源。" },
  { points: "25%", title: "爭議成份", icon: Ban, description: "人工防腐劑、色素等會扣分。" },
] as const;

function FoodRow({ food, index }: { food: NutritionProduct; index: number }) {
  const score = ratingToScore(food.rating);
  const t = tierOf(score);
  const n = food.nutrition;
  const protein = n.dryProtein ?? n.protein;
  const fat = n.dryFat ?? n.fat;
  const formLabel =
    FORM_META[food.form === "raw" ? "freeze-dried" : (food.form as FormFilter)]?.short ?? food.form;

  return (
    <Link
      to={`/nutrition/${food.id}`}
      className={cn(
        "nutrition-food-row group pl-5",
        index < 8 && `nutrition-reveal nutrition-reveal-delay-${Math.min(index % 3, 2) + 1}`,
      )}
      style={{ animationDelay: index < 8 ? `${index * 40}ms` : undefined }}
    >
      <span className={cn("absolute left-0 top-0 bottom-0 w-[3px] rounded-l-2xl", t.stripe)} aria-hidden="true" />
      <NutritionScoreRing score={score} size={54} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{food.brand}</p>
        <h3 className="nutrition-display mt-0.5 truncate text-lg leading-snug text-foreground">{food.name}</h3>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <NutritionGradeBadge score={score} />
          <span className="text-xs text-muted-foreground">
            {formLabel}
            {food.grainInfo ? ` · ${food.grainInfo}` : ""}
          </span>
        </div>
        {food.summary ? (
          <p className="mt-2 hidden line-clamp-1 text-sm text-muted-foreground md:block">{food.summary}</p>
        ) : null}
      </div>
      <div className="hidden shrink-0 gap-6 border-l border-[hsl(var(--nutrition-line))] pl-5 sm:flex">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">蛋白</div>
          <div className="nutrition-display mt-0.5 text-base tabular-nums">{protein != null ? `${protein}%` : "—"}</div>
        </div>
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">脂肪</div>
          <div className="nutrition-display mt-0.5 text-base tabular-nums">{fat != null ? `${fat}%` : "—"}</div>
        </div>
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" aria-hidden="true" />
    </Link>
  );
}

function FoodRowSkeleton() {
  return (
    <div className="nutrition-panel flex items-center gap-4 p-4 md:p-5">
      <Skeleton className="h-[54px] w-[54px] shrink-0 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-5 w-3/4 max-w-xs" />
        <Skeleton className="h-5 w-28" />
      </div>
    </div>
  );
}

const PAGE_SIZE = 24;

export default function NutritionScore() {
  const [species, setSpecies] = useState<Species>("dog");
  const [formFilter, setFormFilter] = useState<FormFilter>("all");
  const [query, setQuery] = useState("");
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [products, setProducts] = useState<NutritionProduct[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [analyzerOpen, setAnalyzerOpen] = useState(false);

  useSEO({
    title: "糧食評分｜PetWell 中立寵物糧營養評測",
    description:
      "PetWell 自家糧食評分系統，收錄過千款貓糧、狗糧同零食。以公開營養標籤加權計分，唔收品牌費，幫你揀啱毛孩每日食嘅嘢。",
    canonicalUrl: "https://petwellhk.com/nutrition",
  });

  useEffect(() => {
    fetch("/data/nutrition-products.json")
      .then((r) => r.json())
      .then((d: NutritionProduct[]) => setProducts(d))
      .catch(() => setLoadError(true));
  }, []);

  useEffect(() => {
    setVisible(PAGE_SIZE);
  }, [species, formFilter, query]);

  const speciesFoods = useMemo(
    () => (products ?? []).filter((f) => f.species === species),
    [products, species],
  );

  const filteredFoods = useMemo(() => {
    let list = speciesFoods;
    if (formFilter === "freeze-dried") {
      list = list.filter((f) => f.form === "freeze-dried" || f.form === "raw");
    } else if (formFilter !== "all") {
      list = list.filter((f) => f.form === formFilter);
    }
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (f) =>
          f.brand.toLowerCase().includes(q) ||
          f.name.toLowerCase().includes(q) ||
          f.foodType.toLowerCase().includes(q),
      );
    }
    return list;
  }, [speciesFoods, formFilter, query]);

  const countByForm = useMemo(() => {
    const counts: Record<FormFilter, number> = { all: speciesFoods.length, dry: 0, wet: 0, "freeze-dried": 0, treat: 0 };
    for (const f of speciesFoods) {
      if (f.form === "dry") counts.dry++;
      else if (f.form === "wet") counts.wet++;
      else if (f.form === "freeze-dried" || f.form === "raw") counts["freeze-dried"]++;
      else if (f.form === "treat") counts.treat++;
    }
    return counts;
  }, [speciesFoods]);

  const shown = filteredFoods.slice(0, visible);
  const hasActiveFilters = formFilter !== "all" || query.trim().length > 0;
  const totalCount = products?.length ?? 0;

  const clearFilters = () => {
    setFormFilter("all");
    setQuery("");
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="nutrition-page flex-1 pb-16">
        {/* Hero */}
        <section className="nutrition-hero">
          <div className="container relative mx-auto max-w-4xl px-4 py-10 md:py-14">
            <div className="nutrition-reveal flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-[hsl(var(--nutrition-line))] bg-white/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary backdrop-blur-sm">
                  <ScanLine className="h-3 w-3" aria-hidden="true" />
                  糧食評分系統
                </div>
                <h1 className="nutrition-display mt-5 text-4xl leading-[1.05] text-foreground md:text-5xl">
                  毛孩食糧，
                  <br />
                  <span className="text-primary">幾多分先夠放心？</span>
                </h1>
                <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-muted-foreground">
                  收錄 {totalCount > 0 ? totalCount.toLocaleString() : "過千"} 款貓糧、狗糧同零食。根據公開營養標籤計分，公式透明，唔收品牌費。
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col lg:items-end">
                <button
                  type="button"
                  onClick={() => setAnalyzerOpen(true)}
                  className="nutrition-scan-cta inline-flex h-12 items-center justify-center gap-2 rounded-full px-6 text-sm font-semibold"
                >
                  <Camera className="h-4 w-4" aria-hidden="true" />
                  影相分析
                </button>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <ShieldCheck className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                  中立評分 · 唔收品牌費
                </div>
              </div>
            </div>

            <div className="nutrition-reveal nutrition-reveal-delay-2 mt-8 grid gap-3 sm:grid-cols-3">
              {METHOD_DIMENSIONS.map(({ points, title, icon: Icon, description }) => (
                <div key={title} className="nutrition-method-pill">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
                    <span className="nutrition-display text-xl tabular-nums">{points}</span>
                  </div>
                  <p className="mt-1 text-sm font-semibold">{title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="container mx-auto max-w-4xl px-4">
          {/* Toolbar */}
          <div
            id="nutrition-list"
            className="nutrition-toolbar sticky top-[var(--header-height)] z-20 -mx-4 px-4 py-4"
          >
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <nav aria-label="寵物類別" className="flex gap-1 rounded-full border border-[hsl(var(--nutrition-line))] bg-white p-1">
                  {(["dog", "cat"] as Species[]).map((s) => {
                    const Icon = s === "cat" ? Cat : Dog;
                    const active = species === s;
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSpecies(s)}
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                          active ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
                        )}
                        aria-pressed={active}
                      >
                        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                        {s === "cat" ? "貓糧" : "狗糧"}
                      </button>
                    );
                  })}
                </nav>
                <button
                  type="button"
                  onClick={() => setAnalyzerOpen(true)}
                  className="inline-flex h-9 items-center gap-1.5 rounded-full border border-primary/25 bg-primary/5 px-3.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/10 md:hidden"
                >
                  <Camera className="h-3.5 w-3.5" aria-hidden="true" />
                  影相分析
                </button>
              </div>

              <div className="relative">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                <Input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="搜尋品牌或產品名"
                  className="h-11 rounded-xl border-[hsl(var(--nutrition-line))] bg-white pl-10 shadow-none"
                  aria-label="搜尋品牌或產品名"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="mr-1 hidden items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground sm:inline-flex">
                  <SlidersHorizontal className="h-3 w-3" aria-hidden="true" />
                  糧型
                </span>
                {(["all", "dry", "wet", "freeze-dried", "treat"] as FormFilter[]).map((f) => {
                  const active = formFilter === f;
                  const count = countByForm[f];
                  return (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setFormFilter(f)}
                      disabled={count === 0 && !active}
                      aria-pressed={active}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                        active
                          ? "border-primary/40 bg-primary/10 text-primary"
                          : "border-[hsl(var(--nutrition-line))] bg-white text-muted-foreground hover:border-primary/25 hover:text-foreground",
                        count === 0 && !active && "opacity-40",
                      )}
                    >
                      {FORM_META[f].label}
                      <span className="tabular-nums opacity-70">{count}</span>
                    </button>
                  );
                })}
                {hasActiveFilters ? (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="inline-flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-muted-foreground hover:text-primary"
                  >
                    <X className="h-3 w-3" aria-hidden="true" />
                    清除
                  </button>
                ) : null}
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="pt-6">
            {products === null ? (
              <div className="space-y-3" aria-busy="true" aria-label="載入評測資料中">
                {Array.from({ length: 6 }).map((_, i) => (
                  <FoodRowSkeleton key={i} />
                ))}
              </div>
            ) : loadError ? (
              <div className="nutrition-panel py-20 text-center">
                <p className="text-base font-semibold">載入失敗</p>
                <p className="mt-2 text-sm text-muted-foreground">請刷新頁面再試。</p>
              </div>
            ) : filteredFoods.length === 0 ? (
              <div className="nutrition-panel py-20 text-center">
                <p className="text-base font-semibold">冇符合條件嘅評測</p>
                <p className="mt-2 text-sm text-muted-foreground">試下清除搜尋或轉個篩選條件。</p>
                {hasActiveFilters ? (
                  <Button variant="outline" size="sm" onClick={clearFilters} className="mt-5 rounded-full">
                    清除篩選
                  </Button>
                ) : null}
              </div>
            ) : (
              <>
                <p className="mb-4 text-sm tabular-nums text-muted-foreground">
                  顯示 {shown.length.toLocaleString()} / {filteredFoods.length.toLocaleString()} 款
                </p>
                <section aria-label="糧食評測列表" className="space-y-3">
                  {shown.map((food, i) => (
                    <FoodRow key={food.id} food={food} index={i} />
                  ))}
                </section>
                {visible < filteredFoods.length ? (
                  <div className="mt-10 text-center">
                    <Button
                      size="lg"
                      variant="outline"
                      className="rounded-full border-[hsl(var(--nutrition-line))] bg-white"
                      onClick={() => setVisible((v) => v + PAGE_SIZE)}
                    >
                      載入更多（仲有 {(filteredFoods.length - visible).toLocaleString()} 款）
                    </Button>
                  </div>
                ) : null}
              </>
            )}
          </div>

          {/* Bottom scan CTA */}
          <section className="mt-14">
            <div className="nutrition-panel overflow-hidden p-6 md:flex md:items-center md:justify-between md:gap-8 md:p-8">
              <div className="max-w-md">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">即時分析</p>
                <h2 className="nutrition-display mt-2 text-2xl">搵唔到你隻糧？</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  影張營養標籤，AI 逐項讀取成份同保證分析，即刻出分。
                </p>
              </div>
              <div className="mt-5 flex flex-wrap gap-3 md:mt-0 md:shrink-0">
                <button
                  type="button"
                  onClick={() => setAnalyzerOpen(true)}
                  className="nutrition-scan-cta inline-flex h-11 items-center gap-2 rounded-full px-6 text-sm font-semibold"
                >
                  <Camera className="h-4 w-4" aria-hidden="true" />
                  影相分析
                </button>
                <Button variant="outline" asChild className="h-11 rounded-full border-[hsl(var(--nutrition-line))] bg-transparent">
                  <Link to="/download">下載 App</Link>
                </Button>
              </div>
            </div>
          </section>

          <footer className="mt-8 pb-6">
            <div className="flex items-start gap-3 rounded-xl border border-[hsl(var(--nutrition-line))] bg-white/60 px-4 py-4 text-xs leading-relaxed text-muted-foreground md:text-sm">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary/70" aria-hidden="true" />
              <p>
                <span className="font-semibold text-foreground/85">中立聲明：</span>
                PetWell 從不收取品牌費用，評分係根據公開營養標籤自行計算。分數只反映配方組成，最終請以獸醫意見為準。發現資料有誤，歡迎 WhatsApp 55954078。
              </p>
            </div>
          </footer>
        </div>
      </main>

      <Footer />
      <PhotoAnalyzerDialog open={analyzerOpen} onOpenChange={setAnalyzerOpen} />
    </div>
  );
}
