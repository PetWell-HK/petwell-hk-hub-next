import type { MetadataRoute } from "next";
import { blogPosts } from "@/data/blogData";
import { SITE_URL } from "@/lib/seo";
import { serverGraphqlFetch } from "@/lib/server/graphqlFetch";

const staticRoutes: Array<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}> = [
  { path: "/", changeFrequency: "daily", priority: 1 },
  { path: "/restaurants", changeFrequency: "daily", priority: 0.95 },
  { path: "/pet-friendly-restaurants-hk", changeFrequency: "daily", priority: 0.9 },
  { path: "/clinics", changeFrequency: "daily", priority: 0.9 },
  { path: "/home-visits", changeFrequency: "weekly", priority: 0.85 },
  { path: "/salons", changeFrequency: "weekly", priority: 0.85 },
  { path: "/lodging", changeFrequency: "weekly", priority: 0.85 },
  { path: "/malls", changeFrequency: "weekly", priority: 0.85 },
  { path: "/forum", changeFrequency: "hourly", priority: 0.85 },
  { path: "/pet-activities", changeFrequency: "daily", priority: 0.8 },
  { path: "/review", changeFrequency: "daily", priority: 0.8 },
  { path: "/nutrition", changeFrequency: "weekly", priority: 0.8 },
  { path: "/nametag", changeFrequency: "weekly", priority: 0.85 },
  { path: "/anti-lost-dog-tag-hk", changeFrequency: "weekly", priority: 0.8 },
  { path: "/fang-zou-shi-gou-pai", changeFrequency: "weekly", priority: 0.75 },
  { path: "/owner-zone", changeFrequency: "weekly", priority: 0.75 },
  { path: "/ngos", changeFrequency: "monthly", priority: 0.7 },
  { path: "/about", changeFrequency: "monthly", priority: 0.6 },
  { path: "/other-services", changeFrequency: "monthly", priority: 0.6 },
  { path: "/petwell-member", changeFrequency: "monthly", priority: 0.65 },
  { path: "/pet-matchmaker", changeFrequency: "monthly", priority: 0.65 },
  { path: "/rainy-day-pet-friendly-indoor-hong-kong", changeFrequency: "monthly", priority: 0.8 },
  { path: "/blog/hong-kong-dog-trainer-licence-guide", changeFrequency: "monthly", priority: 0.75 },
  { path: "/download", changeFrequency: "monthly", priority: 0.7 },
  { path: "/vendor-application", changeFrequency: "monthly", priority: 0.5 },
];

const RESTAURANT_IDS_QUERY = `
  query DynamoRestaurantSearch($location: LocationInput!, $limit: Int, $sortMethod: String, $verified: Boolean) {
    dynamoRestaurantSearch(location: $location, limit: $limit, sortMethod: $sortMethod, verified: $verified) {
      items { id }
    }
  }
`;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${SITE_URL}${route.path}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const blogEntries: MetadataRoute.Sitemap = blogPosts.map((post) => {
    const slug = post.slug.replace(/^blog\//, "");
    return {
      url: `${SITE_URL}/${slug}`,
      lastModified: post.date ? new Date(post.date) : now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    };
  });

  const restaurantData = await serverGraphqlFetch<{
    dynamoRestaurantSearch?: { items?: Array<{ id: string }> };
  }>(
    RESTAURANT_IDS_QUERY,
    {
      location: { lat: 22.3193, lon: 114.1694 },
      limit: 200,
      sortMethod: "DISTANCE",
      verified: true,
    },
    86400,
  );

  const restaurantEntries: MetadataRoute.Sitemap = (
    restaurantData?.dynamoRestaurantSearch?.items || []
  ).map((item) => ({
    url: `${SITE_URL}/restaurants/${item.id}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...staticEntries, ...blogEntries, ...restaurantEntries];
}
