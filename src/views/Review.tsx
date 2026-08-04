"use client";

import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  Clock,
  Cookie,
  Flame,
  Grid3x3,
  Heart,
  LayoutGrid,
  LayoutList,
  Loader2,
  LogIn,
  MoreHorizontal,
  Package,
  Pill,
  Scale,
  Search,
  ShieldCheck,
  Sparkles,
  Store,
  TrendingDown,
  Utensils,
  X,
  Zap,
  type LucideIcon,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WishlistHeartButton from "@/components/WishlistHeartButton";
import CompareBar from "@/components/CompareBar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useAuthPanel } from "@/contexts/AuthPanelContext";
import { useCompare } from "@/contexts/CompareContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useSEO } from "@/hooks/useSEO";
import { usePriceReviewProducts } from "@/hooks/usePriceReviewProducts";
import { ReviewPriceAmount, ReviewProductPrice } from "@/components/ReviewPriceDisplay";
import ProductReviewRatingBadge from "@/components/ProductReviewRatingBadge";
import {
  getProductComparablePrices,
  roundPrice,
  savingsAmount,
  savingsPct,
  sortProductsByComparablePrice,
} from "@/lib/priceReviewPricing";
import { getPriceReviewProductPath } from "@/lib/priceReviewUrl";
import type { PriceReviewProductSummary } from "@/types/priceReview";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
const logo = "/assets/logo.png";

const CATEGORIES: { id: string; label: string; icon: LucideIcon }[] = [
  { id: "all", label: "全部", icon: LayoutGrid },
  { id: "food", label: "糧食", icon: Utensils },
  { id: "medicine", label: "藥品", icon: Pill },
  { id: "treats", label: "零食", icon: Cookie },
  { id: "supplies", label: "日用品", icon: Package },
  { id: "unknown", label: "其他", icon: MoreHorizontal },
];

const HOT_SEARCHES = ["Royal Canin", "貓砂", "Hill's i/d", "Orijen", "Frontline"];

const NAV_TABS = [
  { label: "格價首頁", href: "#review-top", hash: true },
  { label: "熱門比價", href: "#review-results", hash: true },
  { label: "心水清單", href: "/wishlist", hash: false },
  { label: "產品比較", href: "/compare", hash: false },
  { label: "店主合作", href: "/other-services", hash: false },
] as const;

const PROMO_TILES = [
  { id: "deals", title: "今日最抵", sub: "慳最多", filter: "deals" as const },
  { id: "stores", title: "最多店舖", sub: "選擇多", filter: "stores" as const },
  { id: "food", title: "糧食專區", sub: "主糧罐頭", filter: "food" as const },
  { id: "medicine", title: "藥品專區", sub: "驅蟲護理", filter: "medicine" as const },
  { id: "treats", title: "零食專區", sub: "獎勵小食", filter: "treats" as const },
  { id: "supplies", title: "用品專區", sub: "日常護理", filter: "supplies" as const },
] as const;

type PromoFilter = (typeof PROMO_TILES)[number]["filter"];
type SortKey = "default" | "price-asc" | "price-desc" | "savings" | "stores";
type ViewMode = "grid" | "list";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "default", label: "推薦" },
  { value: "price-asc", label: "價格 ↑" },
  { value: "price-desc", label: "價格 ↓" },
  { value: "savings", label: "慳最多" },
  { value: "stores", label: "店舖最多" },
];

