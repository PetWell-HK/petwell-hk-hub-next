import type { Metadata } from "next";

export const SITE_URL = "https://petwellhk.com";
export const SITE_NAME = "PetWell HK";
export const DEFAULT_OG_IMAGE =
  "https://storage.googleapis.com/gpt-engineer-file-uploads/JHL1szBw74V1hbPrOlIVhZq067C3/social-images/social-1759652520246-PetWell Logo (Instagram Post).png";

export type BuildMetadataInput = {
  title: string;
  description: string;
  keywords?: string | string[];
  path?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: "website" | "article" | "profile";
  noIndex?: boolean;
  articlePublishedTime?: string;
  articleModifiedTime?: string;
  articleAuthor?: string;
  articleSection?: string;
  articleTags?: string[];
};

export function absoluteUrl(pathOrUrl = "/"): string {
  if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")) {
    return pathOrUrl;
  }
  const path = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
  return `${SITE_URL}${path}`;
}

export function buildMetadata({
  title,
  description,
  keywords,
  path = "/",
  canonicalUrl,
  ogImage = DEFAULT_OG_IMAGE,
  ogType = "website",
  noIndex = false,
  articlePublishedTime,
  articleModifiedTime,
  articleAuthor,
  articleSection,
  articleTags,
}: BuildMetadataInput): Metadata {
  const canonical = canonicalUrl || absoluteUrl(path);
  const keywordList = Array.isArray(keywords)
    ? keywords
    : keywords
      ? keywords.split(",").map((k) => k.trim()).filter(Boolean)
      : undefined;

  return {
    title: {
      absolute: title,
    },
    description,
    keywords: keywordList,
    authors: [{ name: "PetWell HK Limited" }],
    creator: "PetWell HK Limited",
    publisher: "PetWell HK Limited",
    category: "Pets",
    applicationName: SITE_NAME,
    metadataBase: new URL(SITE_URL),
    alternates: {
      canonical,
      languages: {
        "zh-HK": canonical,
        en: canonical,
        "x-default": canonical,
      },
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
          googleBot: { index: false, follow: false },
        }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        },
    openGraph: {
      type: ogType,
      url: canonical,
      siteName: SITE_NAME,
      title,
      description,
      locale: "zh_HK",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      ...(ogType === "article"
        ? {
            publishedTime: articlePublishedTime,
            modifiedTime: articleModifiedTime,
            authors: articleAuthor ? [articleAuthor] : undefined,
            section: articleSection,
            tags: articleTags,
          }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      site: "@PetWellHK",
      title,
      description,
      images: [ogImage],
    },
    other: {
      "geo.region": "HK",
      "geo.placename": "Hong Kong",
      "geo.position": "22.302711;114.177216",
      ICBM: "22.302711, 114.177216",
      language: "Chinese (Traditional), zh-HK",
    },
  };
}

export function jsonLdScript(data: object | object[]): string {
  return JSON.stringify(data);
}
