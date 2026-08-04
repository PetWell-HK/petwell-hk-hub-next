"use client";

import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  ExternalLink,
  Loader2,
  Scale,
  ShieldCheck,
  Sparkles,
  Store,
  TrendingDown,
  X,
  Zap,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useCompare } from "@/contexts/CompareContext";
import { useSEO } from "@/hooks/useSEO";
import { usePriceReviewProductsByIds } from "@/hooks/usePriceReviewProducts";
import { ReviewProductPrice } from "@/components/ReviewPriceDisplay";
import ProductReviewRatingBadge from "@/components/ProductReviewRatingBadge";
import {
  formatPrice,
  getProductComparablePrices,
  savingsPct,
} from "@/lib/priceReviewPricing";
import { getPriceReviewProductPath } from "@/lib/priceReviewUrl";
import type { PriceReviewProductSummary } from "@/types/priceReview";
import { cn } from "@/lib/utils";

const COMPARE_ROWS = [
  { key: "lowest", label: "最低價" },
  { key: "savings", label: "慳幅" },
  { key: "stores", label: "店舖數量" },
  { key: "bestStore", label: "最低店舖" },
  { key: "highest", label: "最高報價" },
  { key: "size", label: "規格" },
] as const;

type CompareRowKey = (typeof COMPARE_ROWS)[number]["key"];

