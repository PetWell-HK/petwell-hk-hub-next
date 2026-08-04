import { graphqlQuery } from "@/services/graphqlClient";
import { listPriceReviewProducts } from "@/services/priceReviewApi";
import type { PublicClientProfile, UserReviewItem, UserReviewType } from "@/types/userReview";
import { isExternalReviewSource } from "@/utils/reviewDisplay";

const REVIEW_FETCH_LIMIT = 50;

const PLACE_FIELDS = `
  id
  reviewerId
  title
  description
  environmentRating
  serviceRating
  personnelRating
  waitingRating
  valueRating
  totalRating
  fileAttachments
  anonymous
  source
  createdAt
  updatedAt
`;

// byReviewerId indexes have no sort key — do not pass sortDirection
// (AppSync rejects with InvalidArgumentsError; mobile omits it too).
const clinicReviewsByReviewerIdQuery = /* GraphQL */ `
  query ClinicReviewsByReviewerId($reviewerId: ID!, $limit: Int) {
    clinicReviewsByReviewerId(reviewerId: $reviewerId, limit: $limit) {
      items {
        ${PLACE_FIELDS}
        clinicId
        clinic { id name { zh en } }
      }
    }
  }
`;

const salonReviewsByReviewerIdQuery = /* GraphQL */ `
  query SalonReviewsByReviewerId($reviewerId: ID!, $limit: Int) {
    salonReviewsByReviewerId(reviewerId: $reviewerId, limit: $limit) {
      items {
        ${PLACE_FIELDS}
        salonId
        salon { id name { zh en } }
      }
    }
  }
`;

const lodgingReviewsByReviewerIdQuery = /* GraphQL */ `
  query LodgingReviewsByReviewerId($reviewerId: ID!, $limit: Int) {
    lodgingReviewsByReviewerId(reviewerId: $reviewerId, limit: $limit) {
      items {
        ${PLACE_FIELDS}
        lodgingId
        lodging { id name { zh en } }
      }
    }
  }
`;

const restaurantReviewsByReviewerIdQuery = /* GraphQL */ `
  query RestaurantReviewsByReviewerId($reviewerId: ID!, $limit: Int) {
    restaurantReviewsByReviewerId(reviewerId: $reviewerId, limit: $limit) {
      items {
        ${PLACE_FIELDS}
        restaurantId
        restaurant { id name { zh en } }
      }
    }
  }
`;

const productReviewsByReviewerIdQuery = /* GraphQL */ `
  query ProductReviewsByReviewerId($reviewerId: ID!, $limit: Int) {
    productReviewsByReviewerId(reviewerId: $reviewerId, limit: $limit) {
      items {
        id
        reviewerId
        productId
        title
        description
        rating
        fileAttachments
        anonymous
        source
        createdAt
        updatedAt
      }
    }
  }
`;

const getClientPublicQuery = /* GraphQL */ `
  query GetClientPublic($id: ID!) {
    getClient(id: $id) {
      id
      displayName
      firstName
      lastName
      profileImage
    }
  }
`;

type MultiLangName = { zh?: string | null; en?: string | null } | string | null | undefined;

function resolveName(name: MultiLangName, language: string): string {
  if (!name) return "";
  if (typeof name === "string") return name;
  if (language.startsWith("zh")) return name.zh || name.en || "";
  return name.en || name.zh || "";
}

