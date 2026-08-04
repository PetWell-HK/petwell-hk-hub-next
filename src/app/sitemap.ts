import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

const staticRoutes: Array<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}> = [
  { path: "/", changeFrequency: "daily", priority: 1 },
  { path: "/restaurants", changeFrequency: "daily", priority: 0.95 },
  { path: "/pet-friendly-restaurants-hk", changeFrequency: "daily", priority: 0.9 },
  { path: "/clinics", changeFrequency: "daily", priority: 0.9 },
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
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return staticRoutes.map((route) => ({
    url: `${SITE_URL}${route.path}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
    alternates: {
      languages: {
        "zh-HK": `${SITE_URL}${route.path}`,
        en: `${SITE_URL}${route.path}`,
      },
    },
  }));
}
