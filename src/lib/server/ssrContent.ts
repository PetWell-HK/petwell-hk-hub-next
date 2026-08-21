import {
  GET_CLINIC_QUERY,
  transformClinic,
  type ApiClinic,
  type Clinic,
} from "@/services/clinicApi";
import {
  GET_ORGANIZED_EVENT_QUERY,
  type OrganizedEvent,
} from "@/services/eventApi";
import {
  GET_HOME_VISIT_PROVIDER_QUERY,
  LIST_HOME_VISIT_PROVIDERS_QUERY,
  transformHomeVisitProvider,
  type ApiHomeVisitProvider,
  type HomeVisitProvider,
} from "@/services/homeVisitApi";
import {
  GET_LODGING_QUERY,
  transformLodging,
  type ApiLodging,
  type Lodging,
} from "@/services/lodgingApi";
import {
  GET_MALL_QUERY,
  LIST_MALLS_QUERY,
  transformMall,
  type ApiMall,
  type Mall,
} from "@/services/mallApi";
import { getPlaceSearchQueryConfig, type PlaceSearchType } from "@/services/placeSearchConfig";
import { applyPlaceDistrictSearchVariables, getPlaceSearchRegionParam } from "@/services/placeSearchUtils";
import {
  GET_RESTAURANT_QUERY,
  GET_RESTAURANT_QUERY_LEGACY,
  GET_RESTAURANT_QUERY_WITHOUT_PARTNER_REPLY,
  RESTAURANT_SEARCH_PAGE_SIZE,
  transformRestaurant,
  type ApiRestaurant,
  type Restaurant,
} from "@/services/restaurantApi";
import {
  GET_SALON_QUERY,
  transformSalon,
  type ApiSalon,
  type Salon,
} from "@/services/salonApi";
import { PRICE_REVIEW_API_URL } from "@/config/priceReview";
import { getPublicEnv } from "@/lib/env";
import {
  serverGraphqlFetch,
  serverGraphqlFetchEnvelope,
} from "@/lib/server/graphqlFetch";
import { notFound } from "next/navigation";
import type {
  PriceReviewDetailResponse,
  PriceReviewListResponse,
  PriceReviewProductSummary,
} from "@/types/priceReview";
import { isDevListing, shouldIncludeDevListings } from "@/utils/devListings";
import { sortPremiumFirst, pickFeaturedWithPremiumFirst } from "@/utils/partnerPremium";
import {
  isFehdLicensed,
  parseRestaurantExternalMetadata,
} from "@/utils/restaurantExternalMetadata";
import { blogPosts, type BlogPost } from "@/data/blogData";
import { resolveAreaSlug } from "@/data/hongKong18Districts";
import type { ForumPost } from "@/services/forumApi";
import type { HomeRails } from "@/types/homeRails";
import { readFile } from "node:fs/promises";
import path from "node:path";

const LIST_EVENTS_SSR_QUERY = `
  query ListOrganizedEvents($limit: Int, $nextToken: String) {
    listOrganizedEvents(limit: $limit, nextToken: $nextToken) {
      items {
        id
        organizerId
        organizerName
        name
        description
        photos
        dateTime
        deadline
        location
        address
        district
        price
        category
        remark
        i18n
      }
      nextToken
    }
  }
`;

const LIST_FORUM_POSTS_SSR_QUERY = `
  query ListForumPosts($filter: ModelForumPostFilterInput, $limit: Int) {
    listForumPosts(filter: $filter, limit: $limit) {
      items {
        id
        title
        content
        authorId
        tags
        attachments
        likes
        dislikes
        replies
        views
        isPinned
        isLocked
        isDeleted
        category
        location
        createdAt
        updatedAt
        lastReplyAt
        isAnonymous
        anonHash
        authorName
        hotScore
      }
    }
  }
`;

const GET_EVENT_SSR_FALLBACK_QUERY = `
  query GetOrganizedEvent($id: ID!) {
    getOrganizedEvent(id: $id) {
      id
      name
      description
      photos
      dateTime
      deadline
      location
      address
      district
      price
      category
      remark
      i18n
    }
  }
`;

const GET_FORUM_POST_SSR_QUERY = `
  query GetForumPost($id: ID!) {
    getForumPost(id: $id) {
      id
      title
      content
      authorId
      tags
      attachments
      likes
      dislikes
      replies
      views
      isPinned
      isLocked
      isDeleted
      category
      location
      createdAt
      updatedAt
      lastReplyAt
      isAnonymous
      anonHash
      authorName
      hotScore
    }
  }
`;