const Compare = () => {
  const { ids, remove, clear, max } = useCompare();
  const { data, isLoading, isError, error } = usePriceReviewProductsByIds(ids);
  const products = data?.items || [];

  useSEO({
    title: "產品比較 | PetWell Review",
    description: "並排比較寵物用品真實價格、店舖數量及最低報價。",
    canonicalUrl: "https://petwellhk.com/compare",
  });

  if (ids.length === 0) return <EmptyCompare max={max} />;

  const bestPrice = products.length > 0
    ? Math.min(...products.map((p) => getProductComparablePrices(p).lowestPrice))
    : 0;
  const bestStores = products.length > 0 ? Math.max(...products.map((p) => p.storeCount)) : 0;
  const bestSavings = products.length > 0 ? Math.max(...products.map((p) => savingsPct(p))) : 0;

  return (
    <div className="review-page min-h-screen">
      <Header />

      <div className="border-b border-[hsl(var(--review-line))] bg-white">
        <div className="container mx-auto flex items-center gap-1 overflow-x-auto whitespace-nowrap px-4 py-2.5 text-[12px] text-muted-foreground">
          <Link to="/review" className="inline-flex items-center gap-1 hover:text-primary">
            <ArrowLeft className="h-3 w-3" /> 格價
          </Link>
          <ChevronRight className="h-3 w-3 shrink-0 opacity-40" />
          <span className="font-medium text-foreground">產品比較</span>
        </div>
      </div>

      <section className="container mx-auto px-4 py-4 md:py-6">
        <div className="review-panel overflow-hidden bg-white">
          <div className="flex flex-col gap-4 border-b border-[hsl(var(--review-line))] p-4 sm:flex-row sm:items-center sm:justify-between md:p-5">
            <div className="min-w-0">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="review-chip inline-flex items-center gap-1 border border-primary/20 bg-secondary/60 px-2 py-0.5 text-[11px] font-semibold text-primary">
                  <Scale className="h-3 w-3" />
                  產品比較
                </span>
                <span className="review-stat-pill px-2 py-0.5 text-[11px] text-muted-foreground">
                  {ids.length} / {max} 件
                </span>
              </div>
              <h1 className="review-display text-xl leading-snug md:text-2xl">並排比較報價</h1>
              <p className="mt-1.5 text-[13px] text-muted-foreground">
                並排睇清楚邊款最抵、邊間店舖最多選擇。
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <Button variant="outline" size="sm" asChild className="h-8 rounded-md border-[hsl(var(--review-line))] text-[12px]">
                <Link to="/review">
                  <ArrowLeft className="mr-1 h-3.5 w-3.5" />
                  繼續格價
                </Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={clear}
                className="h-8 rounded-md border-[hsl(var(--review-line))] text-[12px]"
              >
                清除全部
              </Button>
            </div>
          </div>

          {products.length > 0 && !isLoading && (
            <div className="grid grid-cols-3 divide-x divide-[hsl(var(--review-line))] border-b border-[hsl(var(--review-line))]">
              <SummaryStat
                icon={TrendingDown}
                label="最低價"
                value={formatPrice(bestPrice)}
              />
              <SummaryStat
                icon={Store}
                label="最多店舖"
                value={`${bestStores} 間`}
              />
              <SummaryStat
                icon={Zap}
                label="最大慳幅"
                value={bestSavings > 0 ? `${bestSavings}%` : "—"}
              />
            </div>
          )}
        </div>

        <p className="mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-primary" />
          價格每日更新 · 落單前請以店舖頁面為準
        </p>
      </section>

      <section className="container mx-auto px-4 pb-8 md:pb-10">
        {isLoading ? (
          <LoadingState />
        ) : isError ? (
          <ErrorState message={(error as Error).message} />
        ) : products.length === 0 ? (
          <EmptyCompare max={max} />
        ) : (
          <>
            <div className="space-y-2 md:hidden">
              {products.map((product) => (
                <MobileCompareCard
                  key={product.id}
                  product={product}
                  onRemove={() => remove(product.id)}
                  bestPrice={bestPrice}
                  bestStores={bestStores}
                  bestSavings={bestSavings}
                />
              ))}
            </div>

            <div className="review-panel hidden overflow-hidden bg-white md:block">
              <div className="overflow-x-auto">
                <div
                  className="review-stagger min-w-max"
                  style={{
                    display: "grid",
                    gridTemplateColumns: `132px repeat(${products.length}, minmax(220px, 1fr))`,
                  }}
                >
                  <div className="border-b border-r border-[hsl(var(--review-line))] bg-[hsl(var(--review-canvas))]/50 p-4" />
                  {products.map((product) => (
                    <CompareProductHeader
                      key={product.id}
                      product={product}
                      onRemove={() => remove(product.id)}
                    />
                  ))}

                  {COMPARE_ROWS.map((row) => (
                    <CompareGridRow
                      key={row.key}
                      label={row.label}
                      products={products}
                      rowKey={row.key}
                      bestPrice={bestPrice}
                      bestStores={bestStores}
                      bestSavings={bestSavings}
                    />
                  ))}

                  <div className="border-r border-[hsl(var(--review-line))] bg-[hsl(var(--review-canvas))]/50 p-4 text-[12px] font-medium text-muted-foreground">
                    行動
                  </div>
                  {products.map((product) => (
                    <div
                      key={`actions-${product.id}`}
                      className="border-b border-[hsl(var(--review-line))] p-4 last:border-b-0"
                    >
                      <div className="flex flex-wrap gap-2">
                        <Button asChild size="sm" className="h-8 flex-1 rounded-md text-[12px]">
                          <Link to={getPriceReviewProductPath(product)}>睇詳情</Link>
                        </Button>
                        {product.topOffers[0]?.url && (
                          <Button asChild size="sm" variant="outline" className="h-8 rounded-md border-[hsl(var(--review-line))] px-2.5">
                            <a href={product.topOffers[0].url} target="_blank" rel="noopener noreferrer" aria-label="去店舖購買">
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </section>

      <section className="border-t border-[hsl(var(--review-line))] bg-white">
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
    </div>
  );
};

function CompareProductHeader({
  product,
  onRemove,
}: {
  product: PriceReviewProductSummary;
  onRemove: () => void;
}) {
  return (
    <div className="relative border-b border-r border-[hsl(var(--review-line))] p-4 last:border-r-0">
      <button
        type="button"
        onClick={onRemove}
        aria-label="移除"
        className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-md border border-[hsl(var(--review-line))] bg-white text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
      >
        <X className="h-3.5 w-3.5" />
      </button>

      <div className="pr-8">
        <Link
          to={getPriceReviewProductPath(product)}
          className="group mb-3 block aspect-square max-h-[120px] overflow-hidden rounded-md bg-[hsl(var(--review-canvas))]/40 p-2"
        >
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-[12px] text-muted-foreground">—</div>
          )}
        </Link>

        <Link
          to={`/review/brand/${encodeURIComponent(product.brand)}`}
          className="review-chip mb-1.5 inline-block border border-primary/20 bg-secondary/60 px-2 py-0.5 text-[10px] font-semibold text-primary hover:border-primary/40"
        >
          {product.brand}
        </Link>
        <Link to={getPriceReviewProductPath(product)}>
          <p className="line-clamp-2 text-[13px] font-semibold leading-snug text-foreground hover:text-primary">
            {product.name}
          </p>
        </Link>
        <ProductReviewRatingBadge
          avgRating={product.avgRating}
          numReviews={product.numReviews}
          className="mt-1.5"
        />
      </div>
    </div>
  );
}

function CompareGridRow({
  label,
  products,
  rowKey,
  bestPrice,
  bestStores,
  bestSavings,
}: {
  label: string;
  products: PriceReviewProductSummary[];
  rowKey: CompareRowKey;
  bestPrice: number;
  bestStores: number;
  bestSavings: number;
}) {
  return (
    <>
      <div className="border-b border-r border-[hsl(var(--review-line))] bg-[hsl(var(--review-canvas))]/50 p-4 text-[12px] font-medium text-muted-foreground">
        {label}
      </div>
      {products.map((product) => {
        const highlight = isHighlighted(product, rowKey, bestPrice, bestStores, bestSavings);
        const value = getCellValue(product, rowKey);

        return (
          <div
            key={`${rowKey}-${product.id}`}
            className={cn(
              "border-b border-r border-[hsl(var(--review-line))] p-4 text-center last:border-r-0",
              highlight && "bg-primary/[0.04]",
            )}
          >
            {rowKey === "lowest" ? (
              <div className="flex flex-col items-center gap-1">
                <ReviewProductPrice product={product} size="sm" highlight={highlight} />
                {highlight && (
                  <span className="review-savings-pill inline-flex items-center gap-0.5 rounded-sm px-1.5 py-0.5 text-[10px]">
                    <Check className="h-3 w-3" /> 最抵
                  </span>
                )}
              </div>
            ) : rowKey === "savings" ? (
              <div className="flex flex-col items-center gap-1">
                {savingsPct(product) > 0 ? (
                  <>
                    <span className={cn("text-[14px] font-bold", highlight ? "text-primary" : "text-foreground")}>
                      {savingsPct(product)}%
                    </span>
                    {highlight && (
                      <span className="text-[10px] font-medium text-primary">慳最多</span>
                    )}
                  </>
                ) : (
                  <span className="text-[13px] text-muted-foreground">—</span>
                )}
              </div>
            ) : (
              <CellValue value={value} highlight={highlight} />
            )}
          </div>
        );
      })}
    </>
  );
}

function CellValue({ value, highlight }: { value: string; highlight: boolean }) {
  return (
    <p className={cn("text-[13px]", highlight ? "font-semibold text-primary" : "text-foreground")}>
      {highlight && <Check className="mr-1 inline h-3.5 w-3.5" />}
      {value}
    </p>
  );
}

function MobileCompareCard({
  product,
  onRemove,
  bestPrice,
  bestStores,
  bestSavings,
}: {
  product: PriceReviewProductSummary;
  onRemove: () => void;
  bestPrice: number;
  bestStores: number;
  bestSavings: number;
}) {
  const pct = savingsPct(product);
  const pricing = getProductComparablePrices(product);
  const isBestPrice = pricing.lowestPrice === bestPrice;
  const isBestStores = product.storeCount === bestStores;
  const isBestSavings = pct === bestSavings && pct > 0;

  return (
    <article className="review-panel review-card-product overflow-hidden bg-white">
      <div className="flex gap-3 p-3">
        <Link
          to={getPriceReviewProductPath(product)}
          className="relative block h-[88px] w-[88px] shrink-0 overflow-hidden rounded-md bg-[hsl(var(--review-canvas))]/40 p-1.5"
        >
          {product.image ? (
            <img src={product.image} alt={product.name} className="h-full w-full object-contain" />
          ) : (
            <div className="flex h-full items-center justify-center text-[11px] text-muted-foreground">—</div>
          )}
          {pct > 0 && (
            <span className="review-savings-pill absolute left-1 top-1 rounded-sm px-1 py-px text-[9px] leading-none">
              慳{pct}%
            </span>
          )}
        </Link>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <Link
                to={`/review/brand/${encodeURIComponent(product.brand)}`}
                className="review-chip mb-1 inline-block border border-primary/20 bg-secondary/60 px-1.5 py-px text-[10px] font-semibold text-primary"
              >
                {product.brand}
              </Link>
              <Link to={getPriceReviewProductPath(product)}>
                <h3 className="line-clamp-2 text-[13px] font-semibold leading-snug text-foreground hover:text-primary">
                  {product.name}
                </h3>
              </Link>
              <ProductReviewRatingBadge
                avgRating={product.avgRating}
                numReviews={product.numReviews}
                className="mt-1"
              />
            </div>
            <button
              type="button"
              onClick={onRemove}
              aria-label="移除"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-[hsl(var(--review-line))] text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-1.5">
            <MetricPill label="最低價" active={isBestPrice}>
              <ReviewProductPrice product={product} size="xs" highlight={isBestPrice} showPurchaseNote={false} />
            </MetricPill>
            <MetricPill label="店舖" active={isBestStores}>
              <span className={cn("text-[13px] font-bold", isBestStores && "text-primary")}>
                {product.storeCount} 間
              </span>
            </MetricPill>
            <MetricPill label="慳幅" active={isBestSavings}>
              <span className={cn("text-[13px] font-bold", isBestSavings ? "text-primary" : "text-foreground")}>
                {pct > 0 ? `${pct}%` : "—"}
              </span>
            </MetricPill>
          </div>

          <p className="mt-2 flex items-center gap-1 text-[11px] text-muted-foreground">
            <Store className="h-3 w-3 shrink-0" />
            {product.topOffers[0]?.store || "—"}
          </p>
        </div>
      </div>

      <div className="flex gap-2 border-t border-[hsl(var(--review-line))] p-3">
        <Button asChild size="sm" className="h-8 flex-1 rounded-md text-[12px]">
          <Link to={getPriceReviewProductPath(product)}>睇詳情</Link>
        </Button>
        {product.topOffers[0]?.url && (
          <Button asChild size="sm" variant="outline" className="h-8 rounded-md border-[hsl(var(--review-line))] px-3 text-[12px]">
            <a href={product.topOffers[0].url} target="_blank" rel="noopener noreferrer">
              去購買 <ExternalLink className="ml-1 h-3 w-3" />
            </a>
          </Button>
        )}
      </div>
    </article>
  );
}

function MetricPill({
  label,
  active,
  children,
}: {
  label: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-md border px-2 py-1.5 text-center",
        active
          ? "border-primary/20 bg-primary/[0.05]"
          : "border-[hsl(var(--review-line))] bg-[hsl(var(--review-canvas))]/30",
      )}
    >
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <div className="mt-0.5">{children}</div>
    </div>
  );
}

function SummaryStat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof TrendingDown;
  label: string;
  value: string;
}) {
  return (
    <div className="review-pdp-stat px-3 py-3 text-center md:px-4 md:py-4">
      <Icon className="mx-auto mb-1 h-4 w-4 text-primary" strokeWidth={2} />
      <p className="text-[16px] font-bold tabular-nums text-foreground md:text-[18px]">{value}</p>
      <p className="text-[10px] text-muted-foreground md:text-[11px]">{label}</p>
    </div>
  );
}

function FootLink({
  icon: Icon,
  label,
  sub,
  href,
  internal,
}: {
  icon: typeof Sparkles;
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

function LoadingState() {
  return (
    <div className="review-panel flex items-center justify-center p-12 text-[14px] text-muted-foreground">
      <Loader2 className="mr-2 h-5 w-5 animate-spin text-primary" />
      正在整理比較資料…
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="review-panel border-destructive/30 p-6 text-center">
      <h2 className="review-display text-xl">暫時未能載入</h2>
      <p className="mx-auto mt-2 max-w-xl text-[14px] text-muted-foreground">{message}</p>
      <Button asChild className="mt-4 rounded-md">
        <Link to="/review">返回格價</Link>
      </Button>
    </div>
  );
}

function EmptyCompare({ max }: { max: number }) {
  return (
    <div className="review-page min-h-screen">
      <Header />

      <div className="border-b border-[hsl(var(--review-line))] bg-white">
        <div className="container mx-auto flex items-center gap-1 px-4 py-2.5 text-[12px] text-muted-foreground">
          <Link to="/review" className="inline-flex items-center gap-1 hover:text-primary">
            <ArrowLeft className="h-3 w-3" /> 格價
          </Link>
          <ChevronRight className="h-3 w-3 shrink-0 opacity-40" />
          <span className="font-medium text-foreground">產品比較</span>
        </div>
      </div>

      <main className="container mx-auto flex flex-1 items-center justify-center px-4 py-12 md:py-16">
        <div className="review-panel w-full max-w-md p-8 text-center md:p-10">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-md border border-primary/20 bg-secondary/60">
            <Scale className="h-7 w-7 text-primary" strokeWidth={1.75} />
          </div>
          <h1 className="review-display text-xl md:text-2xl">未有產品可比較</h1>
          <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
            喺格價頁面剔選 2 至 {max} 件產品，再返嚟並排比較。
          </p>
          <Button asChild className="mt-5 rounded-md">
            <Link to="/review">前往格價</Link>
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function isHighlighted(
  product: PriceReviewProductSummary,
  rowKey: CompareRowKey,
  bestPrice: number,
  bestStores: number,
  bestSavings: number,
): boolean {
  switch (rowKey) {
    case "lowest":
      return getProductComparablePrices(product).lowestPrice === bestPrice;
    case "savings":
      return savingsPct(product) === bestSavings && bestSavings > 0;
    case "stores":
      return product.storeCount === bestStores;
    case "bestStore":
    case "highest":
    case "size":
      return false;
    default: {
      const _exhaustive: never = rowKey;
      return _exhaustive;
    }
  }
}

function getCellValue(product: PriceReviewProductSummary, rowKey: CompareRowKey): string {
  switch (rowKey) {
    case "lowest":
      return formatPrice(getProductComparablePrices(product).lowestPrice);
    case "savings":
      return savingsPct(product) > 0 ? `${savingsPct(product)}%` : "—";
    case "stores":
      return `${product.storeCount} 間`;
    case "bestStore":
      return product.topOffers[0]?.store || "—";
    case "highest":
      return formatPrice(getProductComparablePrices(product).highestPrice);
    case "size":
      return product.size || "—";
    default: {
      const _exhaustive: never = rowKey;
      return _exhaustive;
    }
  }
}

export default Compare;