function normalizePlaceReview(
  item: any,
  reviewType: Exclude<UserReviewType, "product">,
  placeIdKey: string,
  placeKey: string,
  language: string,
): UserReviewItem | null {
  if (!item?.id) return null;
  return {
    id: item.id,
    reviewType,
    placeId: item[placeIdKey],
    placeName: resolveName(item[placeKey]?.name, language) || item.title || "",
    totalRating: item.totalRating ?? 0,
    title: item.title || "",
    description: item.description || "",
    anonymous: Boolean(item.anonymous),
    source: item.source || "petwell",
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

async function enrichProductNames(productReviews: any[]): Promise<Record<string, string>> {
  const ids = [...new Set(productReviews.map((r) => r.productId).filter(Boolean))];
  if (ids.length === 0) return {};
  try {
    const result = await listPriceReviewProducts({ ids, limit: ids.length });
    const map: Record<string, string> = {};
    for (const product of result.items || []) {
      if (product?.id) map[product.id] = product.name || "";
    }
    return map;
  } catch (error) {
    console.warn("Failed to enrich product names", error);
    return {};
  }
}

export async function fetchUserReviews(
  reviewerId: string,
  options: { includeAnonymous?: boolean; language?: string } = {},
): Promise<UserReviewItem[]> {
  const includeAnonymous = options.includeAnonymous ?? true;
  const language = options.language || "en";
  if (!reviewerId) return [];

  const variables = {
    reviewerId,
    limit: REVIEW_FETCH_LIMIT,
  };

  // Match the mobile app: one failing review-type query must not wipe the whole list.
  const settled = await Promise.allSettled([
    graphqlQuery<{ clinicReviewsByReviewerId: { items: any[] } }>(clinicReviewsByReviewerIdQuery, variables, { authMode: "apiKey" }),
    graphqlQuery<{ salonReviewsByReviewerId: { items: any[] } }>(salonReviewsByReviewerIdQuery, variables, { authMode: "apiKey" }),
    graphqlQuery<{ lodgingReviewsByReviewerId: { items: any[] } }>(lodgingReviewsByReviewerIdQuery, variables, { authMode: "apiKey" }),
    graphqlQuery<{ restaurantReviewsByReviewerId: { items: any[] } }>(restaurantReviewsByReviewerIdQuery, variables, { authMode: "apiKey" }),
    graphqlQuery<{ productReviewsByReviewerId: { items: any[] } }>(productReviewsByReviewerIdQuery, variables, { authMode: "apiKey" }),
  ]);

  const [clinicRes, salonRes, lodgingRes, restaurantRes, productRes] = settled.map((result) =>
    result.status === "fulfilled" ? (result.value as any) : null,
  ) as any[];

  const productItems = productRes?.productReviewsByReviewerId?.items || [];
  const productNameById = await enrichProductNames(productItems);

  const reviews: UserReviewItem[] = [
    ...(clinicRes?.clinicReviewsByReviewerId?.items || []).map((item) =>
      normalizePlaceReview(item, "clinic", "clinicId", "clinic", language),
    ),
    ...(salonRes?.salonReviewsByReviewerId?.items || []).map((item) =>
      normalizePlaceReview(item, "salon", "salonId", "salon", language),
    ),
    ...(lodgingRes?.lodgingReviewsByReviewerId?.items || []).map((item) =>
      normalizePlaceReview(item, "lodging", "lodgingId", "lodging", language),
    ),
    ...(restaurantRes?.restaurantReviewsByReviewerId?.items || []).map((item) =>
      normalizePlaceReview(item, "restaurant", "restaurantId", "restaurant", language),
    ),
    ...productItems.map((item): UserReviewItem | null => {
      if (!item?.id) return null;
      return {
        id: item.id,
        reviewType: "product",
        placeId: item.productId,
        placeName: productNameById[item.productId] || item.title || "",
        totalRating: item.rating ?? 0,
        title: item.title || "",
        description: item.description || "",
        anonymous: Boolean(item.anonymous),
        source: item.source || "petwell",
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      };
    }),
  ].filter((item): item is UserReviewItem => Boolean(item));

  const filtered = includeAnonymous ? reviews : reviews.filter((review) => !review.anonymous);
  filtered.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  return filtered;
}

export async function fetchPublicClient(userId: string): Promise<PublicClientProfile | null> {
  if (!userId) return null;
  const result = await graphqlQuery<{ getClient: PublicClientProfile | null }>(
    getClientPublicQuery,
    { id: userId },
    { authMode: "apiKey" },
  );
  return result.getClient || null;
}

export function getUserReviewHref(review: UserReviewItem): string {
  switch (review.reviewType) {
    case "clinic":
      return `/clinics/${review.placeId}`;
    case "salon":
      return `/salons/${review.placeId}`;
    case "lodging":
      return `/lodging/${review.placeId}`;
    case "restaurant":
      return `/restaurants/${review.placeId}`;
    case "product":
      return `/review/${review.placeId}`;
    default: {
      const _exhaustive: never = review.reviewType;
      return "/";
    }
  }
}

export function canLinkToUserProfile(opts: {
  anonymous?: boolean | null;
  source?: string | null;
  reviewerId?: string | null;
}): boolean {
  if (opts.anonymous) return false;
  if (isExternalReviewSource(opts.source)) return false;
  return Boolean(opts.reviewerId);
}