const HK_CENTER = { lat: 22.3193, lon: 114.1694 };
const SSR_REVALIDATE = 1800;
const LISTING_LANGUAGE = "zh";
const LIST_PAGE_SIZE = 100;
const MAX_LIST_PAGES = 6;

export type PlaceListingPage<T> = {
  items: T[];
  total: number;
  nextToken: number[] | null;
};

export type RestaurantListingPage = {
  restaurants: Restaurant[];
  total: number;
  nextToken: number[] | null;
};

export type SsrEntity<T> =
  | { state: "found"; data: T }
  | { state: "missing" }
  | { state: "unavailable" };

/** 404 only when GraphQL/API proved the entity is gone — never when the fetch itself failed. */
export function unwrapSsrEntity<T>(entity: SsrEntity<T>): T | null {
  if (entity.state === "missing") notFound();
  if (entity.state === "found") return entity.data;
  return null;
}

const keepOrder = <U,>(items: readonly U[]): U[] => [...items];

function finalizeRestaurant(restaurant: ApiRestaurant): ApiRestaurant | null {
  if (isDevListing(restaurant.isDevListing) && !shouldIncludeDevListings()) {
    return null;
  }
  const parsedMeta = parseRestaurantExternalMetadata(restaurant.externalMetadata);
  return {
    ...restaurant,
    externalMetadata: parsedMeta,
    fehdLicensed: restaurant.fehdLicensed === true || isFehdLicensed(parsedMeta),
  };
}

async function fetchGetField<T>(
  key: string,
  queries: string[],
  variables: Record<string, unknown>,
  revalidateSeconds = SSR_REVALIDATE,
): Promise<SsrEntity<T>> {
  let sawConfirmedMissing = false;
  for (const query of queries) {
    const envelope = await serverGraphqlFetchEnvelope<Record<string, T | null>>(
      query,
      variables,
      revalidateSeconds,
    );
    if (!envelope.transportOk || !envelope.data) continue;
    const value = envelope.data[key];
    if (value) return { state: "found", data: value };
    if (envelope.errors && envelope.errors.length > 0) continue;
    sawConfirmedMissing = true;
  }
  return sawConfirmedMissing ? { state: "missing" } : { state: "unavailable" };
}

async function searchPlacePage<TItem>(
  placeType: PlaceSearchType,
  extraVariables: Record<string, unknown> = {},
): Promise<{ items: TItem[]; total: number; nextToken: number[] | null }> {
  const { query, key } = getPlaceSearchQueryConfig(placeType);
  const data = await serverGraphqlFetch<
    Record<string, { items?: TItem[]; total?: number; nextToken?: number[] | null }>
  >(
    query,
    {
      location: HK_CENTER,
      limit: RESTAURANT_SEARCH_PAGE_SIZE,
      sortMethod: "rating-desc",
      ...extraVariables,
    },
    900,
  );
  const payload = data?.[key];
  return {
    items: payload?.items ?? [],
    total: payload?.total ?? 0,
    nextToken: payload?.nextToken ?? null,
  };
}

export async function ssrRestaurant(id: string): Promise<SsrEntity<ApiRestaurant>> {
  const entity = await fetchGetField<ApiRestaurant>(
    "getRestaurant",
    [
      GET_RESTAURANT_QUERY,
      GET_RESTAURANT_QUERY_WITHOUT_PARTNER_REPLY,
      GET_RESTAURANT_QUERY_LEGACY,
    ],
    { id },
  );
  if (entity.state !== "found") return entity;
  const restaurant = finalizeRestaurant(entity.data);
  if (!restaurant) return { state: "missing" };
  return { state: "found", data: restaurant };
}

export async function ssrClinic(id: string): Promise<SsrEntity<ApiClinic>> {
  const entity = await fetchGetField<ApiClinic>("getClinic", [GET_CLINIC_QUERY], { id });
  if (entity.state !== "found") return entity;
  const clinic = entity.data;
  if (clinic.reviews?.items) {
    clinic.reviews.items = clinic.reviews.items.slice(0, 3);
  }
  return { state: "found", data: clinic };
}

