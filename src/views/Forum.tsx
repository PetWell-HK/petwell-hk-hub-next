"use client";

import { useState, useEffect, useMemo, useRef, useCallback, type ReactElement } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import Header from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MessageCircle, Search, Plus, X, AlertCircle, ChevronRight, Share2, ChevronLeft, Heart, Loader2, X as XIcon, Reply, AlertTriangle, ThumbsDown, Flame } from "lucide-react";
import { parseBBCode, sanitizeUserVisibleText, stripBBCode } from "@/utils/bbcodeParser";
import RichTextEditor from "@/components/RichTextEditor";
import { uploadData } from "aws-amplify/storage";
import { 
  fetchAllForumPosts, 
  getForumPostById, 
  getForumPostReplies,
  getAuthorDisplayName, 
  getRelativeTime, 
  getCategories, 
  getAllTags,
  fetchForumCategories,
  getCategoryLabel,
  fetchForumTags,
  togglePostLike,
  checkUserLikedPost,
  togglePostDislike,
  checkUserDislikedPost,
  toggleReplyLike,
  checkUserLikedReply,
  toggleReplyDislike,
  checkUserDislikedReply,
  getOrCreateClient,
  getUserInteractions,
  createForumReply,
  type ForumPost, 
  type ForumPostFilters,
  type ForumReply,
  type ForumTag
} from "@/services/forumApi";
import { useSEO } from "@/hooks/useSEO";
import { useSearchQueryFromUrl } from "@/hooks/useSearchQueryFromUrl";
import CreatePostDialog from "@/components/CreatePostDialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useAuthPanel } from "@/contexts/AuthPanelContext";
import { buildForumImageUrl, normalizeForumImageUrl, resolveStorageImageUrl } from "@/utils/forumImageUrl";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const POSTS_PER_PAGE = 20;
const REPLIES_PER_PAGE = 10;
const HOT_TOPICS_MAX_PAGES = 30;
const HOT_TOPICS_MAX_POSTS = POSTS_PER_PAGE * HOT_TOPICS_MAX_PAGES;
const FORUM_OG_IMAGE = "https://storage.googleapis.com/gpt-engineer-file-uploads/JHL1szBw74V1hbPrOlIVhZq067C3/social-images/social-1759652520246-PetWell Logo (Instagram Post).png";

// Generate consistent color for username based on string hash
const getUsernameColor = (name: string): string => {
  const colors = [
    '#2563eb', // Blue
    '#dc2626', // Red
  ];
  
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
};

const BASE_URL = "https://petwellhk.com";

type ForumProps = {
  initialPosts?: ForumPost[] | null;
};

