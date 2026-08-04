export type PlaceReviewType = "restaurant" | "clinic" | "salon" | "lodging";

export type PlaceReview = {
  id: string;
  reviewerId?: string | null;
  reviewer?: {
    id?: string | null;
    displayName?: string | null;
    firstName?: string | null;
    profileImage?: string | null;
  } | null;
  title?: string | null;
  description: string;
  environmentRating: number;
  serviceRating: number;
  personnelRating: number;
  waitingRating: number;
  valueRating: number;
  totalRating: number;
  fileAttachments?: string[] | null;
  anonymous?: boolean | null;
  restaurantId?: string | null;
  clinicId?: string | null;
  salonId?: string | null;
  lodgingId?: string | null;
  source?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type CreatePlaceReviewInput = {
  reviewerId: string;
  placeType: PlaceReviewType;
  placeId: string;
  title?: string | null;
  description: string;
  environmentRating: number;
  serviceRating: number;
  personnelRating: number;
  waitingRating: number;
  valueRating: number;
  totalRating: number;
  anonymous?: boolean;
  fileAttachments?: string[];
};