export async function ssrSalon(id: string): Promise<SsrEntity<ApiSalon>> {
  const entity = await fetchGetField<ApiSalon>("getSalon", [GET_SALON_QUERY], { id });
  if (entity.state !== "found") return entity;
  const salon = entity.data;
  if (salon.reviews?.items) {
    salon.reviews.items = salon.reviews.items.slice(0, 3);
  }
  return { state: "found", data: salon };
}

export async function ssrLodging(id: string): Promise<SsrEntity<ApiLodging>> {
  return fetchGetField<ApiLodging>("getLodging", [GET_LODGING_QUERY], { id });
}

export async function ssrMall(id: string): Promise<SsrEntity<ApiMall>> {
  const entity = await fetchGetField<ApiMall>("getMall", [GET_MALL_QUERY], { id });
  if (entity.state !== "found") return entity;
  if (entity.data.isDevListing === true) return { state: "missing" };
  return entity;
}

export async function ssrHomeVisit(id: string): Promise<SsrEntity<ApiHomeVisitProvider>> {
  return fetchGetField<ApiHomeVisitProvider>(
    "getHomeVisitProvider",
    [GET_HOME_VISIT_PROVIDER_QUERY],
    { id },
  );
}

export async function ssrRestaurantListing(
  language: string = LISTING_LANGUAGE,
  extraVariables: Record<string, unknown> = {},
): Promise<RestaurantListingPage | null> {
  const page = await searchPlacePage<ApiRestaurant>("restaurant", {
    verified: true,
    ...extraVariables,
  });
  if (page.items.length === 0 && page.total === 0) return null;
  const restaurants = page.items
    .filter((item) => shouldIncludeDevListings() || !isDevListing(item.isDevListing))
    .map((item) => transformRestaurant(item, language));
  return {
    restaurants,
    total: page.total,
    nextToken: page.nextToken,
  };
}

export async function ssrRestaurantListingForArea(
  areaSlug: string,
  language: string = LISTING_LANGUAGE,
): Promise<RestaurantListingPage | null> {
  const area = resolveAreaSlug(areaSlug);
  if (!area || area.type === "index") {
    return ssrRestaurantListing(language);
  }
  if (area.type === "region") {
    const variables: Record<string, unknown> = {};
    applyPlaceDistrictSearchVariables(variables, {
      region: getPlaceSearchRegionParam(area.region.filterRegion),
    });
    return ssrRestaurantListing(language, variables);
  }
  const zhFilterValues = area.district.filterValues.filter((value) =>
    /[\u4e00-\u9fff]/.test(value),
  );
  const districts = zhFilterValues.length > 0 ? zhFilterValues : [area.district.labelZh];
  const variables: Record<string, unknown> = {};
  applyPlaceDistrictSearchVariables(variables, {
    district: districts.length === 1 ? districts[0] : undefined,
    districts: districts.length > 1 ? districts : undefined,
  });
  return ssrRestaurantListing(language, variables);
}

export async function ssrClinicListing(
  language: string = LISTING_LANGUAGE,
): Promise<{ clinics: Clinic[]; total: number; nextToken: number[] | null } | null> {
  const page = await searchPlacePage<ApiClinic>("clinic");
  if (page.items.length === 0 && page.total === 0) return null;
  const clinics = sortPremiumFirst(
    page.items
      .filter((clinic): clinic is ApiClinic => Boolean(clinic?.id))
      .map((clinic) => transformClinic(clinic, language)),
  );
  return { clinics, total: page.total, nextToken: page.nextToken };
}

export async function ssrSalonListing(
  language: string = LISTING_LANGUAGE,
): Promise<{ salons: Salon[]; total: number; nextToken: number[] | null } | null> {
  const page = await searchPlacePage<ApiSalon>("salon");
  if (page.items.length === 0 && page.total === 0) return null;
  const salons = sortPremiumFirst(
    page.items
      .filter((salon): salon is ApiSalon => Boolean(salon?.id))
      .map((salon) => transformSalon(salon, language)),
  );
  return { salons, total: page.total, nextToken: page.nextToken };
}

export async function ssrLodgingListing(
  language: string = LISTING_LANGUAGE,
): Promise<{ lodgings: Lodging[]; total: number; nextToken: number[] | null } | null> {
  const page = await searchPlacePage<ApiLodging>("lodging");
  if (page.items.length === 0 && page.total === 0) return null;
  const lodgings = sortPremiumFirst(
    page.items
      .filter((item): item is ApiLodging => Boolean(item?.id))
      .map((item) => transformLodging(item, language)),
  );
  return { lodgings, total: page.total, nextToken: page.nextToken };
}

