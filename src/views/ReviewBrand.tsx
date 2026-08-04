"use client";

import { memo, useMemo, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  Clock,
  ExternalLink,
  Globe,
  Grid3x3,
  LayoutList,
  Loader2,
  Package,
  Scale,
  ShieldCheck,
  Sparkles,
  Store,
  TrendingDown,
  Zap,
  type LucideIcon,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CompareBar from "@/components/CompareBar";
import WishlistHeartButton from "@/components/WishlistHeartButton";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCompare } from "@/contexts/CompareContext";
import { useSEO } from "@/hooks/useSEO";
import { usePriceReviewBrandProducts } from "@/hooks/usePriceReviewProducts";
import { ReviewProductPrice } from "@/components/ReviewPriceDisplay";
import ProductReviewRatingBadge from "@/components/ProductReviewRatingBadge";
import {
  formatPrice,
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

const BRAND_INFO: Record<string, { origin: string; founded: string; description: string; website?: string }> = {
  "Royal Canin": {
    origin: "法國",
    founded: "1968",
    description: "Royal Canin（法國皇家）以寵物健康營養配方聞名，產品涵蓋不同年齡、體型及特殊需要。",
    website: "https://www.royalcanin.com",
  },
  "Hill's": {
    origin: "美國",
    founded: "1939",
    description: "Hill's Pet Nutrition 是處方糧及獸醫推薦品牌之一，主打科學配方與穩定營養。",
    website: "https://www.hillspet.com",
  },
  Frontline: {
    origin: "法國",
    founded: "1996",
    description: "Frontline 是常見貓狗體外寄生蟲防治品牌，產品包括殺蚤滴劑及相關防護用品。",
    website: "https://www.frontline.com",
  },
};

const CATEGORIES: { id: string; label: string }[] = [
  { id: "all", label: "全部" },
  { id: "food", label: "糧食" },
  { id: "medicine", label: "藥品" },
  { id: "treats", label: "零食" },
  { id: "supplies", label: "日用品" },
  { id: "unknown", label: "其他" },
];

type SortKey = "default" | "price-asc" | "price-desc" | "savings" | "stores";
type ViewMode = "grid" | "list";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "default", label: "推薦" },
  { value: "price-asc", label: "價格 ↑" },
  { value: "price-desc", label: "價格 ↓" },
  { value: "savings", label: "慳最多" },
  { value: "stores", label: "店舖最多" },
];

