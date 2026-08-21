import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";
import { buildDynamicSitemapEntries } from "@/lib/server/sitemapSources";

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
  { path: "/christmas-events-2025", changeFrequency: "weekly", priority: 0.65 },
  { path: "/christmas-dog-mbti-2025", changeFrequency: "monthly", priority: 0.55 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${SITE_URL}${route.path}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const dynamicEntries = await buildDynamicSitemapEntries();
  const merged = [...staticEntries, ...dynamicEntries];
  const seen = new Set<string>();
  return merged.filter((item) => {
    if (seen.has(item.url)) return false;
    seen.add(item.url);
    return true;
  });
}
