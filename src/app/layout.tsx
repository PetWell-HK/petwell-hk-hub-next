import type { Metadata, Viewport } from "next";
import { Suspense, type ReactNode } from "react";
import AppProviders from "@/components/providers/AppProviders";
import JsonLd from "@/components/seo/JsonLd";
import { buildMetadata, SITE_NAME, SITE_URL } from "@/lib/seo";
import "@/index.css";

export const metadata: Metadata = {
  ...buildMetadata({
    title: "PetWell HK | 寵物友善餐廳、獸醫診所、寵物論壇 | 香港寵物健康App",
    description:
      "PetWell 香港首個一站式寵物健康App。全港寵物友善餐廳（18區搜尋）、獸醫診所評價、寵物美容與寄養、寵物活動及論壇。免費下載。",
    keywords:
      "PetWell,寵物香港,寵物健康App,寵物友善餐廳,香港寵物友善餐廳,食環署寵物友善餐廳,獸醫診所評價,寵物美容,寵物寄養,寵物論壇,寵物活動,香港獸醫,24小時獸醫,寵物健康紀錄",
    path: "/",
  }),
  metadataBase: new URL(SITE_URL),
  verification: {
    google: "yAEX8ViMJ7qdYf-99fQRyPDv3prPeU_um10edfHhzgw",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: SITE_NAME,
  },
  formatDetection: {
    telephone: true,
    email: true,
    address: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#ff6a00",
};

const organizationLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "PetWell HK Limited",
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  description:
    "PetWell HK 香港首個一站式寵物健康管理App，提供獸醫診所評價、寵物友善餐廳、寵物美容寄養、寵物活動及論壇。",
  address: {
    "@type": "PostalAddress",
    addressCountry: "HK",
    addressRegion: "Hong Kong",
  },
  sameAs: [
    "https://www.facebook.com/petwellhk",
    "https://www.instagram.com/petwellhk",
    "https://www.youtube.com/@petwellhk",
  ],
};

const mobileAppLd = {
  "@context": "https://schema.org",
  "@type": "MobileApplication",
  name: "PetWell",
  operatingSystem: "iOS, Android",
  applicationCategory: "LifestyleApplication",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "HKD",
  },
  url: SITE_URL,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-HK">
      <head>
        <JsonLd id="ld-organization" data={organizationLd} />
        <JsonLd id="ld-mobile-app" data={mobileAppLd} />
        <meta name="GPTBot" content="noindex, nofollow" />
        <meta name="ChatGPT-User" content="noindex, nofollow" />
        <meta name="CCBot" content="noindex, nofollow" />
        <meta name="anthropic-ai" content="noindex, nofollow" />
        <meta name="ClaudeBot" content="noindex, nofollow" />
        <meta name="Google-Extended" content="noindex, nofollow" />
        <meta name="PerplexityBot" content="noindex, nofollow" />
        <meta name="Bytespider" content="noindex, nofollow" />
        <meta name="AhrefsBot" content="noindex, nofollow" />
        <meta name="SemrushBot" content="noindex, nofollow" />
        <meta name="MJ12bot" content="noindex, nofollow" />
        <meta name="DotBot" content="noindex, nofollow" />
      </head>
      <body>
        <AppProviders>
          <Suspense fallback={null}>{children}</Suspense>
        </AppProviders>
      </body>
    </html>
  );
}
