"use client";

import AppLink from "@/components/AppLink";
import { ChevronRight, ExternalLink, Heart, Loader2, Scale, Trash2, TrendingDown, TrendingUp } from "lucide-react";
import AppUpsellBanner from "@/components/AppUpsellBanner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useAuthPanel } from "@/contexts/AuthPanelContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { usePriceReviewProductsByIds } from "@/hooks/usePriceReviewProducts";
import { getPriceReviewProductPath } from "@/lib/priceReviewUrl";
import { toast } from "sonner";

const Wishlist = () => {

  const { isAuthenticated } = useAuth();
  const { openPanel } = useAuthPanel();
  const { items, remove } = useWishlist();
  const ids = items.map((item) => item.productId);
  const { data, isLoading, isError, error } = usePriceReviewProductsByIds(ids);
  const productsById = new Map((data?.items || []).map((product) => [product.id, product]));

  const entries = items
    .map((entry) => {
      const product = productsById.get(entry.productId);
      if (!product) return null;
      const diff = product.lowestPrice - entry.priceAtAdd;
      const pct = entry.priceAtAdd ? (diff / entry.priceAtAdd) * 100 : 0;
      return { entry, product, diff, pct };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  return (
    <div className="flex min-h-screen flex-col bg-background">

      <main className="flex-1">
        <section className="border-b bg-gradient-to-br from-primary/10 via-background to-accent/10">
          <div className="container mx-auto px-4 py-8 md:py-12">
            <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
              <AppLink href="/review" className="hover:text-primary">格價</AppLink>
              <ChevronRight className="h-3 w-3" />
              <span>追蹤清單</span>
            </div>
            <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight md:text-4xl">
              <Heart className="h-6 w-6 fill-primary text-primary md:h-8 md:w-8" />
              我的追蹤清單
            </h1>
            <p className="mt-2 text-sm text-muted-foreground md:text-base">
              已儲存 {items.length} 件產品，價格會以最新公開資料計算。
            </p>
          </div>
        </section>

        <section className="container mx-auto px-4 py-8">
          {!isAuthenticated && items.length === 0 ? (
            <Card className="mx-auto max-w-lg p-8 text-center md:p-12">
              <Heart className="mx-auto mb-3 h-12 w-12 text-primary" />
              <h2 className="mb-2 text-lg font-semibold md:text-xl">登入後查看追蹤清單</h2>
              <p className="mb-5 text-sm text-muted-foreground">登入 PetWell 帳戶，即可儲存追蹤清單及獲取最平價格通知。</p>
              <div className="flex justify-center gap-2">
                <Button variant="outline" onClick={() => openPanel("LANDING")}>登入</Button>
                <Button asChild>
                  <AppLink href="/register">立即註冊</AppLink>
                </Button>
              </div>
            </Card>
          ) : items.length === 0 ? (
            <EmptyWishlist />
          ) : isLoading ? (
            <Card className="flex items-center justify-center p-10 text-muted-foreground">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              正在載入追蹤產品...
            </Card>
          ) : isError ? (
            <Card className="p-6 text-center">
              <h2 className="font-semibold">暫時未能載入追蹤清單</h2>
              <p className="mt-2 text-sm text-muted-foreground">{(error as Error).message}</p>
            </Card>
          ) : entries.length === 0 ? (
            <Card className="p-8 text-center">
              <h2 className="font-semibold">已追蹤產品暫時未有公開價格</h2>
              <p className="mt-2 text-sm text-muted-foreground">可能仍在 admin review 或產品已下架。</p>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {entries.map(({ entry, product, diff, pct }) => {
                const isDown = diff < 0;
                const isUp = diff > 0;
                const lowest = product.topOffers[0];
                return (
                  <Card key={entry.productId} className="flex flex-col overflow-hidden">
                    <AppLink href={getPriceReviewProductPath(product)} className="block aspect-[16/10] overflow-hidden bg-muted">
                      {product.image && <img src={product.image} alt={product.name} className="h-full w-full object-cover transition-transform hover:scale-105" />}
                    </AppLink>
                    <div className="flex flex-1 flex-col p-4">
                      <Badge variant="outline" className="mb-1.5 self-start text-[10px]">{product.brand}</Badge>
                      <AppLink href={getPriceReviewProductPath(product)} className="line-clamp-2 text-sm font-semibold leading-tight hover:text-primary md:text-base">
                        {product.name}
                      </AppLink>
                      <p className="mt-0.5 text-xs text-muted-foreground">{product.size}</p>

                      <div className="mt-3 flex items-end justify-between gap-2 border-t pt-3">
                        <div>
                          <p className="text-[10px] text-muted-foreground">全網最平</p>
                          <p className="text-xl font-bold leading-tight text-primary">HK${product.lowestPrice}</p>
                          <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{lowest?.store || "—"}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-muted-foreground">加入後</p>
                          {diff === 0 ? (
                            <p className="text-xs font-medium text-muted-foreground">無變動</p>
                          ) : (
                            <p className={`inline-flex items-center gap-0.5 text-xs font-semibold ${isDown ? "text-green-600" : "text-red-500"}`}>
                              {isDown ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
                              {isUp ? "+" : ""}{Math.round(pct)}% / {isDown ? "" : "+"}HK${diff}
                            </p>
                          )}
                          <p className="mt-0.5 text-[10px] text-muted-foreground">入單 HK${entry.priceAtAdd}</p>
                        </div>
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            remove(entry.productId);
                            toast("已從追蹤清單移除", { duration: 3000 });
                          }}
                          className="gap-1 text-xs"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> 移除
                        </Button>
                        <Button variant="outline" size="sm" asChild className="gap-1 text-xs">
                          <AppLink href={getPriceReviewProductPath(product)}>
                            <Scale className="h-3.5 w-3.5" /> 前往比較
                          </AppLink>
                        </Button>
                      </div>
                      {lowest?.url && (
                        <Button asChild size="sm" className="mt-1.5 w-full gap-1 text-xs">
                          <a href={lowest.url} target="_blank" rel="noopener noreferrer">
                            前往最平店舖 <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </section>
      </main>

      <AppUpsellBanner />
    </div>
  );
};

function EmptyWishlist() {
  return (
    <Card className="mx-auto max-w-lg p-8 text-center md:p-12">
      <Heart className="mx-auto mb-3 h-12 w-12 text-muted-foreground/40" />
      <h2 className="mb-2 text-lg font-semibold md:text-xl">仲未有追蹤產品</h2>
      <p className="mb-5 text-sm text-muted-foreground">喺格價頁面按心心即可加入追蹤清單。</p>
      <Button asChild>
        <AppLink href="/review">前往格價</AppLink>
      </Button>
    </Card>
  );
}

export default Wishlist;
