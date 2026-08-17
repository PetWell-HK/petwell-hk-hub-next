"use client";

import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { blogPosts, type BlogPost } from "@/data/blogData";
import { Search } from "lucide-react";
import { useSEO } from "@/hooks/useSEO";
import { useSearchQueryFromUrl } from "@/hooks/useSearchQueryFromUrl";
import { AppDownloadCTA } from "@/components/AppDownloadCTA";

const DESK_PREVIEW = 4;
const DESK_STEP = 6;

const DESKS = [
  {
    id: "health",
    label: "健康護理",
    blurb: "急症、日常護理、身體警號",
    categories: ["寵物健康", "健康保健", "急症護理", "寵物護理", "寵物安全"],
  },
  {
    id: "life",
    label: "生活出行",
    blurb: "帶毛孩出街、活動、週末去處",
    categories: ["戶外活動", "生活娛樂", "寵物生活"],
  },
  {
    id: "guides",
    label: "實用指南",
    blurb: "牌照、訓練、飲食、保險",
    categories: ["法例牌照", "訓練行為", "飲食營養", "寵物保險", "寵物行為"],
  },
] as const;

type DeskId = (typeof DESKS)[number]["id"];
type FrontTab = "cover" | DeskId;

const HEALTH_CATEGORIES = new Set<string>(DESKS[0].categories);
const LIFE_CATEGORIES = new Set<string>(DESKS[1].categories);

function storyTitle(title: string) {
  return title.replace(/\s*[|｜]\s*PetWell(?:\s*HK)?\s*$/i, "").trim();
}

function storyDate(iso: string) {
  const [year, month, day] = iso.split("-").map(Number);
  if (!year || !month || !day) return iso;
  return `${year}年${month}月${day}日`;
}

function deskIdForCategory(category: string): DeskId {
  if (HEALTH_CATEGORIES.has(category)) return "health";
  if (LIFE_CATEGORIES.has(category)) return "life";
  return "guides";
}

function matchesQuery(post: BlogPost, query: string) {
  const haystack = `${post.title} ${post.excerpt} ${post.category}`.toLowerCase();
  return haystack.includes(query);
}

