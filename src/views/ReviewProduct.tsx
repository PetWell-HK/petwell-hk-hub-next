"use client";

import { useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import AppLink from "@/components/AppLink";
import AppRedirect from "@/components/AppRedirect";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Calendar,
  ChevronRight,
  Clock,
  ExternalLink,
  Flag,
  Loader2,
  Scale,
  Share2,
  ShieldCheck,
  Sparkles,
  Star,
  Store,
  TrendingDown,
  Truck,
  type LucideIcon,
} from "lucide-react";
import PriceReportDialog from "@/components/PriceReportDialog";
import { ReviewOfferPrice, ReviewProductPrice } from "@/components/ReviewPriceDisplay";
import WishlistHeartButton from "@/components/WishlistHeartButton";
import { Button } from "@/components/ui/button";
import { usePriceReviewProduct } from "@/hooks/usePriceReviewProducts";
import { formatPriceReviewShipping } from "@/lib/priceReviewText";
import {
  formatPrice,
  getComparablePrice,
  getOfferDisplayPrice,
  roundPrice,
  sortOffersByComparablePrice,
} from "@/lib/priceReviewPricing";
import { getPriceReviewProductPath, getPriceReviewProductUrl } from "@/lib/priceReviewUrl";
import type { PriceReviewOffer, PriceReviewProductSummary } from "@/types/priceReview";
import ProductReviewSection from "@/components/ProductReviewSection";
import {
  DEMO_SPECS_FALLBACK,
  generateDemoPriceHistory,
  PRICE_HISTORY_RANGES,
  type DemoPricePoint,
  type PriceHistoryRangeId,
} from "@/data/reviewProductDemo";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { PriceReviewDetailResponse } from "@/types/priceReview";

