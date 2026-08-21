import { PRICE_REVIEW_API_URL } from "@/config/priceReview";
import { christmasEvents } from "@/data/christmasEventData";
import { blogPosts } from "@/data/blogData";
import { ALL_AREA_SEO_SLUGS } from "@/data/hongKong18Districts";
import { ngos } from "@/data/ngoData";
import { getPublicEnv } from "@/lib/env";
import { SITE_URL } from "@/lib/seo";
import { getNutritionProductIds } from "@/lib/server/contentMetadata";
import { serverGraphqlFetch } from "@/lib/server/graphqlFetch";
import type { MetadataRoute } from "next";

const HK_LOCATION = { lat: 22.3193, lon: 114.1694 };

type IdItem = { id?: string | null; isDeleted?: boolean | null };

function entry(
  path: string,
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"],
  priority: number,
  lastModified?: Date,
): MetadataRoute.Sitemap[number] {
  return {
    url: `${SITE_URL}${path}`,
    lastModified: lastModified ?? new Date(),
    changeFrequency,
    priority,
  };
}

async function paginateSearchIds(
  query: string,
  key: string,
  extraVars: Record<string, unknown> = {},
  pages = 8,
): Promise<string[]> {
  const ids: string[] = [];
  let nextToken: unknown = undefined;
  for (let i = 0; i < pages; i += 1) {
    const data = await serverGraphqlFetch<
      Record<string, { items?: IdItem[]; nextToken?: unknown } | null>
    >(
      query,
      {
        location: HK_LOCATION,
        limit: 500,
        sortMethod: "DISTANCE",
        nextToken,
        ...extraVars,
      },
      86400,
    );
    const page = data?.[key];
    const items = page?.items || [];
    for (const item of items) {
      if (item?.id) ids.push(item.id);
    }
    nextToken = page?.nextToken;
    if (!nextToken || items.length === 0) break;
  }
  return [...new Set(ids)];
}

async function paginateListIds(query: string, key: string, pages = 8): Promise<string[]> {
  const ids: string[] = [];
  let nextToken: string | null = null;
  for (let i = 0; i < pages; i += 1) {
    const data = await serverGraphqlFetch<
      Record<string, { items?: IdItem[]; nextToken?: string | null } | null>
    >(query, { limit: 200, nextToken }, 86400);
    const page = data?.[key];
    const items = page?.items || [];
    for (const item of items) {
      if (item?.id && !item.isDeleted) ids.push(item.id);
    }
    nextToken = page?.nextToken ?? null;
    if (!nextToken || items.length === 0) break;
  }
  return [...new Set(ids)];
}

const RESTAURANT_IDS_QUERY = `
  query DynamoRestaurantSearch($location: LocationInput!, $limit: Int, $sortMethod: String, $verified: Boolean, $nextToken: [Float]) {
    dynamoRestaurantSearch(location: $location, limit: $limit, sortMethod: $sortMethod, verified: $verified, nextToken: $nextToken) {
      items { id }
      nextToken
    }
  }
`;

const CLINIC_IDS_QUERY = `
  query DynamoClinicSearch($location: LocationInput!, $limit: Int, $sortMethod: String, $nextToken: [Float]) {
    dynamoClinicSearch(location: $location, limit: $limit, sortMethod: $sortMethod, nextToken: $nextToken) {
      items { id }
      nextToken
    }
  }
`;

const SALON_IDS_QUERY = `
  query DynamoSalonSearch($location: LocationInput!, $limit: Int, $sortMethod: String, $nextToken: [Float]) {
    dynamoSalonSearch(location: $location, limit: $limit, sortMethod: $sortMethod, nextToken: $nextToken) {
      items { id }
      nextToken
    }
  }
`;

const LODGING_IDS_QUERY = `
  query DynamoLodgingSearch($location: LocationInput!, $limit: Int, $sortMethod: String, $nextToken: [Float]) {
    dynamoLodgingSearch(location: $location, limit: $limit, sortMethod: $sortMethod, nextToken: $nextToken) {
      items { id }
      nextToken
    }
  }
`;

const LIST_MALLS_QUERY = `
  query ListMalls($limit: Int, $nextToken: String) {
    listMalls(limit: $limit, nextToken: $nextToken) {
      items { id }
      nextToken
    }
  }
`;

const LIST_HOME_VISITS_QUERY = `
  query ListHomeVisitProviders($limit: Int, $nextToken: String) {
    listHomeVisitProviders(limit: $limit, nextToken: $nextToken) {
      items { id }
      nextToken
    }
  }
`;

