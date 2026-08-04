export type ProductReviewReviewer = {
  id?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  displayName?: string | null;
  profileImage?: string | null;
};

export type ProductReview = {
  id: string;
  reviewerId?: string | null;
  reviewer?: ProductReviewReviewer | null;
  productId: string;
  title?: string | null;
  description: string;
  rating: number;
  fileAttachments?: string[] | null;
  anonymous?: boolean | null;
  source?: string | null;
  createdAt?: string | null;
};

export type ProductReviewListResponse = {
  items: ProductReview[];
  nextToken?: string | null;
};