const ReviewProduct = ({
  initialReview = null,
}: {
  initialReview?: PriceReviewDetailResponse | null;
}) => {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError, error } = usePriceReviewProduct(id, initialReview);
  const { i18n } = useTranslation();
  const offersRef = useRef<HTMLDivElement>(null);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportStore, setReportStore] = useState<string | undefined>(undefined);
  const [historyRange, setHistoryRange] = useState<PriceHistoryRangeId>("6m");

  const product = data?.product;
  const sortedOffers = useMemo(
    () => (product ? sortOffersByComparablePrice(product.offers) : []),
    [product],
  );

  const demoSpecs = product?.specs?.length ? product.specs : DEMO_SPECS_FALLBACK;
  const basePrice = product
    ? getOfferDisplayPrice(sortedOffers[0] ?? product.offers[0])
    : 500;
  const demoHistory = useMemo(
    () => generateDemoPriceHistory(basePrice, product?.id?.length ?? 7),
    [basePrice, product?.id],
  );

  const historyMonths = PRICE_HISTORY_RANGES.find((r) => r.id === historyRange)?.months ?? 6;
  const historySlice = useMemo(
    () => demoHistory.slice(-historyMonths),
    [demoHistory, historyMonths],
  );
  const historyStats = useMemo(() => {
    const prices = historySlice.map((p) => p.price);
    if (prices.length === 0) return { low: 0, high: 0, avg: 0 };
    return {
      low: Math.min(...prices),
      high: Math.max(...prices),
      avg: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length),
    };
  }, [historySlice]);

  const lowest = sortedOffers[0];
  const highest = sortedOffers[sortedOffers.length - 1];
  const lowestComparable = lowest ? getComparablePrice(lowest) : 0;
  const highestComparable = highest ? getComparablePrice(highest) : 0;
  const saving = lowest && highest ? roundPrice(highestComparable - lowestComparable) : 0;
  const pct = highest && lowest && highestComparable > lowestComparable
    ? Math.round((saving / highestComparable) * 100)
    : 0;

  const canonicalUrl = product ? getPriceReviewProductUrl(product) : undefined;
  const seoDescription = product && lowest
    ? `${product.name} 香港格價：最低 ${formatPrice(lowestComparable)}，比較 ${product.storeCount} 間寵物店報價、運費及購買連結。`
    : "";
  const structuredData = product && lowest
    ? {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "Product",
            "@id": `${canonicalUrl}#product`,
            name: product.name,
            image: product.image ? [product.image] : undefined,
            brand: { "@type": "Brand", name: product.brand },
            category: product.category,
            description: seoDescription,
            ...(product.numReviews && product.avgRating
              ? {
                  aggregateRating: {
                    "@type": "AggregateRating",
                    ratingValue: product.avgRating,
                    reviewCount: product.numReviews,
                    bestRating: 5,
                    worstRating: 1,
                  },
                }
              : {}),
            offers: {
              "@type": "AggregateOffer",
              priceCurrency: "HKD",
              lowPrice: lowestComparable,
              highPrice: highestComparable,
              offerCount: product.storeCount,
              offers: sortedOffers.slice(0, 10).map((offer) => ({
                "@type": "Offer",
                price: offer.price,
                priceCurrency: "HKD",
                url: offer.url,
                availability: "https://schema.org/InStock",
                seller: { "@type": "Organization", name: offer.store },
              })),
            },
          },
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "PetWell Review", item: "https://petwellhk.com/review" },
              { "@type": "ListItem", position: 2, name: product.brand, item: `https://petwellhk.com/review/brand/${encodeURIComponent(product.brand)}` },
              { "@type": "ListItem", position: 3, name: product.name, item: canonicalUrl },
            ],
          },
        ],
      }
    : undefined;


  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: product?.name, url });
      else {
        await navigator.clipboard.writeText(url);
        toast.success("已複製連結");
      }
    } catch { /* cancelled */ }
  };

  if (isLoading) {
    return (
      <PageShell>
        <div className="review-panel mx-auto mt-10 flex max-w-lg items-center justify-center p-12 text-[14px] text-muted-foreground">
          <Loader2 className="mr-2 h-5 w-5 animate-spin text-primary" />
          正在整理報價…
        </div>
      </PageShell>
    );
  }

  if (isError) {
    const message = (error as Error).message;
    if (/not found/i.test(message)) return <AppRedirect href="/review" replace />;
    return (
      <PageShell>
        <div className="review-panel mx-auto mt-10 max-w-lg p-8 text-center">
          <h1 className="review-display text-xl">暫時未能載入</h1>
          <p className="mt-2 text-[14px] text-muted-foreground">{message}</p>
          <Button asChild className="mt-4 rounded-md">
            <AppLink href="/review">返回格價</AppLink>
          </Button>
        </div>
      </PageShell>
    );
  }

  if (!product || !lowest) return <AppRedirect href="/review" replace />;

  const priceRange = Math.max(1, highestComparable - lowestComparable);

  return (
    <div className="review-page min-h-screen pb-[4.5rem] text-foreground md:pb-0">

      <div className="border-b border-[hsl(var(--review-line))] bg-white">
        <div className="container mx-auto flex items-center gap-1 overflow-x-auto whitespace-nowrap px-4 py-2.5 text-[12px] text-muted-foreground">
          <AppLink href="/review" className="inline-flex items-center gap-1 hover:text-primary">
            <ArrowLeft className="h-3 w-3" /> 格價
          </AppLink>
          <ChevronRight className="h-3 w-3 shrink-0 opacity-40" />
          <AppLink href={`/review/brand/${encodeURIComponent(product.brand)}`} className="hover:text-primary">
            {product.brand}
          </AppLink>
          <ChevronRight className="h-3 w-3 shrink-0 opacity-40" />
          <span className="truncate font-medium text-foreground">{product.name}</span>
        </div>
      </div>

      <section className="container mx-auto px-4 py-4 md:py-6">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)] lg:gap-6 xl:grid-cols-[400px_minmax(0,1fr)]">
          <div className="space-y-3">
            <div className="overflow-hidden">
              <div className="relative aspect-square max-h-[320px] bg-[hsl(var(--review-canvas))]/40 sm:max-h-[360px] lg:max-h-none">
                <ProductImage src={product.image} alt={product.name} />
              </div>
            </div>

            <div className="md:hidden">
              <ProductTitle product={product} />
            </div>
          </div>

          <div className="lg:sticky lg:top-[calc(var(--header-height)+0.75rem)] lg:self-start">
            <div className="hidden md:block">
              <ProductTitle product={product} />
            </div>

            <div className="mt-0 md:mt-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="review-savings-pill rounded-sm px-2 py-0.5 text-[11px]">最低價</span>
                  <span className="text-[12px] text-muted-foreground">{product.storeCount} 間店舖比價</span>
                  {product.lastUpdated && (
                    <span className="ml-auto hidden items-center gap-1 text-[11px] text-muted-foreground sm:flex">
                      <Clock className="h-3 w-3" />
                      {formatDate(product.lastUpdated)}
                    </span>
                  )}
                </div>

                <div className="mt-3">
                  <ReviewOfferPrice offer={lowest} highlight className="text-left [&>p]:text-[26px] [&_.review-price-value]:text-[26px]" />
                  {saving > 0 && (
                    <p className="mt-2 text-[13px] text-muted-foreground">
                      最高 <span className="review-price-struck text-[13px]">{formatPrice(highestComparable)}</span>
                      <span className="mx-1.5 text-foreground/25">·</span>
                      慳 <span className="font-semibold text-primary">{pct}%</span>
                    </p>
                  )}
                </div>

                <div className="mt-4 flex items-center gap-2.5 rounded-md bg-[hsl(var(--review-canvas))]/50 p-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10">
                    <Store className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14px] font-semibold">{lowest.store}</p>
                    <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Truck className="h-3 w-3 shrink-0" />
                      {formatPriceReviewShipping(lowest.shipping, i18n.language)}
                      <span className="text-foreground/30">·</span>
                      {formatDate(lowest.lastSeenAt || product.lastUpdated)}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <Button asChild className="h-9 rounded-md px-4 text-[13px] font-semibold">
                    <a href={lowest.url} target="_blank" rel="noopener noreferrer">
                      去 {lowest.store} 購買 <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                    </a>
                  </Button>
                  <WishlistHeartButton
                    productId={product.id}
                    currentLowest={lowestComparable}
                    variant="labeled"
                    className="h-9 shrink-0 rounded-md px-3 text-[13px]"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 shrink-0 rounded-md border-[hsl(var(--review-line))]"
                    onClick={handleShare}
                    aria-label="分享"
                  >
                    <Share2 className="h-3.5 w-3.5" />
                  </Button>
                  {sortedOffers.length > 1 && (
                    <button
                      type="button"
                      onClick={() => offersRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
                      className="flex w-full basis-full items-center gap-1 py-1 text-[12px] font-medium text-primary hover:underline sm:w-auto sm:basis-auto"
                    >
                      <Scale className="h-3.5 w-3.5" />
                      睇晒 {sortedOffers.length} 間店舖報價
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
            </div>

            <p className="mt-2.5 hidden items-center gap-1.5 text-[11px] text-muted-foreground md:flex">
              <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-primary" />
              價格及庫存可能隨時變動，落單前請以店舖頁面為準
            </p>
          </div>
        </div>
      </section>

      <section ref={offersRef} className="scroll-mt-[calc(var(--header-height)+0.5rem)] border-t border-[hsl(var(--review-line))]">
        <div className="container mx-auto px-4 py-6 md:py-8">
          <DetailSection
            title="店舖比價"
            subtitle={`由平至貴 · 共 ${sortedOffers.length} 個報價`}
            footer={(
              <p className="mt-3 flex flex-wrap items-center justify-end gap-1 text-[11px] text-muted-foreground">
                <Flag className="h-3 w-3" />
                發現價格、連結或庫存有問題？
                <button
                  type="button"
                  onClick={() => { setReportStore(undefined); setReportOpen(true); }}
                  className="font-medium text-primary hover:underline"
                >
                  歡迎回報
                </button>
              </p>
            )}
          >
            <div className="review-stagger divide-y divide-[hsl(var(--review-line))]">
              <div className="review-offer-header">
                <span>#</span>
                <span>店舖</span>
                <span className="hidden md:block">運費</span>
                <span className="text-right">價格</span>
                <span className="text-center">購買</span>
                <span />
              </div>
              {sortedOffers.map((offer, index) => (
                <OfferRow
                  key={offer.id}
                  offer={offer}
                  rank={index + 1}
                  lowestPrice={lowestComparable}
                  priceRange={priceRange}
                  language={i18n.language}
                  productImage={product.image}
                  onReport={() => {
                    setReportStore(offer.store);
                    setReportOpen(true);
                  }}
                />
              ))}
            </div>
          </DetailSection>
        </div>
      </section>

      <section className="border-t border-[hsl(var(--review-line))]">
        <div className="container mx-auto space-y-10 px-4 py-8 md:space-y-12 md:py-10">
          <DetailSection
            title={`用戶評價${product.numReviews ? ` (${product.numReviews})` : ""}`}
            subtitle={
              product.numReviews && product.avgRating
                ? `平均 ${product.avgRating.toFixed(1)} 星`
                : undefined
            }
          >
            <ProductReviewSection
              productId={product.id}
              productName={product.name}
              avgRating={product.avgRating}
              numReviews={product.numReviews}
            />
          </DetailSection>

          <div className="grid gap-8 border-t border-[hsl(var(--review-line))] pt-10 md:pt-12 lg:grid-cols-2 lg:gap-12">
            <DetailSection
              title="產品規格"
              subtitle={product.description ? "產品說明及規格表" : "示範規格資料"}
            >
              <SpecsContent description={product.description} specs={demoSpecs} />
            </DetailSection>

            <DetailSection
              title="價格走勢"
              subtitle="每月最低成交價 · 示範資料"
              className="lg:border-l lg:border-[hsl(var(--review-line))] lg:pl-12"
            >
              <HistoryContent
                points={historySlice}
                currentPrice={lowestComparable}
                range={historyRange}
                onRangeChange={setHistoryRange}
                stats={historyStats}
              />
            </DetailSection>
          </div>
        </div>
      </section>

      {data?.related && data.related.length > 0 && (
        <section className="border-t border-[hsl(var(--review-line))]">
          <div className="container mx-auto px-4 py-6 md:py-8">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="review-display text-xl">相關產品</h2>
              <AppLink href="/review" className="flex items-center gap-0.5 text-[12px] font-medium text-primary hover:underline">
                全部格價 <ArrowRight className="h-3.5 w-3.5" />
              </AppLink>
            </div>
            <div className="review-deal-rail -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:grid md:grid-cols-4 md:gap-2 md:overflow-visible md:px-0 md:pb-0 lg:grid-cols-5">
              {data.related.map((item) => (
                <RelatedCard key={item.id} product={item} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="border-t border-[hsl(var(--review-line))] bg-white">
        <div className="container mx-auto grid gap-4 px-4 py-6 md:grid-cols-[1.4fr_1fr] md:py-8">
          <div>
            <p className="text-[12px] text-muted-foreground">關於 PetWell 格價</p>
            <h2 className="review-display mt-1.5 text-lg leading-snug md:text-xl">
              我哋唔賣嘢，只係幫你<span className="text-primary">睇清楚</span>價錢
            </h2>
            <p className="mt-2 max-w-lg text-[13px] leading-relaxed text-muted-foreground">
              所有價格由 PetWell 編輯部整理自香港寵物店公開報價。落單前請以店舖頁面為準。
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <TrustLink icon={Sparkles} label="想我哋加邊款？" sub="WhatsApp 編輯部" href="https://wa.me/85255954078" />
            <TrustLink icon={Store} label="店主合作" sub="加入比價聯盟" href="/other-services" internal />
            <TrustLink icon={TrendingDown} label="格價公平守則" sub="點解信得過" href="/about" internal />
          </div>
        </div>
      </section>

      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-[hsl(var(--review-line))] bg-white/95 p-3 backdrop-blur-md md:hidden">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <ReviewOfferPrice offer={lowest} highlight className="text-left" />
            <p className="truncate text-[11px] text-muted-foreground">{lowest.store} · 最低價</p>
          </div>
          <WishlistHeartButton productId={product.id} currentLowest={lowestComparable} size="sm" />
          <Button asChild size="lg" className="h-10 shrink-0 rounded-md px-4 text-[14px] font-semibold">
            <a href={lowest.url} target="_blank" rel="noopener noreferrer">
              去購買
            </a>
          </Button>
        </div>
      </div>

      <PriceReportDialog
        open={reportOpen}
        onOpenChange={setReportOpen}
        productId={product.id}
        productName={product.name}
        storeName={reportStore}
      />

    </div>
  );
};

function ProductTitle({
  product,
}: {
  product: { name: string; brand: string; size: string; category?: string; storeCount: number };
}) {
  return (
    <div>
      <div className="mb-1.5 flex flex-wrap items-center gap-2">
        <AppLink
          href={`/review/brand/${encodeURIComponent(product.brand)}`}
          className="review-chip border border-primary/20 bg-secondary/60 px-2 py-0.5 text-[11px] font-semibold text-primary hover:border-primary/40"
        >
          {product.brand}
        </AppLink>
        <span className="text-[11px] text-muted-foreground">{categoryLabel(product.category)}</span>
        {product.size && (
          <>
            <span className="text-muted-foreground/30">·</span>
            <span className="text-[11px] text-muted-foreground">{product.size}</span>
          </>
        )}
      </div>
      <h1 className="review-display text-xl leading-snug md:text-2xl">{product.name}</h1>
    </div>
  );
}

function ProductImage({ src, alt }: { src?: string; alt: string }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return <div className="flex h-full items-center justify-center text-[13px] text-muted-foreground">—</div>;
  }
  return (
    <img
      src={src}
      alt={alt}
      className="h-full w-full object-contain p-4 md:p-6"
      onError={() => setFailed(true)}
    />
  );
}

function OfferImage({ src, alt }: { src?: string | null; alt: string }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <div className="flex h-full items-center justify-center bg-[hsl(var(--review-canvas))]/60">
        <Store className="h-4 w-4 text-muted-foreground/50" />
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className="h-full w-full object-contain p-1"
      onError={() => setFailed(true)}
    />
  );
}

function OfferRow({
  offer,
  rank,
  lowestPrice,
  priceRange,
  language,
  productImage,
  onReport,
}: {
  offer: PriceReviewOffer;
  rank: number;
  lowestPrice: number;
  priceRange: number;
  language?: string;
  productImage?: string;
  onReport: () => void;
}) {
  const isBest = rank === 1;
  const positionPct = priceRange > 0 ? ((getComparablePrice(offer) - lowestPrice) / priceRange) * 100 : 0;
  const imageSrc = offer.imageUrl || productImage;
  const domain = getOfferDomain(offer);

  return (
    <div
      className={cn(
        "border-b border-[hsl(var(--review-line))] px-3 py-3 last:border-b-0 md:px-5 md:py-3.5",
        isBest ? "bg-primary/[0.04]" : "bg-white",
        "flex items-center gap-3 md:grid md:review-offer-row",
      )}
    >
      <div className="flex justify-center">
        {rank <= 3 ? (
          <span
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-sm text-[11px] font-bold md:h-8 md:w-8 md:text-xs",
              rank === 1 && "review-savings-pill",
              rank === 2 && "bg-foreground/75 text-white",
              rank === 3 && "bg-muted-foreground/55 text-white",
            )}
          >
            {rank}
          </span>
        ) : (
          <span className="text-[13px] font-medium tabular-nums text-muted-foreground">{rank}</span>
        )}
      </div>

      <div className="min-w-0 flex-1 md:flex-none">
        <div className="flex items-start gap-2.5">
          <div className="h-11 w-11 shrink-0 overflow-hidden rounded-md border border-[hsl(var(--review-line))] bg-[hsl(var(--review-canvas))]/50 md:h-12 md:w-12">
            <OfferImage src={imageSrc} alt={offer.store} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <p className="truncate text-[13px] font-semibold md:text-[14px]">{offer.store}</p>
              {isBest && (
                <span className="review-savings-pill inline-flex items-center gap-0.5 rounded-sm px-1.5 py-px text-[9px] md:text-[10px]">
                  <BadgeCheck className="h-2.5 w-2.5" /> 最低
                </span>
              )}
            </div>
            {domain && (
              <p className="truncate text-[11px] text-muted-foreground">{domain}</p>
            )}
            <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground md:hidden">
              <Truck className="h-3 w-3 shrink-0" />
              {formatPriceReviewShipping(offer.shipping, language)}
            </p>
            <div className="mt-1.5 hidden md:block">
              <div className="review-offer-position">
                <div
                  className="review-offer-position-fill transition-all"
                  style={{ width: `${Math.max(4, positionPct)}%`, opacity: isBest ? 1 : 0.35 + (1 - positionPct / 100) * 0.45 }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <p className="hidden truncate text-[11px] text-muted-foreground md:block">
        {formatPriceReviewShipping(offer.shipping, language)}
      </p>

      <ReviewOfferPrice offer={offer} highlight={isBest} className="shrink-0 md:block" />

      <div className="hidden justify-center md:flex">
        <Button
          asChild
          size="sm"
          variant={isBest ? "default" : "outline"}
          className={cn("h-8 rounded-md text-[12px]", !isBest && "border-[hsl(var(--review-line))]")}
        >
          <a href={offer.url} target="_blank" rel="noopener noreferrer">
            前往 <ExternalLink className="ml-1 h-3 w-3" />
          </a>
        </Button>
      </div>

      <div className="flex items-center justify-end gap-0.5 md:justify-center">
        <a
          href={offer.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground md:hidden"
          aria-label={`前往 ${offer.store}`}
        >
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
        <button type="button" onClick={onReport} aria-label={`回報 ${offer.store} 價格`} className="rounded-sm p-1 text-muted-foreground hover:text-primary">
          <Flag className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

function RelatedCard({ product }: { product: PriceReviewProductSummary }) {
  return (
    <AppLink
      href={getPriceReviewProductPath(product)}
      className="review-deal-rail-item review-panel review-card-product flex w-[140px] shrink-0 flex-col overflow-hidden bg-white md:w-auto"
    >
      <div className="relative aspect-square bg-[hsl(var(--review-canvas))]/40 p-2.5">
        {product.image ? (
          <img src={product.image} alt={product.name} loading="lazy" className="h-full w-full object-contain transition-transform group-hover:scale-[1.03]" />
        ) : (
          <div className="flex h-full items-center justify-center text-[11px] text-muted-foreground">—</div>
        )}
      </div>
      <div className="space-y-1 p-2.5 pt-2">
        <p className="truncate text-[10px] font-medium text-primary">{product.brand}</p>
        <h3 className="line-clamp-2 min-h-[2rem] text-[11px] leading-snug text-foreground">{product.name}</h3>
        <ReviewProductPrice product={product} size="sm" showPurchaseNote={false} />
      </div>
    </AppLink>
  );
}

function TrustLink({
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
    "group flex items-center gap-3 rounded-md border border-[hsl(var(--review-line))] bg-white px-3 py-2.5 transition-colors hover:border-primary/30";
  const content = (
    <>
      <Icon className="h-4 w-4 shrink-0 text-primary" strokeWidth={2} />
      <div className="flex-1 text-left">
        <p className="text-[13px] font-medium">{label}</p>
        <p className="text-[11px] text-muted-foreground">{sub}</p>
      </div>
      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
    </>
  );
  if (internal) return <AppLink href={href} className={className}>{content}</AppLink>;
  return <a href={href} target="_blank" rel="noopener noreferrer" className={className}>{content}</a>;
}

function DetailSection({
  title,
  subtitle,
  children,
  footer,
  className,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("min-w-0", className)}>
      <div className="mb-4">
        <h2 className="review-display text-[18px] leading-snug md:text-xl">{title}</h2>
        {subtitle && <p className="mt-1 text-[12px] text-muted-foreground">{subtitle}</p>}
      </div>
      {children}
      {footer}
    </div>
  );
}

function HistoryContent({
  points,
  currentPrice,
  range,
  onRangeChange,
  stats,
}: {
  points: DemoPricePoint[];
  currentPrice: number;
  range: PriceHistoryRangeId;
  onRangeChange: (range: PriceHistoryRangeId) => void;
  stats: { low: number; high: number; avg: number };
}) {
  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-end gap-2">
        <div className="inline-flex items-center gap-1">
          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
          {PRICE_HISTORY_RANGES.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => onRangeChange(r.id)}
              className={cn(
                "rounded-sm px-2.5 py-1 text-[11px] transition-colors",
                range === r.id
                  ? "font-semibold text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <PriceSparkline points={points} current={currentPrice} />

      <div className="mt-4 flex flex-wrap gap-6 text-[12px]">
        <div>
          <p className="text-muted-foreground">期內最低</p>
          <p className="review-price mt-0.5">
            <span className="review-price-symbol text-[10px]">HK$</span>
            <span className="review-price-value text-[16px]">{stats.low}</span>
          </p>
        </div>
        <div>
          <p className="text-muted-foreground">平均價</p>
          <p className="mt-0.5 text-[16px] font-bold tabular-nums">{formatPrice(stats.avg)}</p>
        </div>
        <div>
          <p className="text-muted-foreground">期內最高</p>
          <p className="mt-0.5 text-[16px] font-bold tabular-nums text-muted-foreground">
            {formatPrice(stats.high)}
          </p>
        </div>
      </div>

      <p className="mt-4 text-[11px] text-muted-foreground">
        * 走勢以每月最低成交價計算，僅供參考。
      </p>
    </div>
  );
}

function PriceSparkline({
  points,
  current,
  height = 140,
}: {
  points: DemoPricePoint[];
  current: number;
  height?: number;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const w = 800;
  const h = height;
  const padX = 12;
  const padY = 16;
  const prices = points.map((p) => p.price);
  const min = Math.min(...prices, current);
  const max = Math.max(...prices, current);
  const range = Math.max(max - min, 1);
  const stepX = (w - padX * 2) / Math.max(points.length - 1, 1);
  const y = (v: number) => padY + (1 - (v - min) / range) * (h - padY * 2);
  const x = (i: number) => padX + i * stepX;

  const path = points.map((p, i) => `${i === 0 ? "M" : "L"} ${x(i)} ${y(p.price)}`).join(" ");
  const area = `${path} L ${x(points.length - 1)} ${h - padY} L ${x(0)} ${h - padY} Z`;
  const lowIdx = prices.indexOf(min);
  const hoverPoint = hover !== null ? points[hover] : null;

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${w} ${h}`}
        preserveAspectRatio="none"
        className="w-full select-none"
        style={{ height }}
        onMouseLeave={() => setHover(null)}
        onMouseMove={(e) => {
          const rect = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
          const px = ((e.clientX - rect.left) / rect.width) * w;
          const idx = Math.round((px - padX) / stepX);
          setHover(Math.max(0, Math.min(points.length - 1, idx)));
        }}
      >
        <defs>
          <linearGradient id="review-spark-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.25" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#review-spark-fill)" />
        <path d={path} fill="none" stroke="hsl(var(--primary))" strokeWidth="2.5" />
        <circle cx={x(lowIdx)} cy={y(min)} r="5" fill="hsl(var(--primary))" />
        {hover !== null && (
          <>
            <line
              x1={x(hover)}
              x2={x(hover)}
              y1={padY}
              y2={h - padY}
              stroke="hsl(var(--foreground))"
              strokeOpacity="0.2"
              strokeDasharray="3 3"
            />
            <circle cx={x(hover)} cy={y(points[hover].price)} r="4" fill="hsl(var(--foreground))" />
          </>
        )}
      </svg>
      {hoverPoint && (
        <div
          className="pointer-events-none absolute -top-1 rounded-md bg-foreground px-2.5 py-1.5 text-[11px] text-background shadow-lg"
          style={{
            left: `${((hover! * stepX + padX) / w) * 100}%`,
            transform: "translate(-50%, -100%)",
          }}
        >
          <div className="font-semibold">{formatPrice(hoverPoint.price)}</div>
          <div className="opacity-70">{hoverPoint.date}</div>
        </div>
      )}
    </div>
  );
}

function SpecsContent({
  description,
  specs,
}: {
  description?: string;
  specs: { label: string; value: string }[];
}) {
  return (
    <div>
      {description && (
        <p className="mb-5 text-[14px] leading-relaxed text-muted-foreground">{description}</p>
      )}
      <div className="divide-y divide-[hsl(var(--review-line))]">
        {specs.map((spec, i) => (
          <div
            key={`${spec.label}-${i}`}
            className="grid grid-cols-[100px_1fr] gap-3 py-3 text-[13px] md:grid-cols-[130px_1fr]"
          >
            <p className="text-[12px] font-medium text-muted-foreground">{spec.label}</p>
            <p className="font-medium">{spec.value}</p>
          </div>
        ))}
      </div>
      {!description && (
        <p className="mt-3 text-[11px] text-muted-foreground">* 規格為示範資料。</p>
      )}
    </div>
  );
}

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="review-page min-h-screen">
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}

function formatDate(value?: string | null) {
  if (!value) return "最近更新";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "最近更新";
  return date.toLocaleDateString("zh-HK", { month: "short", day: "2-digit" });
}

function getOfferDomain(offer: PriceReviewOffer): string | null {
  try {
    const host = new URL(offer.url).hostname.replace(/^www\./i, "");
    if (host) return host;
  } catch {
    /* invalid url */
  }
  const platform = offer.platform.trim();
  return platform || null;
}

function categoryLabel(category?: string) {
  switch (category) {
    case "food": return "糧食";
    case "medicine": return "藥品";
    case "treats": return "零食";
    case "supplies": return "日用品";
    default: return "其他";
  }
}

export default ReviewProduct;
