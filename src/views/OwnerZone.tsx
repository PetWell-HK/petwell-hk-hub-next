import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { blogPosts } from "@/data/blogData";
import { Calendar, Search } from "lucide-react";
import { useSEO } from "@/hooks/useSEO";
import { useSearchQueryFromUrl } from "@/hooks/useSearchQueryFromUrl";
import { AppDownloadCTA } from "@/components/AppDownloadCTA";

const POSTS_PER_PAGE = 12;

const OwnerZone = () => {
  const [visiblePostCount, setVisiblePostCount] = useState(POSTS_PER_PAGE);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useSearchQueryFromUrl();

  const categories = useMemo(
    () => Array.from(new Set(blogPosts.map((post) => post.category))),
    [],
  );

  const sortedPosts = useMemo(
    () =>
      [...blogPosts].sort((a, b) => {
        // Pinned posts always appear first
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }),
    [],
  );

  const filteredPosts = useMemo(() => {
    let posts = selectedCategory === "all"
      ? sortedPosts
      : sortedPosts.filter((post) => post.category === selectedCategory);

    const query = searchQuery.trim().toLowerCase();
    if (query) {
      posts = posts.filter(
        (post) =>
          post.title.toLowerCase().includes(query) ||
          post.excerpt.toLowerCase().includes(query) ||
          post.category.toLowerCase().includes(query),
      );
    }

    return posts;
  }, [sortedPosts, selectedCategory, searchQuery]);

  const visiblePosts = filteredPosts.slice(0, visiblePostCount);
  const hasMorePosts = visiblePostCount < filteredPosts.length;

  const structuredData = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "Blog",
      name: "PetWell 主人專區",
      description: "實用寵物照護知識、養狗貼士、寵物保險比較",
      url: "https://petwellhk.com/owner-zone",
      blogPost: blogPosts.slice(0, 10).map((post) => ({
        "@type": "BlogPosting",
        headline: post.title,
        description: post.excerpt,
        datePublished: post.date,
        author: {
          "@type": "Organization",
          name: post.author,
        },
        url: `https://petwellhk.com/${post.slug}`,
      })),
    }),
    [],
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

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="place-listing-page flex-1 pb-14 md:pb-16">
        <div className="container mx-auto max-w-6xl px-4">
          <header className="hero-summary pt-8 md:pt-10">
            <div className="max-w-2xl">
              <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                寵物香港 · 主人專區
              </h1>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground md:text-[15px]">
                實用的寵物照護知識與經驗分享，為寵物主人提供專業資訊
              </p>
            </div>
          </header>

          <div className="relative mt-6 max-w-xl">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              type="search"
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value);
                setVisiblePostCount(POSTS_PER_PAGE);
              }}
              placeholder="搜尋文章標題或內容…"
              className="pl-9"
              aria-label="搜尋文章"
            />
          </div>

          <nav
            aria-label="文章分類"
            className="mt-6 flex gap-1 overflow-x-auto scrollbar-none border-b border-border pb-px"
          >
            <button
              type="button"
              onClick={() => {
                setSelectedCategory("all");
                setVisiblePostCount(POSTS_PER_PAGE);
              }}
              data-active={selectedCategory === "all"}
              className="place-listing-region-tab shrink-0"
              aria-pressed={selectedCategory === "all"}
            >
              全部文章
            </button>
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => {
                  setSelectedCategory(category);
                  setVisiblePostCount(POSTS_PER_PAGE);
                }}
                data-active={selectedCategory === category}
                className="place-listing-region-tab shrink-0"
                aria-pressed={selectedCategory === category}
              >
                {category}
              </button>
            ))}
          </nav>

          <div className="pt-8">
            <p className="mb-6 text-sm tabular-nums text-muted-foreground">
              共 {filteredPosts.length} 篇文章
            </p>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {visiblePosts.map((post) => (
                <article key={post.id}>
                  <Link to={`/${post.slug}`} className="group block h-full">
                    <Card className="h-full overflow-hidden rounded-xl border-border shadow-none transition-shadow hover:shadow-strong">
                      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                        <img
                          src={post.imageUrl}
                          alt={post.title}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                        />
                        <span className="absolute left-2 top-2 rounded-md bg-background/90 px-2 py-0.5 text-[11px] font-medium text-foreground backdrop-blur-sm">
                          {post.category}
                        </span>
                      </div>
                      <div className="flex flex-col p-4">
                        <h2 className="line-clamp-2 text-[15px] font-semibold leading-snug text-foreground group-hover:text-primary transition-colors">
                          {post.title}
                        </h2>
                        <p className="mt-2 line-clamp-2 flex-1 text-xs leading-relaxed text-muted-foreground">
                          {post.excerpt}
                        </p>
                        <div className="mt-3 flex items-center gap-1 border-t border-border pt-3 text-[11px] text-muted-foreground">
                          <Calendar className="h-3 w-3 shrink-0" aria-hidden="true" />
                          <time dateTime={post.date}>{post.date}</time>
                        </div>
                      </div>
                    </Card>
                  </Link>
                </article>
              ))}
            </div>

            {hasMorePosts && (
              <div className="mt-10 flex justify-center">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="min-w-36 rounded-lg"
                  onClick={() => setVisiblePostCount((count) => count + POSTS_PER_PAGE)}
                >
                  載入更多文章
                </Button>
              </div>
            )}

            <section className="mt-14 border-t border-border pt-10">
              <Card className="border border-border bg-background p-6 shadow-none md:p-8">
                <AppDownloadCTA
                  title="想參與更多討論？"
                  description="立即下載 PetWell App，加入我們的社群，與其他寵物主人交流經驗"
                />
              </Card>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default OwnerZone;
