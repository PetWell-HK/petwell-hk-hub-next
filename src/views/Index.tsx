"use client";

import { useMemo } from "react";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import HomeForumTrends from "@/components/home/HomeForumTrends";
import HomeHeroSearch from "@/components/home/HomeHeroSearch";
import HomeQuickNav from "@/components/home/HomeQuickNav";
import HomeSectorShowcase from "@/components/home/HomeSectorShowcase";
import { useSEO } from "@/hooks/useSEO";
import type { HomeRails } from "@/types/homeRails";

const Index = ({ initialHome = null }: { initialHome?: HomeRails | null }) => {
  const structuredData = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "PetWell HK - 寵物香港首選平台",
      url: "https://petwellhk.com",
      description:
        "PetWell HK 香港寵物資訊平台。搜尋獸醫診所、寵物美容、寄養、友善餐廳、論壇與寵物資訊。",
      inLanguage: "zh-HK",
      potentialAction: [
        {
          "@type": "SearchAction",
          target: "https://petwellhk.com/restaurants?q={search_term_string}",
          "query-input": "required name=search_term_string",
        },
        {
          "@type": "SearchAction",
          target: "https://petwellhk.com/clinics?q={search_term_string}",
          "query-input": "required name=search_term_string",
        },
      ],
      publisher: {
        "@type": "Organization",
        name: "PetWell HK Limited",
        url: "https://petwellhk.com",
        logo: {
          "@type": "ImageObject",
          url: "https://petwellhk.com/logo.png",
        },
      },
    }),
    [],
  );

  useSEO({
    title: "PetWell HK | 寵物友善餐廳、獸醫診所、寵物論壇 | 香港寵物資訊平台",
    description:
      "PetWell 香港寵物資訊平台。搜尋寵物友善餐廳、獸醫診所評價、寵物美容、寄養、寵物活動、論壇熱門帖文與寵物資訊。",
    keywords:
      "PetWell,寵物香港,寵物友善餐廳,香港寵物友善餐廳,獸醫診所評價,寵物美容,寵物寄養,寵物論壇,寵物活動",
    canonicalUrl: "https://petwellhk.com/",
    structuredData,
    speakableSelectors: ["h1", ".home-search-card"],
  });

  return (
    <div className="home-portal min-h-screen bg-background">
      <Header />
      <HomeHeroSearch />
      <HomeQuickNav />
      <main className="home-portal-main">
        <HomeSectorShowcase initialHome={initialHome} />
        <HomeForumTrends initialPosts={initialHome?.forumPosts} />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