async function paginateList<T>(
  query: string,
  key: string,
  takeItems: (payload: { items?: Array<T | null>; nextToken?: string | null }) => T[],
): Promise<T[]> {
  const allItems: T[] = [];
  let nextToken: string | null = null;
  for (let page = 0; page < MAX_LIST_PAGES; page += 1) {
    const data = await serverGraphqlFetch<
      Record<string, { items?: Array<T | null>; nextToken?: string | null }>
    >(query, { limit: LIST_PAGE_SIZE, nextToken }, 900);
    const payload = data?.[key];
    if (!payload) break;
    allItems.push(...takeItems(payload));
    nextToken = payload.nextToken ?? null;
    if (!nextToken) break;
  }
  return allItems;
}

export async function ssrMalls(language: string = LISTING_LANGUAGE): Promise<Mall[] | null> {
  const items = await paginateList<ApiMall>(LIST_MALLS_QUERY, "listMalls", (payload) =>
    (payload.items ?? []).filter((mall): mall is ApiMall => Boolean(mall?.id)),
  );
  if (items.length === 0) return null;
  return items
    .filter((mall) => mall.isDevListing !== true)
    .map((mall) => transformMall(mall, language));
}

export async function ssrHomeVisits(
  language: string = LISTING_LANGUAGE,
): Promise<HomeVisitProvider[] | null> {
  const items = await paginateList<ApiHomeVisitProvider>(
    LIST_HOME_VISIT_PROVIDERS_QUERY,
    "listHomeVisitProviders",
    (payload) =>
      (payload.items ?? []).filter((item): item is ApiHomeVisitProvider => Boolean(item?.id)),
  );
  if (items.length === 0) return null;
  return items.map((item) => transformHomeVisitProvider(item, language));
}

export async function ssrForumPost(id: string): Promise<SsrEntity<ForumPost>> {
  const entity = await fetchGetField<ForumPost>(
    "getForumPost",
    [GET_FORUM_POST_SSR_QUERY],
    { id },
    600,
  );
  if (entity.state !== "found") return entity;
  const post = entity.data;
  if (post.isDeleted) return { state: "missing" };
  if (post.isAnonymous) {
    post.authorId = "";
    post.author = undefined;
  }
  return { state: "found", data: post };
}

export async function ssrEvent(id: string): Promise<SsrEntity<OrganizedEvent>> {
  const full = await fetchGetField<OrganizedEvent>(
    "getOrganizedEvent",
    [GET_ORGANIZED_EVENT_QUERY],
    { id },
  );
  if (full.state === "found" && full.data.id) return full;
  if (full.state === "missing") return full;

  const slim = await fetchGetField<OrganizedEvent>(
    "getOrganizedEvent",
    [GET_EVENT_SSR_FALLBACK_QUERY],
    { id },
  );
  if (slim.state !== "found") return slim;
  const event = slim.data;
  if (!event.id || !event.name) return { state: "missing" };
  return {
    state: "found",
    data: {
      id: event.id,
      name: event.name,
      description: event.description,
      photos: event.photos || [],
      dateTime: event.dateTime,
      deadline: event.deadline,
      location: event.location,
      address: event.address,
      district: event.district,
      price: event.price,
      category: event.category,
      remark: event.remark,
      i18n: event.i18n,
      paymentRequired: null,
      createdAt: "",
      updatedAt: "",
    },
  };
}

export function ssrBlogPost(slug: string): BlogPost | null {
  return blogPosts.find((post) => post.slug === slug) ?? null;
}

export async function ssrNutritionProduct(
  id: string,
): Promise<SsrEntity<Record<string, unknown>>> {
  try {
    const file = path.join(process.cwd(), "public", "data", "nutrition-products.json");
    const raw = await readFile(file, "utf8");
    const products = JSON.parse(raw) as Array<Record<string, unknown> & { id: string }>;
    const product = products.find((item) => item.id === id);
    if (!product) return { state: "missing" };
    return { state: "found", data: product };
  } catch {
    return { state: "unavailable" };
  }
}

function priceApiBase(): string {
  const fromEnv = getPublicEnv("VITE_PRICE_REVIEW_API_URL") || PRICE_REVIEW_API_URL;
  return fromEnv.replace(/\/$/, "");
}

