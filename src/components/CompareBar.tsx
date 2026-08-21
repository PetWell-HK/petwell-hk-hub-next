import AppLink from "@/components/AppLink";
import { Loader2, Scale, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCompare } from "@/contexts/CompareContext";
import { usePriceReviewProductsByIds } from "@/hooks/usePriceReviewProducts";

const CompareBar = () => {
  const { ids, clear, remove, max } = useCompare();
  const { data, isLoading } = usePriceReviewProductsByIds(ids);

  if (!ids.length) return null;

  const canCompare = ids.length >= 2;
  const productsById = new Map((data?.items || []).map((product) => [product.id, product]));

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background/95 shadow-[0_-4px_20px_-8px_rgba(0,0,0,0.15)] backdrop-blur">
      <div className="container mx-auto px-3 py-2.5 md:px-4 md:py-3">
        <div className="flex items-center gap-2 md:gap-4">
          <div className="hidden shrink-0 items-center gap-2 text-sm font-medium md:flex">
            <Scale className="h-4 w-4 text-primary" />
            已選 {ids.length} / {max} 件
          </div>

          <div className="scrollbar-none flex flex-1 items-center gap-2 overflow-x-auto">
            {isLoading && (
              <div className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                載入比較產品
              </div>
            )}
            {ids.map((id) => {
              const product = productsById.get(id);
              return (
                <div key={id} className="flex max-w-[180px] shrink-0 items-center gap-1.5 rounded-full bg-muted py-1 pl-1 pr-1">
                  {product?.image ? (
                    <img src={product.image} alt={product.name} className="h-7 w-7 shrink-0 rounded-full bg-white object-cover" />
                  ) : (
                    <div className="h-7 w-7 shrink-0 rounded-full bg-background" />
                  )}
                  <span className="hidden truncate text-xs sm:inline">{product?.name || "載入中..."}</span>
                  <button
                    onClick={() => remove(id)}
                    aria-label="移除"
                    className="inline-flex h-5 w-5 items-center justify-center rounded-full hover:bg-background"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              );
            })}
          </div>

          <div className="flex shrink-0 items-center gap-1.5 md:gap-2">
            <span className="whitespace-nowrap text-xs font-medium md:hidden">已選 {ids.length}</span>
            <Button variant="ghost" size="sm" onClick={clear} className="h-8 text-xs md:h-9 md:text-sm">
              清除
            </Button>
            <Button
              size="sm"
              asChild={canCompare}
              disabled={!canCompare}
              className="h-8 gap-1 text-xs md:h-9 md:text-sm"
              title={canCompare ? undefined : "請選擇至少 2 件產品"}
            >
              {canCompare ? (
                <AppLink href="/compare">
                  <Scale className="h-3.5 w-3.5" />
                  比較
                </AppLink>
              ) : (
                <span>
                  <Scale className="mr-1 inline h-3.5 w-3.5" />
                  比較
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompareBar;