const ReviewBrand = () => {
  const { brand } = useParams<{ brand: string }>();
  const brandName = brand ? decodeURIComponent(brand) : "";
  const { data, isLoading, isError, error } = usePriceReviewBrandProducts(brandName);
  const products = data?.items || [];
  const info = BRAND_INFO[brandName];

  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState<SortKey>("default");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const { isSelected, toggle: toggleCompare, ids: compareIds } = useCompare();

  const totalOffers = products.reduce((sum, product) => sum + product.storeCount, 0);
  const lowest = products.reduce<number | null>((best, product) => {
    const price = getProductComparablePrices(product).lowestPrice;
    if (best === null) return price;
    return Math.min(best, price);
  }, null);

  const featuredProduct = useMemo(
    () => [...products].sort((a, b) => savingsPct(b) - savingsPct(a))[0],
    [products],
  );

  const filteredProducts = useMemo(() => {
    const items = category === "all" ? products : products.filter((p) => p.category === category);
    const sorted = [...items];
    switch (sortBy) {
      case "price-asc":
        return sortProductsByComparablePrice(sorted, "asc");
      case "price-desc":
        return sortProductsByComparablePrice(sorted, "desc");
      case "savings":
        return sorted.sort((a, b) => savingsPct(b) - savingsPct(a));
      case "stores":
        return sorted.sort((a, b) => b.storeCount - a.storeCount);
      case "default":
        return sorted;
      default: {
        const _exhaustive: never = sortBy;
        return _exhaustive;
      }
    }
  }, [products, category, sortBy]);

  const availableCategories = useMemo(() => {
    const cats = new Set<string>(products.map((p) => (p.category as string) || "unknown"));
    return CATEGORIES.filter((c) => c.id === "all" || cats.has(c.id));
  }, [products]);

  const canonicalUrl = `https://petwellhk.com/review/brand/${encodeURIComponent(brandName)}`;
  const seoDescription = `比較 ${brandName} 喺香港不同寵物店的最新價格，${products.length} 款產品、${totalOffers} 個店舖報價。`;

  useSEO({
    title: `${brandName} 全部產品格價 | PetWell Review`,
    description: seoDescription,
    canonicalUrl,
    structuredData: products.length > 0
      ? {
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Brand",
              name: brandName,
              description: info?.description || seoDescription,
              url: canonicalUrl,
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "PetWell Review", item: "https://petwellhk.com/review" },
                { "@type": "ListItem", position: 2, name: brandName, item: canonicalUrl },
              ],
            },
          ],
        }
      : undefined,
  });

  if (!brandName) return <Navigate to="/review" replace />;

  return (
    <div className={cn("review-page min-h-screen", compareIds.length && "pb-20 md:pb-24")}>
      <Header />

      <div className="border-b border-[hsl(var(--review-line))] bg-white">
        <div className="container mx-auto flex items-center gap-1 overflow-x-auto whitespace-nowrap px-4 py-2.5 text-[12px] text-muted-foreground">
          <Link to="/review" className="inline-flex items-center gap-1 hover:text-primary">
            <ArrowLeft className="h-3 w-3" /> 格價
          </Link>
          <ChevronRight className="h-3 w-3 shrink-0 opacity-40" />
          <span className="truncate font-medium text-foreground">{brandName}</span>
        </div>
      </div>

      <section className="container mx-auto px-4 py-4 md:py-6">
        <div className="review-panel overflow-hidden bg-white">
          <div className="p-4 md:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-md border border-[hsl(var(--review-line))] bg-[hsl(var(--review-canvas))]/50 sm:h-20 sm:w-20">
                {featuredProduct?.image ? (
                  <img
                    src={featuredProduct.image}
                    alt=""
                    className="h-full w-full object-contain p-2"
                  />
                ) : (
                  <span className="px-1 text-center text-[15px] font-bold leading-tight text-primary sm:text-lg">
                    {brandName.slice(0, 2).toUpperCase()}
                  </span>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="review-chip border border-primary/20 bg-secondary/60 px-2 py-0.5 text-[11px] font-semibold text-primary">
                    {brandName}
                  </span>
                  {info && (
                    <span className="review-chip border border-[hsl(var(--review-line))] bg-white px-2 py-0.5 text-[11px] text-muted-foreground">
                      {info.origin} · 創立於 {info.founded}
                    </span>
                  )}
                  <span className="review-chip border border-[hsl(var(--review-line))] bg-white px-2 py-0.5 text-[11px] text-muted-foreground">
                    <ShieldCheck className="mr-1 inline h-3 w-3 text-primary" />
                    真實報價
                  </span>
                </div>

                <h1 className="review-display text-xl leading-snug md:text-2xl">{brandName}</h1>
                <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-muted-foreground md:text-[14px]">
                  {info?.description || `${brandName} 的香港寵物用品價格比較，PetWell 會持續整理可公開查看的店舖價格。`}
                </p>

                {info?.website && (
                  <a
                    href={info.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1 text-[12px] font-medium text-primary hover:underline"
                  >
                    <Globe className="h-3.5 w-3.5" />
                    官方網站
                    <ExternalLink className="h-3 w-3 opacity-60" />
                  </a>
                )}
              </div>
            </div>

            <div className="review-panel mt-4 grid grid-cols-3 divide-x divide-[hsl(var(--review-line))] overflow-hidden border border-[hsl(var(--review-line))]">
              <BrandStat
                icon={Package}
                label="在售產品"
                value={isLoading ? "…" : String(products.length)}
              />
              <BrandStat
                icon={Store}
                label="店舖報價"
                value={isLoading ? "…" : String(totalOffers)}
              />
              <BrandStat
                icon={TrendingDown}
                label="最低由"
                value={lowest ? formatPrice(lowest) : "—"}
              />
            </div>
          </div>

          {featuredProduct && savingsPct(featuredProduct) > 0 && (
            <Link
              to={getPriceReviewProductPath(featuredProduct)}
              className="review-hero-deal group flex items-stretch border-t border-[hsl(var(--review-line))] transition-colors hover:bg-[hsl(var(--review-canvas))]/30"
            >
              <div className="relative hidden w-[120px] shrink-0 items-center justify-center bg-[hsl(var(--review-canvas))]/30 sm:flex md:w-[140px]">
                {featuredProduct.image && (
                  <img
                    src={featuredProduct.image}
                    alt=""
                    className="h-[88px] w-[88px] object-contain transition-transform duration-300 group-hover:scale-105"
                  />
                )}
              </div>
              <div className="flex min-w-0 flex-1 flex-col justify-center p-4 md:p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="review-savings-pill inline-flex items-center gap-1 rounded-sm px-2 py-0.5 text-[11px]">
                    <Zap className="h-3 w-3" /> {brandName} 最抵
                  </span>
                  <span className="text-[11px] font-semibold text-primary">
                    慳 {savingsPct(featuredProduct)}%
                  </span>
                </div>
                <p className="mt-2 line-clamp-1 text-[14px] font-semibold text-foreground md:text-[15px]">
                  {featuredProduct.name}
                </p>
                <div className="mt-2 flex flex-wrap items-end gap-3">
                  <ReviewProductPrice product={featuredProduct} size="md" />
                  {savingsAmount(featuredProduct) > 0 && (
                    <span className="review-price-struck mb-0.5 text-[12px]">
                      HK${roundPrice(getProductComparablePrices(featuredProduct).highestPrice)}
                    </span>
                  )}
                  <span className="mb-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Store className="h-3 w-3" />
                    {featuredProduct.storeCount} 間店舖
                    <ArrowRight className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                  </span>
                </div>
              </div>
            </Link>
          )}
        </div>

        <p className="mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Clock className="h-3.5 w-3.5 shrink-0 text-primary" />
          價格每日更新 · 落單前請以店舖頁面為準
        </p>
      </section>

      <section id="brand-products" className="scroll-mt-[calc(var(--header-height)+0.25rem)]">
        <div className="sticky top-[var(--header-height)] z-20 border-y border-[hsl(var(--review-line))] bg-white/95 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <div className="mr-auto flex min-w-0 items-center gap-2">
                <h2 className="shrink-0 text-[14px] font-semibold text-foreground">
                  全部 {brandName} 產品
                </h2>
                {!isLoading && filteredProducts.length > 0 && (
                  <span className="review-stat-pill hidden px-2 py-0.5 text-[11px] text-muted-foreground sm:inline">
                    {filteredProducts.length} 件
                  </span>
                )}
              </div>

              <div className="flex min-w-0 flex-1 gap-1 overflow-x-auto scrollbar-none lg:flex-none lg:overflow-visible">
                {availableCategories.map((c) => (
                  <FilterChip
                    key={c.id}
                    active={category === c.id}
                    onClick={() => setCategory(c.id)}
                  >
                    {c.label}
                  </FilterChip>
                ))}
              </div>

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
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-3 md:py-4">
          {isLoading ? (
            <LoadingState />
          ) : isError ? (
            <ErrorState message={(error as Error).message} />
          ) : filteredProducts.length === 0 ? (
            <div className="review-panel p-8 text-center">
              <p className="review-display text-lg">暫時未有公開產品價格</p>
              <p className="mt-2 text-[13px] text-muted-foreground">
                {category !== "all" ? "試吓揀其他分類，或者" : ""}
                <Link to="/review" className="font-medium text-primary hover:underline">返回格價首頁</Link>
              </p>
            </div>
          ) : viewMode === "list" ? (
            <div className="review-stagger space-y-1.5">
              {filteredProducts.map((product) => (
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
          ) : (
            <div className="review-product-grid review-stagger grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {filteredProducts.map((product) => (
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

function BrandStat({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="review-pdp-stat px-3 py-3 text-center md:px-4 md:py-4">
      <Icon className="mx-auto mb-1 h-4 w-4 text-primary" strokeWidth={2} />
      <p className="text-[18px] font-bold tabular-nums text-foreground md:text-[22px]">{value}</p>
      <p className="text-[10px] text-muted-foreground md:text-[11px]">{label}</p>
    </div>
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
        {product.size && (
          <p className="truncate text-[10px] text-muted-foreground">{product.size}</p>
        )}
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
        {product.size && (
          <p className="text-[10px] text-muted-foreground">{product.size}</p>
        )}
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
      <Button asChild className="mt-4 rounded-md">
        <Link to="/review">返回格價</Link>
      </Button>
    </div>
  );
}

export default ReviewBrand;