export async function ssrReviewProduct(
  id: string,
): Promise<SsrEntity<PriceReviewDetailResponse>> {
  try {
    const response = await fetch(`${priceApiBase()}/products/${encodeURIComponent(id)}`, {
      headers: { accept: "application/json" },
      next: { revalidate: SSR_REVALIDATE },
    });
    if (response.status === 404) return { state: "missing" };
    if (!response.ok) return { state: "unavailable" };
    return { state: "found", data: (await response.json()) as PriceReviewDetailResponse };
  } catch {
    return { state: "unavailable" };
  }
}

export async function ssrForumListing(limit = 50): Promise<ForumPost[] | null> {
  const data = await serverGraphqlFetch<{ listForumPosts: { items?: Array<ForumPost | null> } }>(
    LIST_FORUM_POSTS_SSR_QUERY,
    { filter: { isDeleted: { ne: true } }, limit },
    600,
  );
  const posts = (data?.listForumPosts?.items ?? [])
    .filter((post): post is ForumPost => Boolean(post?.id) && !post.isDeleted)
    .map((post) =>
      post.isAnonymous ? { ...post, authorId: "", author: undefined } : post,
    );
  if (!data) return null;
  return posts.sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    const aTime = a.lastReplyAt || a.createdAt || "";
    const bTime = b.lastReplyAt || b.createdAt || "";
    return new Date(bTime).getTime() - new Date(aTime).getTime();
  });
}

export async function ssrEventListing(limit = 100): Promise<OrganizedEvent[] | null> {
  const data = await serverGraphqlFetch<{
    listOrganizedEvents: { items?: Array<OrganizedEvent | null> };
  }>(LIST_EVENTS_SSR_QUERY, { limit }, 900);
  if (!data) return null;
  return (data.listOrganizedEvents?.items ?? [])
    .filter((event): event is OrganizedEvent => Boolean(event?.id && event.name))
    .map((event) => ({
      ...event,
      photos: event.photos || [],
      createdAt: event.createdAt || "",
      updatedAt: event.updatedAt || "",
    }));
}

async function ssrReviewListing(limit = 12): Promise<PriceReviewProductSummary[]> {
  try {
    const response = await fetch(`${priceApiBase()}/products?limit=${limit}`, {
      headers: { accept: "application/json" },
      next: { revalidate: 900 },
    });
    if (!response.ok) return [];
    const json = (await response.json()) as PriceReviewListResponse;
    return json.items ?? [];
  } catch {
    return [];
  }
}

export async function ssrHomeRails(): Promise<HomeRails | null> {
  const [
    restaurantPage,
    clinicPage,
    salonPage,
    lodgingPage,
    events,
    forumPosts,
    reviews,
  ] = await Promise.all([
    ssrRestaurantListing(),
    ssrClinicListing(),
    ssrSalonListing(),
    ssrLodgingListing(),
    ssrEventListing(20),
    ssrForumListing(20),
    ssrReviewListing(12),
  ]);

  const rails: HomeRails = {
    restaurants: pickFeaturedWithPremiumFirst(
      (restaurantPage?.restaurants ?? []).filter((item) => item.verified),
      8,
      keepOrder,
    ),
    clinics: pickFeaturedWithPremiumFirst(
      (clinicPage?.clinics ?? []).filter((clinic) => clinic.hasData),
      8,
      keepOrder,
    ),
    salons: pickFeaturedWithPremiumFirst(salonPage?.salons ?? [], 8, keepOrder),
    lodgings: pickFeaturedWithPremiumFirst(lodgingPage?.lodgings ?? [], 8, keepOrder),
    events: (events ?? [])
      .filter((event) => event.dateTime)
      .sort(
        (a, b) =>
          new Date(a.dateTime || 0).getTime() - new Date(b.dateTime || 0).getTime(),
      )
      .slice(0, 8),
    forumPosts: (forumPosts ?? []).slice(0, 4),
    reviews: [...reviews].slice(0, 8),
  };

  const hasContent =
    rails.restaurants.length > 0 ||
    rails.clinics.length > 0 ||
    rails.salons.length > 0 ||
    rails.lodgings.length > 0 ||
    rails.events.length > 0 ||
    rails.forumPosts.length > 0 ||
    rails.reviews.length > 0;
  return hasContent ? rails : null;
}
