import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight, Flame, MessageCircle } from "lucide-react";
import { fetchHotTopics, getRelativeTime, type ForumPost } from "@/services/forumApi";
import { Skeleton } from "@/components/ui/skeleton";
import { sanitizeUserVisibleText, stripBBCode } from "@/utils/bbcodeParser";

const PLACEHOLDER_POSTS: Array<{ id: string; title: string; replies: number }> = [
  { id: "placeholder-1", title: "邊間獸醫睇皮膚科好？", replies: 24 },
  { id: "placeholder-2", title: "帶狗去西貢食飯有咩推介？", replies: 18 },
  { id: "placeholder-3", title: "新手養貓必備清單分享", replies: 31 },
  { id: "placeholder-4", title: "邊度買貓糧最抵？", replies: 15 },
];

const HomeForumTrends = () => {
  const { t, i18n } = useTranslation();
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [usePlaceholder, setUsePlaceholder] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadHotPosts = async () => {
      try {
        const hotPosts = await fetchHotTopics(4);
        if (cancelled) return;
        if (hotPosts.length > 0) {
          setPosts(hotPosts.slice(0, 4));
          setUsePlaceholder(false);
        } else {
          setUsePlaceholder(true);
        }
      } catch {
        if (!cancelled) {
          setUsePlaceholder(true);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadHotPosts();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="home-forum-section" aria-labelledby="home-forum-heading">
      <div className="container mx-auto px-4">
        <div className="home-forum-section__header">
          <div className="flex items-center gap-2.5">
            <span className="home-forum-section__icon-badge">
              <Flame className="h-4 w-4" aria-hidden="true" />
            </span>
            <div>
              <h2 id="home-forum-heading" className="home-forum-section__title">
                {t("homePortal.forum.title")}
              </h2>
              <p className="home-forum-section__subtitle">{t("homePortal.forum.subtitle")}</p>
            </div>
          </div>
          <Link to="/forum" className="home-forum-section__view-all">
            {t("homePortal.forum.viewAll")}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="home-forum-section__grid">
          {loading &&
            Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="home-forum-card home-forum-card--skeleton" />
            ))}

          {!loading && usePlaceholder &&
            PLACEHOLDER_POSTS.map((post) => (
              <Link key={post.id} to="/forum" className="home-forum-card">
                <div className="home-forum-card__hot">
                  <Flame className="h-3.5 w-3.5" aria-hidden="true" />
                  {t("homePortal.forum.hot")}
                </div>
                <h3 className="home-forum-card__title">
                  {sanitizeUserVisibleText(post.title)}
                </h3>
                <p className="home-forum-card__meta">
                  <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
                  {t("homePortal.forum.replies", { count: post.replies })}
                </p>
              </Link>
            ))}

          {!loading && !usePlaceholder &&
            posts.map((post) => (
              <Link key={post.id} to={`/forum/${post.id}`} className="home-forum-card">
                <div className="home-forum-card__hot">
                  <Flame className="h-3.5 w-3.5" aria-hidden="true" />
                  {t("homePortal.forum.hot")}
                </div>
                <h3 className="home-forum-card__title">
                  {sanitizeUserVisibleText(post.title)}
                </h3>
                <p className="home-forum-card__excerpt">
                  {stripBBCode(post.content ?? "").slice(0, 72)}
                </p>
                <p className="home-forum-card__meta">
                  <span className="flex items-center gap-1">
                    <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
                    {t("homePortal.forum.replies", { count: post.replies ?? 0 })}
                  </span>
                  {post.createdAt && (
                    <span>{getRelativeTime(post.createdAt, i18n.language)}</span>
                  )}
                </p>
              </Link>
            ))}
        </div>
      </div>
    </section>
  );
};

export default HomeForumTrends;
