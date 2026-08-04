import { graphqlQuery } from "@/services/graphqlClient";
import type { ProductReview, ProductReviewListResponse } from "@/types/productReview";

const productReviewsByProductIdWithReviewer = /* GraphQL */ `
  query ProductReviewsByProductIdAndCreatedAt(
    $productId: ID!
    $createdAt: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $limit: Int
    $nextToken: String
  ) {
    productReviewsByProductIdAndCreatedAt(
      productId: $productId
      createdAt: $createdAt
      sortDirection: $sortDirection
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        reviewerId
        reviewer {
          id
          firstName
          lastName
          displayName
          profileImage
        }
        title
        description
        rating
        fileAttachments
        productId
        source
        anonymous
        createdAt
      }
      nextToken
    }
  }
`;

const createProductReviewSimple = /* GraphQL */ `
  mutation CreateProductReview($input: CreateProductReviewInput!) {
    createProductReview(input: $input) {
      id
      reviewerId
      title
      description
      rating
      fileAttachments
      anonymous
      productId
      source
      createdAt
    }
  }
`;

const updateProductReviewSimple = /* GraphQL */ `
  mutation UpdateProductReview($input: UpdateProductReviewInput!) {
    updateProductReview(input: $input) {
      id
      reviewerId
      title
      description
      rating
      fileAttachments
      anonymous
      productId
      source
      createdAt
      updatedAt
    }
  }
`;

const deleteProductReviewSimple = /* GraphQL */ `
  mutation DeleteProductReview($input: DeleteProductReviewInput!) {
    deleteProductReview(input: $input) {
      id
      productId
      rating
    }
  }
`;

const updatePriceProductRatingMutation = /* GraphQL */ `
  mutation UpdatePriceProductRating(
    $productId: ID!
    $reviewRating: Float!
    $delta: Int!
    $oldReviewRating: Float
  ) {
    updatePriceProductRating(
      productId: $productId
      reviewRating: $reviewRating
      delta: $delta
      oldReviewRating: $oldReviewRating
    )
  }
`;

export async function listProductReviews(
  productId: string,
  options?: { limit?: number; nextToken?: string | null },
): Promise<ProductReviewListResponse> {
  const result = await graphqlQuery<{
    productReviewsByProductIdAndCreatedAt: ProductReviewListResponse;
  }>(
    productReviewsByProductIdWithReviewer,
    {
      productId,
      sortDirection: "DESC",
      limit: options?.limit ?? 20,
      nextToken: options?.nextToken ?? undefined,
    },
    { authMode: "apiKey" },
  );
  return result.productReviewsByProductIdAndCreatedAt;
}

export type CreateProductReviewInput = {
  reviewerId: string;
  productId: string;
  title?: string | null;
  description: string;
  rating: number;
  anonymous?: boolean;
  fileAttachments?: string[];
};

export async function createProductReview(input: CreateProductReviewInput) {
  const result = await graphqlQuery<{ createProductReview: ProductReview }>(
    createProductReviewSimple,
    {
      input: {
        ...input,
        source: "petwell",
      },
    },
    { authMode: "userPool" },
  );

  updatePriceProductRating({
    productId: input.productId,
    reviewRating: input.rating,
    delta: 1,
  }).catch(() => {});

  return result.createProductReview;
}

export async function updateProductReview(
  input: {
    id: string;
    title?: string | null;
    description: string;
    rating: number;
    anonymous?: boolean;
    fileAttachments?: string[];
  },
  options: { productId: string; oldReviewRating: number },
) {
  const result = await graphqlQuery<{ updateProductReview: ProductReview }>(
    updateProductReviewSimple,
    { input },
    { authMode: "userPool" },
  );

  updatePriceProductRating({
    productId: options.productId,
    reviewRating: input.rating,
    delta: 0,
    oldReviewRating: options.oldReviewRating,
  }).catch(() => {});

  return result.updateProductReview;
}

export async function deleteProductReview(
  id: string,
  options: { productId: string; reviewRating: number },
) {
  const result = await graphqlQuery<{ deleteProductReview: ProductReview }>(
    deleteProductReviewSimple,
    { input: { id } },
    { authMode: "userPool" },
  );

  await updatePriceProductRating({
    productId: options.productId,
    reviewRating: options.reviewRating,
    delta: -1,
  });

  return result.deleteProductReview;
}

export async function updatePriceProductRating(params: {
  productId: string;
  reviewRating: number;
  delta: number;
  oldReviewRating?: number;
}) {
  return graphqlQuery(
    updatePriceProductRatingMutation,
    {
      productId: params.productId,
      reviewRating: params.reviewRating,
      delta: params.delta,
      oldReviewRating: params.oldReviewRating ?? undefined,
    },
    { authMode: "userPool" },
  );
}

export function getProductReviewAuthorName(
  review: ProductReview,
  anonymousLabel = "PetWell 用戶",
): string {
  if (review.anonymous) return anonymousLabel;
  return (
    review.reviewer?.displayName?.trim() ||
    review.reviewer?.firstName?.trim() ||
    anonymousLabel
  );
}