const LIST_EVENTS_QUERY = `
  query ListOrganizedEvents($limit: Int, $nextToken: String) {
    listOrganizedEvents(limit: $limit, nextToken: $nextToken) {
      items { id }
      nextToken
    }
  }
`;

const LIST_FORUM_QUERY = `
  query ListForumPosts($limit: Int) {
    listForumPosts(limit: $limit) {
      items { id isDeleted }
    }
  }
`;

async function fetchPriceReviewIds(): Promise<string[]> {
  const base = (getPublicEnv("VITE_PRICE_REVIEW_API_URL") || PRICE_REVIEW_API_URL).replace(
    /\/$/,
    "",
  );
  const ids: string[] = [];
  let cursor: string | null = null;
  for (let i = 0; i < 10; i += 1) {
    const params = new URLSearchParams({ limit: "100" });
    if (cursor) params.set("cursor", cursor);
    try {
      const response = await fetch(`${base}/products?${params.toString()}`, {
        headers: { accept: "application/json" },
        next: { revalidate: 86400 },
      });
      if (!response.ok) break;
      const json = (await response.json()) as {
        items?: Array<{ id?: string }>;
        nextCursor?: string | null;
      };
      for (const item of json.items || []) {
        if (item.id) ids.push(item.id);
      }
      cursor = json.nextCursor ?? null;
      if (!cursor || !(json.items || []).length) break;
    } catch {
      break;
    }
  }
  return [...new Set(ids)];
}

export async function buildDynamicSitemapEntries(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const [
    restaurantIds,
    clinicIds,
    salonIds,
    lodgingIds,
    mallIds,
    homeVisitIds,
    eventIds,
    forumIds,
    reviewIds,
    nutritionIds,
  ] = await Promise.all([
    paginateSearchIds(RESTAURANT_IDS_QUERY, "dynamoRestaurantSearch", { verified: true }),
    paginateSearchIds(CLINIC_IDS_QUERY, "dynamoClinicSearch"),
    paginateSearchIds(SALON_IDS_QUERY, "dynamoSalonSearch"),
    paginateSearchIds(LODGING_IDS_QUERY, "dynamoLodgingSearch"),
    paginateListIds(LIST_MALLS_QUERY, "listMalls"),
    paginateListIds(LIST_HOME_VISITS_QUERY, "listHomeVisitProviders"),
    paginateListIds(LIST_EVENTS_QUERY, "listOrganizedEvents"),
    paginateListIds(LIST_FORUM_QUERY, "listForumPosts", 3),
    fetchPriceReviewIds(),
    getNutritionProductIds().catch(() => [] as string[]),
  ]);

  const blogEntries = blogPosts.map((post) =>
    entry(`/${post.slug}`, "monthly", 0.7, post.date ? new Date(post.date) : now),
  );
  const areaEntries = ALL_AREA_SEO_SLUGS.map((slug) =>
    entry(`/pet-friendly-restaurants/${slug}`, "weekly", slug === "districts" ? 0.85 : 0.8),
  );
  const ngoEntries = ngos.map((ngo) => entry(`/ngos/${ngo.id}`, "monthly", 0.55));
  const christmasEntries = christmasEvents.map((event) =>
    entry(`/christmas-event/${event.id}`, "weekly", 0.6),
  );

  return [
    ...blogEntries,
    ...areaEntries,
    ...ngoEntries,
    ...christmasEntries,
    ...restaurantIds.map((id) => entry(`/restaurants/${id}`, "weekly", 0.8)),
    ...clinicIds.map((id) => entry(`/clinics/${id}`, "weekly", 0.75)),
    ...salonIds.map((id) => entry(`/salons/${id}`, "weekly", 0.7)),
    ...lodgingIds.map((id) => entry(`/lodging/${id}`, "weekly", 0.7)),
    ...mallIds.map((id) => entry(`/malls/${id}`, "weekly", 0.7)),
    ...homeVisitIds.map((id) => entry(`/home-visits/${id}`, "weekly", 0.7)),
    ...eventIds.map((id) => entry(`/event/${id}`, "daily", 0.65)),
    ...forumIds.map((id) => entry(`/forum/${id}`, "hourly", 0.55)),
    ...reviewIds.map((id) => entry(`/review/${id}`, "daily", 0.7)),
    ...nutritionIds.map((id) => entry(`/nutrition/${id}`, "monthly", 0.6)),
  ];
}
