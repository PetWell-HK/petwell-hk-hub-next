import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  getPriceReviewProduct,
  listPriceReviewBrandProducts,
  listPriceReviewProducts,
} from "@/services/priceReviewApi";
import type { PriceReviewDetailResponse, PriceReviewListResponse, PriceReviewProductSummary, PriceReviewQuery } from "@/types/priceReview";

export function usePriceReviewProducts(
  query: PriceReviewQuery,
  initialItems?: PriceReviewProductSummary[] | null,
) {
  return useQuery({
    queryKey: ["priceReviewProducts", query],
    queryFn: () => listPriceReviewProducts(query),
    staleTime: 60_000,
    placeholderData: keepPreviousData,
    initialData: initialItems?.length
      ? ({ items: initialItems, brands: [] } satisfies PriceReviewListResponse)
      : undefined,
  });
}

export function usePriceReviewProduct(
  productId?: string,
  initialData?: PriceReviewDetailResponse | null,
) {
  return useQuery({
    queryKey: ["priceReviewProduct", productId],
    queryFn: () => getPriceReviewProduct(productId || ""),
    enabled: Boolean(productId),
    staleTime: 60_000,
    initialData: initialData ?? undefined,
  });
}

export function usePriceReviewBrandProducts(brand?: string) {
  return useQuery({
    queryKey: ["priceReviewBrandProducts", brand],
    queryFn: () => listPriceReviewBrandProducts(brand || ""),
    enabled: Boolean(brand),
    staleTime: 60_000,
  });
}

export function usePriceReviewProductsByIds(ids: string[]) {
  const stableIds = [...ids].sort();
  return useQuery({
    queryKey: ["priceReviewProductsByIds", stableIds],
    queryFn: () => listPriceReviewProducts({ ids: stableIds, limit: stableIds.length }),
    enabled: stableIds.length > 0,
    staleTime: 60_000,
  });
}
