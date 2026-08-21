import type { Clinic } from "@/services/clinicApi";
import type { OrganizedEvent } from "@/services/eventApi";
import type { Lodging } from "@/services/lodgingApi";
import type { Restaurant } from "@/services/restaurantApi";
import type { Salon } from "@/services/salonApi";
import type { ForumPost } from "@/services/forumApi";
import type { PriceReviewProductSummary } from "@/types/priceReview";

export type HomeRails = {
  restaurants: Restaurant[];
  clinics: Clinic[];
  salons: Salon[];
  lodgings: Lodging[];
  events: OrganizedEvent[];
  forumPosts: ForumPost[];
  reviews: PriceReviewProductSummary[];
};
