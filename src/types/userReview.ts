export type UserReviewType = "clinic" | "salon" | "lodging" | "restaurant" | "product";

export type UserReviewItem = {
  id: string;
  reviewType: UserReviewType;
  placeId: string;
  placeName: string;
  totalRating: number;
  title: string;
  description: string;
  anonymous: boolean;
  source: string;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type PublicClientProfile = {
  id: string;
  displayName?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  profileImage?: string | null;
};
