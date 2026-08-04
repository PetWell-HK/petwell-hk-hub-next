export type PriceReviewCategory = "food" | "medicine" | "supplies" | "treats" | "unknown";

export type PriceReviewOffer = {
  id: string;
  store: string;
  platform: string;
  price: number;
  markPrice?: number | null;
  shipping: string;
  url: string;
  lastSeenAt?: string | null;
  confidence?: number | null;
  imageUrl?: string | null;
  priceUnit?: string | null;
  unitsInPrice?: number | null;
  unitPrice?: number | null;
  priceUnitLabel?: string | null;
  hasSpecialDiscount?: boolean;
  discountRequirement?: string | null;
  discountAppliesToProduct?: boolean | null;
};

export type PriceReviewProduct = {
  id: string;
  slug?: string;
  name: string;
  brand: string;
  category: PriceReviewCategory;
  image: string;
  size: string;
  description?: string;
  specs?: { label: string; value: string }[];
  offers: PriceReviewOffer[];
  lowestPrice: number;
  highestPrice: number;
  storeCount: number;
  lastUpdated?: string | null;
  avgRating?: number | null;
  numReviews?: number;
};

export type PriceReviewProductSummary = Omit<PriceReviewProduct, "description" | "specs" | "offers"> & {
  topOffers: PriceReviewOffer[];
};

export type PriceReviewListResponse = {
  items: PriceReviewProductSummary[];
  nextCursor?: string | null;
  totalApprox?: number;
  brands: string[];
};

export type PriceReviewDetailResponse = {
  product: PriceReviewProduct;
  related: PriceReviewProductSummary[];
};

export type PriceReviewQuery = {
  search?: string;
  category?: string;
  brand?: string;
  limit?: number;
  cursor?: string | null;
  ids?: string[];
};
