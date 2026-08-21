import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Metadata } from "next";
import { christmasEvents, getEventById } from "@/data/christmasEventData";
import { blogPosts, type BlogPost } from "@/data/blogData";
import { ALL_AREA_SEO_SLUGS, resolveAreaSlug } from "@/data/hongKong18Districts";
import { ngos } from "@/data/ngoData";
import { PRICE_REVIEW_API_URL } from "@/config/priceReview";
import { absoluteUrl, breadcrumbJsonLd, buildMetadata, SITE_URL } from "@/lib/seo";
import { formatPrice, getComparablePrice } from "@/lib/priceReviewPricing";
import { getPublicEnv } from "@/lib/env";
import { serverGraphqlFetch } from "@/lib/server/graphqlFetch";
import {
  generateBlogDescription,
  generateBlogFAQ,
  generateBlogKeywords,
  generateBlogStructuredData,
} from "@/utils/blogSEO";
import type { PriceReviewDetailResponse, PriceReviewProduct } from "@/types/priceReview";

const GET_FORUM_POST_QUERY = `
  query GetForumPost($id: ID!) {
    getForumPost(id: $id) {
      id
      title
      content
      authorName
      isAnonymous
      isDeleted
      category
      createdAt
      updatedAt
    }
  }
`;

const GET_EVENT_QUERY = `
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

type ForumPostRecord = {
  id: string;
  title?: string | null;
  content?: string | null;
  authorName?: string | null;
  isAnonymous?: boolean | null;
  isDeleted?: boolean | null;
  category?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

type EventI18n = {
  zh?: Partial<Record<"name" | "description" | "remark" | "address" | "district", string>>;
  en?: Partial<Record<"name" | "description" | "remark" | "address" | "district", string>>;
};

type EventRecord = {
  id: string;
  name?: string | null;
  description?: string | null;
  photos?: string[] | null;
  dateTime?: string | null;
  deadline?: string | null;
  location?: string | null;
  address?: string | null;
  district?: string | null;
  price?: number | null;
  category?: string | null;
  remark?: string | null;
  i18n?: string | EventI18n | null;
};

type NutritionProduct = {
  id: string;
  brand: string;
  name: string;
  summary?: string;
  rating?: number;
};

let nutritionCache: NutritionProduct[] | null = null;

async function loadNutritionProducts(): Promise<NutritionProduct[]> {
  if (nutritionCache) return nutritionCache;
  const file = path.join(process.cwd(), "public", "data", "nutrition-products.json");
  const raw = await readFile(file, "utf8");
  nutritionCache = JSON.parse(raw) as NutritionProduct[];
  return nutritionCache;
}

function priceApiBase(): string {
  const fromEnv = getPublicEnv("VITE_PRICE_REVIEW_API_URL") || PRICE_REVIEW_API_URL;
  return fromEnv.replace(/\/$/, "");
}

function parseEventI18n(value: EventRecord["i18n"]): EventI18n | null {
  if (!value) return null;
  if (typeof value === "object") return value;
  try {
    return JSON.parse(value) as EventI18n;
  } catch {
    return null;
  }
}

function stripBbCode(text: string): string {
  return text
    .replace(/\[\/?[^\]]+\]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function findBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug);
}

export function getBlogSlugs(): string[] {
  return blogPosts.map((post) => post.slug);
}

export function getAreaSlugs(): string[] {
  return ALL_AREA_SEO_SLUGS;
}

export function getNgoIds(): string[] {
  return ngos.map((ngo) => ngo.id);
}

export function getChristmasEventIds(): string[] {
  return christmasEvents.map((event) => event.id);
}

export async function getNutritionProductIds(): Promise<string[]> {
  const products = await loadNutritionProducts();
  return products.map((product) => product.id);
}

export function generateBlogMetadata(slug: string): Metadata {
  const post = findBlogPost(slug);
  if (!post) {
    return buildMetadata({
      title: "文章不存在 | PetWell HK",
      description: "找不到此文章。",
      path: `/${slug}`,
      noIndex: true,
    });
  }

  const title = `${post.title.replace(/\s*[|｜]\s*PetWell HK\s*$/i, "").trim()} | PetWell HK`;
  return buildMetadata({
    title,
    description: generateBlogDescription(post),
    keywords: generateBlogKeywords(post),
    path: `/${slug}`,
    ogImage: post.imageUrl,
    ogType: "article",
    articlePublishedTime: post.date,
    articleModifiedTime: post.date,
    articleAuthor: post.author,
    articleSection: post.category,
    articleTags: post.seoKeywords?.slice(0, 10),
  });
}

export function generateBlogJsonLd(slug: string): object[] | null {
  const post = findBlogPost(slug);
  if (!post) return null;
  const faq = generateBlogFAQ(post);
  const faqSchema =
    faq.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faq.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: { "@type": "Answer", text: item.answer },
          })),
        }
      : null;
  const base = generateBlogStructuredData(post, slug);
  return faqSchema ? [...base, faqSchema] : base;
}

export function blogPostExists(slug: string): boolean {
  return Boolean(findBlogPost(slug));
}

export function generateAreaMetadata(areaSlug: string): Metadata {
  const area = resolveAreaSlug(areaSlug);
  if (!area) {
    return buildMetadata({
      title: "找不到此地區 | PetWell HK",
      description: "此寵物友善餐廳地區頁面不存在。",
      path: `/pet-friendly-restaurants/${areaSlug}`,
      noIndex: true,
    });
  }

  if (area.type === "index") {
    return buildMetadata({
      title: "香港18區寵物友善餐廳 | 按區搜尋帶狗食飯好去處 | PetWell HK",
      description:
        "按香港18區搵寵物友善餐廳。PetWell 提供每區已認證餐廳名單，另可參考食環署獲批食肆。",
      keywords: "18區寵物友善餐廳,香港寵物友善餐廳,按區搵餐廳,帶狗食飯",
      path: "/pet-friendly-restaurants/districts",
    });
  }

  if (area.type === "district") {
    const district = area.district.labelZh;
    const region = area.district.regionLabelZh;
    return buildMetadata({
      title: `${district}寵物友善餐廳 | 帶狗食飯好去處 | PetWell HK`,
      description: `${district}（${region}）寵物友善餐廳指南。搜尋 PetWell 認證可帶寵物用餐嘅餐廳，可篩選室內入座同即場入座。`,
      keywords: `${district}寵物友善餐廳,${district}帶狗餐廳,${region}寵物友善餐廳,帶狗食飯`,
      path: `/pet-friendly-restaurants/${area.district.slug}`,
    });
  }

  const region = area.region.labelZh;
  return buildMetadata({
    title: `${region}寵物友善餐廳 | 帶狗食飯好去處 | PetWell HK`,
    description: `${region}寵物友善餐廳指南。搜尋 PetWell 認證可帶寵物用餐嘅餐廳，覆蓋${region}各區。`,
    keywords: `${region}寵物友善餐廳,${region}帶狗餐廳,pet friendly restaurant ${region}`,
    path: `/pet-friendly-restaurants/${area.region.slug}`,
  });
}

export function generateAreaJsonLd(areaSlug: string): object[] | null {
  const area = resolveAreaSlug(areaSlug);
  if (!area) return null;
  const path = `/pet-friendly-restaurants/${areaSlug}`;
  const name =
    area.type === "index"
      ? "香港18區寵物友善餐廳"
      : area.type === "district"
        ? `${area.district.labelZh}寵物友善餐廳`
        : `${area.region.labelZh}寵物友善餐廳`;
  return [
    breadcrumbJsonLd([
      { name: "首頁", path: "/" },
      { name: "寵物友善餐廳", path: "/restaurants" },
      { name, path },
    ]),
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name,
      url: absoluteUrl(path),
      inLanguage: "zh-HK",
    },
  ];
}

export function areaSlugExists(areaSlug: string): boolean {
  return resolveAreaSlug(areaSlug) !== null;
}

export function generateNgoMetadata(ngoId: string): Metadata {
  const ngo = ngos.find((item) => item.id === ngoId);
  if (!ngo) {
    return buildMetadata({
      title: "找不到此機構 | PetWell HK",
      description: "此動物福利機構頁面不存在。",
      path: `/ngos/${ngoId}`,
      noIndex: true,
    });
  }

  return buildMetadata({
    title: `${ngo.name} | 香港動物NGO | PetWell HK`,
    description: ngo.description.slice(0, 160),
    keywords: `${ngo.name},${ngo.nameEn},香港動物救援,動物福利NGO`,
    path: `/ngos/${ngo.id}`,
    ogImage: ngo.logo || undefined,
  });
}

export function generateNgoJsonLd(ngoId: string): object[] | null {
  const ngo = ngos.find((item) => item.id === ngoId);
  if (!ngo) return null;
  const url = absoluteUrl(`/ngos/${ngo.id}`);
  return [
    breadcrumbJsonLd([
      { name: "首頁", path: "/" },
      { name: "動物NGO", path: "/ngos" },
      { name: ngo.name, path: `/ngos/${ngo.id}` },
    ]),
    {
      "@context": "https://schema.org",
      "@type": "NGO",
      name: ngo.name,
      alternateName: ngo.nameEn,
      description: ngo.description,
      url,
      telephone: ngo.phone,
      email: ngo.email,
      sameAs: ngo.website || undefined,
      address: {
        "@type": "PostalAddress",
        streetAddress: ngo.address,
        addressCountry: "HK",
      },
      foundingDate: ngo.established || undefined,
    },
  ];
}

export function ngoExists(ngoId: string): boolean {
  return ngos.some((item) => item.id === ngoId);
}

export function generateChristmasEventMetadata(eventId: string): Metadata {
  const event = getEventById(eventId);
  if (!event) {
    return buildMetadata({
      title: "找不到此活動 | PetWell HK",
      description: "此聖誕活動頁面不存在。",
      path: `/christmas-event/${eventId}`,
      noIndex: true,
    });
  }

  return buildMetadata({
    title: `${event.name} | 2025 香港狗狗聖誕活動 | PetWell HK`,
    description: `${event.name} — ${event.organiser}聖誕活動。地點：${event.address}。${event.remark.slice(0, 80)}`,
    keywords: `${event.name},${event.organiser},香港聖誕寵物活動,帶狗聖誕`,
    path: `/christmas-event/${event.id}`,
    ogImage: event.imageUrl,
  });
}

export function generateChristmasEventJsonLd(eventId: string): object[] | null {
  const event = getEventById(eventId);
  if (!event) return null;
  const url = absoluteUrl(`/christmas-event/${event.id}`);
  return [
    breadcrumbJsonLd([
      { name: "首頁", path: "/" },
      { name: "2025聖誕活動", path: "/christmas-events-2025" },
      { name: event.name, path: `/christmas-event/${event.id}` },
    ]),
    {
      "@context": "https://schema.org",
      "@type": "Event",
      name: event.name,
      description: event.remark,
      startDate: event.dateStart,
      endDate: event.dateEnd,
      eventStatus: "https://schema.org/EventScheduled",
      eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
      image: event.imageUrl,
      url,
      location: {
        "@type": "Place",
        name: event.organiser,
        address: {
          "@type": "PostalAddress",
          streetAddress: event.address,
          addressLocality: event.district,
          addressCountry: "HK",
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: event.latitude,
          longitude: event.longitude,
        },
      },
      organizer: {
        "@type": "Organization",
        name: event.organiser,
      },
    },
  ];
}

export function christmasEventExists(eventId: string): boolean {
  return Boolean(getEventById(eventId));
}

export async function generateForumMetadata(postId: string): Promise<Metadata> {
  const data = await serverGraphqlFetch<{ getForumPost: ForumPostRecord | null }>(
    GET_FORUM_POST_QUERY,
    { id: postId },
    600,
  );
  const post = data?.getForumPost;
  if (!post || post.isDeleted) {
    return buildMetadata({
      title: "寵物討論區 | 寵物論壇 | PetWell HK",
      description: "香港最活躍寵物討論區。分享養寵經驗、獸醫推薦、寵物美容心得、領養資訊。",
      path: `/forum/${postId}`,
      noIndex: !post,
    });
  }

  const plain = stripBbCode(post.content || "").slice(0, 140);
  const description =
    plain || `${post.authorName || "用戶"} 喺PetWell香港寵物討論區分享：${post.title}`;
  return buildMetadata({
    title: `${post.title} | PetWell 香港寵物討論區`,
    description,
    keywords: `${post.title},寵物討論區,寵物論壇,香港寵物,PetWell`,
    path: `/forum/${post.id}`,
    ogType: "article",
    articlePublishedTime: post.createdAt || undefined,
    articleModifiedTime: post.updatedAt || post.createdAt || undefined,
    articleAuthor: post.isAnonymous ? "匿名用戶" : post.authorName || "用戶",
    articleSection: post.category || "寵物論壇",
  });
}

export async function generateForumJsonLd(postId: string): Promise<object[] | null> {
  const data = await serverGraphqlFetch<{ getForumPost: ForumPostRecord | null }>(
    GET_FORUM_POST_QUERY,
    { id: postId },
    600,
  );
  const post = data?.getForumPost;
  if (!post || post.isDeleted) return null;
  const url = absoluteUrl(`/forum/${post.id}`);
  const plain = stripBbCode(post.content || "");
  return [
    breadcrumbJsonLd([
      { name: "首頁", path: "/" },
      { name: "寵物論壇", path: "/forum" },
      { name: post.title || "討論", path: `/forum/${post.id}` },
    ]),
    {
      "@context": "https://schema.org",
      "@type": "DiscussionForumPosting",
      headline: post.title,
      text: plain.slice(0, 5000),
      url,
      datePublished: post.createdAt || undefined,
      dateModified: post.updatedAt || post.createdAt || undefined,
      author: {
        "@type": "Person",
        name: post.isAnonymous ? "匿名用戶" : post.authorName || "用戶",
      },
      publisher: {
        "@type": "Organization",
        name: "PetWell HK Limited",
        url: SITE_URL,
      },
    },
  ];
}

export async function generateEventMetadata(eventId: string): Promise<Metadata> {
  const data = await serverGraphqlFetch<{ getOrganizedEvent: EventRecord | null }>(
    GET_EVENT_QUERY,
    { id: eventId },
    1800,
  );
  const event = data?.getOrganizedEvent;
  const i18n = parseEventI18n(event?.i18n);
  const name = i18n?.zh?.name || event?.name || "寵物活動";
  const description =
    i18n?.zh?.description ||
    event?.description ||
    event?.remark ||
    "查看香港寵物活動詳情、時間與地點。";
  const image = event?.photos?.[0];

  if (!event) {
    return buildMetadata({
      title: "寵物活動詳情 | PetWell HK",
      description: "查看香港寵物活動詳情。",
      path: `/event/${eventId}`,
    });
  }

  return buildMetadata({
    title: `${name} | 香港寵物活動 | PetWell HK`,
    description: description.slice(0, 160),
    keywords: `${name},香港寵物活動,帶寵物活動,PetWell`,
    path: `/event/${event.id}`,
    ogImage: image,
  });
}

export async function generateEventJsonLd(eventId: string): Promise<object[] | null> {
  const data = await serverGraphqlFetch<{ getOrganizedEvent: EventRecord | null }>(
    GET_EVENT_QUERY,
    { id: eventId },
    1800,
  );
  const event = data?.getOrganizedEvent;
  if (!event) return null;
  const i18n = parseEventI18n(event.i18n);
  const name = i18n?.zh?.name || event.name || "寵物活動";
  const description = i18n?.zh?.description || event.description || event.remark || name;
  const url = absoluteUrl(`/event/${event.id}`);
  return [
    breadcrumbJsonLd([
      { name: "首頁", path: "/" },
      { name: "寵物活動", path: "/pet-activities" },
      { name, path: `/event/${event.id}` },
    ]),
    {
      "@context": "https://schema.org",
      "@type": "Event",
      name,
      description,
      startDate: event.dateTime || undefined,
      endDate: event.deadline || undefined,
      image: event.photos?.[0],
      url,
      location: {
        "@type": "Place",
        name: event.location || name,
        address: {
          "@type": "PostalAddress",
          streetAddress: event.address || event.location || undefined,
          addressLocality: event.district || "Hong Kong",
          addressCountry: "HK",
        },
      },
      offers:
        event.price != null
          ? {
              "@type": "Offer",
              price: event.price,
              priceCurrency: "HKD",
              url,
            }
          : undefined,
    },
  ];
}

export async function generateReviewProductMetadata(productId: string): Promise<Metadata> {
  try {
    const response = await fetch(
      `${priceApiBase()}/products/${encodeURIComponent(productId)}`,
      { headers: { accept: "application/json" }, next: { revalidate: 1800 } },
    );
    if (!response.ok) {
      return buildMetadata({
        title: "產品比較 | PetWell HK",
        description: "比較香港寵物食品與用品價格。",
        path: `/review/${productId}`,
      });
    }
    const data = (await response.json()) as PriceReviewDetailResponse;
    const product = data.product;
    const lowest = product.offers
      .map((offer) => getComparablePrice(offer))
      .filter((price) => Number.isFinite(price))
      .sort((a, b) => a - b)[0];
    const title = lowest
      ? `${product.name} 最低 ${formatPrice(lowest)} 格價比較 | PetWell Review`
      : `${product.name} 格價比較 | PetWell Review`;
    const description = lowest
      ? `${product.name} 香港格價：最低 ${formatPrice(lowest)}，比較 ${product.storeCount} 間寵物店報價、運費及購買連結。`
      : `${product.name} 香港寵物店格價比較。`;
    return buildMetadata({
      title,
      description,
      keywords: `${product.name}, ${product.brand}, 香港寵物用品格價, pet product price hk`,
      path: `/review/${product.id}`,
      ogImage: product.image || undefined,
    });
  } catch {
    return buildMetadata({
      title: "產品比較 | PetWell HK",
      description: "比較香港寵物食品與用品價格。",
      path: `/review/${productId}`,
    });
  }
}

export async function generateReviewProductJsonLd(productId: string): Promise<object[] | null> {
  try {
    const response = await fetch(
      `${priceApiBase()}/products/${encodeURIComponent(productId)}`,
      { headers: { accept: "application/json" }, next: { revalidate: 1800 } },
    );
    if (!response.ok) return null;
    const data = (await response.json()) as PriceReviewDetailResponse;
    const product: PriceReviewProduct = data.product;
    const url = `${SITE_URL}/review/${encodeURIComponent(product.id)}`;
    const offers = product.offers.map((offer) => ({
      "@type": "Offer",
      url: offer.url,
      price: offer.price,
      priceCurrency: "HKD",
      availability: "https://schema.org/InStock",
      seller: { "@type": "Organization", name: offer.store },
    }));
    return [
      breadcrumbJsonLd([
        { name: "首頁", path: "/" },
        { name: "格價", path: "/review" },
        { name: product.name, path: `/review/${product.id}` },
      ]),
      {
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.name,
        image: product.image ? [product.image] : undefined,
        brand: { "@type": "Brand", name: product.brand },
        description: product.description || `${product.name} 香港格價比較`,
        offers: offers.length
          ? {
              "@type": "AggregateOffer",
              lowPrice: product.lowestPrice,
              highPrice: product.highestPrice,
              priceCurrency: "HKD",
              offerCount: offers.length,
              offers,
            }
          : undefined,
        ...(product.numReviews && product.avgRating
          ? {
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: product.avgRating,
                reviewCount: product.numReviews,
                bestRating: 5,
                worstRating: 1,
              },
            }
          : {}),
        url,
      },
    ];
  } catch {
    return null;
  }
}

export async function generateReviewBrandMetadata(brand: string): Promise<Metadata> {
  const brandName = decodeURIComponent(brand);
  return buildMetadata({
    title: `${brandName} 全部產品格價 | PetWell Review`,
    description: `比較 ${brandName} 喺香港不同寵物店的最新價格與產品評價。`,
    keywords: `${brandName},寵物糧格價,香港寵物用品,PetWell Review`,
    path: `/review/brand/${encodeURIComponent(brandName)}`,
  });
}

export function generateReviewBrandJsonLd(brand: string): object[] {
  const brandName = decodeURIComponent(brand);
  const path = `/review/brand/${encodeURIComponent(brandName)}`;
  return [
    breadcrumbJsonLd([
      { name: "首頁", path: "/" },
      { name: "格價", path: "/review" },
      { name: brandName, path },
    ]),
    {
      "@context": "https://schema.org",
      "@type": "Brand",
      name: brandName,
      url: absoluteUrl(path),
    },
  ];
}

export async function generateNutritionMetadata(productId: string): Promise<Metadata> {
  try {
    const products = await loadNutritionProducts();
    const food = products.find((item) => item.id === productId);
    if (!food) {
      return buildMetadata({
        title: "糧食評測｜PetWell HK",
        description: "PetWell 糧食評測。",
        path: `/nutrition/${productId}`,
        noIndex: true,
      });
    }
    return buildMetadata({
      title: `${food.brand} ${food.name}｜PetWell 糧食評測`,
      description: `PetWell 中立分析：${food.brand} ${food.name} 嘅營養評分、成份重點同注意事項。`,
      keywords: `${food.brand},${food.name},寵物糧評測,寵物營養`,
      path: `/nutrition/${food.id}`,
    });
  } catch {
    return buildMetadata({
      title: "糧食評測｜PetWell HK",
      description: "PetWell 糧食評測。",
      path: `/nutrition/${productId}`,
    });
  }
}

export async function generateNutritionJsonLd(productId: string): Promise<object[] | null> {
  try {
    const products = await loadNutritionProducts();
    const food = products.find((item) => item.id === productId);
    if (!food) return null;
    const url = absoluteUrl(`/nutrition/${food.id}`);
    return [
      breadcrumbJsonLd([
        { name: "首頁", path: "/" },
        { name: "營養評分", path: "/nutrition" },
        { name: `${food.brand} ${food.name}`, path: `/nutrition/${food.id}` },
      ]),
      {
        "@context": "https://schema.org",
        "@type": "Review",
        name: `${food.brand} ${food.name} 營養評測`,
        reviewBody: food.summary,
        itemReviewed: {
          "@type": "Product",
          name: `${food.brand} ${food.name}`,
          brand: { "@type": "Brand", name: food.brand },
        },
        author: { "@type": "Organization", name: "PetWell HK Limited" },
        reviewRating:
          food.rating != null
            ? {
                "@type": "Rating",
                ratingValue: food.rating,
                bestRating: 5,
                worstRating: 1,
              }
            : undefined,
        url,
      },
    ];
  } catch {
    return null;
  }
}

export function generateUserMetadata(userId: string): Metadata {
  return buildMetadata({
    title: "PetWell 用戶評價 | PetWell HK",
    description: "查看 PetWell 用戶的公開寵物店、診所與產品評價。",
    path: `/users/${userId}`,
  });
}

export function generatePrivatePageMetadata(title: string, path: string): Metadata {
  return buildMetadata({
    title,
    description: "此頁面不對外公開。",
    path,
    noIndex: true,
  });
}