const OwnerZone = () => {
  const [searchQuery, setSearchQuery] = useSearchQueryFromUrl();
  const [activeTab, setActiveTab] = useState<FrontTab>("cover");
  const [deskVisible, setDeskVisible] = useState<Record<DeskId, number>>({
    health: DESK_PREVIEW,
    life: DESK_PREVIEW,
    guides: DESK_PREVIEW,
  });

  const query = searchQuery.trim().toLowerCase();
  const isSearching = query.length > 0;

  const sortedPosts = useMemo(
    () =>
      [...blogPosts].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      ),
    [],
  );

  const coverStory = sortedPosts[0];
  const supportingStories = useMemo(
    () => sortedPosts.slice(1, 4),
    [sortedPosts],
  );

  const deskStories = useMemo(() => {
    const coverIds = new Set(sortedPosts.slice(0, 4).map((post) => post.id));
    const grouped: Record<DeskId, BlogPost[]> = {
      health: [],
      life: [],
      guides: [],
    };

    sortedPosts.forEach((post) => {
      if (coverIds.has(post.id)) return;
      grouped[deskIdForCategory(post.category)].push(post);
    });

    return grouped;
  }, [sortedPosts]);

  const searchResults = useMemo(() => {
    if (!isSearching) return [];
    return sortedPosts.filter((post) => matchesQuery(post, query));
  }, [isSearching, sortedPosts, query]);

  const issueDate = coverStory ? storyDate(coverStory.date) : "";

  const structuredData = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "Blog",
      name: "PetWell 主人專區",
      description: "香港寵物媒體：健康護理、生活出行、實用指南",
      url: "https://petwellhk.com/owner-zone",
      blogPost: sortedPosts.slice(0, 10).map((post) => ({
        "@type": "BlogPosting",
        headline: storyTitle(post.title),
        description: post.excerpt,
        datePublished: post.date,
        author: {
          "@type": "Organization",
          name: post.author,
        },
        url: `https://petwellhk.com/${post.slug}`,
      })),
    }),
    [sortedPosts],
  );

  useSEO({
    title:
      "寵物香港 - 主人專區 | 寵物健康知識、養狗貼士、寵物保險比較、寵物護理指南 | PetWell HK",
    description:
      "寵物香港首選 - PetWell 主人專區提供實用寵物照護知識：狗狗健康、貓貓護理、寵物保險比較、獸醫推薦、寵物飲食、寵物行為、寵物安全、急症護理、戶外活動指南。由專業團隊撰寫，幫助寵物香港主人更好照顧毛孩。",
    keywords:
      "寵物健康知識,養狗貼士,貓貓護理,寵物保險比較,寵物護理指南,寵物行為,寵物安全,PetWell,寵物主人",
    canonicalUrl: "https://petwellhk.com/owner-zone",
    structuredData,
  });

  const goToTab = (tab: FrontTab) => {
    setActiveTab(tab);
    setSearchQuery("");

    const targetId = tab === "cover" ? "media-cover" : `media-desk-${tab}`;
    window.requestAnimationFrame(() => {
      document.getElementById(targetId)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="media-page flex-1 pb-14 md:pb-16">
        <div className="container mx-auto max-w-6xl px-4">
          <header className="media-masthead">
            <p className="media-masthead__kicker">PETWELL · 香港寵物媒體</p>
            <h1 className="media-masthead__title">主人專區</h1>
            <p className="media-masthead__lede">
              今期封面、健康護理、出行同實用指南。揀一篇睇，帶走一個可以即刻用嘅答案。
            </p>
            {issueDate ? (
              <p className="media-masthead__meta">今期更新 · {issueDate}</p>
            ) : null}
          </header>
        </div>

        <div className="media-desks">
          <div className="container mx-auto max-w-6xl px-4">
            <div className="media-desks__inner">
              <nav className="media-desks__nav" aria-label="內容欄目">
                <button
                  type="button"
                  className="media-desk-tab"
                  data-active={!isSearching && activeTab === "cover"}
                  aria-current={!isSearching && activeTab === "cover" ? "true" : undefined}
                  onClick={() => goToTab("cover")}
                >
                  今期
                </button>
                {DESKS.map((desk) => (
                  <button
                    key={desk.id}
                    type="button"
                    className="media-desk-tab"
                    data-active={!isSearching && activeTab === desk.id}
                    aria-current={!isSearching && activeTab === desk.id ? "true" : undefined}
                    onClick={() => goToTab(desk.id)}
                  >
                    {desk.label}
                  </button>
                ))}
              </nav>

              <div className="media-desks__search">
                <Search className="media-desks__search-icon" aria-hidden="true" />
                <Input
                  type="search"
                  value={searchQuery}
                  onChange={(event) => {
                    setSearchQuery(event.target.value);
                    setActiveTab("cover");
                  }}
                  placeholder="搵題目…"
                  className="media-desks__search-input"
                  aria-label="搜尋內容"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto max-w-6xl px-4">
          {isSearching ? (
            <SearchResults
              query={searchQuery.trim()}
              results={searchResults}
              onClear={() => {
                setSearchQuery("");
                setActiveTab("cover");
              }}
            />
          ) : (
            <>
              {coverStory ? (
                <section
                  id="media-cover"
                  className="media-cover"
                  aria-label="今期封面"
                >
                  <Link to={`/${coverStory.slug}`} className="media-cover__feature">
                    <div className="media-cover__image">
                      <img
                        src={coverStory.imageUrl}
                        alt=""
                        loading="eager"
                        width={1200}
                        height={750}
                      />
                    </div>
                    <span className="media-kicker">{coverStory.category}</span>
                    <h2 className="media-cover__headline">
                      {storyTitle(coverStory.title)}
                    </h2>
                    <p className="media-cover__excerpt line-clamp-3">
                      {coverStory.excerpt}
                    </p>
                    <p className="media-dateline">{storyDate(coverStory.date)}</p>
                  </Link>

                  {supportingStories.length > 0 ? (
                    <div className="media-cover__rail">
                      {supportingStories.map((post) => (
                        <Link
                          key={post.id}
                          to={`/${post.slug}`}
                          className="media-support"
                        >
                          <div className="media-story-thumb">
                            <img
                              src={post.imageUrl}
                              alt=""
                              loading="lazy"
                              width={200}
                              height={200}
                            />
                          </div>
                          <div>
                            <span className="media-kicker media-kicker--tight">
                              {post.category}
                            </span>
                            <h3 className="media-support__headline line-clamp-3">
                              {storyTitle(post.title)}
                            </h3>
                            <p className="media-dateline">{storyDate(post.date)}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </section>
              ) : null}

              {DESKS.map((desk) => {
                const stories = deskStories[desk.id];
                if (stories.length === 0) return null;

                const visibleCount = deskVisible[desk.id];
                const visible = stories.slice(0, visibleCount);
                const feature = visible[0];
                const rest = visible.slice(1);
                const hasMore = visibleCount < stories.length;

                return (
                  <section
                    key={desk.id}
                    id={`media-desk-${desk.id}`}
                    className="media-desk"
                    aria-labelledby={`media-desk-title-${desk.id}`}
                  >
                    <header className="media-desk__header">
                      <h2
                        id={`media-desk-title-${desk.id}`}
                        className="media-desk__title"
                      >
                        {desk.label}
                      </h2>
                      <p className="media-desk__blurb">{desk.blurb}</p>
                    </header>

                    <div className="media-desk__grid">
                      <Link
                        to={`/${feature.slug}`}
                        className="media-desk-feature"
                      >
                        <div className="media-desk-feature__image">
                          <img
                            src={feature.imageUrl}
                            alt=""
                            loading="lazy"
                            width={800}
                            height={500}
                          />
                        </div>
                        <span className="media-kicker">{feature.category}</span>
                        <h3 className="media-desk-feature__headline">
                          {storyTitle(feature.title)}
                        </h3>
                        <p className="media-desk-feature__excerpt">
                          {feature.excerpt}
                        </p>
                        <p className="media-dateline">{storyDate(feature.date)}</p>
                      </Link>

                      {rest.length > 0 ? (
                        <div className="media-desk__list">
                          {rest.map((post) => (
                            <Link
                              key={post.id}
                              to={`/${post.slug}`}
                              className="media-row"
                            >
                              <span className="media-kicker media-kicker--tight">
                                {post.category}
                              </span>
                              <h3 className="media-row__headline line-clamp-2">
                                {storyTitle(post.title)}
                              </h3>
                              <p className="media-dateline">{storyDate(post.date)}</p>
                            </Link>
                          ))}
                        </div>
                      ) : null}
                    </div>

                    {hasMore ? (
                      <div className="media-more">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="media-more__btn"
                          onClick={() =>
                            setDeskVisible((current) => ({
                              ...current,
                              [desk.id]: current[desk.id] + DESK_STEP,
                            }))
                          }
                        >
                          更多{desk.label}
                        </Button>
                      </div>
                    ) : null}
                  </section>
                );
              })}
            </>
          )}

          <section className="media-subscribe" aria-label="加入社群">
            <AppDownloadCTA
              title="想同其他主人傾吓？"
              description="下載 PetWell App，入社群交流照顧經驗"
            />
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

function SearchResults({
  query,
  results,
  onClear,
}: {
  query: string;
  results: BlogPost[];
  onClear: () => void;
}) {
  return (
    <section className="media-results" aria-live="polite">
      <div className="media-results__header">
        <h2 className="media-results__title">
          {results.length > 0
            ? `同「${query}」相關嘅內容`
            : `未有同「${query}」相關嘅內容`}
        </h2>
        <button type="button" className="media-results__clear" onClick={onClear}>
          返回今期
        </button>
      </div>

      {results.length === 0 ? (
        <p className="media-results__empty">
          試吓第二個關鍵字，或者返回今期封面繼續睇。
        </p>
      ) : (
        <div className="media-results__list">
          {results.map((post) => (
            <Link key={post.id} to={`/${post.slug}`} className="media-result">
              <div className="media-story-thumb">
                <img
                  src={post.imageUrl}
                  alt=""
                  loading="lazy"
                  width={200}
                  height={200}
                />
              </div>
              <div>
                <span className="media-kicker media-kicker--tight">
                  {post.category}
                </span>
                <h3 className="media-result__headline">
                  {storyTitle(post.title)}
                </h3>
                <p className="media-result__excerpt">{post.excerpt}</p>
                <p className="media-dateline">{storyDate(post.date)}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

export default OwnerZone;
