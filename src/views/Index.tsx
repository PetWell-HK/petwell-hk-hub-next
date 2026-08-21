"use client";

import HomeForumTrends from "@/components/home/HomeForumTrends";
import HomeHeroSearch from "@/components/home/HomeHeroSearch";
import HomeQuickNav from "@/components/home/HomeQuickNav";
import HomeSectorShowcase from "@/components/home/HomeSectorShowcase";
import type { HomeRails } from "@/types/homeRails";

const Index = ({ initialHome = null }: { initialHome?: HomeRails | null }) => {
  return (
    <div className="home-portal min-h-screen bg-background">
      <HomeHeroSearch />
      <HomeQuickNav />
      <main className="home-portal-main">
        <HomeSectorShowcase initialHome={initialHome} />
        <HomeForumTrends initialPosts={initialHome?.forumPosts} />
      </main>
    </div>
  );
};

export default Index;
