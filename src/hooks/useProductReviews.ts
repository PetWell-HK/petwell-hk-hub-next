import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createProductReview,
  deleteProductReview,
  listProductReviews,
  updateProductReview,
  type CreateProductReviewInput,
} from "@/services/productReviewApi";

export function useProductReviews(productId: string | undefined) {
  return useInfiniteQuery({
    queryKey: ["productReviews", productId],
    queryFn: ({ pageParam }) =>
      listProductReviews(productId!, { limit: 20, nextToken: pageParam }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextToken ?? undefined,
    enabled: Boolean(productId),
  });
}

export function useCreateProductReview(productId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateProductReviewInput) => createProductReview(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["productReviews", productId] });
      queryClient.invalidateQueries({ queryKey: ["priceReviewProduct", productId] });
      queryClient.invalidateQueries({ queryKey: ["priceReviewProducts"] });
    },
  });
}

export function useUpdateProductReview(productId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: {
      input: {
        id: string;
        title?: string | null;
        description: string;
        rating: number;
        anonymous?: boolean;
      };
      oldReviewRating: number;
    }) => updateProductReview(params.input, {
      productId,
      oldReviewRating: params.oldReviewRating,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["productReviews", productId] });
      queryClient.invalidateQueries({ queryKey: ["priceReviewProduct", productId] });
      queryClient.invalidateQueries({ queryKey: ["priceReviewProducts"] });
    },
  });
}

export function useDeleteProductReview(productId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: { id: string; reviewRating: number }) =>
      deleteProductReview(params.id, { productId, reviewRating: params.reviewRating }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["productReviews", productId] });
      queryClient.invalidateQueries({ queryKey: ["priceReviewProduct", productId] });
      queryClient.invalidateQueries({ queryKey: ["priceReviewProducts"] });
    },
  });
}

export function useProductReviewsSummary(productId: string | undefined) {
  return useQuery({
    queryKey: ["productReviewsSummary", productId],
    queryFn: () => listProductReviews(productId!, { limit: 50 }),
    enabled: Boolean(productId),
    staleTime: 60_000,
  });
}
