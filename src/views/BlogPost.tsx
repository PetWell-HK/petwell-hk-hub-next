import { useParams, Link } from "react-router-dom";
import { useMemo, useState, useEffect, useCallback, useRef } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FAQSection from "@/components/FAQSection";
import FehdPetFriendlyDirectory from "@/components/FehdPetFriendlyDirectory";
import PetFriendlyMallsDirectory from "@/components/PetFriendlyMallsDirectory";
import React from "react";
import { blogPosts } from "@/data/blogData";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Calendar, User, ArrowLeft, MapPin, Clock, Sparkles, Navigation, X, ZoomIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useSEO } from "@/hooks/useSEO";
import {
  generateBlogKeywords,
  generateBlogDescription,
  generateBlogFAQ,
  generateBlogStructuredData
} from "@/utils/blogSEO";
import BlogAdSense from "@/components/BlogAdSense";

const BlogPost = () => {
  const { slug } = useParams();
  const post = blogPosts.find((p) => p.slug === slug);

  // Enhanced SEO with scalable system
  const seoData = useMemo(() => {
    if (!post || !slug) return null;
    
    return {
      keywords: generateBlogKeywords(post),
      description: generateBlogDescription(post),
      structuredData: generateBlogStructuredData(post, slug),
      faqItems: generateBlogFAQ(post)
    };
  }, [post, slug]);

  useSEO({
    title: post
      ? `${post.title.replace(/\s*[\|\｜]\s*PetWell HK\s*$/i, "").trim()} | PetWell HK`
      : '文章不存在 | PetWell HK',
    description: post
      ? (seoData?.description || post.excerpt)
      : '找不到此文章',
    keywords: post
      ? (seoData?.keywords || `${post.category},寵物健康,養寵物貼士`)
      : '',
    canonicalUrl: `https://petwellhk.com/${slug}`,
    ogImage: post?.imageUrl,
    ogType: 'article',
    structuredData: seoData?.structuredData,
    faqItems: seoData?.faqItems,
    articlePublishedTime: post?.date,
    articleModifiedTime: post?.date,
    articleAuthor: post?.author,
    articleSection: post?.category,
    articleTags: post?.seoKeywords?.slice(0, 10),
  });

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 py-10 md:py-12">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl font-bold mb-4">文章不存在</h1>
            <Link to="/owner-zone">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                返回主人專區
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Get related posts (same category, different post)
  const relatedPosts = blogPosts
    .filter((p) => p.category === post.category && p.id !== post.id)
    .slice(0, 3);

  // Lightbox state for blog images
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [lightboxAlt, setLightboxAlt] = useState("");

  const handleImageClick = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const img = target.closest("img");
    if (!img) return;
    const prose = img.closest(".prose");
    if (!prose) return;
    // Skip if the image is inside a link (let the link work)
    if (img.closest("a")) return;
    e.preventDefault();
    setLightboxSrc(img.getAttribute("src"));
    setLightboxAlt(img.getAttribute("alt") || "");
    setLightboxOpen(true);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pt-6 pb-20">
        <article className="container mx-auto px-4" onClick={handleImageClick}>
          {/* Back Button */}
          <Link to="/owner-zone" className="inline-block mb-8">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              返回文章列表
            </Button>
          </Link>

          {/* Hero Image */}
          <div className="max-w-4xl mx-auto mb-8">
            {post.slug !== 'hk-fehd-pet-friendly-restaurants-1000-list' && (
              <div className="aspect-video rounded-2xl overflow-hidden mb-6">
                <img 
                  src={post.imageUrl} 
                  alt={`${post.title} - ${post.category} - PetWell HK`}
                  className="w-full h-full object-cover"
                  loading="eager"
                  width="1200"
                  height="675"
                />
              </div>
            )}

            {/* Meta Info */}
            <div className="mb-6">
              <Badge className="mb-4">{post.category}</Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">{post.title}</h1>
              <p className="text-xl text-muted-foreground mb-6">{post.excerpt}</p>
              
              <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                <span className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {post.author}
                </span>
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {post.date}
                </span>
              </div>
            </div>

            <BlogAdSense placement="top" />

            {/* Prominent Answer Box for Key Search Queries */}
            {post.slug === 'pet-insurance-hk-2025' && (
              <div className="mb-8 p-6 bg-background border-2 border-border rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold mb-4">寵物保險邊間好？快速答案</h2>
                <div className="space-y-4 text-base leading-relaxed">
                  <p className="font-semibold text-lg">選擇<strong>寵物保險</strong>要比較保額、自付比率、保障範圍、續保年齡限制和等候期。以下是根據不同情況的<strong>寵物保險</strong>推薦：</p>
                  <div className="grid md:grid-cols-2 gap-4 mt-4">
                    <div className="bg-muted/30 p-4 rounded-lg border">
                      <h3 className="font-bold mb-2">年輕健康寵物</h3>
                      <p>可選擇 <strong>One Degree</strong> 或 <strong>MSIG</strong> <strong>寵物保險</strong>（終身續保、網絡診所優惠）</p>
                    </div>
                    <div className="bg-muted/30 p-4 rounded-lg border">
                      <h3 className="font-bold mb-2">高齡寵物</h3>
                      <p>可考慮 <strong>Prudential</strong> 或 <strong>BlueCross</strong> <strong>寵物保險</strong>（無年齡限制或較寬鬆）</p>
                    </div>
                    <div className="bg-muted/30 p-4 rounded-lg border">
                      <h3 className="font-bold mb-2">有慢性病史</h3>
                      <p>可選 <strong>MSIG</strong> 或 <strong>Prudential</strong> <strong>寵物保險</strong>（特殊病保障較佳）</p>
                    </div>
                    <div className="bg-muted/30 p-4 rounded-lg border">
                      <h3 className="font-bold mb-2">常看網絡診所</h3>
                      <p>可選 <strong>One Degree</strong> 或 <strong>MSIG</strong> <strong>寵物保險</strong>（自付額優惠、網絡方便）</p>
                    </div>
                  </div>
                  <p className="mt-4 text-muted-foreground">建議根據寵物品種、年齡、健康狀況和就醫習慣選擇最適合的<strong>寵物保險</strong>計劃。詳細<strong>寵物保險</strong>比較表見下方👇</p>
                </div>
              </div>
            )}

            {/* CNY Pet Fair Special UI - Quick Summary */}
            {post.slug === 'cny-pet-fair-hong-kong-2026' && (
              <div className="mb-8 space-y-6">
                {/* Quick Answer Box for SEO */}
                <Card className="p-6 bg-background border-2 border-primary/20 rounded-xl shadow-lg">
                  <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-primary" />
                    2026年邊度有寵物友善年宵市集？快速答案
                  </h2>
                  <div className="space-y-4 text-base leading-relaxed">
                    <p className="font-semibold text-lg">
                      2026年全港有<strong className="text-primary">13個寵物友善年宵市集</strong>，涵蓋港島、九龍、新界三大區域。以下是各區年宵市集分布：
                    </p>
                    <div className="grid md:grid-cols-3 gap-4 mt-4">
                      <div className="bg-muted/30 p-4 rounded-lg border border-primary/20">
                        <h3 className="font-bold mb-2 text-primary">港島區（5個）</h3>
                        <ul className="text-sm space-y-1 text-muted-foreground">
                          <li>• 銅鑼灣維園萌寵市集</li>
                          <li>• 利園新春市集</li>
                          <li>• 合和商場福馬迎春市集</li>
                          <li>• 利東街新春主題週末市集</li>
                          <li>• 中環街市馬上開運新年市集</li>
                        </ul>
                      </div>
                      <div className="bg-muted/30 p-4 rounded-lg border border-primary/20">
                        <h3 className="font-bold mb-2 text-primary">九龍區（5個）</h3>
                        <ul className="text-sm space-y-1 text-muted-foreground">
                          <li>• 啟德雙子匯二期新春好物市集</li>
                          <li>• 啟德體育園新春盛會</li>
                          <li>• 朗豪坊熱鬥大麻成</li>
                          <li>• APM新春年宵市集</li>
                          <li>• Mikiki X 柴語錄賀年展銷</li>
                        </ul>
                      </div>
                      <div className="bg-muted/30 p-4 rounded-lg border border-primary/20">
                        <h3 className="font-bold mb-2 text-primary">新界區（4個）</h3>
                        <ul className="text-sm space-y-1 text-muted-foreground">
                          <li>• 荃灣廣場「開心果甜品X手作市集」</li>
                          <li>• 南豐紗廠流量蜜馬新春市集</li>
                          <li>• D·Park「豐衣足食」年宵市集</li>
                          <li>• 西沙GO PARK人寵迎福馬新春市集</li>
                        </ul>
                      </div>
                    </div>
                    <p className="mt-4 text-muted-foreground">
                      大部分年宵市集係<strong>免費入場</strong>，建議選擇<strong>室內商場市集</strong>（如朗豪坊、APM、Mikiki）更適合帶寵物，有冷氣且地面平坦。詳細日期、時間和地點見下方👇
                    </p>
                  </div>
                </Card>

                {/* Quick Stats Summary */}
                <Card className="p-6 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 border-orange-200 dark:border-orange-800">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <Sparkles className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold mb-3 text-foreground">2026寵物友善年宵市集總覽</h2>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-primary mb-1">13</div>
                          <div className="text-sm text-muted-foreground">個年宵市集</div>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-bold text-primary mb-1">5</div>
                          <div className="text-sm text-muted-foreground">港島區</div>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-bold text-primary mb-1">5</div>
                          <div className="text-sm text-muted-foreground">九龍區</div>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-bold text-primary mb-1">4</div>
                          <div className="text-sm text-muted-foreground">新界區</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Quick Navigation - Enhanced */}
                <Card className="p-6 border-2">
                  <div className="flex items-center gap-2 mb-4">
                    <Navigation className="w-5 h-5 text-primary" />
                    <h3 className="text-xl font-bold">快速導航</h3>
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    <a 
                      href="#region-hk" 
                      className="group p-4 bg-background border-2 border-border rounded-lg hover:border-primary hover:shadow-md transition-all"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-lg text-primary">港島區</span>
                        <ArrowLeft className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-transform rotate-180" />
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">5個年宵市集</p>
                      <p className="text-xs text-muted-foreground">維園・利園・合和・利東街・中環街市</p>
                    </a>
                    <a 
                      href="#region-kln" 
                      className="group p-4 bg-background border-2 border-border rounded-lg hover:border-primary hover:shadow-md transition-all"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-lg text-primary">九龍區</span>
                        <ArrowLeft className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-transform rotate-180" />
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">5個年宵市集</p>
                      <p className="text-xs text-muted-foreground">啟德・朗豪坊・APM・Mikiki</p>
                    </a>
                    <a 
                      href="#region-nt" 
                      className="group p-4 bg-background border-2 border-border rounded-lg hover:border-primary hover:shadow-md transition-all"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-lg text-primary">新界區</span>
                        <ArrowLeft className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-transform rotate-180" />
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">4個年宵市集</p>
                      <p className="text-xs text-muted-foreground">荃灣廣場・南豐紗廠・D·Park・西沙</p>
                    </a>
                  </div>
                </Card>

                {/* Key Tips for Pet Owners */}
                <Card className="p-6 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    帶毛孩行年宵小貼士
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg mt-0.5">
                        <Clock className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold mb-1">選擇合適時段</p>
                        <p className="text-sm text-muted-foreground">建議選擇清晨或傍晚，避開人潮高峰時段</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg mt-0.5">
                        <MapPin className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold mb-1">室內市集較適合</p>
                        <p className="text-sm text-muted-foreground">朗豪坊、APM、Mikiki等室內商場有冷氣，更舒適</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg mt-0.5">
                        <Navigation className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold mb-1">準備充足裝備</p>
                        <p className="text-sm text-muted-foreground">帶備牽繩、飲水、零食、寵物尿墊</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg mt-0.5">
                        <Calendar className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold mb-1">確認開放時間</p>
                        <p className="text-sm text-muted-foreground">出發前先查看各市集具體日期和時間</p>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* Content */}
            {post.slug === 'hk-fehd-pet-friendly-restaurants-1000-list' ? (
              (() => {
                const parts = post.content.split('<div data-component="fehd-directory"></div>');
                return (
                  <div className="mb-12">
                    <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: parts[0] }} />
                    <FehdPetFriendlyDirectory />
                    {parts[1] && (
                      <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: parts[1] }} />
                    )}
                  </div>
                );
              })()
            ) : post.slug === 'rainy-day-pet-friendly-indoor-hong-kong' || post.slug === 'typhoon-weekend-pet-friendly-malls-hong-kong' ? (
              (() => {
                const parts = post.content.split('<div data-component="malls-directory"></div>');
                return (
                  <div className="mb-12">
                    <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: parts[0] }} />
                    <PetFriendlyMallsDirectory />
                    {parts[1] && (
                      <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: parts[1] }} />
                    )}
                  </div>
                );
              })()
            ) : (
              <div 
                className={`prose prose-lg max-w-none mb-12 ${
                  post.slug === 'cny-pet-fair-hong-kong-2026' 
                    ? 'cny-blog-content' 
                    : ''
                }`}
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            )}

            <BlogAdSense placement="bottom" />

            {/* FAQ Section */}
            {seoData?.faqItems && seoData.faqItems.length > 0 && (
              <FAQSection 
                title="常見問題"
                items={seoData.faqItems}
                className="mb-12 bg-muted/30"
              />
            )}

            {/* Comprehensive SEO Content Sections */}
            <section className="mb-12 space-y-8">
              {/* About Category Section */}
              <div className="bg-background rounded-lg p-6 border">
                {post.category !== '法例牌照' && <h2 className="text-2xl font-bold mb-4">關於 {post.category}</h2>}
                <div className="prose prose-sm max-w-none text-muted-foreground">
                  {post.category === '健康保健' && (
                    <>
                      <p>PetWell 提供專業寵物健康資訊，幫助主人及早發現問題，守護毛孩健康。定期檢查、正確護理和及時就醫是保持寵物健康的關鍵。</p>
                      <p>寵物健康管理包括日常觀察、定期健康檢查、疫苗接種、驅蟲、口腔護理、皮膚護理等。及早發現健康問題可以避免嚴重後果，降低醫療費用，提高治療成功率。PetWell App 可以幫助記錄寵物健康狀況，追蹤疫苗和驅蟲時間，管理醫療記錄，及早發現異常。</p>
                      <p>常見寵物健康問題包括耳炎、皮膚病、消化問題、關節問題、牙齒問題等。定期觀察寵物行為、食慾、排泄和活動量，如有異常應及早諮詢獸醫。預防勝於治療，正確的日常護理和定期檢查可以保持寵物健康。</p>
                    </>
                  )}
                  {post.category === '寵物保險' && (
                    <>
                      <p>選擇合適的寵物保險可以分擔醫療開支，為毛孩提供保障。比較不同保險公司的計劃、保額和條款，選擇最適合的保障方案。</p>
                      <p>寵物醫療費用高昂，一次手術可能需數萬元，急症診金動輒過千。寵物保險可以提供醫療保障，分擔意外和疾病開支，特別係癌症、手術、急症等大額醫療費用。選擇保險時要比較保額、自付比率、保障範圍、續保年齡限制、等候期、網絡診所優惠等。</p>
                      <p>年輕健康寵物保費較低，建議及早投保。高齡或有病史寵物則需注意續保限制和等候期。部分保險公司提供終身續保，部分則有年齡限制。選擇時要根據寵物品種、年齡、健康狀況和就醫習慣選擇最適合的計劃。</p>
                    </>
                  )}
                  {post.category === '寵物護理' && (
                    <>
                      <p>正確的日常護理可以讓寵物保持健康美麗。從清潔、美容到日常照顧，PetWell 提供專業護理指南，幫助主人更好地照顧毛孩。</p>
                      <p>寵物護理包括洗澡、梳毛、指甲修剪、耳朵清潔、口腔護理、皮膚護理等。不同品種和年齡的寵物有不同的護理需求。長毛狗需要更頻繁梳毛，短毛狗則需要定期洗澡。高齡寵物可能需要更溫和的護理方法。</p>
                      <p>定期護理可以及早發現健康問題，如皮膚病、耳炎、牙齒問題等。正確的護理方法可以避免傷害，保持寵物舒適。如有疑問，應諮詢獸醫或專業美容師。PetWell 提供詳細的護理指南和影片教學，幫助主人掌握正確的護理技巧。</p>
                    </>
                  )}
                  {post.category === '寵物行為' && (
                    <>
                      <p>了解寵物行為背後的原因，可以幫助改善問題行為，建立更和諧的人寵關係。PetWell 提供專業行為分析和訓練建議。</p>
                      <p>寵物行為問題可能源於健康問題、環境壓力、缺乏訓練、社交不足等。常見問題行為包括過度吠叫、破壞行為、攻擊行為、分離焦慮、如廁問題等。改善問題行為需要了解背後原因，提供適當的運動、訓練和環境豐富化。</p>
                      <p>正向訓練方法可以建立信任，改善行為問題。必要時應尋求專業行為治療師協助。PetWell 提供行為分析和訓練建議，幫助主人了解寵物行為，建立更和諧的人寵關係。</p>
                    </>
                  )}
                  {post.category === '寵物安全' && (
                    <>
                      <p>識別危險成分和用品，保護寵物遠離意外和中毒風險。選擇安全的寵物用品，為毛孩創造安全的生活環境。</p>
                      <p>許多常見用品對寵物有危險，包括除蟲菊、苯酚、精油、漂白劑、木糖醇等。即使標示「天然」或「寵物安心」，亦要仔細查看成分表。對狗安全不等於對貓安全，對人無毒不等於對寵物無害。</p>
                      <p>選擇寵物專用產品，避免使用含危險成分的清潔劑和驅蟲用品。如有疑問，應諮詢獸醫。PetWell 提供詳細的危險成分清單和安全建議，幫助主人識別危險，保護毛孩安全。</p>
                    </>
                  )}
                  {post.category === '急症護理' && (
                    <>
                      <p>掌握寵物急症處理知識，關鍵時刻可以救毛孩一命。識別緊急症狀，及時就醫，是每個寵物主人的責任。</p>
                      <p>寵物急症包括呼吸困難、持續嘔吐、抽搐、無法排尿、大量出血、中毒、高溫中暑、車禍受傷等。這些情況都需要立即就醫，不要延誤，時間就是生命。PetWell 提供全港24小時獸醫診所資訊，包括地址、電話和收費，幫助你在緊急時刻快速找到最近的診所。</p>
                      <p>建議預先Bookmark最近你屋企的24小時獸醫資訊，準備急救用品，了解基本急救知識。在緊急情況下保持冷靜，盡快帶往獸醫診所。PetWell 提供急症處理指南和急救知識，幫助主人在關鍵時刻救毛孩一命。</p>
                    </>
                  )}
                  {post.category === '戶外活動' && (
                    <>
                      <p>帶寵物參與戶外活動可以增進感情，但需要注意安全和準備。PetWell 提供戶外活動指南和安全建議。</p>
                      <p>戶外活動包括行山、游水、獨木舟、SUP、公園活動等。不同活動需要不同的裝備和準備。游水需要救生衣、防曬、清水、毛巾等。行山需要充足飲水、牽引繩、急救用品等。夏天要避開正午時段，注意防曬和降溫。</p>
                      <p>出發前要確認地點是否寵物友善，準備充足裝備，注意天氣和安全。PetWell 提供全港寵物友善活動資訊，包括地點、路線、裝備清單、安全建議等，幫助你和毛孩一起享受愉快的戶外時光。</p>
                    </>
                  )}
                  {post.category === '飲食營養' && (
                    <>
                      <p>均衡的飲食是寵物健康的基礎。選擇優質食物，注意營養搭配，為毛孩提供全面的營養支持。</p>
                      <p>寵物飲食要根據年齡、體重、活動量和健康狀況選擇。幼犬幼貓需要高蛋白質、高鈣質的糧食；成犬成貓需要均衡營養；高齡寵物需要易消化、低脂肪的糧食。如有特殊健康需求（如腎病、心臟病、敏感等），應諮詢獸醫建議處方糧。</p>
                      <p>選擇優質品牌，注意成分標籤，避免含人工添加劑和有害成分的食物。部分人類食物可以適量食用，但要注意選擇和安全。PetWell 提供詳細的飲食指南和營養建議，幫助主人為毛孩提供均衡營養。</p>
                    </>
                  )}
                  {post.category === '生活娛樂' && (
                    <>
                      <p>豐富的生活可以讓寵物更快樂。探索寵物友善場所，參與寵物活動，與毛孩一起享受美好時光。</p>
                      <p>香港有許多寵物友善餐廳、咖啡店、公園和活動場所。部分餐廳設有戶外座位，歡迎帶寵物。寵物活動包括寵物市集、寵物派對、寵物展覽、寵物訓練班、寵物攝影等。</p>
                      <p>參與活動可以增進人寵感情，提供社交機會，豐富生活。PetWell 提供全港寵物友善餐廳和活動資訊，包括地址、電話、評價、報名方法等，幫助你和毛孩一起探索香港，享受美好時光。</p>
                    </>
                  )}
                  {!['健康保健', '寵物保險', '寵物護理', '寵物行為', '寵物安全', '急症護理', '戶外活動', '飲食營養', '生活娛樂', '法例牌照'].includes(post.category) && (
                    <p>PetWell 提供專業寵物資訊，幫助主人更好照顧毛孩。下載 PetWell App 獲取更多實用資訊。</p>
                  )}
                  {post.category !== '法例牌照' && (
                    <p className="mt-4">
                      想了解更多{post.category}相關資訊？瀏覽<a href="/owner-zone" className="text-primary hover:underline">主人專區</a>或下載 <a href="/download" className="text-primary hover:underline">PetWell App</a> 獲取最新寵物資訊。
                    </p>
                  )}
                </div>
              </div>


              {/* Related Resources Section */}
              <div className="bg-background rounded-lg p-6 border">
                <h2 className="text-2xl font-bold mb-4">相關資源</h2>
                <div className="prose prose-sm max-w-none text-muted-foreground">
                  <p>想了解更多寵物資訊？PetWell 提供以下資源：</p>
                  <ul>
                    <li><a href="/owner-zone" className="text-primary hover:underline">主人專區</a> - 瀏覽更多寵物健康、護理、行為等文章</li>
                    <li><a href="/salons" className="text-primary hover:underline">寵物美容</a> - 搜尋寵物美容店評價與服務</li>
                    <li><a href="/lodging" className="text-primary hover:underline">寵物寄養</a> - 搜尋寵物寄養場所與用戶評價</li>
                    <li><a href="/clinics" className="text-primary hover:underline">獸醫診所</a> - 尋找附近獸醫診所，查看評價和預約</li>
                    <li><a href="/restaurants" className="text-primary hover:underline">寵物友善餐廳</a> - 探索全港寵物友善餐廳和咖啡店</li>
                    <li><a href="/download" className="text-primary hover:underline">PetWell App</a> - 下載App獲取更多實用功能和資訊</li>
                  </ul>
                  <p>PetWell 是香港首個一站式寵物健康管理平台，致力於幫助主人更好照顧毛孩，守護寵物健康。</p>
                </div>
              </div>
            </section>

            {/* CTA */}
            <Card className="p-8 bg-primary text-primary-foreground text-center mb-12">
              <h2 className="text-2xl font-bold mb-4">喜歡這篇文章嗎？</h2>
              <p className="text-lg mb-6 opacity-90">
                下載 PetWell App，獲取更多實用的寵物照護資訊
              </p>
              <Link to="/coming-soon">
                <button className="px-8 py-3 bg-background text-primary rounded-lg hover:bg-background/90 transition-colors font-semibold">
                  立即下載 App
                </button>
              </Link>
            </Card>

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
              <div>
                <h2 className="text-3xl font-bold mb-6">相關文章</h2>
                <div className="grid md:grid-cols-3 gap-6">
                  {relatedPosts.map((relatedPost) => (
                    <Link key={relatedPost.id} to={`/${relatedPost.slug}`}>
                      <Card className="overflow-hidden hover:shadow-strong transition-all h-full">
                        <div className="aspect-video overflow-hidden">
                          <img 
                            src={relatedPost.imageUrl} 
                            alt={`${relatedPost.title} - ${relatedPost.category} - 相關文章`}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                            width="400"
                            height="225"
                          />
                        </div>
                        <div className="p-4">
                          <Badge className="mb-2 text-xs">{relatedPost.category}</Badge>
                          <h3 className="font-bold mb-2 line-clamp-2">{relatedPost.title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">{relatedPost.excerpt}</p>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </article>
      </main>

      {/* Image Lightbox */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-[min(92vw,56rem)] border-none bg-black/95 p-2 sm:p-4">
          <DialogTitle className="sr-only">{lightboxAlt || "放大圖片"}</DialogTitle>
          {lightboxSrc && (
            <div className="flex items-center justify-center">
              <img
                src={lightboxSrc}
                alt={lightboxAlt}
                className="max-h-[85vh] w-full rounded-lg object-contain"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default BlogPost;
