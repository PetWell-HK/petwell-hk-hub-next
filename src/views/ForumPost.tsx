import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageCircle, Heart, Share2, ArrowLeft, AlertCircle } from "lucide-react";
import { getForumPostById, getForumPostReplies, getAuthorDisplayName, getRelativeTime, getCategoryLabel, type ForumPost as ForumPostType, type ForumReply } from "@/services/forumApi";
import { parseBBCode, stripBBCode } from "@/utils/bbcodeParser";
import { useSEO } from "@/hooks/useSEO";

const BASE_URL = "https://petwellhk.com";

const ForumPost = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [post, setPost] = useState<ForumPostType | null>(null);
  const [replies, setReplies] = useState<ForumReply[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Build SEO values from loaded post + replies
  const canonicalUrl = postId ? `${BASE_URL}/forum/${postId}` : `${BASE_URL}/forum`;

  const seoData = useMemo(() => {
    if (!post) {
      return {
        title: "寵物討論區 | 寵物論壇 | PetWell HK",
        description: "香港最活躍寵物討論區。分享養寵經驗、獸醫推薦、寵物美容心得、領養資訊。",
        keywords: "寵物討論區,寵物論壇,香港寵物討論區,香港寵物,PetWell",
        structuredData: undefined as object | undefined,
        articlePublishedTime: undefined as string | undefined,
        articleModifiedTime: undefined as string | undefined,
        articleAuthor: undefined as string | undefined,
        articleSection: undefined as string | undefined,
        articleTags: undefined as string[] | undefined,
      };
    }

    const authorName = post.isAnonymous
      ? "匿名用戶"
      : getAuthorDisplayName(post, post.author, post.authorId, i18n.language) || "用戶";
    const categoryLabel = post.category ? getCategoryLabel(post.category, i18n.language) : "";
    const tagNames = post.postTags?.map(pt => pt.tag.name).filter(Boolean) ?? [];
    const plain = stripBBCode(post.content).replace(/\n+/g, " ").trim();

    // Rich description: category prefix + content snippet + reply count
    const contentSnippet = plain.length > 120 ? plain.slice(0, 117) + "…" : plain;
    const descriptionParts = [
      categoryLabel ? `【${categoryLabel}】` : "",
      contentSnippet || `${authorName} 喺PetWell香港寵物討論區分享：${post.title}`,
      replies.length > 0 ? ` （${replies.length} 則留言）` : "",
    ];
    const description = descriptionParts.join("").slice(0, 160);

    // Rich title: include category when available
    const title = categoryLabel
      ? `${post.title} [${categoryLabel}] | PetWell 香港寵物討論區`
      : `${post.title} | PetWell 香港寵物討論區`;

    // Keywords: base + category + post-specific tags + post title words
    const keywordParts = [
      "寵物討論區", "寵物論壇", "寵物討論", "香港寵物", "pet forum hong kong",
      categoryLabel,
      post.title,
      "PetWell",
      "香港毛孩",
      ...tagNames,
    ].filter(Boolean);
    const keywords = [...new Set(keywordParts)].join(",");

    const structuredData = [
      {
        "@context": "https://schema.org",
        "@type": "DiscussionForumPosting",
        "headline": post.title,
        "text": plain,
        "url": canonicalUrl,
        "inLanguage": "zh-HK",
        "datePublished": post.createdAt,
        "dateModified": post.updatedAt || post.createdAt,
        "author": {
          "@type": "Person",
          "name": authorName,
        },
        "isPartOf": {
          "@type": "DiscussionForum",
          "name": "PetWell 香港寵物討論區",
          "url": `${BASE_URL}/forum`,
        },
        "keywords": tagNames.join(", ") || categoryLabel,
        "articleSection": categoryLabel,
        "interactionStatistic": [
          {
            "@type": "InteractionCounter",
            "interactionType": "https://schema.org/LikeAction",
            "userInteractionCount": post.likes,
          },
          {
            "@type": "InteractionCounter",
            "interactionType": "https://schema.org/CommentAction",
            "userInteractionCount": post.replies,
          },
        ],
        "commentCount": replies.length,
        "comment": replies.slice(0, 50).map((reply) => {
          const replyAuthor = getAuthorDisplayName(undefined, reply.author, reply.authorId, i18n.language) || "用戶";
          return {
            "@type": "Comment",
            "text": stripBBCode(reply.content),
            "datePublished": reply.createdAt,
            "author": { "@type": "Person", "name": replyAuthor },
          };
        }),
      },
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "PetWell HK", "item": BASE_URL },
          { "@type": "ListItem", "position": 2, "name": "寵物討論區 / 寵物論壇", "item": `${BASE_URL}/forum` },
          ...(categoryLabel ? [{ "@type": "ListItem", "position": 3, "name": categoryLabel, "item": `${BASE_URL}/forum?category=${post.category}` }] : []),
          { "@type": "ListItem", "position": categoryLabel ? 4 : 3, "name": post.title, "item": canonicalUrl },
        ],
      },
    ];

    return {
      title,
      description,
      keywords,
      structuredData,
      articlePublishedTime: post.createdAt,
      articleModifiedTime: post.updatedAt || post.createdAt,
      articleAuthor: authorName,
      articleSection: categoryLabel || undefined,
      articleTags: tagNames.length > 0 ? tagNames : undefined,
    };
  }, [post, replies, canonicalUrl, i18n.language]);

  useSEO({
    title: seoData.title,
    description: seoData.description,
    keywords: seoData.keywords,
    ogType: "article",
    canonicalUrl,
    structuredData: seoData.structuredData,
    articlePublishedTime: seoData.articlePublishedTime,
    articleModifiedTime: seoData.articleModifiedTime,
    articleAuthor: seoData.articleAuthor,
    articleSection: seoData.articleSection,
    articleTags: seoData.articleTags,
    speakableSelectors: post ? ["h1", ".forum-post-content", ".forum-reply-content"] : undefined,
  });

  const loadPostData = async () => {
    if (!postId) {
      setError(t('forum.invalidPostId'));
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Fetch post and replies in parallel
      const [fetchedPost, fetchedReplies] = await Promise.all([
        getForumPostById(postId),
        getForumPostReplies(postId)
      ]);
      
      setPost(fetchedPost);
      const sorted = [...fetchedReplies].sort((a, b) => {
        if (!a.createdAt && !b.createdAt) return 0;
        if (!a.createdAt) return 1;
        if (!b.createdAt) return -1;
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      });
      setReplies(sorted);
    } catch (err) {
      setError(t('forum.error'));
      console.error("Error loading forum post:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPostData();
  }, [postId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <Header />
        <main className="container mx-auto px-4 py-10 md:py-12">
          <div className="max-w-4xl mx-auto">
            <Skeleton className="h-10 w-32 mb-6" />
            <Card className="p-8 mb-8">
              <div className="flex items-start gap-4 mb-6">
                <Skeleton className="w-16 h-16 rounded-full" />
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <Skeleton className="h-8 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <div className="flex gap-6 pt-2">
                    <Skeleton className="h-5 w-12" />
                    <Skeleton className="h-5 w-12" />
                    <Skeleton className="h-5 w-12" />
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <Header />
        <main className="container mx-auto px-4 py-10 md:py-12">
          <div className="max-w-4xl mx-auto text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-destructive" />
            <h1 className="text-3xl font-bold mb-4">{error || t('forum.postNotFound')}</h1>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => navigate("/forum")} variant="outline">{t('forum.backToForum')}</Button>
              {error && <Button onClick={loadPostData}>{t('forum.retry')}</Button>}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />
      
      <main className="container mx-auto px-4 py-10 md:py-12">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate("/forum")}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('forum.backToForum')}
          </Button>

          <Card className="p-4 md:p-8 mb-8">
            <div className="mb-4">
              <h1 className="text-xl md:text-3xl font-bold text-foreground mb-3">{post.title}</h1>
              
              <div className="flex items-center gap-2 mb-1 text-sm">
                <span className="font-semibold text-foreground">{getAuthorDisplayName(post, post.author, post.authorId, i18n.language)}</span>
                <span className="text-muted-foreground">· {getRelativeTime(post.createdAt)}</span>
              </div>
              {post.category && (
                <div className="mb-4">
                  <span className="inline-block font-medium px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground text-xs">
                    {getCategoryLabel(post.category, i18n.language)}
                  </span>
                </div>
              )}

              <div 
                className="forum-post-content text-base md:text-lg text-foreground mb-6 prose max-w-none"
                dangerouslySetInnerHTML={{ __html: parseBBCode(post.content) }}
              />
              
              <div className="flex items-center gap-5 text-muted-foreground pt-2 border-t border-border">
                <button className="flex items-center gap-1.5 hover:text-primary transition-colors py-2">
                  <Heart className="w-5 h-5" />
                  <span className="text-sm">{post.likes}</span>
                </button>
                <button className="flex items-center gap-1.5 hover:text-primary transition-colors py-2">
                  <MessageCircle className="w-5 h-5" />
                  <span className="text-sm">{post.replies}</span>
                </button>
                <button className="flex items-center gap-1.5 hover:text-primary transition-colors py-2">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </Card>

          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-6 text-foreground">
              {t('forum.replies')} ({replies.length})
            </h2>
            {replies.length > 0 ? (
              <div className="space-y-4">
                {replies.map((reply) => (
                  <Card key={reply.id} className="p-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-foreground">{getAuthorDisplayName(undefined, reply.author, reply.authorId, i18n.language)}</span>
                        <span className="text-sm text-muted-foreground">· {getRelativeTime(reply.createdAt)}</span>
                      </div>
                      <div 
                        className="forum-reply-content text-muted-foreground prose max-w-none"
                        dangerouslySetInnerHTML={{ __html: parseBBCode(reply.content) }}
                      />
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">{t('forum.noReplies')}</p>
              </Card>
            )}
          </div>

          <div className="bg-gradient-primary rounded-2xl p-8 md:p-12 text-center shadow-glow">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {t('forum.postDetailCta.title')}
            </h2>
            <p className="text-white/90 text-lg mb-6 max-w-2xl mx-auto">
              {t('forum.postDetailCta.description')}
            </p>
            <div className="flex justify-center">
              <Button 
                size="lg" 
                onClick={() => navigate("/download")}
                className="bg-white text-primary hover:bg-white/90 font-semibold text-lg px-8 shadow-elegant"
              >
                {t('forum.postDetailCta.button')}
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ForumPost;