const Review = () => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [brand, setBrand] = useState("all");
  const [pageSize, setPageSize] = useState("10");
  const [pageIndex, setPageIndex] = useState(0);
  const [pageCursors, setPageCursors] = useState<(string | undefined)[]>([undefined]);
  const [promoFilter, setPromoFilter] = useState<PromoFilter | null>(null);
  const [activeNav, setActiveNav] = useState("格價首頁");
  const [sortBy, setSortBy] = useState<SortKey>("default");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const { isSelected, toggle: toggleCompare, ids: compareIds } = useCompare();
  const { items: wishlistItems } = useWishlist();
  const { isAuthenticated } = useAuth();
  const { openPanel } = useAuthPanel();

  useEffect(() => {
    setPageIndex(0);
    setPageCursors([undefined]);
  }, [search, category, brand, pageSize, promoFilter]);

  const query = useMemo(
    () => ({
      search: search.trim() || undefined,
      category: category === "all" ? undefined : category,
      brand: brand === "all" ? undefined : brand,
      limit: Number(pageSize),
      cursor: pageCursors[pageIndex],
    }),
    [search, category, brand, pageSize, pageCursors, pageIndex],
  );

  const { data, isLoading, isError, error, isFetching } = usePriceReviewProducts(query);
  const products = data?.items || [];
  const allBrands = data?.brands || [];
  const hasPreviousPage = pageIndex > 0;
  const hasNextPage = Boolean(data?.nextCursor);

  const { data: feedData } = usePriceReviewProducts({ limit: 48 });
  const feed = feedData?.items || [];

  const bestDeals = useMemo(
    () => [...feed].sort((a, b) => savingsPct(b) - savingsPct(a)).slice(0, 12),
    [feed],
  );

  const trending = useMemo(
    () => [...feed].sort((a, b) => b.storeCount - a.storeCount).slice(0, 12),
    [feed],
  );

  const heroProduct = bestDeals[0] || trending[0] || feed[0];

  const promoProducts = useMemo(() => {
    switch (promoFilter) {
      case "deals":
        return bestDeals;
      case "stores":
        return trending;
      case "food":
      case "medicine":
      case "treats":
      case "supplies":
        return feed.filter((p) => p.category === promoFilter);
      default:
        return feed;
    }
  }, [promoFilter, bestDeals, trending, feed]);

  const displayProducts = promoFilter ? promoProducts.slice(0, Number(pageSize)) : products;

  const sortedProducts = useMemo(() => {
    const items = [...displayProducts];
    switch (sortBy) {
      case "price-asc":
        return sortProductsByComparablePrice(items, "asc");
      case "price-desc":
        return sortProductsByComparablePrice(items, "desc");
      case "savings":
        return items.sort((a, b) => savingsPct(b) - savingsPct(a));
      case "stores":
        return items.sort((a, b) => b.storeCount - a.storeCount);
      case "default":
        return items;
      default: {
        const _exhaustive: never = sortBy;
        return _exhaustive;
      }
    }
  }, [displayProducts, sortBy]);

  const goToNextPage = useCallback(() => {
    if (!data?.nextCursor) return;
    setPageCursors((current) => {
      if (current[pageIndex + 1] === data.nextCursor) return current;
      const next = current.slice(0, pageIndex + 1);
      next.push(data.nextCursor || undefined);
      return next;
    });
    setPageIndex((current) => current + 1);
    document.getElementById("review-results")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [data?.nextCursor, pageIndex]);

  const goToPreviousPage = useCallback(() => {
    if (!hasPreviousPage) return;
    setPageIndex((current) => Math.max(0, current - 1));
    document.getElementById("review-results")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [hasPreviousPage]);

  useSEO({
    title: "寵物用品格價比較 | PetWell Review",
    description: "比較香港寵物糧食、藥品、用品真實價格，睇清楚邊間最抵。",
    canonicalUrl: "https://petwellhk.com/review",
  });

  const hasActiveFilter =
    category !== "all" || brand !== "all" || Boolean(search.trim()) || Boolean(promoFilter);

  const resetFilters = () => {
    setSearch("");
    setCategory("all");
    setBrand("all");
    setPromoFilter(null);
  };

  const applyCategory = (id: string) => {
    setCategory(id);
    setPromoFilter(null);
    document.getElementById("review-results")?.scrollIntoView({ behavior: "smooth" });
  };

  const applyPromo = (filter: PromoFilter) => {
    setPromoFilter(filter);
    if (filter === "food" || filter === "medicine" || filter === "treats" || filter === "supplies") {
      setCategory(filter);
    } else {
      setCategory("all");
    }
    setBrand("all");
    setSearch("");
    document.getElementById("review-results")?.scrollIntoView({ behavior: "smooth" });
  };

  const showHomePortal = !hasActiveFilter && !search.trim();
  const storeLabel = allBrands.length > 0 ? `${allBrands.length}+` : "20+";

  return (
    <div className={cn("review-page min-h-screen", compareIds.length && "pb-20 md:pb-24")}>
      <Header />

      <section id="review-top" className="review-panel border-x-0 border-t-0 bg-white">
        <div className="container mx-auto px-4 py-4 md:py-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            <Link to="/review" className="flex shrink-0 items-center gap-2.5">
              <img src={logo} alt="PetWell" className="h-9 w-9 object-contain md:h-10 md:w-10" />
              <div>
                <p className="text-[15px] font-semibold leading-tight text-foreground md:text-base">
                  PetWell 格價
                </p>
                <p className="text-[12px] text-muted-foreground">香港寵物用品比價</p>
              </div>
            </Link>

            <div className="min-w-0 flex-1 lg:max-w-2xl lg:mx-auto">
              <div className="review-search flex h-11 border-2 border-primary transition-shadow md:h-12">
                <div className="flex min-w-0 flex-1 items-center gap-2 bg-white px-3">
                  <Search className="h-4 w-4 shrink-0 text-primary/70" />
                  <Input
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPromoFilter(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        document.getElementById("review-results")?.scrollIntoView({ behavior: "smooth" });
                      }
                    }}
                    placeholder="搜尋品牌、產品名稱…"
                    className="h-full border-0 px-0 text-[14px] shadow-none focus-visible:ring-0 md:text-[15px]"
                  />
                  {search && (
                    <button type="button" onClick={() => setSearch("")} aria-label="清除搜尋" className="rounded-sm p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground">
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => document.getElementById("review-results")?.scrollIntoView({ behavior: "smooth" })}
                  className="shrink-0 bg-primary px-5 text-[14px] font-semibold text-primary-foreground transition-colors hover:bg-primary-hover md:px-8"
                >
                  搜尋
                </button>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px]">
                <span className="inline-flex items-center gap-1 text-muted-foreground">
                  <Flame className="h-3 w-3 text-primary" /> 熱搜
                </span>
                {HOT_SEARCHES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      setSearch(s);
                      setPromoFilter(null);
                      document.getElementById("review-results")?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="review-chip border border-[hsl(var(--review-line))] bg-white px-2 py-0.5 text-foreground/80 transition-colors hover:border-primary/40 hover:text-primary"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <nav className="mt-3 flex flex-wrap gap-1 border-t border-[hsl(var(--review-line))] pt-1">
            {NAV_TABS.map((tab) =>
              tab.hash ? (
                <a
                  key={tab.label}
                  href={tab.href}
                  data-active={activeNav === tab.label}
                  className="review-nav-tab"
                  onClick={() => setActiveNav(tab.label)}
                >
                  {tab.label}
                </a>
              ) : (
                <Link
                  key={tab.label}
                  to={tab.href}
                  data-active={activeNav === tab.label}
                  className="review-nav-tab"
                  onClick={() => setActiveNav(tab.label)}
                >
                  {tab.label}
                </Link>
              ),
            )}
          </nav>
        </div>
      </section>

      {showHomePortal && (
        <section className="container mx-auto px-4 py-3 md:py-4">
          <div className="flex gap-3">
            <aside className="hidden w-[188px] shrink-0 lg:block">
              <div className="review-category-rail bg-primary text-primary-foreground">
                <div className="border-b border-white/15 px-3 py-2 text-[12px] font-semibold">
                  商品分類
                </div>
                <ul>
                  {CATEGORIES.map((c) => (
                    <li key={c.id}>
                      <button
                        type="button"
                        onClick={() => applyCategory(c.id)}
                        className="flex w-full items-center gap-2 border-b border-white/10 px-3 py-2.5 text-left text-[13px] last:border-b-0 hover:bg-white/10"
                      >
                        <c.icon className="h-3.5 w-3.5 shrink-0 opacity-90" strokeWidth={2} />
                        <span className="flex-1">{c.label}</span>
                        <ChevronRight className="h-3.5 w-3.5 opacity-50" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="review-panel mt-2 space-y-2 p-3 text-[12px] text-muted-foreground">
                <TrustLine icon={Store} label={`${storeLabel} 間香港寵物店`} />
                <TrustLine icon={Clock} label="每日更新報價" />
                <TrustLine icon={ShieldCheck} label="中立格價平台" />
              </div>
            </aside>

            <div className="min-w-0 flex-1">
              <div className="flex flex-col gap-2 sm:flex-row">
                {heroProduct && (
                  <Link
                    to={getPriceReviewProductPath(heroProduct)}
                    className="review-panel review-hero-deal review-card-product group relative flex min-h-[210px] min-w-0 flex-1 flex-col overflow-hidden sm:max-w-[42%]"
                  >
                    {heroProduct.image && (
                      <img
                        src={heroProduct.image}
                        alt=""
                        className="absolute -right-2 top-1/2 h-[120px] w-[120px] -translate-y-1/2 object-contain transition-transform duration-300 group-hover:scale-105 sm:h-[140px] sm:w-[140px]"
                      />
                    )}
                    <div className="relative flex h-full flex-col p-4 md:p-5">
                      <div className="flex items-center gap-2">
                        <span className="review-savings-pill inline-flex items-center gap-1 rounded-sm px-2 py-0.5 text-[11px]">
                          <Zap className="h-3 w-3" /> 今日最抵
                        </span>
                        {savingsPct(heroProduct) > 0 && (
                          <span className="text-[11px] font-semibold text-primary">
                            慳 {savingsPct(heroProduct)}%
                          </span>
                        )}
                      </div>
                      <p className="mt-3 line-clamp-2 max-w-[58%] text-[14px] font-semibold leading-snug text-foreground md:text-[15px]">
                        {heroProduct.name}
                      </p>
                      <p className="mt-0.5 max-w-[58%] truncate text-[12px] text-primary">{heroProduct.brand}</p>
                      <div className="mt-auto pt-3">
                        <ReviewProductPrice product={heroProduct} size="lg" />
                        {savingsAmount(heroProduct) > 0 && (
                          <div className="mt-1.5 flex flex-wrap items-center gap-2">
                            <span className="review-price-struck">
                              HK${roundPrice(getProductComparablePrices(heroProduct).highestPrice)}
                            </span>
                            <span className="text-[11px] font-medium text-primary">
                              慳 HK${savingsAmount(heroProduct)}
                            </span>
                          </div>
                        )}
                        <div className="mt-2 max-w-[70%]">
                          <div className="review-spread-bar" aria-hidden />
                          <p className="mt-1.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                            <Store className="h-3 w-3" />
                            {heroProduct.storeCount} 間店舖報價 · 睇全部
                            <ArrowRight className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                )}

                <div className="review-panel grid min-h-[210px] flex-1 grid-cols-3 grid-rows-2 divide-x divide-y divide-[hsl(var(--review-line))] overflow-hidden">
                  {PROMO_TILES.map((tile) => {
                    const sample = getPromoSample(feed, tile.filter);
                    const isActive = promoFilter === tile.filter;
                    return (
                      <button
                        key={tile.id}
                        type="button"
                        data-active={isActive}
                        onClick={() => applyPromo(tile.filter)}
                        className="review-promo-tile flex flex-col border border-transparent bg-white p-2.5 text-left"
                      >
                        <p className="text-[13px] font-semibold text-foreground">{tile.title}</p>
                        <p className="text-[11px] text-muted-foreground">{tile.sub}</p>
                        {sample && (
                          <div className="mt-auto flex items-end justify-between gap-1 pt-2">
                            {sample.image ? (
                              <img src={sample.image} alt="" className="h-9 w-9 object-contain" loading="lazy" />
                            ) : (
                              <span className="h-9 w-9" />
                            )}
                            <ReviewPriceAmount
                              amount={getProductComparablePrices(sample).lowestPrice}
                              size="sm"
                            />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {bestDeals.length > 1 && (
                <DealRail
                  title="今日最抵"
                  icon={Zap}
                  products={bestDeals.slice(1, 9)}
                  onSeeAll={() => applyPromo("deals")}
                  isSelected={isSelected}
                  onToggleCompare={(id) => {
                    const result = toggleCompare(id);
                    if (!result.ok && result.reason) toast.error(result.reason, { duration: 3000 });
                  }}
                />
              )}

              {trending.length > 0 && (
                <DealRail
                  title="最多店舖比價"
                  icon={Store}
                  products={trending.slice(0, 8)}
                  onSeeAll={() => applyPromo("stores")}
                  isSelected={isSelected}
                  onToggleCompare={(id) => {
                    const result = toggleCompare(id);
                    if (!result.ok && result.reason) toast.error(result.reason, { duration: 3000 });
                  }}
                />
              )}

              <div className="mt-2 grid grid-cols-6 gap-1.5 lg:hidden">
                {CATEGORIES.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => applyCategory(c.id)}
                    className="review-panel flex flex-col items-center gap-1 py-2.5"
                  >
                    <c.icon className="h-4 w-4 text-primary" strokeWidth={2} />
                    <span className="text-[11px] font-medium text-foreground/80">{c.label}</span>
                  </button>
                ))}
              </div>

              {allBrands.length > 0 && (
                <div className="review-panel mt-2 px-3 py-2.5">
                  <p className="mb-2 text-[12px] font-medium text-muted-foreground">熱門品牌</p>
                  <div className="-mx-1 flex gap-2 overflow-x-auto pb-0.5 scrollbar-none">
                    {allBrands.slice(0, 24).map((b) => (
                      <Link
                        key={b}
                        to={`/review/brand/${encodeURIComponent(b)}`}
                        className="shrink-0 review-chip border border-[hsl(var(--review-line))] bg-white px-2.5 py-0.5 text-[12px] text-foreground/85 hover:border-primary hover:text-primary"
                      >
                        {b}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <aside className="hidden w-[212px] shrink-0 xl:block">
              <div className="review-panel p-4">
                <p className="text-[13px] text-muted-foreground">
                  {getGreeting()}，{isAuthenticated ? "歡迎返嚟" : "歡迎"}
                </p>
                {!isAuthenticated ? (
                  <Button onClick={() => openPanel("LANDING")} className="mt-3 h-9 w-full rounded-md text-[13px]" size="sm">
                    <LogIn className="mr-1.5 h-3.5 w-3.5" />
                    登入 / 註冊
                  </Button>
                ) : (
                  <Link to="/owner-zone" className="mt-3 block">
                    <Button variant="outline" className="h-9 w-full rounded-md text-[13px]" size="sm">
                      我的帳戶
                    </Button>
                  </Link>
                )}
                <div className="review-panel-inset mt-4 grid grid-cols-2 gap-px overflow-hidden border border-[hsl(var(--review-line))] bg-[hsl(var(--review-line))]">
                  <QuickLink to="/wishlist" icon={Heart} label="心水" count={wishlistItems.length} />
                  <QuickLink to="/compare" icon={Scale} label="比較" count={compareIds.length} />
                  <QuickLink to="/review" icon={Store} label="格價" />
                  <QuickLink to="/other-services" icon={BadgeCheck} label="合作" />
                </div>
              </div>
              <div className="review-panel mt-2 border-primary/20 bg-secondary/50 p-3 text-center">
                <p className="text-[13px] font-semibold text-primary">價格永久免費</p>
                <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
                  我哋唔賣嘢，只幫你睇清楚邊間最抵
                </p>
              </div>
            </aside>
          </div>
        </section>
      )}

      <section id="review-results" className="scroll-mt-[calc(var(--header-height)+0.25rem)]">
        <div className="sticky top-[var(--header-height)] z-20 border-y border-[hsl(var(--review-line))] bg-white/95 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <div className="mr-auto flex min-w-0 items-center gap-2">
                <h2 className="shrink-0 text-[14px] font-semibold text-foreground">
                  {promoFilter
                    ? PROMO_TILES.find((t) => t.filter === promoFilter)?.title ?? "精選"
                    : hasActiveFilter
                      ? "搜尋結果"
                      : "猜你鍾意"}
                </h2>
                {sortedProducts.length > 0 && (
                  <span className="review-stat-pill hidden px-2 py-0.5 text-[11px] text-muted-foreground sm:inline">
                    {sortedProducts.length} 件
                  </span>
                )}
              </div>
              <div className="flex min-w-0 flex-1 gap-1 overflow-x-auto scrollbar-none lg:flex-none lg:overflow-visible">
                {CATEGORIES.map((c) => (
                  <FilterChip key={c.id} active={category === c.id} onClick={() => applyCategory(c.id)}>
                    {c.label}
                  </FilterChip>
                ))}
              </div>
              <Select value={brand} onValueChange={setBrand}>
                <SelectTrigger className="review-chip h-7 w-[118px] shrink-0 border-[hsl(var(--review-line))] bg-white text-[12px]">
                  <SelectValue placeholder="品牌" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部品牌</SelectItem>
                  {allBrands.map((b) => (
                    <SelectItem key={b} value={b}>{b}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortKey)}>
                <SelectTrigger className="review-chip h-7 w-[96px] shrink-0 border-[hsl(var(--review-line))] bg-white text-[12px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!promoFilter && (
                <Select value={pageSize} onValueChange={setPageSize}>
                  <SelectTrigger className="review-chip hidden h-7 w-[84px] shrink-0 border-[hsl(var(--review-line))] bg-white text-[12px] sm:flex">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 件</SelectItem>
                    <SelectItem value="20">20 件</SelectItem>
                    <SelectItem value="40">40 件</SelectItem>
                  </SelectContent>
                </Select>
              )}
              <div className="hidden items-center rounded-md border border-[hsl(var(--review-line))] sm:flex">
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  aria-label="格狀檢視"
                  className={cn(
                    "flex h-7 w-8 items-center justify-center transition-colors",
                    viewMode === "grid" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Grid3x3 className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  aria-label="列表檢視"
                  className={cn(
                    "flex h-7 w-8 items-center justify-center border-l border-[hsl(var(--review-line))] transition-colors",
                    viewMode === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <LayoutList className="h-3.5 w-3.5" />
                </button>
              </div>
              {hasActiveFilter && (
                <button type="button" onClick={resetFilters} className="inline-flex shrink-0 items-center gap-0.5 text-[12px] text-primary hover:underline">
                  <X className="h-3 w-3" /> 清除
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-3 md:py-4">
          {isLoading && !promoFilter ? (
            <LoadingState />
          ) : isError && !promoFilter ? (
            <ErrorState message={(error as Error).message} />
          ) : sortedProducts.length === 0 ? (
            <SuggestProductCard initialQuery={search} />
          ) : viewMode === "list" ? (
            <>
              <div className="review-stagger space-y-1.5">
                {sortedProducts.map((product) => (
                  <ProductListRow
                    key={product.id}
                    product={product}
                    isSelected={isSelected(product.id)}
                    onToggleCompare={() => {
                      const result = toggleCompare(product.id);
                      if (!result.ok && result.reason) toast.error(result.reason, { duration: 3000 });
                    }}
                  />
                ))}
              </div>
              {!promoFilter && (hasPreviousPage || hasNextPage) && (
                <PaginationBar
                  pageIndex={pageIndex}
                  hasPreviousPage={hasPreviousPage}
                  hasNextPage={hasNextPage}
                  isFetching={isFetching}
                  onPrevious={goToPreviousPage}
                  onNext={goToNextPage}
                />
              )}
            </>
          ) : (
            <>
              <div className="review-product-grid review-stagger grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {sortedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    isSelected={isSelected(product.id)}
                    onToggleCompare={() => {
                      const result = toggleCompare(product.id);
                      if (!result.ok && result.reason) toast.error(result.reason, { duration: 3000 });
                    }}
                  />
                ))}
              </div>
              {!promoFilter && (hasPreviousPage || hasNextPage) && (
                <PaginationBar
                  pageIndex={pageIndex}
                  hasPreviousPage={hasPreviousPage}
                  hasNextPage={hasNextPage}
                  isFetching={isFetching}
                  onPrevious={goToPreviousPage}
                  onNext={goToNextPage}
                />
              )}
            </>
          )}
        </div>
      </section>

      <section className="mt-2 border-t border-[hsl(var(--review-line))] bg-white">
        <div className="container mx-auto grid gap-6 px-4 py-8 md:grid-cols-[1.4fr_1fr] md:py-10">
          <div>
            <p className="text-[12px] text-muted-foreground">關於 PetWell 格價</p>
            <h2 className="review-display mt-2 text-xl leading-snug md:text-2xl">
              我哋唔賣嘢，只係幫你<span className="text-primary">睇清楚</span>價錢
            </h2>
            <p className="mt-2 max-w-lg text-[14px] leading-relaxed text-muted-foreground">
              所有價格由 PetWell 編輯部整理自香港寵物店公開報價。價格與庫存可能隨時變動，落單前請以店舖頁面為準。
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <FootLink icon={Sparkles} label="想我哋加邊款？" sub="WhatsApp 編輯部" href="https://wa.me/85255954078" />
            <FootLink icon={Store} label="店主合作" sub="加入比價聯盟" href="/other-services" internal />
            <FootLink icon={TrendingDown} label="格價公平守則" sub="點解信得過" href="/about" internal />
          </div>
        </div>
      </section>

      <Footer />
      <CompareBar />
    </div>
  );
};

function getPromoSample(items: PriceReviewProductSummary[], filter: PromoFilter) {
  if (filter === "deals") {
    return [...items].sort((a, b) => savingsPct(b) - savingsPct(a))[0];
  }
  if (filter === "stores") {
    return [...items].sort((a, b) => b.storeCount - a.storeCount)[0];
  }
  return items.find((p) => p.category === filter);
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "早晨";
  if (h < 18) return "午安";
  return "晚安";
}

function TrustLine({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-3.5 w-3.5 shrink-0 text-primary" strokeWidth={2} />
      <span>{label}</span>
    </div>
  );
}

function QuickLink({
  to,
  icon: Icon,
  label,
  count,
}: {
  to: string;
  icon: LucideIcon;
  label: string;
  count?: number;
}) {
  return (
    <Link to={to} className="flex flex-col items-center bg-white py-3 text-center hover:bg-[hsl(var(--review-canvas))]">
      <Icon className="h-4 w-4 text-foreground/70" strokeWidth={1.75} />
      <span className="mt-1 text-[11px] font-medium text-foreground/80">{label}</span>
      {count !== undefined && count > 0 && (
        <span className="text-[11px] tabular-nums text-primary">{count}</span>
      )}
    </Link>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "review-chip shrink-0 border px-2.5 py-0.5 text-[12px] font-medium transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-[hsl(var(--review-line))] bg-white text-muted-foreground hover:border-primary/40 hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

function FootLink({
  icon: Icon,
  label,
  sub,
  href,
  internal,
}: {
  icon: LucideIcon;
  label: string;
  sub: string;
  href: string;
  internal?: boolean;
}) {
  const className =
    "group flex items-center gap-3 rounded-lg border border-[hsl(var(--review-line))] bg-white px-3 py-2.5 hover:border-primary/30";
  const content = (
    <>
      <Icon className="h-4 w-4 text-primary" strokeWidth={2} />
      <div className="flex-1 text-left">
        <p className="text-[14px] font-medium">{label}</p>
        <p className="text-[12px] text-muted-foreground">{sub}</p>
      </div>
      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
    </>
  );
  if (internal) return <Link to={href} className={className}>{content}</Link>;
  return <a href={href} target="_blank" rel="noopener noreferrer" className={className}>{content}</a>;
}

const ProductCard = memo(function ProductCard({
  product,
  isSelected,
  onToggleCompare,
}: {
  product: PriceReviewProductSummary;
  isSelected: boolean;
  onToggleCompare: () => void;
}) {
  const pct = savingsPct(product);
  const saved = savingsAmount(product);
  const pricing = getProductComparablePrices(product);

  return (
    <article className="review-panel review-card-product group flex h-full flex-col overflow-hidden bg-white">
      <Link to={getPriceReviewProductPath(product)} className="relative block aspect-square bg-[hsl(var(--review-canvas))]/40 p-2.5">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-[12px] text-muted-foreground">—</div>
        )}
        {pct > 0 && (
          <span className="review-savings-pill absolute left-2 top-2 rounded-sm px-1.5 py-0.5 text-[10px] leading-none">
            慳{pct}%
          </span>
        )}
        <div className="absolute bottom-2 right-2 opacity-0 transition-opacity group-hover:opacity-100">
          <WishlistHeartButton productId={product.id} currentLowest={pricing.lowestPrice} size="sm" />
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-1 p-2.5 pt-2">
        <Link
          to={`/review/brand/${encodeURIComponent(product.brand)}`}
          className="truncate text-[11px] font-medium text-primary hover:underline"
        >
          {product.brand}
        </Link>
        <Link to={getPriceReviewProductPath(product)}>
          <h3 className="line-clamp-2 min-h-[2.25rem] text-[12px] leading-snug text-foreground group-hover:text-primary">
            {product.name}
          </h3>
        </Link>

        <div className="mt-auto space-y-1 pt-1">
          <ReviewProductPrice product={product} size="sm" />
          {saved > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="review-price-struck">HK${roundPrice(pricing.highestPrice)}</span>
              <span className="text-[10px] font-medium text-primary">慳 HK${saved}</span>
            </div>
          )}
          <div className="flex items-end justify-between gap-1">
            <div className="space-y-0.5">
              <p className="flex items-center gap-0.5 text-[11px] text-muted-foreground">
                <Store className="h-3 w-3 shrink-0" />
                {product.storeCount} 間
              </p>
              <ProductReviewRatingBadge avgRating={product.avgRating} numReviews={product.numReviews} />
            </div>
            <label
              className={cn(
                "inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-sm px-1 py-0.5 text-[10px] font-medium transition-colors",
                isSelected
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
              onClick={(e) => e.stopPropagation()}
            >
              <Checkbox checked={isSelected} onCheckedChange={onToggleCompare} className="h-3 w-3" />
              比較
            </label>
          </div>
        </div>
      </div>
    </article>
  );
});

function ProductListRow({
  product,
  isSelected,
  onToggleCompare,
}: {
  product: PriceReviewProductSummary;
  isSelected: boolean;
  onToggleCompare: () => void;
}) {
  const pct = savingsPct(product);
  const saved = savingsAmount(product);
  const pricing = getProductComparablePrices(product);

  return (
    <article className="review-panel review-card-product review-list-row bg-white px-3 py-2.5 md:px-4 md:py-3">
      <Link to={getPriceReviewProductPath(product)} className="relative block h-14 w-14 shrink-0 overflow-hidden rounded-md bg-[hsl(var(--review-canvas))]/50 p-1 md:h-16 md:w-16">
        {product.image ? (
          <img src={product.image} alt="" loading="lazy" className="h-full w-full object-contain" />
        ) : (
          <div className="flex h-full items-center justify-center text-[10px] text-muted-foreground">—</div>
        )}
      </Link>

      <div className="min-w-0">
        <Link
          to={`/review/brand/${encodeURIComponent(product.brand)}`}
          className="text-[11px] font-medium text-primary hover:underline"
        >
          {product.brand}
        </Link>
        <Link to={getPriceReviewProductPath(product)}>
          <h3 className="line-clamp-2 text-[13px] font-medium leading-snug text-foreground hover:text-primary md:line-clamp-1">
            {product.name}
          </h3>
        </Link>
        <p className="mt-0.5 hidden items-center gap-2 text-[11px] text-muted-foreground md:flex">
          <span className="inline-flex items-center gap-1">
            <Store className="h-3 w-3" /> {product.storeCount} 間店舖
          </span>
          <ProductReviewRatingBadge avgRating={product.avgRating} numReviews={product.numReviews} />
        </p>
      </div>

      <div className="hidden text-right md:block">
        <ReviewProductPrice product={product} size="sm" />
        <p className="mt-0.5 text-[10px] text-muted-foreground">最低</p>
      </div>

      <div className="hidden text-right md:block">
        {pricing.highestPrice > pricing.lowestPrice ? (
          <>
            <span className="review-price-struck text-[13px]">HK${roundPrice(pricing.highestPrice)}</span>
            <p className="mt-0.5 text-[10px] text-muted-foreground">最高</p>
          </>
        ) : (
          <span className="text-[12px] text-muted-foreground">—</span>
        )}
      </div>

      <div className="hidden text-center md:block">
        {pct > 0 ? (
          <span className="review-savings-pill inline-block rounded-sm px-1.5 py-0.5 text-[11px]">
            慳 {pct}%
          </span>
        ) : (
          <span className="text-[12px] text-muted-foreground">—</span>
        )}
        {saved > 0 && (
          <p className="mt-0.5 text-[10px] text-primary">HK${saved}</p>
        )}
      </div>

      <div className="text-right md:hidden">
        <ReviewProductPrice product={product} size="sm" />
        {pct > 0 && (
          <span className="mt-0.5 inline-block text-[10px] font-medium text-primary">慳{pct}%</span>
        )}
      </div>

      <label
        className={cn(
          "flex cursor-pointer items-center justify-end",
          isSelected ? "text-primary" : "text-muted-foreground",
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <Checkbox checked={isSelected} onCheckedChange={onToggleCompare} className="h-4 w-4" />
      </label>
    </article>
  );
}

function DealRail({
  title,
  icon: Icon,
  products,
  onSeeAll,
  isSelected,
  onToggleCompare,
}: {
  title: string;
  icon: LucideIcon;
  products: PriceReviewProductSummary[];
  onSeeAll: () => void;
  isSelected: (id: string) => boolean;
  onToggleCompare: (id: string) => void;
}) {
  if (products.length === 0) return null;

  return (
    <div className="review-panel mt-2 overflow-hidden">
      <div className="flex items-center justify-between border-b border-[hsl(var(--review-line))] px-3 py-2">
        <h3 className="flex items-center gap-1.5 text-[13px] font-semibold text-foreground">
          <Icon className="h-3.5 w-3.5 text-primary" strokeWidth={2.5} />
          {title}
        </h3>
        <button
          type="button"
          onClick={onSeeAll}
          className="flex items-center gap-0.5 text-[12px] font-medium text-primary hover:underline"
        >
          睇全部 <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="review-deal-rail flex gap-2 overflow-x-auto p-2.5">
        {products.map((product) => {
          const pct = savingsPct(product);
          return (
            <div
              key={product.id}
              className="review-deal-rail-item review-card-product review-panel w-[132px] shrink-0 overflow-hidden bg-white sm:w-[148px]"
            >
              <Link to={getPriceReviewProductPath(product)} className="relative block aspect-square bg-[hsl(var(--review-canvas))]/30 p-2">
                {product.image ? (
                  <img src={product.image} alt="" loading="lazy" className="h-full w-full object-contain" />
                ) : (
                  <div className="flex h-full items-center justify-center text-[10px] text-muted-foreground">—</div>
                )}
                {pct > 0 && (
                  <span className="review-savings-pill absolute left-1 top-1 rounded-sm px-1 py-px text-[9px] leading-none">
                    -{pct}%
                  </span>
                )}
              </Link>
              <div className="space-y-1 p-2 pt-1.5">
                <Link to={getPriceReviewProductPath(product)}>
                  <p className="line-clamp-2 min-h-[2rem] text-[11px] leading-snug text-foreground">{product.name}</p>
                </Link>
                <ReviewProductPrice product={product} size="sm" showPurchaseNote={false} />
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">{product.storeCount} 店</span>
                  <label
                    className={cn(
                      "cursor-pointer",
                      isSelected(product.id) ? "text-primary" : "text-muted-foreground",
                    )}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Checkbox
                      checked={isSelected(product.id)}
                      onCheckedChange={() => onToggleCompare(product.id)}
                      className="h-3 w-3"
                    />
                  </label>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PaginationBar({
  pageIndex,
  hasPreviousPage,
  hasNextPage,
  isFetching,
  onPrevious,
  onNext,
}: {
  pageIndex: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  isFetching: boolean;
  onPrevious: () => void;
  onNext: () => void;
}) {
  return (
    <div className="mt-6 flex items-center justify-center gap-3">
      <Button
        variant="outline"
        size="sm"
        onClick={onPrevious}
        disabled={!hasPreviousPage || isFetching}
        className="h-8 rounded-md border-[hsl(var(--review-line))] text-[13px]"
      >
        <ChevronLeft className="mr-1 h-4 w-4" /> 上一頁
      </Button>
      <span className="min-w-[4rem] text-center text-[13px] text-muted-foreground">
        第 {pageIndex + 1} 頁
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={onNext}
        disabled={!hasNextPage || isFetching}
        className="h-8 rounded-md border-[hsl(var(--review-line))] text-[13px]"
      >
        {isFetching ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : null}
        下一頁 <ChevronRight className="ml-1 h-4 w-4" />
      </Button>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="review-panel flex items-center justify-center p-12 text-[14px] text-muted-foreground">
      <Loader2 className="mr-2 h-5 w-5 animate-spin text-primary" />
      正在整理報價…
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="review-panel border-destructive/30 p-6 text-center">
      <h3 className="review-display text-xl">暫時未能載入</h3>
      <p className="mx-auto mt-2 max-w-xl text-[14px] text-muted-foreground">{message}</p>
    </div>
  );
}

function SuggestProductCard({ initialQuery }: { initialQuery: string }) {
  const [contact, setContact] = useState("");
  const [request, setRequest] = useState(initialQuery);
  const canSubmit = contact.trim().length > 0 && request.trim().length > 0;
  const handleSubmit = () => {
    if (!canSubmit) return;
    const text =
      `[產品建議]\n想睇嘅產品：${request.trim()}\n聯絡方式（電話 / IG）：${contact.trim()}\n\n麻煩 PetWell 更新後 DM 我，多謝！`;
    window.open(`https://wa.me/85255954078?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="review-panel p-8 md:p-10">
      <div className="mx-auto max-w-md text-center">
        <h3 className="review-display text-2xl">未搵到？話我哋知</h3>
        <p className="mt-2 text-[14px] text-muted-foreground">留低聯絡方法同產品名，更新後即刻通知你</p>
        <div className="mt-5 space-y-2 text-left">
          <Input placeholder="例如：Royal Canin 成貓糧" value={request} onChange={(e) => setRequest(e.target.value)} maxLength={200} />
          <Input placeholder="電話 或 IG" value={contact} onChange={(e) => setContact(e.target.value)} maxLength={100} />
          <Button onClick={handleSubmit} disabled={!canSubmit} className="w-full rounded-md" size="lg">
            提交建議
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Review;