const Forum = ({ initialPosts = null }: ForumProps) => {

  const { t, i18n } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated, userInfo } = useAuth();
  const { openPanel, onAuthSuccess } = useAuthPanel();
  const [showDownloadCta, setShowDownloadCta] = useState(false);
  const pendingReplyRef = useRef<{ content: string; postId: string; replyingTo: ForumReply | null; imagePreviews: Array<{ id: string; file: File; preview: string }> } | null>(null);
  const closingForAuthRef = useRef(false);
  const ssrPosts = initialPosts ?? [];
  const urlCategoryOnMount = searchParams.get("category") || "all";
  const [allPosts, setAllPosts] = useState<ForumPost[]>(ssrPosts);
  const [displayedPosts, setDisplayedPosts] = useState<ForumPost[]>(() =>
    ssrPosts.slice(0, POSTS_PER_PAGE),
  );
  const [selectedPost, setSelectedPost] = useState<ForumPost | null>(null);
  const [selectedPostReplies, setSelectedPostReplies] = useState<ForumReply[]>([]);
  const [allPostReplies, setAllPostReplies] = useState<ForumReply[]>([]); // Store all replies for parent lookup
  const [loading, setLoading] = useState(ssrPosts.length === 0);
  const [loadingPostDetail, setLoadingPostDetail] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentReplyPage, setCurrentReplyPage] = useState(1);
  const [totalReplyPages, setTotalReplyPages] = useState(1);
  const [totalReplies, setTotalReplies] = useState(0);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [dislikedPosts, setDislikedPosts] = useState<Set<string>>(new Set());
  const [likedReplies, setLikedReplies] = useState<Set<string>>(new Set());
  const [dislikedReplies, setDislikedReplies] = useState<Set<string>>(new Set());
  const [replyContent, setReplyContent] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyingToReply, setReplyingToReply] = useState<ForumReply | null>(null);
  const [replyImagePreviews, setReplyImagePreviews] = useState<Array<{ id: string; file: File; preview: string }>>([]);
  const [selectedPostAttachmentUrls, setSelectedPostAttachmentUrls] = useState<string[]>([]);
  const [likingPostIds, setLikingPostIds] = useState<Set<string>>(new Set());
  const [likingReplyIds, setLikingReplyIds] = useState<Set<string>>(new Set());
  const [dislikingReplyIds, setDislikingReplyIds] = useState<Set<string>>(new Set());
  const [expandedPosts, setExpandedPosts] = useState<Set<string>>(new Set());
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());
  const [postsNeedingShowMore, setPostsNeedingShowMore] = useState<Set<string>>(new Set());
  const [repliesNeedingShowMore, setRepliesNeedingShowMore] = useState<Set<string>>(new Set());
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [viewingImageUrl, setViewingImageUrl] = useState<string | null>(null);
  const [tradingDisclaimerOpen, setTradingDisclaimerOpen] = useState(false);
  const loadingPostIdRef = useRef<string | null>(null);
  const currentPostIdRef = useRef<string | null>(null);
  const postContentRef = useRef<HTMLDivElement>(null);
  const postListContainerRef = useRef<HTMLDivElement>(null);
  const replyContentRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const lastPostListScrollTopRef = useRef(0);
  const isInitialMountRef = useRef(true);
  const isUpdatingFromUrlRef = useRef(false);
  const skipInitialListFetchRef = useRef(ssrPosts.length > 0 && urlCategoryOnMount === "all");
  const skipInitialSearchFetchRef = useRef(ssrPosts.length > 0 && urlCategoryOnMount === "all");

  // Mobile UX: track whether the detail panel is the active view on small screens.
  // Initialise to true when navigating directly to a post URL on mobile.
  const [mobileShowDetail, setMobileShowDetail] = useState(() => !!searchParams.get('post'));
  const [isMobileFilterBarHidden, setIsMobileFilterBarHidden] = useState(false);
  
  // Constants for content truncation
  const MAX_CONTENT_LENGTH = 3000; // Characters before showing "show more"
  
  // Get post ID and category from URL
  const postIdFromUrl = searchParams.get('post');
  const categoryFromUrl = searchParams.get('category');
  
  // Filters
  const [searchQuery, setSearchQuery] = useSearchQueryFromUrl();
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryFromUrl || "all");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedTag, setSelectedTag] = useState<string>("all"); // Legacy single tag filter
  const [viewFilter, setViewFilter] = useState<'recent' | 'hot'>('recent'); // Recent or Hot filter
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'replies' | 'hot'>('recent');
  const [availableTags, setAvailableTags] = useState<ForumTag[]>([]);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  
  // Get fixed categories with translations (no API call needed)
  const categories = fetchForumCategories(i18n.language);

  // Dynamic SEO: update meta tags when a specific post is selected inline
  const seoProps = useMemo(() => {
    if (!selectedPost) {
      return {
        title: "香港寵物討論區 | 寵物論壇 | 狗狗貓貓毛孩社群 開post吹水 | PetWell 寵物台",
        description: "香港寵物討論區——像 LIHKG、discuss 咁樣嘅寵物版。開post、吹水、問獸醫、領養、走失協尋、健康美容飲食訓練。狗狗台、貓貓台、小動物討論，香港最活躍寵物論壇，完全免費。",
        keywords: "討論區,寵物討論區,香港寵物討論區,寵物論壇,香港討論區寵物,香港寵物討論,寵物台,狗狗討論區,貓貓討論區,狗狗論壇,貓貓論壇,狗狗台,貓貓台,香港寵物社群,寵物吹水,寵物開post,pet forum hong kong,寵物forum,養狗心得,養貓分享,寵物健康討論,獸醫推薦,寵物美容,領養寵物香港,走失協尋,毛孩主人,毛孩討論區,hong kong pet community,香港狗主,香港貓主,寵物交流,寵物求助,寵物飲食,狗狗訓練,寵物行為問題,寵物園地,寵物問題討論,hong kong pet forum,hk pet forum,pet discussion board hong kong,寵物資訊香港,寵物社區香港,discuss 寵物,hk 寵物討論區",
        canonicalUrl: `${BASE_URL}/forum`,
        ogImage: FORUM_OG_IMAGE,
        structuredData: [
          {
            "@context": "https://schema.org",
            "@type": "DiscussionForum",
            "name": "PetWell 香港寵物討論區 - 寵物論壇",
            "alternateName": ["香港寵物討論區", "寵物討論區", "寵物台", "寵物論壇", "香港寵物forum", "香港寵物討論區論壇"],
            "description": "香港最活躍寵物討論區。狗狗、貓貓、小動物主人分享養寵經驗、健康資訊、領養資訊，互相幫助。涵蓋獸醫推薦、走失協尋、寵物美容、行為訓練等話題。",
            "url": `${BASE_URL}/forum`,
            "inLanguage": ["zh-HK", "zh-TW", "en"],
            "audience": {
              "@type": "Audience",
              "audienceType": "Pet Owners",
              "geographicArea": {
                "@type": "AdministrativeArea",
                "name": "Hong Kong"
              }
            },
            "provider": {
              "@type": "Organization",
              "name": "PetWell HK",
              "url": BASE_URL,
              "logo": `${BASE_URL}/logo.png`,
              "sameAs": [
                "https://www.instagram.com/petwell.hk",
                "https://www.facebook.com/petwellhk"
              ]
            },
            "about": [
              {"@type": "Thing", "name": "狗狗"},
              {"@type": "Thing", "name": "貓貓"},
              {"@type": "Thing", "name": "寵物健康"},
              {"@type": "Thing", "name": "寵物領養"},
              {"@type": "Thing", "name": "獸醫推薦"},
              {"@type": "Thing", "name": "寵物訓練"}
            ]
          },
          {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": "香港寵物討論區 | PetWell 寵物論壇",
            "description": "香港最活躍寵物討論區兼論壇，涵蓋狗狗、貓貓、小動物等17個討論分類，包括健康、美容、飲食、領養、走失協尋、緊急求助。",
            "url": `${BASE_URL}/forum`,
            "inLanguage": "zh-HK",
            "isPartOf": {"@type": "WebSite", "name": "PetWell HK", "url": BASE_URL}
          },
          {
            "@context": "https://schema.org",
            "@type": "ItemList",
            "name": "PetWell 寵物討論區・論壇分類",
            "description": "香港寵物討論區／論壇涵蓋的17個寵物話題分類",
            "numberOfItems": 17,
            "itemListElement": [
              {"@type": "ListItem", "position": 1, "name": "狗狗討論", "url": `${BASE_URL}/forum?category=DOG`},
              {"@type": "ListItem", "position": 2, "name": "貓貓討論", "url": `${BASE_URL}/forum?category=CAT`},
              {"@type": "ListItem", "position": 3, "name": "小動物", "url": `${BASE_URL}/forum?category=SMALL_ANIMAL`},
              {"@type": "ListItem", "position": 4, "name": "生活分享", "url": `${BASE_URL}/forum?category=LIFE_SHARING`},
              {"@type": "ListItem", "position": 5, "name": "寵物活動", "url": `${BASE_URL}/forum?category=EVENTS`},
              {"@type": "ListItem", "position": 6, "name": "寵物領養", "url": `${BASE_URL}/forum?category=ADOPTION`},
              {"@type": "ListItem", "position": 7, "name": "寵物健康", "url": `${BASE_URL}/forum?category=HEALTH`},
              {"@type": "ListItem", "position": 8, "name": "寵物美容", "url": `${BASE_URL}/forum?category=GROOMING`},
              {"@type": "ListItem", "position": 9, "name": "寵物飲食", "url": `${BASE_URL}/forum?category=DIET`},
              {"@type": "ListItem", "position": 10, "name": "寵物訓練", "url": `${BASE_URL}/forum?category=TRAINING`},
              {"@type": "ListItem", "position": 11, "name": "行為問題", "url": `${BASE_URL}/forum?category=BEHAVIOR`},
              {"@type": "ListItem", "position": 12, "name": "用品評價", "url": `${BASE_URL}/forum?category=PRODUCT_REVIEW`},
              {"@type": "ListItem", "position": 13, "name": "寵物交易", "url": `${BASE_URL}/forum?category=TRADING`},
              {"@type": "ListItem", "position": 14, "name": "寵物旅遊", "url": `${BASE_URL}/forum?category=TRAVEL`},
              {"@type": "ListItem", "position": 15, "name": "寵物住宿", "url": `${BASE_URL}/forum?category=LODGING`},
              {"@type": "ListItem", "position": 16, "name": "走失協尋", "url": `${BASE_URL}/forum?category=LOST_FOUND`},
              {"@type": "ListItem", "position": 17, "name": "緊急求助", "url": `${BASE_URL}/forum?category=EMERGENCY`}
            ]
          },
          {
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "PetWell HK - 香港寵物討論區・寵物論壇",
            "url": BASE_URL,
            "potentialAction": {
              "@type": "SearchAction",
              "target": {
                "@type": "EntryPoint",
                "urlTemplate": `${BASE_URL}/forum?search={search_term_string}`
              },
              "query-input": "required name=search_term_string"
            }
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "PetWell HK",
                "item": BASE_URL
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "寵物討論區 / 寵物論壇",
                "item": `${BASE_URL}/forum`
              }
            ]
          }
        ],
        faqItems: [
          {
            question: "香港邊度有寵物討論區？",
            answer: "PetWell HK係香港最活躍嘅寵物論壇同討論區，專為香港毛孩主人而設。你可以喺度討論狗狗、貓貓、小動物嘅健康、飲食、美容、訓練等各種話題，仲可以分享養寵心得、搵領養資訊同獸醫推薦，完全免費。"
          },
          {
            question: "香港寵物討論區／論壇有咩討論分類？",
            answer: "PetWell寵物討論區（論壇）涵蓋17個討論分類：狗狗、貓貓、小動物、生活分享、活動、領養、健康、美容、飲食、訓練、行為問題、用品評價、交易、旅遊、住宿、走失協尋及緊急求助。係香港覆蓋範圍最廣嘅寵物討論區。"
          },
          {
            question: "點樣喺香港寵物討論區發帖？",
            answer: "喺PetWell寵物論壇，你只需免費註冊帳號即可發帖。支援文字、圖片及分類標籤，亦可選擇匿名發文。點擊「發佈帖文」按鈕，選擇分類後即可開始分享。"
          },
          {
            question: "點樣搵香港寵物領養資訊？",
            answer: "喺PetWell寵物論壇嘅「領養」分類，你可以搵到香港各地嘅寵物領養資訊，包括狗狗、貓貓同其他小動物。亦有走失協尋分類幫助尋回走失寵物。"
          },
          {
            question: "可以匿名喺寵物討論區／論壇發文嗎？",
            answer: "可以！PetWell寵物討論區（論壇）支援匿名發帖功能，讓你可以自由分享個人經歷或提問，毋需擔心個人資料外洩。適合分享敏感話題或想保護私隱的主人。"
          },
          {
            question: "香港寵物主人最常討論咩話題？",
            answer: "香港寵物主人最常討論嘅話題包括：獸醫推薦、寵物健康問題（皮膚、腸胃、骨科等）、飲食建議、美容心得、寵物友善餐廳、訓練技巧、行為問題、走失尋寵及領養資訊。"
          },
          {
            question: "PetWell寵物討論區同LIHKG、Threads、discuss.com.hk有咩唔同？",
            answer: "PetWell係香港首個專門為寵物主人而設的討論區兼論壇，所有討論分類都圍繞寵物話題，唔係綜合討論區。同連登、discuss、Threads唔同，我哋係寵物專屬：開post吹水、獸醫診所、寵物友善餐廳、領養走失協尋一應俱全，係名副其實嘅「寵物台」討論區。"
          },
          {
            question: "Where can I find a Hong Kong pet forum in English?",
            answer: "PetWell HK is Hong Kong's most active pet forum and discussion board, supporting both Traditional Chinese and English. You can find discussions on dogs, cats, small animals, pet health, grooming, adoption, lost pets, and more. Join our community at petwellhk.com/forum."
          }
        ],
        speakableSelectors: ["h1", ".forum-hero-description", ".faq-answer"],
      };
    }

    const authorName = selectedPost.isAnonymous
      ? "匿名用戶"
      : getAuthorDisplayName(selectedPost, selectedPost.author, selectedPost.authorId, i18n.language) || "用戶";
    const plainContent = stripBBCode(selectedPost.content).replace(/\n+/g, " ").trim();
    const description = plainContent.length > 160 ? plainContent.slice(0, 157) + "…" : plainContent;
    const canonicalUrl = `${BASE_URL}/forum?post=${selectedPost.id}`;
    const categoryLabel = selectedPost.category ? getCategoryLabel(selectedPost.category, i18n.language) : "";

    const safeTitle = sanitizeUserVisibleText(selectedPost.title);
    const tagNames = selectedPost.postTags?.map(pt => pt.tag?.name).filter(Boolean) ?? [];
    const keywordParts = [
      "寵物討論區", "寵物論壇", "寵物討論", "香港寵物", "pet forum hong kong",
      "PetWell", "香港毛孩",
      ...(categoryLabel ? [categoryLabel] : []),
      safeTitle,
      ...tagNames,
    ].filter(Boolean);
    const keywords = [...new Set(keywordParts)].join(",");

    return {
      title: categoryLabel
        ? `${safeTitle} [${categoryLabel}] | PetWell 香港寵物討論區`
        : `${safeTitle} | PetWell 香港寵物討論區`,
      description: description || `${authorName} 喺PetWell香港寵物討論區分享：${safeTitle}`,
      keywords,
      ogType: "article" as const,
      ogImage: FORUM_OG_IMAGE,
      canonicalUrl,
      articlePublishedTime: selectedPost.createdAt,
      articleModifiedTime: selectedPost.updatedAt || selectedPost.createdAt,
      articleAuthor: selectedPost.isAnonymous ? undefined : authorName,
      articleSection: categoryLabel || undefined,
      articleTags: tagNames.length > 0 ? tagNames : undefined,
      structuredData: [
        {
          "@context": "https://schema.org",
          "@type": "DiscussionForumPosting",
          "headline": safeTitle,
          "text": stripBBCode(selectedPost.content),
          "url": canonicalUrl,
          "datePublished": selectedPost.createdAt,
          "dateModified": selectedPost.updatedAt || selectedPost.createdAt,
          "author": {
            "@type": "Person",
            "name": authorName,
          },
          "interactionStatistic": [
            {
              "@type": "InteractionCounter",
              "interactionType": "https://schema.org/LikeAction",
              "userInteractionCount": selectedPost.likes ?? 0
            },
            {
              "@type": "InteractionCounter",
              "interactionType": "https://schema.org/CommentAction",
              "userInteractionCount": allPostReplies.length
            }
          ],
          "commentCount": allPostReplies.length,
          "comment": allPostReplies.slice(0, 50).map((reply) => {
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
            { "@type": "ListItem", "position": 3, "name": safeTitle, "item": canonicalUrl }
          ]
        }
      ],
    };
  }, [selectedPost, allPostReplies, i18n.language]);

  useSEO(seoProps);

  useEffect(() => {
    let isCancelled = false;

    const loadSelectedPostAttachments = async () => {
      if (!selectedPost?.attachments?.length) {
        setSelectedPostAttachmentUrls([]);
        return;
      }

      const resolvedUrls = (
        await Promise.all(
          selectedPost.attachments.map(async (attachment) => {
            try {
              return await resolveStorageImageUrl(attachment);
            } catch (error) {
              console.error("Failed to resolve forum attachment:", attachment, error);
              return "";
            }
          })
        )
      ).filter(Boolean);

      if (!isCancelled) {
        setSelectedPostAttachmentUrls(resolvedUrls);
      }
    };

    loadSelectedPostAttachments();

    return () => {
      isCancelled = true;
    };
  }, [selectedPost]);

  const loadPosts = async (reset = false) => {
    try {
      if (reset) {
        setLoading(true);
        setDisplayedPosts([]);
      }
      setError(null);
      
      const filters: ForumPostFilters = {
        // Hot view supports up to 30 pages, so fetch a larger window.
        limit: viewFilter === "hot" ? HOT_TOPICS_MAX_POSTS : 100,
        sortBy
      };

      // Add category filter
      if (selectedCategory !== "all") {
        filters.category = selectedCategory;
      }

      // Add tag filters
      if (selectedTags.length > 0) {
        filters.tagIds = selectedTags;
      }

      if (searchQuery.trim()) {
        filters.searchQuery = searchQuery.trim();
      }

      const fetchedPosts = await fetchAllForumPosts(filters);
      setAllPosts(fetchedPosts);
      
      // Check which posts user has liked (if authenticated)
      // OPTIMIZED: Use batch query instead of individual queries per post
      if (isAuthenticated && userInfo?.email) {
        try {
          const userId = await getOrCreateClient(userInfo.email, userInfo.email);
          
          // Fetch all user interactions in batch (4 queries total instead of N*2 queries)
          const interactions = await getUserInteractions(userId);
          
          // Debug: Log all interactions fetched
          console.log('All user interactions fetched:', {
            totalLikedPosts: interactions.likedPostIds.size,
            totalDislikedPosts: interactions.dislikedPostIds.size,
            likedPostIds: Array.from(interactions.likedPostIds),
            dislikedPostIds: Array.from(interactions.dislikedPostIds),
            fetchedPostIds: fetchedPosts.map(p => p.id)
          });
          
          // IMPORTANT: Set ALL liked/disliked posts from the batch query, not just the ones in fetchedPosts
          // This ensures we have the complete state of all user interactions
          // The UI will check if a post is liked by checking likedPosts.has(post.id)
          setLikedPosts(prev => {
            // Merge: Keep all liked posts from the batch query, plus any from prev that might not be in the query yet
            const newSet = new Set(interactions.likedPostIds);
            // Also keep any existing likes that might not be in the batch query (edge case: very new likes)
            prev.forEach(id => {
              newSet.add(id);
            });
            console.log('Setting likedPosts state:', {
              fromBatch: Array.from(interactions.likedPostIds),
              fromPrev: Array.from(prev),
              final: Array.from(newSet),
              fetchedPostIds: fetchedPosts.map(p => p.id),
              matchedInFetched: fetchedPosts.filter(p => newSet.has(p.id)).map(p => p.id)
            });
            return newSet;
          });
          setDislikedPosts(prev => {
            // Merge: Keep all disliked posts from the batch query, plus any from prev
            const newSet = new Set(interactions.dislikedPostIds);
            prev.forEach(id => {
              newSet.add(id);
            });
            return newSet;
          });
        } catch (err) {
          console.error('Error checking liked posts:', err);
          // Continue without like status
        }
      }
      
      if (reset) {
        setCurrentPage(1);
      }
    } catch (err) {
      setError(t('forum.error'));
      console.error("Error loading forum posts:", err);
    } finally {
      setLoading(false);
    }
  };

  // Load tags on mount
  useEffect(() => {
    const loadTags = async () => {
      try {
        const fetchedTags = await fetchForumTags(undefined, 50);
        setAvailableTags(fetchedTags);
      } catch (err) {
        console.error("Error loading tags:", err);
      }
    };
    loadTags();
  }, []);

  // Update sortBy when viewFilter changes
  useEffect(() => {
    setSortBy(viewFilter === 'hot' ? 'hot' : 'recent');
  }, [viewFilter]);

  const prevCategoryRef = useRef<string>(categoryFromUrl || "all");

  // Initialize category from URL on mount
  useEffect(() => {
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      const urlCategory = searchParams.get('category') || "all";
      prevCategoryRef.current = urlCategory;
      if (urlCategory !== selectedCategory) {
        isUpdatingFromUrlRef.current = true;
        setSelectedCategory(urlCategory);
      }
    }
  }, []);

  // Update URL when category changes (user action only)
  useEffect(() => {
    if (isInitialMountRef.current) return; // Skip on initial mount
    if (isUpdatingFromUrlRef.current) {
      isUpdatingFromUrlRef.current = false;
      return; // Skip URL update if change came from URL
    }

    // Only update URL if category actually changed (user action)
    if (prevCategoryRef.current !== selectedCategory) {
      const newParams = new URLSearchParams(window.location.search);
      if (selectedCategory !== "all") {
        newParams.set('category', selectedCategory);
      } else {
        newParams.delete('category');
      }
      // Remove post param when changing category
      newParams.delete('post');
      prevCategoryRef.current = selectedCategory;
      setSearchParams(newParams, { replace: true });
    }
  }, [selectedCategory, setSearchParams]);

  // Update category when URL changes (browser navigation or shared link)
  useEffect(() => {
    if (isInitialMountRef.current) return;

    const urlCategory = searchParams.get('category') || "all";
    // Only update if URL changed and it's different from what we last set
    if (urlCategory !== prevCategoryRef.current) {
      isUpdatingFromUrlRef.current = true;
      prevCategoryRef.current = urlCategory;
      setSelectedCategory(urlCategory);
    }
  }, [searchParams, setSelectedCategory]);

  useEffect(() => {
    if (skipInitialListFetchRef.current) {
      skipInitialListFetchRef.current = false;
      return;
    }
    loadPosts(true);
  }, [selectedCategory, selectedTags, sortBy]);

  // Show trading disclaimer dialog when Trading category is selected
  useEffect(() => {
    if (selectedCategory === "TRADING") {
      // Check if user has already acknowledged the disclaimer in this session
      const hasAcknowledged = sessionStorage.getItem('trading_disclaimer_acknowledged') === 'true';
      if (!hasAcknowledged) {
        setTradingDisclaimerOpen(true);
      }
    }
  }, [selectedCategory]);

  // Debounced search
  useEffect(() => {
    if (skipInitialSearchFetchRef.current) {
      skipInitialSearchFetchRef.current = false;
      return;
    }
    const timer = setTimeout(() => {
      if (searchQuery.trim() || !searchQuery) {
        loadPosts(true);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Filter posts by tag
  const filteredPosts = useMemo(() => {
    let filtered = [...allPosts];

    if (selectedTag !== "all") {
      filtered = filtered.filter(post =>
        post.tags && post.tags.some(tag =>
          tag.toLowerCase().includes(selectedTag.toLowerCase())
        )
      );
    }

    if (viewFilter === "hot") {
      // Hot tab should only show posts explicitly marked as hot by scheduler.
      filtered = filtered
        .filter((post) => post.isHot === true)
        .sort((a, b) => (b.hotScore ?? 0) - (a.hotScore ?? 0))
        .slice(0, HOT_TOPICS_MAX_POSTS);
    }

    return filtered;
  }, [allPosts, selectedTag, viewFilter]);

  // Calculate total pages for posts
  const totalPostPages = useMemo(() => {
    return Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
  }, [filteredPosts.length]);

  // Update displayed posts when filtered posts or page changes
  useEffect(() => {
    const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
    const endIndex = startIndex + POSTS_PER_PAGE;
    setDisplayedPosts(filteredPosts.slice(startIndex, endIndex));
    
    // Don't reset selected post when filters change - keep URL state
    // Only reset if post is not in filtered results
    if (selectedPost && !filteredPosts.find(p => p.id === selectedPost.id)) {
      setSelectedPost(null);
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('post');
      setSearchParams(newParams, { replace: true });
    }
  }, [filteredPosts, currentPage, selectedPost, searchParams, setSearchParams]);

  // When no post is selected (e.g., after back-navigation or deselect) reset mobile view to list.
  useEffect(() => {
    if (!selectedPost) {
      setMobileShowDetail(false);
    }
  }, [selectedPost]);

  useEffect(() => {
    if (mobileShowDetail || isSearchExpanded) {
      setIsMobileFilterBarHidden(false);
    }
  }, [mobileShowDetail, isSearchExpanded]);

  useEffect(() => {
    const postListContainer = postListContainerRef.current;
    if (!postListContainer || mobileShowDetail) {
      return;
    }

    lastPostListScrollTopRef.current = postListContainer.scrollTop;

    const handlePostListScroll = () => {
      if (window.innerWidth >= 768) {
        if (isMobileFilterBarHidden) {
          setIsMobileFilterBarHidden(false);
        }
        lastPostListScrollTopRef.current = postListContainer.scrollTop;
        return;
      }

      const currentScrollTop = postListContainer.scrollTop;
      const scrollDelta = currentScrollTop - lastPostListScrollTopRef.current;

      if (currentScrollTop <= 8) {
        if (isMobileFilterBarHidden) {
          setIsMobileFilterBarHidden(false);
        }
      } else if (scrollDelta > 12) {
        if (!isMobileFilterBarHidden) {
          setIsMobileFilterBarHidden(true);
        }
      } else if (scrollDelta < -12) {
        if (isMobileFilterBarHidden) {
          setIsMobileFilterBarHidden(false);
        }
      }

      lastPostListScrollTopRef.current = currentScrollTop;
    };

    postListContainer.addEventListener('scroll', handlePostListScroll, { passive: true });

    return () => {
      postListContainer.removeEventListener('scroll', handlePostListScroll);
    };
  }, [mobileShowDetail, isMobileFilterBarHidden]);

  // Handle page change for posts
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    // Scroll to top of post list
    const postListContainer = postListContainerRef.current;
    if (postListContainer) {
      postListContainer.scrollTop = 0;
    }
  }, []);

  // Store posts in refs to avoid dependency issues
  const displayedPostsRef = useRef(displayedPosts);
  const allPostsRef = useRef(allPosts);
  const selectedPostRef = useRef(selectedPost);
  
  useEffect(() => {
    displayedPostsRef.current = displayedPosts;
  }, [displayedPosts]);
  
  useEffect(() => {
    allPostsRef.current = allPosts;
  }, [allPosts]);
  
  useEffect(() => {
    selectedPostRef.current = selectedPost;
  }, [selectedPost]);

  // Load post detail when selected (with loading state to prevent flashing)
  const loadPostDetail = useCallback(async (postId: string, skipIfSame = false, replyPage = 1) => {
    // Skip if already loading/loaded the same post
    if (skipIfSame && selectedPostRef.current?.id === postId && loadingPostIdRef.current !== postId) {
      return;
    }
    
    // Skip if already loading this post
    if (loadingPostIdRef.current === postId) {
      return;
    }
    
    // Set loading state and track which post we're loading
    loadingPostIdRef.current = postId;
    setLoadingPostDetail(true);
    
    try {
      const fullPost = await getForumPostById(postId);
      
      // Load all replies first, then paginate all replies (flat view - 10 per page)
      const allReplies = await getForumPostReplies(postId, 100);
      
      // Sort all replies by creation time (oldest first)
      const sortedAllReplies = [...allReplies].sort((a, b) => {
        if (!a.createdAt || !b.createdAt) return 0;
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      });
      
      // Paginate all replies (10 per page)
      const totalPages = Math.ceil(sortedAllReplies.length / REPLIES_PER_PAGE);
      const startIndex = (replyPage - 1) * REPLIES_PER_PAGE;
      const endIndex = startIndex + REPLIES_PER_PAGE;
      const paginatedReplies = sortedAllReplies.slice(startIndex, endIndex);
      
      // Separate top-level replies for counting (for display purposes)
      const topLevelReplies = allReplies.filter(r => !r.parentReplyId);
      
      // Only update if this is still the post we're loading (prevent race conditions)
      if (loadingPostIdRef.current === postId) {
        setSelectedPost(fullPost);
        setSelectedPostReplies(paginatedReplies);
        setAllPostReplies(allReplies); // Store all replies for numbering and parent lookup
        setTotalReplies(allReplies.length); // Count all replies for pagination
        setTotalReplyPages(totalPages);
        setCurrentReplyPage(replyPage);
        
        // Check if user has liked this post and replies (if authenticated)
        if (isAuthenticated && userInfo?.email) {
          try {
            const userId = await getOrCreateClient(userInfo.email, userInfo.email);
            
            // OPTIMIZED: Fetch all user interactions in batch (much faster than individual queries)
            const interactions = await getUserInteractions(userId);
            
            // Update ALL liked/disliked posts from the batch query (not just this one post)
            // This ensures we have the complete state of all user interactions
            setLikedPosts(prev => {
              const newSet = new Set(interactions.likedPostIds);
              // Merge with prev to keep any very recent likes that might not be in batch yet
              prev.forEach(id => newSet.add(id));
              return newSet;
            });
            setDislikedPosts(prev => {
              const newSet = new Set(interactions.dislikedPostIds);
              // Merge with prev to keep any very recent dislikes that might not be in batch yet
              prev.forEach(id => newSet.add(id));
              return newSet;
            });
            
            // Filter reply interactions for this post's replies
            const likedReplyIds = new Set<string>();
            const dislikedReplyIds = new Set<string>();
            paginatedReplies.forEach(reply => {
              if (interactions.likedReplyIds.has(reply.id)) {
                likedReplyIds.add(reply.id);
              }
              if (interactions.dislikedReplyIds.has(reply.id)) {
                dislikedReplyIds.add(reply.id);
              }
            });
            
            setLikedReplies(prev => {
              const newSet = new Set(prev);
              // Remove old likes for this post's replies
              paginatedReplies.forEach(reply => newSet.delete(reply.id));
              // Add new likes
              likedReplyIds.forEach(id => newSet.add(id));
              return newSet;
            });
            setDislikedReplies(prev => {
              const newSet = new Set(prev);
              // Remove old dislikes for this post's replies
              paginatedReplies.forEach(reply => newSet.delete(reply.id));
              // Add new dislikes
              dislikedReplyIds.forEach(id => newSet.add(id));
              return newSet;
            });
          } catch (err) {
            console.error('Error checking like status:', err);
            // Continue without like status
          }
        }
        
        setLoadingPostDetail(false);
        loadingPostIdRef.current = null;
      }
    } catch (err) {
      console.error("Error loading post detail:", err);
      // Only update if this is still the post we're loading
      if (loadingPostIdRef.current === postId) {
        // If error, try to find post in displayed posts as fallback
        const fallbackPost = displayedPostsRef.current.find(p => p.id === postId) || allPostsRef.current.find(p => p.id === postId);
        if (fallbackPost) {
          setSelectedPost(fallbackPost);
        }
        setLoadingPostDetail(false);
        loadingPostIdRef.current = null;
      }
    }
  }, []); // No dependencies - use refs instead

  // Handle reply page change
  const handleReplyPageChange = useCallback((page: number, scrollToReplyId?: string) => {
    if (selectedPost) {
      setCurrentReplyPage(page);
      loadPostDetail(selectedPost.id, false, page).then(() => {
        // Scroll to top of replies section or specific reply
        if (scrollToReplyId) {
          // Wait for DOM to update, try multiple times if needed
          const scrollToElement = (attempts = 0) => {
            const replyElement = document.getElementById(`reply-${scrollToReplyId}`);
            if (replyElement) {
              replyElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
              // Highlight the reply briefly
              replyElement.classList.add('ring-2', 'ring-[#FF902A]', 'ring-offset-2', 'transition-all');
              setTimeout(() => {
                replyElement.classList.remove('ring-2', 'ring-[#FF902A]', 'ring-offset-2');
              }, 2000);
            } else if (attempts < 10) {
              // Retry if element not found yet
              setTimeout(() => scrollToElement(attempts + 1), 100);
            }
          };
          setTimeout(() => scrollToElement(), 200);
        } else {
          const repliesSection = document.querySelector('[data-replies-section]');
          if (repliesSection) {
            repliesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      });
    }
  }, [selectedPost, loadPostDetail]);
  
  // Find which page a reply is on and jump to it
  const jumpToReply = useCallback((replyId: string) => {
    if (!selectedPost) return;
    
    // Use allPostReplies if available, otherwise use selectedPostReplies
    const repliesToSearch = allPostReplies.length > 0 ? allPostReplies : selectedPostReplies;
    if (repliesToSearch.length === 0) {
      // Try to scroll to it anyway if it's on the current page
      setTimeout(() => {
        const replyElement = document.getElementById(`reply-${replyId}`);
        if (replyElement) {
          replyElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          replyElement.classList.add('ring-2', 'ring-[#FF902A]', 'ring-offset-2', 'transition-all');
          setTimeout(() => {
            replyElement.classList.remove('ring-2', 'ring-[#FF902A]', 'ring-offset-2');
          }, 2000);
        }
      }, 100);
      return;
    }
    
    // Find the reply in repliesToSearch
    const reply = repliesToSearch.find(r => r.id === replyId);
    if (!reply) {
      // Try to scroll to it anyway if it's on the current page
      setTimeout(() => {
        const replyElement = document.getElementById(`reply-${replyId}`);
        if (replyElement) {
          replyElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          replyElement.classList.add('ring-2', 'ring-[#FF902A]', 'ring-offset-2', 'transition-all');
          setTimeout(() => {
            replyElement.classList.remove('ring-2', 'ring-[#FF902A]', 'ring-offset-2');
          }, 2000);
        }
      }, 100);
      return;
    }
    
    // Determine if it's a top-level reply or nested
    const isTopLevel = !reply.parentReplyId;
    
    if (isTopLevel) {
      // Find which page this top-level reply is on
      const topLevelReplies = repliesToSearch.filter(r => !r.parentReplyId);
      const replyIndex = topLevelReplies.findIndex(r => r.id === replyId);
      if (replyIndex >= 0) {
        const targetPage = Math.floor(replyIndex / REPLIES_PER_PAGE) + 1;
        // If already on the correct page, just scroll to it
        if (targetPage === currentReplyPage) {
          setTimeout(() => {
            const replyElement = document.getElementById(`reply-${replyId}`);
            if (replyElement) {
              replyElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
              replyElement.classList.add('ring-2', 'ring-[#FF902A]', 'ring-offset-2', 'transition-all');
              setTimeout(() => {
                replyElement.classList.remove('ring-2', 'ring-[#FF902A]', 'ring-offset-2');
              }, 2000);
            }
          }, 100);
        } else {
          handleReplyPageChange(targetPage, replyId);
        }
      }
    } else {
      // For nested replies, find the top-level parent and navigate to its page
      const findTopLevelParent = (currentReplyId: string): string | null => {
        const currentReply = repliesToSearch.find(r => r.id === currentReplyId);
        if (!currentReply || !currentReply.parentReplyId) return currentReplyId;
        const parent = repliesToSearch.find(r => r.id === currentReply.parentReplyId);
        if (!parent) return currentReplyId;
        if (!parent.parentReplyId) return parent.id;
        return findTopLevelParent(parent.id);
      };
      
      const topLevelParentId = findTopLevelParent(replyId);
      if (topLevelParentId) {
        const topLevelReplies = repliesToSearch.filter(r => !r.parentReplyId);
        const parentIndex = topLevelReplies.findIndex(r => r.id === topLevelParentId);
        if (parentIndex >= 0) {
          const targetPage = Math.floor(parentIndex / REPLIES_PER_PAGE) + 1;
          // If already on the correct page, just scroll to it
          if (targetPage === currentReplyPage) {
            setTimeout(() => {
              const replyElement = document.getElementById(`reply-${replyId}`);
              if (replyElement) {
                replyElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                replyElement.classList.add('ring-2', 'ring-[#FF902A]', 'ring-offset-2', 'transition-all');
                setTimeout(() => {
                  replyElement.classList.remove('ring-2', 'ring-[#FF902A]', 'ring-offset-2');
                }, 2000);
              }
            }, 100);
          } else {
            handleReplyPageChange(targetPage, replyId);
          }
        }
      } else {
        // Fallback: try to scroll to it on current page
        setTimeout(() => {
          const replyElement = document.getElementById(`reply-${replyId}`);
          if (replyElement) {
            replyElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            replyElement.classList.add('ring-2', 'ring-[#FF902A]', 'ring-offset-2', 'transition-all');
            setTimeout(() => {
              replyElement.classList.remove('ring-2', 'ring-[#FF902A]', 'ring-offset-2');
            }, 2000);
          }
        }, 100);
      }
    }
  }, [selectedPost, allPostReplies, selectedPostReplies, handleReplyPageChange, currentReplyPage]);

  // Handle post selection - update URL immediately, load data in background
  const handlePostSelect = useCallback((post: ForumPost) => {
    // Clear replies immediately to prevent showing old replies
    setSelectedPostReplies([]);
    setAllPostReplies([]);
    // Clear reply form when switching posts
    setReplyContent("");
    setReplyingToReply(null);
    setShowReplyBox(false);
    
    // Update URL immediately (no loading, instant feedback)
    const newParams = new URLSearchParams(searchParams);
    newParams.set('post', post.id);
    setSearchParams(newParams, { replace: true });
    
    // Set loading state before updating post
    setLoadingPostDetail(true);
    
    // Optimistically set the post from list (instant)
    setSelectedPost(post);

    // On mobile, push to the detail view (replaces the list)
    setMobileShowDetail(true);
    
    // Load full post data in background
    loadPostDetail(post.id);
  }, [searchParams, setSearchParams, loadPostDetail]);

  // Share function
  const handleShare = useCallback(async (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    
    if (!selectedPost) return;
    
    const url = `${window.location.origin}/forum?post=${selectedPost.id}`;
    const shareData = {
      title: sanitizeUserVisibleText(selectedPost.title),
      text: sanitizeUserVisibleText(selectedPost.content).substring(0, 200) + '...',
      url: url,
    };

    try {
      // Try Web Share API first (mobile)
      if (navigator.share) {
        try {
          await navigator.share(shareData);
          toast({
            title: i18n.language === 'zh' ? '分享成功' : 'Shared',
            description: i18n.language === 'zh' ? '內容已分享' : 'Content shared successfully',
          });
          return;
        } catch (shareErr) {
          // User cancelled or share failed, fall through to clipboard
          if (shareErr instanceof Error && shareErr.name === 'AbortError') {
            return; // User cancelled, don't show error
          }
        }
      }
      
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(url);
      toast({
        title: i18n.language === 'zh' ? '連結已複製' : 'Link Copied',
        description: i18n.language === 'zh' ? '連結已複製到剪貼板' : 'Link copied to clipboard',
      });
    } catch (err) {
      // User cancelled share or error occurred
      if (err instanceof Error && err.name !== 'AbortError') {
        console.error('Error sharing:', err);
        // Fallback to clipboard
        try {
          await navigator.clipboard.writeText(url);
          toast({
            title: i18n.language === 'zh' ? '連結已複製' : 'Link Copied',
            description: i18n.language === 'zh' ? '連結已複製到剪貼板' : 'Link copied to clipboard',
          });
        } catch (clipboardErr) {
          console.error('Error copying to clipboard:', clipboardErr);
          toast({
            title: i18n.language === 'zh' ? '複製失敗' : 'Copy Failed',
            description: i18n.language === 'zh' ? '無法複製連結，請手動複製' : 'Failed to copy link, please copy manually',
            variant: 'destructive',
          });
        }
      }
    }
  }, [selectedPost, i18n.language, toast]);

  // Handle like/unlike post with optimistic UI updates
  const handleLikePost = useCallback(async (post: ForumPost, e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    
    if (!isAuthenticated || !userInfo?.email) {
      toast({
        title: i18n.language === 'zh' ? '需要登入' : 'Login Required',
        description: i18n.language === 'zh' ? '請先登入以讚好帖文' : 'Please log in to like posts',
        variant: 'default',
      });
      return;
    }
    
    // Prevent duplicate likes - check if already processing
    if (likingPostIds.has(post.id)) {
      return; // Already processing, ignore click
    }
    
    // Store original state for rollback - check actual like status first
    const wasLiked = likedPosts.has(post.id);
    const originalLikesCount = post.likes;
    
    // Mark as processing
    setLikingPostIds(prev => new Set(prev).add(post.id));
    
    // OPTIMISTIC UPDATE: Update UI immediately (fake/instant response)
    // If wasLiked is true, we're unliking (so subtract 1)
    // If wasLiked is false, we're liking (so add 1)
    const optimisticLiked = !wasLiked;
    const optimisticLikesCount = wasLiked 
      ? Math.max(0, originalLikesCount - 1)  // Unliking: subtract 1
      : originalLikesCount + 1;              // Liking: add 1
    
    // Update liked state immediately using functional update
    setLikedPosts(prev => {
      const newSet = new Set(prev);
      if (optimisticLiked) {
        newSet.add(post.id);
      } else {
        newSet.delete(post.id);
      }
      return newSet;
    });
    
    // If currently disliked, remove dislike first (mutual exclusivity)
    const wasDisliked = dislikedPosts.has(post.id);
    const originalDislikesCount = post.dislikes || 0;
    
    // Optimistically remove dislike if present
    if (wasDisliked) {
      setDislikedPosts(prev => {
        const newSet = new Set(prev);
        newSet.delete(post.id);
        return newSet;
      });
    }
    
    // Calculate optimistic dislikes count
    const optimisticDislikesCount = wasDisliked 
      ? Math.max(0, originalDislikesCount - 1) 
      : originalDislikesCount;
    
    // Update post in lists immediately (both likes and dislikes together to prevent flickering)
    const updatePostInList = (p: ForumPost) => 
      p.id === post.id ? { ...p, likes: optimisticLikesCount, dislikes: optimisticDislikesCount } : p;
    
    setAllPosts(prev => prev.map(updatePostInList));
    setDisplayedPosts(prev => prev.map(updatePostInList));
    
    // Update selected post immediately if it's the one being liked
    if (selectedPost?.id === post.id) {
      setSelectedPost(prev => prev ? { ...prev, likes: optimisticLikesCount, dislikes: optimisticDislikesCount } : null);
    }
    
    // Make API call in background (sync with server) - fire and forget
    // Allow rapid clicks - each click gets its own optimistic update
    togglePostLike(
      post.id,
      userInfo.email,
      originalLikesCount,
      originalDislikesCount,
      post.replies
    ).then(result => {
      console.log('Post like result:', result);
      
      // Always update with server response to ensure consistency
      setLikedPosts(prev => {
        const newSet = new Set(prev);
        if (result.liked) {
          newSet.add(post.id);
          // Ensure mutual exclusivity - remove from disliked if present
          setDislikedPosts(prevDisliked => {
            const newDislikedSet = new Set(prevDisliked);
            newDislikedSet.delete(post.id);
            return newDislikedSet;
          });
        } else {
          newSet.delete(post.id);
        }
        return newSet;
      });
      
      // If was disliked and now liked, remove dislike
      if (wasDisliked && result.liked) {
        setDislikedPosts(prev => {
          const newSet = new Set(prev);
          newSet.delete(post.id);
          return newSet;
        });
      }
      
      // Always update both counts to keep them in sync
      const updatePostWithServer = (p: ForumPost) => 
        p.id === post.id ? { ...p, likes: result.newLikesCount, dislikes: result.newDislikesCount } : p;
      
      setAllPosts(prev => prev.map(updatePostWithServer));
      setDisplayedPosts(prev => prev.map(updatePostWithServer));
      
      if (selectedPost?.id === post.id) {
        setSelectedPost(prev => prev ? { ...prev, likes: result.newLikesCount, dislikes: result.newDislikesCount } : null);
      }
    }).catch(error => {
      console.error('Error toggling like:', error);
      
      // ROLLBACK: Revert optimistic update on error
      setLikedPosts(prev => {
        const newSet = new Set(prev);
        if (wasLiked) {
          newSet.add(post.id);
        } else {
          newSet.delete(post.id);
        }
        return newSet;
      });
      
      // Rollback post counts
      const rollbackPost = (p: ForumPost) => 
        p.id === post.id ? { ...p, likes: originalLikesCount, dislikes: originalDislikesCount } : p;
      
      setAllPosts(prev => prev.map(rollbackPost));
      setDisplayedPosts(prev => prev.map(rollbackPost));
      
      if (selectedPost?.id === post.id) {
        setSelectedPost(prev => prev ? { ...prev, likes: originalLikesCount, dislikes: originalDislikesCount } : null);
      }
      
      // Rollback dislike state if needed
      if (wasDisliked) {
        setDislikedPosts(prev => {
          const newSet = new Set(prev);
          newSet.add(post.id);
          return newSet;
        });
      }
      
      toast({
        title: i18n.language === 'zh' ? '操作失敗' : 'Operation Failed',
        description: i18n.language === 'zh' ? '無法更新讚好狀態，請稍後再試' : 'Failed to update like status, please try again',
        variant: 'destructive',
      });
    }).finally(() => {
      // Remove from processing set
      setLikingPostIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(post.id);
        return newSet;
      });
    });
  }, [isAuthenticated, userInfo, likedPosts, dislikedPosts, selectedPost, i18n.language, toast, likingPostIds]);

  // Handle dislike/un-dislike post with optimistic UI updates
  const handleDislikePost = useCallback(async (post: ForumPost, e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    
    if (!isAuthenticated || !userInfo?.email) {
      toast({
        title: i18n.language === 'zh' ? '需要登入' : 'Login Required',
        description: i18n.language === 'zh' ? '請先登入以不喜歡帖文' : 'Please log in to dislike posts',
        variant: 'default',
      });
      return;
    }
    
    // Prevent duplicate dislikes - check if already processing
    if (likingPostIds.has(post.id)) {
      return; // Already processing, ignore click
    }
    
    // Store original state for rollback
    const wasDisliked = dislikedPosts.has(post.id);
    const wasLiked = likedPosts.has(post.id);
    const originalDislikesCount = post.dislikes || 0;
    const originalLikesCount = post.likes || 0;
    
    // Mark as processing
    setLikingPostIds(prev => new Set(prev).add(post.id));
    
    // OPTIMISTIC UPDATE: Update UI immediately
    const optimisticDisliked = !wasDisliked;
    const optimisticDislikesCount = wasDisliked 
      ? Math.max(0, originalDislikesCount - 1)  // Undisliking: subtract 1
      : originalDislikesCount + 1;              // Disliking: add 1
    
    // If currently liked, remove like first (mutual exclusivity)
    if (wasLiked) {
      setLikedPosts(prev => {
        const newSet = new Set(prev);
        newSet.delete(post.id);
        return newSet;
      });
    }
    
    // Update disliked state immediately
    setDislikedPosts(prev => {
      const newSet = new Set(prev);
      if (optimisticDisliked) {
        newSet.add(post.id);
      } else {
        newSet.delete(post.id);
      }
      return newSet;
    });
    
    // Calculate optimistic likes count
    const optimisticLikesCount = wasLiked 
      ? Math.max(0, originalLikesCount - 1) 
      : originalLikesCount;
    
    // Update post in lists immediately (both likes and dislikes together to prevent flickering)
    const updatePostInList = (p: ForumPost) => 
      p.id === post.id ? { ...p, likes: optimisticLikesCount, dislikes: optimisticDislikesCount } : p;
    
    setAllPosts(prev => prev.map(updatePostInList));
    setDisplayedPosts(prev => prev.map(updatePostInList));
    
    // Update selected post immediately if it's the one being disliked
    if (selectedPost?.id === post.id) {
      setSelectedPost(prev => prev ? { ...prev, likes: optimisticLikesCount, dislikes: optimisticDislikesCount } : null);
    }
    
    // Make API call in background
    togglePostDislike(
      post.id,
      userInfo.email,
      originalLikesCount,
      originalDislikesCount,
      post.replies
    ).then(result => {
      console.log('Post dislike result:', result);
      
      // Always update with server response to ensure consistency
      setDislikedPosts(prev => {
        const newSet = new Set(prev);
        if (result.disliked) {
          newSet.add(post.id);
          // Ensure mutual exclusivity - remove from liked if present
          setLikedPosts(prevLiked => {
            const newLikedSet = new Set(prevLiked);
            newLikedSet.delete(post.id);
            return newLikedSet;
          });
        } else {
          newSet.delete(post.id);
        }
        return newSet;
      });
      
      // Update like state if it changed (ensure mutual exclusivity)
      if (wasLiked && result.disliked) {
        setLikedPosts(prev => {
          const newSet = new Set(prev);
          newSet.delete(post.id);
          return newSet;
        });
      }
      
      // Always update both counts to keep them in sync
      const updatePostWithServer = (p: ForumPost) => 
        p.id === post.id ? { ...p, dislikes: result.newDislikesCount, likes: result.newLikesCount } : p;
      
      setAllPosts(prev => prev.map(updatePostWithServer));
      setDisplayedPosts(prev => prev.map(updatePostWithServer));
      
      if (selectedPost?.id === post.id) {
        setSelectedPost(prev => prev ? { ...prev, dislikes: result.newDislikesCount, likes: result.newLikesCount } : null);
      }
    }).catch(error => {
      console.error('Error toggling dislike:', error);
      
      // ROLLBACK: Revert optimistic update on error
      setDislikedPosts(prev => {
        const newSet = new Set(prev);
        if (wasDisliked) {
          newSet.add(post.id);
        } else {
          newSet.delete(post.id);
        }
        return newSet;
      });
      
      // Rollback post counts
      const rollbackPost = (p: ForumPost) => 
        p.id === post.id ? { ...p, dislikes: originalDislikesCount, likes: originalLikesCount } : p;
      
      setAllPosts(prev => prev.map(rollbackPost));
      setDisplayedPosts(prev => prev.map(rollbackPost));
      
      if (selectedPost?.id === post.id) {
        setSelectedPost(prev => prev ? { ...prev, dislikes: originalDislikesCount, likes: originalLikesCount } : null);
      }
      
      // Rollback like state if needed
      if (wasLiked) {
        setLikedPosts(prev => {
          const newSet = new Set(prev);
          newSet.add(post.id);
          return newSet;
        });
      }
      
      toast({
        title: i18n.language === 'zh' ? '操作失敗' : 'Operation Failed',
        description: i18n.language === 'zh' ? '無法更新不喜歡狀態，請稍後再試' : 'Failed to update dislike status, please try again',
        variant: 'destructive',
      });
    }).finally(() => {
      // Remove from processing set
      setLikingPostIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(post.id);
        return newSet;
      });
    });
  }, [isAuthenticated, userInfo, dislikedPosts, likedPosts, selectedPost, i18n.language, toast, likingPostIds]);

  // Load post from URL on mount or when URL changes
  useEffect(() => {
    // Skip if already showing the correct post and not loading
    if (postIdFromUrl === currentPostIdRef.current && 
        selectedPostRef.current?.id === postIdFromUrl && 
        loadingPostIdRef.current !== postIdFromUrl) {
      return;
    }
    
    if (postIdFromUrl) {
      // Skip if already loading this exact post
      if (loadingPostIdRef.current === postIdFromUrl) {
        return;
      }
      
      // Update ref to track current post
      currentPostIdRef.current = postIdFromUrl;
      
      // Clear replies immediately to prevent showing old content
      setSelectedPostReplies([]);
      setAllPostReplies([]);
      
      // First try to find post in displayed posts (instant)
      const postInList = displayedPostsRef.current.find(p => p.id === postIdFromUrl);
      if (postInList) {
        if (selectedPostRef.current?.id !== postIdFromUrl) {
          setSelectedPost(postInList);
        }
        // Load full details in background
        loadPostDetail(postIdFromUrl, true);
      } else if (allPostsRef.current.length > 0) {
        // Try in all posts
        const postInAll = allPostsRef.current.find(p => p.id === postIdFromUrl);
        if (postInAll) {
          if (selectedPostRef.current?.id !== postIdFromUrl) {
            setSelectedPost(postInAll);
          }
          loadPostDetail(postIdFromUrl, true);
        } else {
          // Post not in current list, load directly
          if (selectedPostRef.current?.id !== postIdFromUrl) {
            setLoadingPostDetail(true);
          }
          loadPostDetail(postIdFromUrl, false);
        }
      } else {
        // No posts loaded yet, set loading state
        if (selectedPostRef.current?.id !== postIdFromUrl) {
          setLoadingPostDetail(true);
        }
      }
    } else {
      // No post in URL, clear selection
      currentPostIdRef.current = null;
      if (selectedPostRef.current) {
        setSelectedPost(null);
        setSelectedPostReplies([]);
        setAllPostReplies([]);
      setLoadingPostDetail(false);
        loadingPostIdRef.current = null;
      }
    }
  }, [postIdFromUrl, loadPostDetail]); // Only depend on URL and stable loadPostDetail

  // When posts are first loaded, check if we need to load a post from URL
  useEffect(() => {
    if (postIdFromUrl && allPosts.length > 0 && !selectedPostRef.current) {
      const post = allPosts.find(p => p.id === postIdFromUrl);
      if (post) {
        currentPostIdRef.current = postIdFromUrl;
        setSelectedPostReplies([]);
        setAllPostReplies([]);
        setSelectedPost(post);
        loadPostDetail(postIdFromUrl, false);
      }
    }
  }, [allPosts.length, postIdFromUrl, loadPostDetail]);

  // Check like status whenever selected post changes (to ensure red state persists)
  useEffect(() => {
    if (selectedPost && isAuthenticated && userInfo?.email) {
      const checkLikeStatus = async () => {
        try {
          const userId = await getOrCreateClient(userInfo.email, userInfo.email);
          const isLiked = await checkUserLikedPost(selectedPost.id, userId);
          setLikedPosts(prev => {
            const newSet = new Set(prev);
            if (isLiked) {
              newSet.add(selectedPost.id);
            } else {
              newSet.delete(selectedPost.id);
            }
            return newSet;
          });
        } catch (err) {
          console.error('Error checking like status for selected post:', err);
        }
      };
      checkLikeStatus();
    }
  }, [selectedPost?.id, isAuthenticated, userInfo?.email]); // Only trigger when posts are first loaded

  // Measure post content height to determine if "show more" is needed
  useEffect(() => {
    if (postContentRef.current && selectedPost) {
      const checkHeight = () => {
        const height = postContentRef.current?.scrollHeight || 0;
        const MAX_HEIGHT = 600;
        setPostsNeedingShowMore(prev => {
          const newSet = new Set(prev);
          if (height > MAX_HEIGHT) {
            newSet.add(selectedPost.id);
          } else {
            newSet.delete(selectedPost.id);
          }
          return newSet;
        });
      };
      
      // Check after a short delay to ensure content is rendered
      const timeoutId = setTimeout(checkHeight, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [selectedPost?.content, selectedPost?.id]);

  // Measure reply content heights to determine if "show more" is needed
  useEffect(() => {
    const MAX_HEIGHT = 400;
    const checkReplyHeights = () => {
      setRepliesNeedingShowMore(prev => {
        const newSet = new Set(prev);
        replyContentRefs.current.forEach((element, replyId) => {
          const height = element.scrollHeight;
          if (height > MAX_HEIGHT) {
            newSet.add(replyId);
          } else {
            newSet.delete(replyId);
          }
        });
        return newSet;
      });
    };
    
    // Check after a short delay to ensure content is rendered
    const timeoutId = setTimeout(checkReplyHeights, 100);
    return () => clearTimeout(timeoutId);
  }, [selectedPostReplies]);

  // Handle image click events from BBCode parsed content using event delegation
  useEffect(() => {
    const handleImageClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'IMG' && target.hasAttribute('data-image-url')) {
        const imageUrl = target.getAttribute('data-image-url');
        if (imageUrl) {
          e.preventDefault();
          e.stopPropagation();
          setViewingImageUrl(imageUrl);
          setImageViewerOpen(true);
        }
      }
    };

    // Use event delegation on the document
    document.addEventListener('click', handleImageClick);
    return () => {
      document.removeEventListener('click', handleImageClick);
    };
  }, []);

  const legacyCategories = useMemo(() => getCategories(allPosts), [allPosts]);
  const tags = useMemo(() => getAllTags(allPosts), [allPosts]);

  const formatDate = (timestamp?: string): string => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleDateString(i18n.language === 'zh' ? 'zh-HK' : 'en-US', {
      year: '2-digit',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const renderPageNumbers = (replies: number) => {
    if (replies === 0) return null;
    const pages = Math.ceil(replies / 20); // Assuming 20 replies per page
    if (pages <= 1) return null;
    return (
      <span className="text-xs text-[#FF902A] font-medium ml-2">
        {pages} {t('forum.pages')}
      </span>
    );
  };

  return (
    <div className="h-screen bg-background overflow-hidden flex flex-col">
      <Header />
      <h1 className="sr-only">
        {i18n.language === "zh" ? "香港寵物討論區" : "Hong Kong Pet Forum"}
      </h1>
      
      {/* Top Bar with Expandable Search */}
      <div className="sticky top-[var(--header-height)] z-20 bg-white border-b border-border shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-14 gap-4">
            {/* Expandable Search */}
            <div className="flex items-center flex-1">
              {!isSearchExpanded ? (
                <>
                  {/* Mobile: forum title when in list view */}
                  <span className="md:hidden text-base font-bold text-foreground mr-2 truncate">
                    {i18n.language === 'zh' ? '寵物討論區' : 'Pet Forum'}
                  </span>
                  <button
                    onClick={() => setIsSearchExpanded(true)}
                    className="p-2 hover:bg-muted rounded-lg transition-colors"
                    aria-label="Search"
                  >
                    <Search className="h-5 w-5 text-muted-foreground" />
                  </button>
                </>
              ) : (
                <div className="flex items-center flex-1 max-w-2xl">
                  <div className="flex items-center bg-white border-2 border-border rounded-lg shadow-sm hover:border-[#FF902A]/50 transition-all duration-200 focus-within:border-[#FF902A] focus-within:shadow-md w-full">
                    <div className="flex items-center px-3 py-2">
                      <Search className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <input
                      type="text"
                      placeholder={t('forum.searchPlaceholder')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1 py-2 px-2 outline-none text-sm bg-transparent placeholder:text-muted-foreground"
                      autoFocus
                    />
                    {searchQuery && (
                      <button
                        onClick={() => {
                          setSearchQuery("");
                          loadPosts(true);
                        }}
                        className="px-2 py-2 hover:bg-muted rounded-r-lg transition-colors"
                        aria-label="Clear search"
                      >
                        <X className="h-4 w-4 text-muted-foreground" />
                      </button>
                    )}
                    <button
                      onClick={() => setIsSearchExpanded(false)}
                      className="px-2 py-2 hover:bg-muted rounded-r-lg transition-colors"
                      aria-label="Collapse search"
                    >
                      <X className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile-only: Create Post button in top bar (visible in list view) */}
            {!mobileShowDetail && !isSearchExpanded && (
              <Button
                onClick={() => setCreateDialogOpen(true)}
                className="md:hidden bg-[#FF902A] hover:bg-[#FF7A1A] text-white h-9 w-9 p-0 shrink-0"
                size="icon"
                title={t('forum.createPost.button')}
              >
                <Plus className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
      
      <main className="container mx-auto px-0 md:px-4 pt-0 md:pt-4 flex-1 overflow-hidden flex flex-col">
        <div className="w-full mx-auto flex-1 overflow-hidden flex flex-col md:px-2">

          {/* Split Layout: Left (Post List) + Right (Post Detail) */}
          <div className="flex md:gap-4 flex-1 min-h-0">
            {/* Left Side: Post List — hidden on mobile when a post detail is open */}
            <div className={`${mobileShowDetail ? 'hidden md:flex' : 'flex'} w-full md:w-[32%] lg:w-1/4 border-r border-border bg-white md:rounded-l-lg flex-col shrink-0`}>
              <div
                className={`overflow-hidden transition-all duration-200 md:overflow-visible ${
                  isMobileFilterBarHidden
                    ? 'max-h-0 -translate-y-2 opacity-0 pointer-events-none md:max-h-none md:translate-y-0 md:opacity-100 md:pointer-events-auto'
                    : 'max-h-40 translate-y-0 opacity-100'
                }`}
              >
                {/* Recent / Hot Filter Tabs */}
                <div className="border-b border-border">
                  <div className="flex">
                    <button
                      onClick={() => setViewFilter('recent')}
                      className={`flex-1 px-4 pt-3.5 pb-2.5 text-sm font-medium transition-all duration-200 relative ${
                        viewFilter === 'recent'
                          ? 'text-[#FF902A]'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {t('forum.sortRecent')}
                      {viewFilter === 'recent' && (
                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF902A]"></span>
                      )}
                    </button>
                    <button
                      onClick={() => setViewFilter('hot')}
                      className={`flex-1 px-4 pt-3.5 pb-2.5 text-sm font-medium transition-all duration-200 relative ${
                        viewFilter === 'hot'
                          ? 'text-[#FF902A]'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {t('forum.sortHot')}
                      {viewFilter === 'hot' && (
                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF902A]"></span>
                      )}
                    </button>
                  </div>
                </div>

                {/* Category Filter and Create Post Button */}
                <div className="px-3 md:px-4 py-2 md:py-4 border-b border-border flex items-center justify-between gap-2 md:gap-3">
                  <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                    <span className="hidden md:inline text-base font-medium text-foreground whitespace-nowrap">{t('forum.filterCategory')}:</span>
                    <Select 
                      value={selectedCategory} 
                      onValueChange={setSelectedCategory}
                    >
                      <SelectTrigger className="flex-1 h-8 md:h-10 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t('forum.allCategories')}</SelectItem>
                        {categories.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                        ))}
                        {/* Legacy categories from posts (for backward compatibility) */}
                        {legacyCategories.filter(cat => !categories.find(c => c.label === cat || c.value === cat)).map((cat) => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {/* Desktop-only create button — mobile has one in the top bar */}
                  <Button
                    onClick={() => setCreateDialogOpen(true)}
                    className="hidden md:flex bg-[#FF902A] hover:bg-[#FF7A1A] text-white h-10 w-10 p-0 shrink-0"
                    size="icon"
                    title={t('forum.createPost.button')}
                  >
                    <Plus className="h-5 w-5" />
                  </Button>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto" data-post-list ref={postListContainerRef}>
              {loading && displayedPosts.length === 0 ? (
                <div className="p-4 space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : error ? (
                <Card className="p-8 m-4 text-center">
                  <AlertCircle className="w-12 h-12 mx-auto mb-4 text-destructive" />
                  <h3 className="text-lg font-semibold mb-2 text-foreground">{error}</h3>
                  <Button onClick={() => loadPosts(true)} variant="outline" className="mt-4">
                    {t('forum.retry')}
                  </Button>
                </Card>
              ) : displayedPosts.length === 0 ? (
                <Card className="p-8 m-4 text-center">
                  <p className="text-muted-foreground">{t('forum.noContent')}</p>
                </Card>
              ) : (
                <div className="divide-y divide-border">
                  {displayedPosts.map((post) => {
                    const authorName = getAuthorDisplayName(post, post.author, post.authorId, i18n.language);
                    const relativeTime = getRelativeTime(post.createdAt, i18n.language);
                    const isSelected = selectedPost?.id === post.id;
                    
                    return (
                      <div
                        key={post.id}
                        onClick={() => handlePostSelect(post)}
                        className={`p-3 md:p-4 cursor-pointer transition-all duration-200 hover:bg-muted/50 border-l-4 ${
                          isSelected 
                            ? 'bg-[#FF902A]/10 border-[#FF902A] shadow-sm' 
                            : 'border-transparent hover:border-[#FF902A]/30'
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          {/* Author row */}
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <div className="flex items-center gap-1.5 flex-1 min-w-0">
                              {post.isHot && (
                                <Flame className="h-3.5 w-3.5 text-[#FF902A] shrink-0" aria-hidden />
                              )}
                              <span
                                className="text-sm font-semibold truncate"
                                style={{ color: getUsernameColor(authorName) }}
                              >
                                {authorName}
                              </span>
                              <span className="text-xs text-muted-foreground/70 whitespace-nowrap shrink-0">
                                {relativeTime}
                              </span>
                            </div>
                            {post.isPinned && (
                              <Badge className="text-xs shrink-0 bg-[#FF902A]/10 text-[#FF902A] border-[#FF902A]/20 hover:bg-[#FF902A]/20">
                                {t('forum.pinned')}
                              </Badge>
                            )}
                          </div>

                          <h3 className="text-base font-semibold mb-2 line-clamp-2 leading-snug text-foreground">
                            <Link
                              to={`/forum/${post.id}`}
                              onClick={(event) => {
                                if (
                                  event.metaKey ||
                                  event.ctrlKey ||
                                  event.shiftKey ||
                                  event.altKey ||
                                  event.button !== 0
                                ) {
                                  return;
                                }
                                event.preventDefault();
                                event.stopPropagation();
                                handlePostSelect(post);
                              }}
                              className="hover:underline"
                            >
                              {sanitizeUserVisibleText(post.title)}
                            </Link>
                          </h3>

                          <div className="flex items-center gap-2 flex-wrap">
                            {post.tags && post.tags.length > 0 && (
                              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100">
                                {post.tags[0]}
                              </Badge>
                            )}
                            {post.category && (
                              <Badge className="text-xs bg-[#FF902A]/10 text-[#FF902A] border-[#FF902A]/30 hover:bg-[#FF902A]/20">
                                {getCategoryLabel(post.category, i18n.language)}
                              </Badge>
                            )}
                            <div className="flex items-center gap-3 ml-auto">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleLikePost(post, e);
                                }}
                                disabled={likingPostIds.has(post.id) || dislikedPosts.has(post.id)}
                                className={`flex items-center gap-1 text-xs font-medium transition-all duration-200 ${
                                  dislikedPosts.has(post.id) || likingPostIds.has(post.id)
                                    ? 'opacity-50 cursor-not-allowed'
                                    : 'cursor-pointer'
                                } bg-transparent hover:bg-transparent ${
                                  likedPosts.has(post.id)
                                    ? 'text-red-500'
                                    : 'text-muted-foreground hover:text-red-500'
                                }`}
                              >
                                <Heart
                                  className={`h-3.5 w-3.5 transition-all duration-200 ${
                                    likedPosts.has(post.id)
                                      ? 'fill-red-500 text-red-500'
                                      : 'fill-none text-muted-foreground'
                                  }`}
                                />
                                <span className="transition-all duration-200">{post.likes - (post.dislikes || 0)}</span>
                              </button>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
                                <MessageCircle className="h-3.5 w-3.5 text-muted-foreground" />
                                <span>{post.replies}</span>
                              </div>
                              {renderPageNumbers(post.replies)}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                    )}
                  </div>
              
              {/* Pagination for Post List */}
              {!loading && displayedPosts.length > 0 && totalPostPages > 1 && (
                <div className="border-t border-border p-4 bg-white">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="flex items-center gap-1 px-2 py-1 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted rounded"
                        >
                          <ChevronLeft className="h-4 w-4" />
                          <span>{t("forum.pagination.previous")}</span>
                        </button>
                      </PaginationItem>
                      {Array.from({ length: Math.min(totalPostPages, 5) }, (_, i) => {
                        let pageNum;
                        if (totalPostPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPostPages - 2) {
                          pageNum = totalPostPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        return (
                          <PaginationItem key={pageNum}>
                            <button
                              onClick={() => handlePageChange(pageNum)}
                              className={`px-3 py-1 text-sm rounded ${
                                currentPage === pageNum
                                  ? 'bg-[#FF902A] text-white'
                                  : 'hover:bg-muted'
                              }`}
                            >
                              {pageNum}
                            </button>
                          </PaginationItem>
                        );
                      })}
                      <PaginationItem>
                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPostPages}
                          className="flex items-center gap-1 px-2 py-1 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted rounded"
                        >
                          <span>{t("forum.pagination.next")}</span>
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </div>

            {/* Right Side: Post Detail — visible on mobile only when a post is selected */}
            <div className={`${mobileShowDetail ? 'flex' : 'hidden md:flex'} flex-1 flex-col overflow-hidden bg-white md:rounded-r-lg overflow-x-hidden`}>
              {selectedPost ? (
                <>
                    {/* Sticky Title Header */}
                    <div className="sticky top-0 z-10 bg-white border-b border-border px-4 md:px-6 py-3 md:py-4 shadow-sm">
                      {/* Mobile back button row */}
                      <div className="md:hidden flex items-center gap-2 mb-2">
                        <button
                          onClick={() => {
                            setMobileShowDetail(false);
                            // Remove post param from URL so back behaves naturally
                            const newParams = new URLSearchParams(searchParams);
                            newParams.delete('post');
                            setSearchParams(newParams, { replace: true });
                            setSelectedPost(null);
                          }}
                          className="flex items-center gap-0.5 text-[#FF902A] font-medium text-sm -ml-1"
                        >
                          <ChevronLeft className="h-5 w-5" />
                          {i18n.language === 'zh' ? '返回' : 'Back'}
                        </button>
                      </div>
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <h1 className="text-lg md:text-xl font-bold text-foreground leading-tight flex-1">
                        {sanitizeUserVisibleText(selectedPost.title)}
                      </h1>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleShare}
                          className="shrink-0"
                          title={i18n.language === 'zh' ? '分享' : 'Share'}
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                      {selectedPost.tags && selectedPost.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {selectedPost.tags.map((tag, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0 flex flex-wrap items-center gap-x-2 gap-y-1.5">
                          <span 
                            className="max-w-full break-words text-sm font-semibold leading-5"
                            style={{ color: getUsernameColor(getAuthorDisplayName(selectedPost, selectedPost.author, selectedPost.authorId, i18n.language)) }}
                          >
                            {getAuthorDisplayName(selectedPost, selectedPost.author, selectedPost.authorId, i18n.language)}
                          </span>
                          <span className="text-xs text-muted-foreground/70 leading-5">
                            {getRelativeTime(selectedPost.createdAt, i18n.language)}
                          </span>
                          {selectedPost.category && (
                            <Badge className="max-w-full whitespace-normal break-words bg-[#FF902A]/10 text-[#FF902A] border-[#FF902A]/30 hover:bg-[#FF902A]/20">
                              {getCategoryLabel(selectedPost.category, i18n.language)}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 self-end sm:self-auto">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setReplyingToReply(null);
                              setShowReplyBox(true);
                            }}
                            className="flex items-center gap-1 text-muted-foreground hover:text-[#FF902A] transition-colors bg-transparent hover:bg-transparent"
                          >
                            <Reply className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => handleLikePost(selectedPost, e)}
                            disabled={likingPostIds.has(selectedPost.id) || dislikedPosts.has(selectedPost.id)}
                            className={`flex items-center gap-1 transition-all duration-200 bg-transparent hover:bg-transparent ${
                              dislikedPosts.has(selectedPost.id) ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                          >
                            <Heart 
                              className={`h-4 w-4 transition-all duration-200 ${
                                likedPosts.has(selectedPost.id) 
                                  ? 'fill-red-500 text-red-500' 
                                  : 'fill-none text-muted-foreground'
                              }`}
                            />
                            <span className={`text-sm transition-all duration-200 ${
                              likedPosts.has(selectedPost.id) ? 'text-red-500' : 'text-muted-foreground'
                            }`}>{selectedPost.likes}</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => handleDislikePost(selectedPost, e)}
                            disabled={likingPostIds.has(selectedPost.id) || likedPosts.has(selectedPost.id)}
                            className={`flex items-center gap-1 transition-all duration-200 bg-transparent hover:bg-transparent ${
                              likedPosts.has(selectedPost.id) ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                          >
                            <ThumbsDown 
                              className={`h-4 w-4 transition-all duration-200 ${
                                dislikedPosts.has(selectedPost.id) 
                                  ? 'fill-blue-500 text-blue-500' 
                                  : 'fill-none text-muted-foreground'
                              }`}
                            />
                            <span className={`text-sm transition-all duration-200 ${
                              dislikedPosts.has(selectedPost.id) ? 'text-blue-500' : 'text-muted-foreground'
                            }`}>{selectedPost.dislikes || 0}</span>
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto relative min-h-0 flex flex-col">
                      {loadingPostDetail && (
                        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center">
                          <div className="flex flex-col items-center gap-2">
                            <div className="w-6 h-6 border-2 border-[#FF902A] border-t-transparent rounded-full animate-spin" />
                            <p className="text-xs text-muted-foreground">
                              {t("common.loading")}
                            </p>
                          </div>
                        </div>
                      )}
                      <div className="py-3 md:py-6 px-0 flex flex-col overflow-x-hidden min-w-0">
                      {/* Main Forum Post - with shadow and background */}
                      {(() => {
                        const isExpanded = expandedPosts.has(selectedPost.id);
                        const needsShowMore = postsNeedingShowMore.has(selectedPost.id);
                        
                        return (
                          <div className="bg-card border border-border md:rounded-lg py-4 md:py-6 px-4 md:px-8 mb-4 shadow-sm md:shadow-md">
                            <div className="prose prose-base md:prose-lg max-w-none w-full overflow-x-hidden">
                              <div className="w-full">
                                <div 
                                  ref={postContentRef}
                                  className={`text-base md:text-lg text-foreground leading-relaxed break-words overflow-wrap-anywhere word-break-break-word w-full ${
                                    !isExpanded && needsShowMore ? 'max-h-[600px] overflow-hidden' : ''
                                  }`}
                                  style={{ overflowWrap: 'anywhere', wordBreak: 'break-word' }}
                                  dangerouslySetInnerHTML={{ 
                                    __html: parseBBCode(selectedPost.content)
                                  }}
                                />
                              </div>
                              {selectedPostAttachmentUrls.length > 0 && (
                                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                                  {selectedPostAttachmentUrls.map((imageUrl, index) => (
                                    <button
                                      key={`${selectedPost.id}-attachment-${index}`}
                                      type="button"
                                      className="overflow-hidden rounded-lg border border-border bg-muted/20 text-left transition-opacity hover:opacity-90"
                                      onClick={() => {
                                        setViewingImageUrl(imageUrl);
                                        setImageViewerOpen(true);
                                      }}
                                    >
                                      <img
                                        src={imageUrl}
                                        alt={i18n.language === "zh" ? `帖文圖片 ${index + 1}` : `Post image ${index + 1}`}
                                        className="h-auto max-h-[420px] w-full object-contain bg-background"
                                        loading="lazy"
                                      />
                                    </button>
                                  ))}
                                </div>
                              )}
                              {needsShowMore && (
                                <div className="mt-4">
                                  <button
                                    onClick={() => {
                                      setExpandedPosts(prev => {
                                        const newSet = new Set(prev);
                                        if (isExpanded) {
                                          newSet.delete(selectedPost.id);
                                        } else {
                                          newSet.add(selectedPost.id);
                                        }
                                        return newSet;
                                      });
                                    }}
                                    className="text-sm text-[#FF902A] hover:text-[#FF7A1A] font-medium underline cursor-pointer"
                                  >
                                    {isExpanded 
                                      ? (i18n.language === 'zh' ? '顯示較少' : 'Show less')
                                      : (i18n.language === 'zh' ? '顯示更多' : 'Show more')
                                    }
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })()}



                        {/* Replies - Right below the post, connected with visual distinction */}
                        {totalReplies > 0 && selectedPostReplies.length > 0 && (() => {
                          // Calculate reply numbers based on chronological order
                          // Use allPostReplies if available, otherwise use selectedPostReplies
                          const repliesForNumbering = allPostReplies.length > 0 ? allPostReplies : selectedPostReplies;
                          const sortedAllReplies = [...repliesForNumbering].sort((a, b) => {
                            if (!a.createdAt || !b.createdAt) return 0;
                            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                          });
                          
                          // Create a map of reply ID to its number
                          const replyNumberMap = new Map<string, number>();
                          sortedAllReplies.forEach((reply, index) => {
                            if (reply && reply.id) {
                              replyNumberMap.set(reply.id, index + 1);
                            }
                          });
                          
                          // Render all replies at the same level (flat view)
                          // Show parent reply info for nested replies but don't indent
                          const renderReply = (reply: ForumReply, index: number): ReactElement => {
                            const replyAuthorName = getAuthorDisplayName(undefined, reply.author, reply.authorId, i18n.language);
                            const replyNumber = replyNumberMap.get(reply.id) || (index + 1);
                            
                            return (
                              <div key={reply.id} id={`reply-${reply.id}`}>
                                <div 
                                  className={`${index % 2 === 0 ? 'bg-muted/30' : 'bg-muted/20'} border-l-4 border-[#FF902A]/30 rounded-r-lg py-4 px-0 shadow-sm hover:shadow-md transition-shadow overflow-hidden`}
                                >
                                    <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-border/30 px-4">
                                      <div className="flex items-center gap-2">
                                        <span className="text-sm font-bold text-[#FF902A]">
                                          #{replyNumber}
                                        </span>
                                        <span 
                                          className="font-semibold text-sm"
                                          style={{ color: getUsernameColor(replyAuthorName) }}
                                        >
                                          {replyAuthorName}
                                        </span>
                                        <span className="text-xs text-muted-foreground/70">
                                          · {getRelativeTime(reply.createdAt, i18n.language)}
                                        </span>
                                      </div>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          setReplyingToReply(reply);
                                          setShowReplyBox(true);
                                        }}
                                        className="flex items-center gap-1 text-muted-foreground hover:text-[#FF902A] transition-colors bg-transparent hover:bg-transparent shrink-0"
                                      >
                                        <Reply className="h-4 w-4" />
                                      </Button>
                                    </div>
                                    <div className="px-4 overflow-x-hidden max-w-full">
                                      {/* Show parent reply info if this is a reply to another reply */}
                                      {reply.parentReplyId && (() => {
                                        // Try to find parent reply in allPostReplies first, then selectedPostReplies as fallback
                                        const parentReply = allPostReplies.find(r => r.id === reply.parentReplyId) || 
                                                           selectedPostReplies.find(r => r.id === reply.parentReplyId);
                                        if (parentReply) {
                                          const parentAuthorName = getAuthorDisplayName(undefined, parentReply.author, parentReply.authorId, i18n.language);
                                          return (
                                            <button
                                              onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                jumpToReply(reply.parentReplyId!);
                                              }}
                                              className="mb-2 p-2 bg-muted/40 border-l-2 border-[#FF902A]/50 rounded text-xs w-full text-left hover:bg-muted/60 transition-colors cursor-pointer"
                                              title={i18n.language === 'zh' ? '點擊跳轉到該留言' : 'Click to jump to this reply'}
                                            >
                                              <span className="text-muted-foreground">
                                                {i18n.language === 'zh' ? '回覆' : 'Replying to'}{' '}
                                              </span>
                                              <span 
                                                className="font-semibold"
                                                style={{ color: getUsernameColor(parentAuthorName) }}
                                              >
                                                {parentAuthorName}
                                              </span>
                                              <span className="text-muted-foreground ml-1">
                                                : {stripBBCode(parentReply.content).substring(0, 100)}{stripBBCode(parentReply.content).length > 100 ? '...' : ''}
                                              </span>
                                            </button>
                                          );
                                        }
                                        // If parent not found, still show that it's a reply (even without parent details)
                                        return (
                                          <div className="mb-2 p-2 bg-muted/40 border-l-2 border-[#FF902A]/50 rounded text-xs">
                                            <span className="text-muted-foreground italic">
                                              {i18n.language === 'zh' ? '回覆其他留言' : 'Replying to another comment'}
                                            </span>
                        </div>
                                        );
                                      })()}
                                      {(() => {
                                        const isExpanded = expandedReplies.has(reply.id);
                                        const needsShowMore = repliesNeedingShowMore.has(reply.id);
                                        
                                        return (
                                          <>
                                            <div className="min-w-0">
                                              <div 
                                                ref={(el) => {
                                                  if (el) {
                                                    replyContentRefs.current.set(reply.id, el);
                                                  } else {
                                                    replyContentRefs.current.delete(reply.id);
                                                  }
                                                }}
                                                className={`text-sm text-foreground leading-relaxed pt-2 break-words overflow-wrap-anywhere word-break-break-word w-full ${
                                                  !isExpanded && needsShowMore ? 'max-h-[400px] overflow-hidden' : ''
                                                }`}
                                                style={{ overflowWrap: 'anywhere', wordBreak: 'break-word', minWidth: 0 }}
                                                dangerouslySetInnerHTML={{ __html: parseBBCode(reply.content) }}
                                              />
                                            </div>
                                            {needsShowMore && (
                                              <div className="mt-3">
                                                <button
                                                  onClick={() => {
                                                    setExpandedReplies(prev => {
                                                      const newSet = new Set(prev);
                                                      if (isExpanded) {
                                                        newSet.delete(reply.id);
                                                      } else {
                                                        newSet.add(reply.id);
                                                      }
                                                      return newSet;
                                                    });
                                                  }}
                                                  className="text-sm text-[#FF902A] hover:text-[#FF7A1A] font-medium underline cursor-pointer"
                                                >
                                                  {isExpanded 
                                                    ? (i18n.language === 'zh' ? '顯示較少' : 'Show less')
                                                    : (i18n.language === 'zh' ? '顯示更多' : 'Show more')
                                                  }
                                                </button>
                                              </div>
                                            )}
                                          </>
                                        );
                                      })()}
                                      {/* Like and Dislike Buttons for Reply - aligned with text */}
                                      <div className="flex items-center gap-2 mt-2">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          disabled={likingReplyIds.has(reply.id) || dislikingReplyIds.has(reply.id) || dislikedReplies.has(reply.id)}
                                          onClick={async (e) => {
                                            e.preventDefault();
                                            if (!isAuthenticated || !userInfo?.email) {
                                              openPanel("LANDING");
                                              return;
                                            }
                                            
                                            // Prevent duplicate likes - check if already processing
                                            if (likingReplyIds.has(reply.id) || dislikingReplyIds.has(reply.id)) {
                                              return; // Already processing, ignore click
                                            }
                                            
                                            // Enforce mutual exclusivity - if already disliked, don't allow like
                                            if (dislikedReplies.has(reply.id)) {
                                              return; // Already disliked, cannot like
                                            }
                                            
                                            const wasLiked = likedReplies.has(reply.id);
                                            const wasDisliked = dislikedReplies.has(reply.id);
                                            const originalLikesCount = reply.likes || 0;
                                            const originalDislikesCount = reply.dislikes || 0;
                                            
                                            // Mark as processing
                                            setLikingReplyIds(prev => new Set(prev).add(reply.id));
                                            
                                            // Optimistic update
                                            const optimisticLiked = !wasLiked;
                                            const optimisticLikesCount = wasLiked 
                                              ? Math.max(0, originalLikesCount - 1)
                                              : originalLikesCount + 1;
                                            const optimisticDislikesCount = wasDisliked
                                              ? Math.max(0, originalDislikesCount - 1)
                                              : originalDislikesCount; // If liking, and was disliked, remove dislike
                                            
                                            setLikedReplies(prev => {
                                              const newSet = new Set(prev);
                                              if (optimisticLiked) {
                                                newSet.add(reply.id);
                                              } else {
                                                newSet.delete(reply.id);
                                              }
                                              return newSet;
                                            });
                                            
                                            // If was disliked, optimistically remove dislike
                                            if (wasDisliked) {
                                              setDislikedReplies(prev => {
                                                const newSet = new Set(prev);
                                                newSet.delete(reply.id);
                                                return newSet;
                                              });
                                            }
                                            
                                            setSelectedPostReplies(prev => prev.map(r => 
                                              r.id === reply.id ? { ...r, likes: optimisticLikesCount, dislikes: optimisticDislikesCount } : r
                                            ));
                                            // Also update allPostReplies to keep it in sync
                                            setAllPostReplies(prev => prev.map(r => 
                                              r.id === reply.id ? { ...r, likes: optimisticLikesCount, dislikes: optimisticDislikesCount } : r
                                            ));
                                            
                                            try {
                                              const result = await toggleReplyLike(
                                                reply.id,
                                                userInfo.email,
                                                originalLikesCount,
                                                originalDislikesCount
                                              );
                                              
                                              console.log('Reply like result:', result);
                                              
                                              // Always update with server response to ensure consistency
                                              setLikedReplies(prev => {
                                                const newSet = new Set(prev);
                                                if (result.liked) {
                                                  newSet.add(reply.id);
                                                  // Ensure mutual exclusivity - remove from disliked if present
                                                  setDislikedReplies(prevDisliked => {
                                                    const newDislikedSet = new Set(prevDisliked);
                                                    newDislikedSet.delete(reply.id);
                                                    return newDislikedSet;
                                                  });
                                                } else {
                                                  newSet.delete(reply.id);
                                                }
                                                return newSet;
                                              });
                                              // Update dislikedReplies: if we were disliking and now we're liking, remove dislike
                                              if (wasDisliked && result.liked) {
                                                setDislikedReplies(prev => {
                                                  const newSet = new Set(prev);
                                                  newSet.delete(reply.id);
                                                  return newSet;
                                                });
                                              }
                                              
                                              setSelectedPostReplies(prev => prev.map(r => 
                                                r.id === reply.id ? { ...r, likes: result.newLikesCount, dislikes: result.newDislikesCount } : r
                                              ));
                                              // Also update allPostReplies
                                              setAllPostReplies(prev => prev.map(r => 
                                                r.id === reply.id ? { ...r, likes: result.newLikesCount, dislikes: result.newDislikesCount } : r
                                              ));
                                            } catch (error) {
                                              console.error('Error toggling reply like:', error);
                                              // Revert optimistic update
                                              setLikedReplies(prev => {
                                                const newSet = new Set(prev);
                                                if (wasLiked) {
                                                  newSet.add(reply.id);
                                                } else {
                                                  newSet.delete(reply.id);
                                                }
                                                return newSet;
                                              });
                                              setDislikedReplies(prev => {
                                                const newSet = new Set(prev);
                                                if (wasDisliked) {
                                                  newSet.add(reply.id);
                                                } else {
                                                  newSet.delete(reply.id);
                                                }
                                                return newSet;
                                              });
                                              
                                              setSelectedPostReplies(prev => prev.map(r => 
                                                r.id === reply.id ? { ...r, likes: originalLikesCount, dislikes: originalDislikesCount } : r
                                              ));
                                              // Also revert allPostReplies
                                              setAllPostReplies(prev => prev.map(r => 
                                                r.id === reply.id ? { ...r, likes: originalLikesCount, dislikes: originalDislikesCount } : r
                                              ));
                                              
                                              toast({
                                                title: i18n.language === 'zh' ? '操作失敗' : 'Operation Failed',
                                                description: i18n.language === 'zh' ? '無法更新讚好狀態，請稍後再試' : 'Failed to update like status, please try again',
                                                variant: 'destructive',
                                              });
                                            } finally {
                                              // Remove from processing set
                                              setLikingReplyIds(prev => {
                                                const newSet = new Set(prev);
                                                newSet.delete(reply.id);
                                                return newSet;
                                              });
                                            }
                                          }}
                                          className={`flex items-center gap-1 transition-all duration-200 bg-transparent hover:bg-transparent ${
                                            dislikedReplies.has(reply.id) ? 'opacity-50' : ''
                                          }`}
                                        >
                                          <Heart 
                                            className={`h-4 w-4 transition-all duration-200 ${
                                              likedReplies.has(reply.id) 
                                                ? 'fill-red-500 text-red-500' 
                                                : 'fill-none text-muted-foreground'
                                            }`}
                                          />
                                          <span className={`text-sm transition-all duration-200 ${
                                            likedReplies.has(reply.id) ? 'text-red-500' : 'text-muted-foreground'
                                          }`}>{reply.likes || 0}</span>
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          disabled={likingReplyIds.has(reply.id) || dislikingReplyIds.has(reply.id) || likedReplies.has(reply.id)}
                                          onClick={async (e) => {
                                            e.preventDefault();
                                            if (!isAuthenticated || !userInfo?.email) {
                                              openPanel("LANDING");
                                              return;
                                            }
                                            
                                            // Prevent duplicate dislikes - check if already processing
                                            if (likingReplyIds.has(reply.id) || dislikingReplyIds.has(reply.id)) {
                                              return; // Already processing, ignore click
                                            }
                                            
                                            // Enforce mutual exclusivity - if already liked, don't allow dislike
                                            if (likedReplies.has(reply.id)) {
                                              return; // Already liked, cannot dislike
                                            }
                                            
                                            const wasLiked = likedReplies.has(reply.id);
                                            const wasDisliked = dislikedReplies.has(reply.id);
                                            const originalLikesCount = reply.likes || 0;
                                            const originalDislikesCount = reply.dislikes || 0;
                                            
                                            // Mark as processing
                                            setDislikingReplyIds(prev => new Set(prev).add(reply.id));
                                            
                                            // Optimistic update
                                            const optimisticDisliked = !wasDisliked;
                                            const optimisticDislikesCount = wasDisliked 
                                              ? Math.max(0, originalDislikesCount - 1)
                                              : originalDislikesCount + 1;
                                            const optimisticLikesCount = wasLiked
                                              ? Math.max(0, originalLikesCount - 1)
                                              : originalLikesCount; // If disliking, and was liked, remove like
                                            
                                            setDislikedReplies(prev => {
                                              const newSet = new Set(prev);
                                              if (optimisticDisliked) {
                                                newSet.add(reply.id);
                                              } else {
                                                newSet.delete(reply.id);
                                              }
                                              return newSet;
                                            });
                                            
                                            // If was liked, optimistically remove like
                                            if (wasLiked) {
                                              setLikedReplies(prev => {
                                                const newSet = new Set(prev);
                                                newSet.delete(reply.id);
                                                return newSet;
                                              });
                                            }
                                            
                                            setSelectedPostReplies(prev => prev.map(r => 
                                              r.id === reply.id ? { ...r, dislikes: optimisticDislikesCount, likes: optimisticLikesCount } : r
                                            ));
                                            // Also update allPostReplies to keep it in sync
                                            setAllPostReplies(prev => prev.map(r => 
                                              r.id === reply.id ? { ...r, dislikes: optimisticDislikesCount, likes: optimisticLikesCount } : r
                                            ));
                                            
                                            try {
                                              const result = await toggleReplyDislike(
                                                reply.id,
                                                userInfo.email,
                                                originalDislikesCount,
                                                originalLikesCount
                                              );
                                              
                                              console.log('Reply dislike result:', result);
                                              
                                              // Always update with server response to ensure consistency
                                              setDislikedReplies(prev => {
                                                const newSet = new Set(prev);
                                                if (result.disliked) {
                                                  newSet.add(reply.id);
                                                  // Ensure mutual exclusivity - remove from liked if present
                                                  setLikedReplies(prevLiked => {
                                                    const newLikedSet = new Set(prevLiked);
                                                    newLikedSet.delete(reply.id);
                                                    return newLikedSet;
                                                  });
                                                } else {
                                                  newSet.delete(reply.id);
                                                }
                                                return newSet;
                                              });
                                              // Update likedReplies: if we were liking and now we're disliking, remove like
                                              if (wasLiked && result.disliked) {
                                                setLikedReplies(prev => {
                                                  const newSet = new Set(prev);
                                                  newSet.delete(reply.id);
                                                  return newSet;
                                                });
                                              }
                                              
                                              setSelectedPostReplies(prev => prev.map(r => 
                                                r.id === reply.id ? { ...r, dislikes: result.newDislikesCount, likes: result.newLikesCount } : r
                                              ));
                                              // Also update allPostReplies
                                              setAllPostReplies(prev => prev.map(r => 
                                                r.id === reply.id ? { ...r, dislikes: result.newDislikesCount, likes: result.newLikesCount } : r
                                              ));
                                            } catch (error) {
                                              console.error('Error toggling reply dislike:', error);
                                              // Revert optimistic update
                                              setDislikedReplies(prev => {
                                                const newSet = new Set(prev);
                                                if (wasDisliked) {
                                                  newSet.add(reply.id);
                                                } else {
                                                  newSet.delete(reply.id);
                                                }
                                                return newSet;
                                              });
                                              setLikedReplies(prev => {
                                                const newSet = new Set(prev);
                                                if (wasLiked) {
                                                  newSet.add(reply.id);
                                                } else {
                                                  newSet.delete(reply.id);
                                                }
                                                return newSet;
                                              });
                                              
                                              setSelectedPostReplies(prev => prev.map(r => 
                                                r.id === reply.id ? { ...r, dislikes: originalDislikesCount, likes: originalLikesCount } : r
                                              ));
                                              // Also revert allPostReplies
                                              setAllPostReplies(prev => prev.map(r => 
                                                r.id === reply.id ? { ...r, dislikes: originalDislikesCount, likes: originalLikesCount } : r
                                              ));
                                              
                                              toast({
                                                title: i18n.language === 'zh' ? '操作失敗' : 'Operation Failed',
                                                description: i18n.language === 'zh' ? '無法更新不讚好狀態，請稍後再試' : 'Failed to update dislike status, please try again',
                                                variant: 'destructive',
                                              });
                                            } finally {
                                              // Remove from processing set
                                              setDislikingReplyIds(prev => {
                                                const newSet = new Set(prev);
                                                newSet.delete(reply.id);
                                                return newSet;
                                              });
                                            }
                                          }}
                                          className={`flex items-center gap-1 transition-all duration-200 bg-transparent hover:bg-transparent ${
                                            likedReplies.has(reply.id) ? 'opacity-50' : ''
                                          }`}
                                        >
                                          <ThumbsDown 
                                            className={`h-4 w-4 transition-all duration-200 ${
                                              dislikedReplies.has(reply.id) 
                                                ? 'fill-blue-500 text-blue-500' 
                                                : 'fill-none text-muted-foreground'
                                            }`}
                                          />
                                          <span className={`text-sm transition-all duration-200 ${
                                            dislikedReplies.has(reply.id) ? 'text-blue-500' : 'text-muted-foreground'
                                          }`}>{reply.dislikes || 0}</span>
                                        </Button>
                  </div>
                                    </div>
                                  </div>
                                </div>
                            );
                          };
                          
                          return (
                            <>
                              <div className="mt-4 flex-1" data-replies-section>
                                <div className="space-y-3">
                                  {selectedPostReplies.map((reply, index) => renderReply(reply, index))}
                                </div>
                              </div>
                              
                              {/* Sticky Pagination for Replies - Always visible at bottom */}
                              {totalReplyPages > 1 && (
                                <div className="sticky bottom-0 bg-white border-t border-border/50 mt-4 pt-3 pb-2 z-10 shadow-sm">
                                    <Pagination>
                                      <PaginationContent>
                                        <PaginationItem>
                                          <button
                                            onClick={() => handleReplyPageChange(currentReplyPage - 1)}
                                            disabled={currentReplyPage === 1}
                                            className="flex items-center gap-1 px-2 py-1 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted rounded"
                                          >
                                            <ChevronLeft className="h-4 w-4" />
                                            <span>{t("forum.pagination.previous")}</span>
                                          </button>
                                        </PaginationItem>
                                        {Array.from({ length: Math.min(totalReplyPages, 5) }, (_, i) => {
                                          let pageNum;
                                          if (totalReplyPages <= 5) {
                                            pageNum = i + 1;
                                          } else if (currentReplyPage <= 3) {
                                            pageNum = i + 1;
                                          } else if (currentReplyPage >= totalReplyPages - 2) {
                                            pageNum = totalReplyPages - 4 + i;
                                          } else {
                                            pageNum = currentReplyPage - 2 + i;
                                          }
                                          return (
                                            <PaginationItem key={pageNum}>
                                              <button
                                                onClick={() => handleReplyPageChange(pageNum)}
                                                className={`px-3 py-1 text-sm rounded ${
                                                  currentReplyPage === pageNum
                                                    ? 'bg-[#FF902A] text-white'
                                                    : 'hover:bg-muted'
                                                }`}
                                              >
                                                {pageNum}
                                              </button>
                                            </PaginationItem>
                                          );
                                        })}
                                        <PaginationItem>
                                          <button
                                            onClick={() => handleReplyPageChange(currentReplyPage + 1)}
                                            disabled={currentReplyPage === totalReplyPages}
                                            className="flex items-center gap-1 px-2 py-1 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted rounded"
                                          >
                                            <span>{t("forum.pagination.next")}</span>
                                            <ChevronRight className="h-4 w-4" />
                                          </button>
                                        </PaginationItem>
                                      </PaginationContent>
                                    </Pagination>
                      </div>
                    )}
                            </>
                          );
                        })()}
                  </div>
                    </div>
                  </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <ChevronRight className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>{t('forum.selectPost') || "選擇左側的帖文以查看內容"}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </main>

      <CreatePostDialog 
        open={createDialogOpen} 
        onOpenChange={setCreateDialogOpen}
        onPostCreated={() => loadPosts(true)}
      />
      
      {/* Reply Dialog */}
      <Dialog open={showReplyBox} onOpenChange={(open) => {
        setShowReplyBox(open);
        if (!open) {
          // Skip clearing if closing for auth flow — draft is saved in pendingReplyRef
          if (closingForAuthRef.current) {
            closingForAuthRef.current = false;
            return;
          }
          setReplyingToReply(null);
          setReplyContent("");
          // Clean up image previews
          replyImagePreviews.forEach((preview) => {
            URL.revokeObjectURL(preview.preview);
          });
          setReplyImagePreviews([]);
        }
      }}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {replyingToReply 
                ? (i18n.language === 'zh' ? '回覆留言' : 'Reply to Comment')
                : (i18n.language === 'zh' ? '發表留言' : 'Post a Reply')
              }
            </DialogTitle>
          </DialogHeader>
          
          {isAuthenticated ? (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!selectedPost || !userInfo?.email || !replyContent.trim()) return;
                
                setIsSubmittingReply(true);
                try {
                  const clientId = await getOrCreateClient(userInfo.email, userInfo.email);
                  
                  // Upload images to S3 and replace image markers in content
                  let finalReplyContent = replyContent.trim();
                  if (replyImagePreviews.length > 0) {
                    const timestamp = Date.now();
                    const imageMarker = i18n.language === 'zh' ? '[圖片]' : '[Image]';
                    
                    const uploadPromises = replyImagePreviews.map(async (preview, index) => {
                      try {
                        // Generate unique key for the image
                        const fileExtension = preview.file.name.split('.').pop() || 'jpg';
                        const imageKey = `forum-images/${timestamp}-${clientId}-reply-${index}.${fileExtension}`;
                        
                        // Upload to S3 using Amplify Storage v6 API
                        await uploadData({
                          key: imageKey,
                          data: preview.file,
                          options: {
                            contentType: preview.file.type,
                            accessLevel: 'guest', // Guest access for public images
                          },
                        }).result;

                        return { url: buildForumImageUrl(imageKey) };
                      } catch (err) {
                        console.error('Error uploading image:', err);
                        throw new Error(`Failed to upload image: ${preview.file.name}`);
                      }
                    });

                    const uploadResults = await Promise.all(uploadPromises);
                    
                    // Replace image markers with actual image BBCode tags (replace from first to last)
                    let markerIndex = 0;
                    uploadResults.forEach(({ url }) => {
                      // Find and replace the first occurrence of the marker
                      const markerIndexInContent = finalReplyContent.indexOf(imageMarker, markerIndex);
                      if (markerIndexInContent !== -1) {
                        finalReplyContent = finalReplyContent.substring(0, markerIndexInContent) + 
                                         `[img]${url}[/img]` + 
                                         finalReplyContent.substring(markerIndexInContent + imageMarker.length);
                        markerIndex = markerIndexInContent + `[img]${url}[/img]`.length;
                      }
                    });
                  }
                  
                  const createdReply = await createForumReply(
                    {
                      content: finalReplyContent,
                      postId: selectedPost.id,
                      authorId: clientId,
                      parentReplyId: replyingToReply?.id || null,
                    },
                    userInfo.email
                  );

                  if ("pendingReview" in createdReply) {
                    setReplyContent("");
                    setReplyingToReply(null);
                    setShowReplyBox(false);
                    replyImagePreviews.forEach((preview) => {
                      URL.revokeObjectURL(preview.preview);
                    });
                    setReplyImagePreviews([]);
                    toast({
                      title: i18n.language === 'zh' ? '留言需要審核' : 'Reply Pending Review',
                      description: i18n.language === 'zh'
                        ? '系統偵測到留言可能包含敏感字眼。留言已提交人工審核，通過前不會公開顯示。'
                        : 'We detected potentially sensitive wording. Your reply has been submitted for manual review and will not be public until approved.',
                    });
                    return;
                  }
                  
                  // Clear reply form and hide dialog
                  setReplyContent("");
                  setReplyingToReply(null);
                  setShowReplyBox(false);
                  // Clean up image previews
                  replyImagePreviews.forEach((preview) => {
                    URL.revokeObjectURL(preview.preview);
                  });
                  setReplyImagePreviews([]);
                  
                  // Reload replies and post to update counts
                  await loadPostDetail(selectedPost.id, false, currentReplyPage);
                  
                  // Update post in lists to reflect new reply count
                  const updatedPost = await getForumPostById(selectedPost.id);
                  setAllPosts(prev => prev.map(p => p.id === selectedPost.id ? updatedPost : p));
                  setDisplayedPosts(prev => prev.map(p => p.id === selectedPost.id ? updatedPost : p));
                  if (selectedPost?.id === updatedPost.id) {
                    setSelectedPost(updatedPost);
                  }
                  
                  toast({
                    title: i18n.language === 'zh' ? '留言成功' : 'Reply Posted',
                    description: i18n.language === 'zh' ? '您的留言已發表' : 'Your reply has been posted',
                  });
                  
                  // Show download CTA after successful reply
                  setShowDownloadCta(true);
                } catch (error: unknown) {
                  console.error('Error creating reply:', error);
                  toast({
                    title: i18n.language === 'zh' ? '發表失敗' : 'Failed to Post',
                    description: error instanceof Error
                      ? error.message
                      : (i18n.language === 'zh' ? '無法發表留言，請稍後再試' : 'Failed to post reply, please try again'),
                    variant: 'destructive',
                  });
                } finally {
                  setIsSubmittingReply(false);
                }
              }}
              className="space-y-4"
            >
              {/* Show parent reply info when replying to a reply */}
              {replyingToReply && (() => {
                const parentAuthorName = getAuthorDisplayName(undefined, replyingToReply.author, replyingToReply.authorId, i18n.language);
                const hasImages = /\[img\].*?\[\/img\]/gi.test(replyingToReply.content);
                const imageMatches = replyingToReply.content.match(/\[img\](.*?)\[\/img\]/gi);
                
                return (
                  <div className="p-3 bg-muted/40 border-l-4 border-[#FF902A]/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs text-muted-foreground">
                        {i18n.language === 'zh' ? '回覆' : 'Replying to'}{' '}
                      </span>
                      <span 
                        className="text-sm font-semibold"
                        style={{ color: getUsernameColor(parentAuthorName) }}
                      >
                        {parentAuthorName}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {/* Show text content (without images) */}
                      <div 
                        className="text-sm text-foreground/80 line-clamp-2"
                        dangerouslySetInnerHTML={{ 
                          __html: parseBBCode(replyingToReply.content.replace(/\[img\].*?\[\/img\]/gi, '').trim()) 
                        }}
                      />
                      {/* Show image indicators or thumbnails */}
                      {hasImages && imageMatches && (
                        <div className="flex flex-wrap gap-2 items-center">
                          {imageMatches.slice(0, 3).map((imgTag, index) => {
                            const urlMatch = imgTag.match(/\[img\](.*?)\[\/img\]/i);
                            const imageUrl = urlMatch ? normalizeForumImageUrl(urlMatch[1]) : '';
                            return (
                              <div key={index} className="flex items-center gap-1.5">
                                {imageUrl ? (
                                  <img 
                                    src={imageUrl} 
                                    alt={i18n.language === 'zh' ? '圖片' : 'Image'}
                                    className="w-12 h-12 object-cover rounded border border-border cursor-pointer hover:opacity-80"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setViewingImageUrl(imageUrl);
                                      setImageViewerOpen(true);
                                    }}
                                  />
                                ) : (
                                  <span className="text-xs text-muted-foreground px-2 py-1 bg-muted rounded">
                                    {i18n.language === 'zh' ? '[圖片]' : '[Picture]'}
                                  </span>
                                )}
                              </div>
                            );
                          })}
                          {imageMatches.length > 3 && (
                            <span className="text-xs text-muted-foreground">
                              +{imageMatches.length - 3} {i18n.language === 'zh' ? '更多' : 'more'}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
              <div className="border border-border rounded-lg p-4 bg-background relative">
                <RichTextEditor
                  value={replyContent}
                  onChange={setReplyContent}
                  placeholder={i18n.language === 'zh' ? '輸入您的留言...' : 'Enter your reply...'}
                  rows={16}
                  maxLength={10000}
                  disabled={isSubmittingReply}
                  onImageSelect={(files) => {
                    const newPreviews = files.map((file) => {
                      const id = `${Date.now()}-${Math.random()}`;
                      return {
                        id,
                        file,
                        preview: URL.createObjectURL(file),
                      };
                    });
                    setReplyImagePreviews((prev) => [...prev, ...newPreviews]);
                    
                    // Insert simple image marker in content at cursor position (default left aligned, inline with text)
                    const imageMarker = i18n.language === 'zh' ? '[圖片]' : '[Image]';
                    const placeholder = newPreviews.map(() => imageMarker).join(' ');
                    setReplyContent((prev) => {
                      const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
                      if (textarea) {
                        const start = textarea.selectionStart;
                        const end = textarea.selectionEnd;
                        const before = prev.substring(0, start);
                        const after = prev.substring(end);
                        // Insert with space before and after to make it inline with text
                        const insertText = (before && !before.endsWith(' ') && !before.endsWith('\n') ? ' ' : '') + 
                                          placeholder + 
                                          (after && !after.startsWith(' ') && !after.startsWith('\n') ? ' ' : '');
                        return before + insertText + after;
                      }
                      return prev + (prev && !prev.endsWith(' ') ? ' ' : '') + placeholder;
                    });
                  }}
                  imagePreviews={replyImagePreviews}
                  onRemoveImage={(id) => {
                    setReplyImagePreviews((prev) => {
                      const removed = prev.find((p) => p.id === id);
                      if (removed) {
                        URL.revokeObjectURL(removed.preview);
                      }
                      const filtered = prev.filter((p) => p.id !== id);
                      
                      // Remove the corresponding image marker from content
                      const imageMarker = i18n.language === 'zh' ? '[圖片]' : '[Image]';
                      setReplyContent((current) => {
                        // Find the index of the removed image in the original array
                        const removedIndex = prev.findIndex((p) => p.id === id);
                        if (removedIndex === -1) return current;
                        
                        // Count occurrences of the marker before the removed one
                        let markerCount = 0;
                        let lastIndex = 0;
                        for (let i = 0; i < removedIndex; i++) {
                          const markerPos = current.indexOf(imageMarker, lastIndex);
                          if (markerPos !== -1) {
                            markerCount++;
                            lastIndex = markerPos + imageMarker.length;
                          } else {
                            break;
                          }
                        }
                        
                        // Find and remove the marker at the correct position
                        let searchIndex = 0;
                        for (let i = 0; i <= markerCount; i++) {
                          const markerPos = current.indexOf(imageMarker, searchIndex);
                          if (markerPos !== -1 && i === markerCount) {
                            // Remove this marker
                            return current.substring(0, markerPos) + 
                                   current.substring(markerPos + imageMarker.length).replace(/^\s+/, '');
                          }
                          if (markerPos !== -1) {
                            searchIndex = markerPos + imageMarker.length;
                          } else {
                            break;
                          }
                        }
                        
                        return current;
                      });
                      
                      return filtered;
                    });
                  }}
                />
                {/* Reply Button inside text box */}
                <div className="absolute bottom-4 right-4">
                  <Button
                    type="submit"
                    disabled={!replyContent.trim() || isSubmittingReply}
                    className="bg-[#FF902A] hover:bg-[#FF7A1A] text-white"
                    size="sm"
                  >
                    {isSubmittingReply ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {i18n.language === 'zh' ? '發表中...' : 'Posting...'}
                      </>
                    ) : (
                      <>
                        <Reply className="h-4 w-4 mr-2" />
                        {i18n.language === 'zh' ? '發表留言' : 'Post Reply'}
                      </>
                    )}
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-start">
                <p className="text-xs text-muted-foreground">
                  {replyContent.length}/10000 {i18n.language === 'zh' ? '字' : 'characters'}
                </p>
              </div>
            </form>
          ) : (
            /* Unauthenticated: show editor but prompt login on submit */
            <div className="space-y-4">
              {/* Show parent reply info when replying to a reply */}
              {replyingToReply && (() => {
                const parentAuthorName = getAuthorDisplayName(undefined, replyingToReply.author, replyingToReply.authorId, i18n.language);
                return (
                  <div className="p-3 bg-muted/40 border-l-4 border-primary/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs text-muted-foreground">
                        {i18n.language === 'zh' ? '回覆' : 'Replying to'}{' '}
                      </span>
                      <span 
                        className="text-sm font-semibold"
                        style={{ color: getUsernameColor(parentAuthorName) }}
                      >
                        {parentAuthorName}
                      </span>
                    </div>
                  </div>
                );
              })()}
              <div className="border border-border rounded-lg p-4 bg-background relative">
                <RichTextEditor
                  value={replyContent}
                  onChange={setReplyContent}
                  placeholder={i18n.language === 'zh' ? '輸入您的留言...' : 'Enter your reply...'}
                  rows={16}
                  maxLength={10000}
                  disabled={false}
                />
                {/* Submit button that triggers login */}
                <div className="absolute bottom-4 right-4">
                  <Button
                    type="button"
                    disabled={!replyContent.trim()}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                    size="sm"
                    onClick={() => {
                      // Save draft content in ref so it persists through auth flow
                      pendingReplyRef.current = {
                        content: replyContent,
                        postId: selectedPost?.id || '',
                        replyingTo: replyingToReply,
                        imagePreviews: [...replyImagePreviews],
                      };
                      // Register callback for after auth success
                      onAuthSuccess(() => {
                        // Restore draft from pendingReplyRef
                        const pending = pendingReplyRef.current;
                        if (pending) {
                          setReplyContent(pending.content);
                          setReplyingToReply(pending.replyingTo);
                          setReplyImagePreviews(pending.imagePreviews);
                          pendingReplyRef.current = null;
                        }
                        setShowReplyBox(true);
                        toast({
                          title: i18n.language === 'zh' ? '登入成功！' : 'Logged in!',
                          description: i18n.language === 'zh' ? '您可以繼續發表留言' : 'You can now post your reply',
                        });
                      });
                      // Set guard so dialog close doesn't clear draft
                      closingForAuthRef.current = true;
                      setShowReplyBox(false);
                      openPanel("LANDING");
                    }}
                  >
                    <Reply className="h-4 w-4 mr-2" />
                    {i18n.language === 'zh' ? '登入並發表' : 'Login & Post'}
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                {i18n.language === 'zh' ? '需要登入或建立帳戶後才能發表留言，您寫嘅內容會被保留' : 'Login or create an account to post. Your draft will be saved.'}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Image Viewer Modal */}
      <Dialog open={imageViewerOpen} onOpenChange={setImageViewerOpen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] w-[95vw] h-[95vh] p-0 gap-0 bg-black/95 border-none overflow-hidden">
          <DialogTitle className="sr-only">
            {i18n.language === 'zh' ? '查看圖片' : 'View Image'}
          </DialogTitle>
          <div className="relative w-full h-full flex items-center justify-center p-4 overflow-hidden">
            {/* Close button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-50 text-white hover:bg-white/20 rounded-full"
              onClick={() => setImageViewerOpen(false)}
            >
              <X className="h-6 w-6" />
            </Button>

            {/* Full-size image */}
            {viewingImageUrl && (
              <div className="w-full h-full flex items-center justify-center overflow-hidden">
                <img
                  src={viewingImageUrl}
                  alt="Full size"
                  className="max-w-full max-h-full w-auto h-auto object-contain rounded-lg"
                  style={{ maxWidth: '100%', maxHeight: '100%' }}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Trading Category Disclaimer Dialog */}
      <Dialog open={tradingDisclaimerOpen} onOpenChange={(open) => {
        // Prevent closing by clicking outside - user must click "I understand"
        if (!open) {
          return;
        }
      }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              <DialogTitle className="text-xl font-semibold text-amber-900 dark:text-amber-100">
                {i18n.language === 'zh' ? '重要聲明' : 'Important Notice'}
              </DialogTitle>
            </div>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="text-sm text-foreground space-y-3">
              <p>
                {i18n.language === 'zh' 
                  ? '本平台不鼓勵寵物買賣或任何形式的寵物繁殖活動。根據香港相關法規，寵物繁殖需要相關許可證。'
                  : 'This platform does not encourage pet trading or any form of pet breeding activities. According to Hong Kong regulations, pet breeding requires relevant licenses.'}
              </p>
              <p className="font-medium">
                {i18n.language === 'zh' 
                  ? '本平台不對任何交易或繁殖相關活動承擔責任。用戶需自行承擔所有風險，並確保遵守香港相關法律法規。'
                  : 'This platform does not assume responsibility for any trading or breeding-related activities. Users are responsible for all risks and must ensure compliance with relevant Hong Kong laws and regulations.'}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                // Save acknowledgment to sessionStorage
                sessionStorage.setItem('trading_disclaimer_acknowledged', 'true');
                setTradingDisclaimerOpen(false);
              }}
              className="bg-[#FF902A] hover:bg-[#FF7A1A] text-white w-full"
            >
              {i18n.language === 'zh' ? '我明白' : 'I Understand'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Download CTA Dialog - shown after successful reply */}
      <Dialog open={showDownloadCta} onOpenChange={setShowDownloadCta}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl text-center">
              {i18n.language === 'zh' ? '🎉 留言成功！' : '🎉 Reply Posted!'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4 text-center">
            <p className="text-foreground font-medium">
              {i18n.language === 'zh' 
                ? '下載 PetWell App，即可免費獲得一個智能寵物名牌！' 
                : 'Download PetWell App and get a FREE smart pet name tag!'}
            </p>
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <p className="text-sm text-muted-foreground">
                {i18n.language === 'zh' 
                  ? '🏷️ 每個名牌都有獨特嘅寵物專屬網頁，萬一寵物走失，拾獲者掃描名牌即可聯繫你。' 
                  : '🏷️ Each tag has a unique pet profile page. If your pet gets lost, anyone who scans it can contact you.'}
              </p>
              <p className="text-sm text-muted-foreground">
                {i18n.language === 'zh'
                  ? '📱 App 仲有獸醫診所評價、寵物健康記錄等功能！'
                  : '📱 The app also features vet clinic reviews, pet health records and more!'}
              </p>
            </div>
            <Button
              onClick={() => {
                setShowDownloadCta(false);
                window.open('/download', '_blank');
              }}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
              size="lg"
            >
              {i18n.language === 'zh' ? '立即下載，領取免費名牌' : 'Download Now & Get Free Tag'}
            </Button>
            <Button
              variant="ghost"
              onClick={() => setShowDownloadCta(false)}
              className="w-full text-muted-foreground"
              size="sm"
            >
              {i18n.language === 'zh' ? '稍後再說' : 'Maybe Later'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Forum;
