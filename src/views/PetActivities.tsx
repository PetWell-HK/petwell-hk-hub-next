"use client";

import { Link } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { ArrowRight, Sparkles, MapPin, Calendar, Search, SlidersHorizontal, X, Loader2, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DirectAnswerBox from "@/components/DirectAnswerBox";
import { fetchAllEvents, calculateEventStatus, getAttendeeCount, extractDistrict, type EventStatus, type OrganizedEvent } from "@/services/eventApi";
import useSEO from "@/hooks/useSEO";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const eventCategoryKeys = [
  "ADOPTION",
  "MARKET",
  "EXPO",
  "WORKSHOP",
  "CHARITY",
  "MEETUP",
  "PET_FRIENDLY",
  "OTHER",
] as const;

const EVENTS_PER_PAGE = 16;

const petActivitiesFAQ = [
  {
    question: "香港有咩寵物活動適合帶狗去？",
    answer:
      "香港有好多寵物活動適合帶狗去，包括寵物市集、寵物派對、狗狗嘉年華、寵物友善商場活動等。PetWell會定期更新最新嘅寵物活動資訊。",
  },
  {
    question: "今個周末帶狗去邊好？",
    answer: "你可以喺PetWell查看最新嘅寵物活動，我哋會列出港島、九龍、新界各區嘅寵物好去處，幫你計劃同毛孩嘅周末活動。",
  },
  {
    question: "邊度可以帶寵物？有咩放狗好地方？",
    answer:
      "香港有唔少寵物友善商場、寵物公園同戶外空間可以帶寵物去。PetWell仲有寵物友善餐廳推薦，幫你搵到狗狗可以入嘅餐廳。",
  },
  {
    question: "寵物活動2025有咩推介？",
    answer:
      "2025年香港有多個大型寵物活動，包括香港寵物節、狗狗嘉年華、寵物市集等。PetWell會定期更新最新活動資訊，幫你同毛孩搵到最啱嘅活動。",
  },
  {
    question: "帶狗活動香港有咩選擇？",
    answer: "香港帶狗活動選擇多元，包括戶外狗狗跑、寵物游泳、商場寵物派對等。你可以根據狗狗性格選擇適合嘅活動。",
  },
  {
    question: "狗狗可以去邊度玩？",
    answer: "香港有超過40個狗公園、多間寵物友善商場同餐廳，仲有定期舉辦嘅寵物活動。PetWell提供全港寵物好去處資訊。",
  },
];

interface EventDisplay {
  id: string;
  name: string;
  description: string;
  dateTime: string;
  location: string;
  district: string;
  imageUrl?: string;
  organizerName: string;
  status: EventStatus;
  attendeeCount: number;
  capacity?: number;
  price?: number;
  category?: string;
  remark?: string;
}

const PetActivities = () => {
  const { t, i18n } = useTranslation();
  const [events, setEvents] = useState<EventDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [priceFilter, setPriceFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [visibleEventCount, setVisibleEventCount] = useState(EVENTS_PER_PAGE);

  const getEventStatusBadge = (status: EventStatus) => {
    switch (status) {
      case 'startingSoon':
        return { label: t('event.status.startingSoon'), className: 'bg-amber-500 text-white' };
      case 'upcoming':
        return { label: t('event.status.upcoming'), className: 'bg-primary text-primary-foreground' };
      case 'ongoing':
        return { label: t('event.status.ongoing'), className: 'bg-green-500 text-white' };
      case 'completed':
        return { label: t('event.status.completed'), className: 'bg-muted text-muted-foreground' };
      default:
        return { label: t('event.status.cancelled'), className: 'bg-muted text-muted-foreground' };
    }
  };

  // Fetch events from database
  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetchAllEvents({ limit: 100 });
        
        if (!response || !response.items) {
          console.warn('No events data received');
          setEvents([]);
          return;
        }
        
        // Transform API events to display format
        const transformedEvents: EventDisplay[] = response.items
          .map((event: OrganizedEvent) => {
            try {
              const status = calculateEventStatus(event);
              const attendeeCount = getAttendeeCount(event);
              const district = extractDistrict(event.location);
              const imageUrl = event.photos && event.photos.length > 0 ? event.photos[0] : undefined;

              return {
                id: event.id,
                name: event.name,
                description: event.description,
                dateTime: event.dateTime,
                location: event.location,
                district,
                imageUrl,
                organizerName: event.organizerName || event.organizer?.name || event.organizerEmail || 'Unknown',
                status,
                attendeeCount,
                capacity: event.capacity || undefined,
                price: event.price || undefined,
                category: normalizeEventCategory(event.category, event.name, event.description),
                remark: event.remark || undefined,
              };
            } catch (err) {
              console.warn('Error transforming event:', event.id, err);
              return null;
            }
          })
          .filter((event): event is NonNullable<typeof event> => event !== null) as EventDisplay[];

        // Sort events by status and date: starting soon first, then ongoing, then upcoming
        const sortedEvents = transformedEvents.sort((a, b) => {
          const statusPriority: Record<EventStatus, number> = {
            startingSoon: 0,
            ongoing: 1,
            upcoming: 2,
            completed: 3,
            cancelled: 4,
          };
          const aPriority = statusPriority[a.status] ?? 4;
          const bPriority = statusPriority[b.status] ?? 4;
          
          if (aPriority !== bPriority) {
            return aPriority - bPriority;
          }
          
          // Within same status, sort by date
          return new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime();
        });

        setEvents(sortedEvents);
      } catch (err) {
        console.error('Error loading events:', err);
        setError('無法載入活動資料，請稍後再試');
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, []);

  const categories = eventCategoryKeys;

  // Filter events
  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesSearch = searchQuery === '' ||
        event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || event.category === categoryFilter;
      
      const isFree = !event.price || event.price === 0;
      const matchesPrice = priceFilter === 'all' ||
        (priceFilter === 'free' && isFree) ||
        (priceFilter === 'paid' && !isFree);
      
      return matchesSearch && matchesStatus && matchesCategory && matchesPrice;
    });
  }, [events, searchQuery, statusFilter, categoryFilter, priceFilter]);

  useEffect(() => {
    setVisibleEventCount(EVENTS_PER_PAGE);
  }, [searchQuery, statusFilter, categoryFilter, priceFilter]);

  const visibleEvents = useMemo(
    () => filteredEvents.slice(0, visibleEventCount),
    [filteredEvents, visibleEventCount],
  );

  const hasMoreEvents = visibleEventCount < filteredEvents.length;

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (statusFilter !== 'all') count++;
    if (categoryFilter !== 'all') count++;
    if (priceFilter !== 'all') count++;
    return count;
  }, [statusFilter, categoryFilter, priceFilter]);

  // Format date for display
  const formatDate = (dateTime: string) => {
    const date = new Date(dateTime);
    const formatOptions: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    return new Intl.DateTimeFormat(i18n.language === 'zh' ? 'zh-HK' : 'en-US', formatOptions).format(date);
  };

  // SEO with dynamic data
  useSEO({
    title: "寵物香港 - 2026 香港寵物活動攻略 | 寵物好去處、帶狗活動推薦 | PetWell",
    description:
      "寵物香港首選 - 精選2026香港寵物活動、寵物好去處、帶狗活動推薦。涵蓋寵物市集、寵物派對、狗狗嘉年華、寵物友善商場活動。港島、九龍、新界全覆蓋，幫寵物香港主人搵到最適合毛孩嘅活動！",
    keywords:
      "寵物活動,寵物好去處,帶狗活動,香港寵物活動,寵物市集,寵物派對,帶狗好去處,寵物友善商場",
    canonicalUrl: "https://petwellhk.com/pet-activities",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "2026 香港寵物活動",
      description: "精選香港寵物活動、帶狗好去處、寵物市集推薦",
      url: "https://petwellhk.com/pet-activities",
      numberOfItems: filteredEvents.length,
      itemListElement: filteredEvents.slice(0, 20).map((event, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "Event",
          name: event.name,
          description: event.description?.replace(/<[^>]*>/g, '').substring(0, 200) || '',
          startDate: event.dateTime,
          location: {
            "@type": "Place",
            name: event.location,
            address: {
              "@type": "PostalAddress",
              addressLocality: event.district,
              addressCountry: "HK"
            }
          },
          organizer: {
            "@type": "Organization",
            name: event.organizerName,
          },
          image: event.imageUrl,
          url: `https://petwellhk.com/event/${event.id}`,
          offers: event.price ? {
            "@type": "Offer",
            price: event.price,
            priceCurrency: "HKD",
            availability: "https://schema.org/InStock",
          } : {
            "@type": "Offer",
            price: "0",
            priceCurrency: "HKD",
            availability: "https://schema.org/InStock",
          },
        },
      })),
    },
    faqItems: petActivitiesFAQ,
    speakableSelectors: [".hero-summary", ".faq-answer", "h1"],
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="place-listing-page flex-1 pb-14 md:pb-16">
        <div className="container mx-auto max-w-6xl px-4">
          <header className="hero-summary pt-8 md:pt-10">
            <div className="max-w-2xl">
              <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                2026 香港寵物好去處
              </h1>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground md:text-[15px]">
                精選寵物活動、市集、派對與嘉年華，港島、九龍、新界全覆蓋
              </p>
            </div>

            <DirectAnswerBox
              question="今個周末帶狗去邊好？"
              answer="PetWell收錄最新香港寵物活動，包括寵物市集、寵物派對、狗狗嘉年華等。港島、九龍、新界全覆蓋，幫你計劃同毛孩嘅周末活動！"
              className="mt-4 max-w-2xl"
              hidden={true}
            />
          </header>

          <div className="seo-hidden">
            <section className="mt-4">
              <h2 className="text-sm font-semibold text-foreground hero-summary">咩係寵物活動？</h2>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground faq-answer">
                寵物活動泛指可以帶寵物參與嘅活動，包括寵物市集、寵物派對、狗狗嘉年華、寵物友善商場活動、戶外狗狗跑等。香港每年都有唔同類型嘅寵物活動，等主人可以同毛孩一齊享受親子時光。
              </p>
            </section>
          </div>

          <div className="place-listing-toolbar sticky top-[var(--header-height)] z-20 -mx-4 mt-6 border-b border-border bg-background/95 px-4 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/90">
            <div className="place-listing-search mx-auto max-w-6xl">
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  type="search"
                  placeholder="搜尋活動名稱、地點..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-11 rounded-lg border-border bg-background pl-10 pr-4 text-[15px] shadow-none"
                  aria-label="搜尋活動"
                />
              </div>
            </div>

            <div className="mx-auto mt-4 flex max-w-6xl flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                  "place-listing-filter-chip inline-flex items-center gap-1.5",
                  showFilters && "place-listing-filter-chip-active",
                )}
                aria-expanded={showFilters}
              >
                <SlidersHorizontal className="h-3 w-3" aria-hidden="true" />
                篩選
                {activeFiltersCount > 0 && (
                  <span className="ml-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              {activeFiltersCount > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setStatusFilter("all");
                    setCategoryFilter("all");
                    setPriceFilter("all");
                  }}
                  className="inline-flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-primary"
                >
                  <X className="h-3 w-3" aria-hidden="true" />
                  清除篩選
                </button>
              )}
            </div>

            {showFilters && (
              <div className="mx-auto mt-4 grid max-w-6xl grid-cols-1 gap-4 border-t border-border pt-4 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">活動狀態</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="h-10 rounded-lg border-border text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t("event.filters.allStatuses")}</SelectItem>
                      <SelectItem value="startingSoon">{t("event.status.startingSoon")}</SelectItem>
                      <SelectItem value="upcoming">{t("event.status.upcoming")}</SelectItem>
                      <SelectItem value="ongoing">{t("event.status.ongoing")}</SelectItem>
                      <SelectItem value="completed">{t("event.status.completed")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">活動類別</Label>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="h-10 rounded-lg border-border text-sm">
                      <SelectValue placeholder="全部類別" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部類別</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {getCategoryLabel(t, cat)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">價格</Label>
                  <Select value={priceFilter} onValueChange={setPriceFilter}>
                    <SelectTrigger className="h-10 rounded-lg border-border text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部</SelectItem>
                      <SelectItem value="free">免費</SelectItem>
                      <SelectItem value="paid">付費</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>

          <div id="upcoming-events" className="scroll-mt-20 pt-8">
            {loading ? (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {[...Array(8)].map((_, i) => (
                  <Card key={i} className="overflow-hidden rounded-xl border-border shadow-none">
                    <Skeleton className="aspect-[4/3] w-full" />
                    <CardContent className="space-y-2 p-4">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                      <Skeleton className="h-3 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : error ? (
              <div className="py-24 text-center">
                <p className="text-base font-medium text-destructive">{error}</p>
                <Button onClick={() => window.location.reload()} variant="outline" size="sm" className="mt-5">
                  重新載入
                </Button>
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="py-24 text-center">
                <Calendar className="mx-auto mb-4 h-10 w-10 text-muted-foreground/50" />
                <p className="text-base font-medium text-foreground">暫無活動</p>
                <p className="mt-2 text-sm text-muted-foreground">請嘗試調整篩選條件</p>
              </div>
            ) : (
              <>
                <p className="mb-6 text-sm tabular-nums text-muted-foreground">
                  共 {filteredEvents.length} 個活動
                </p>

                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                  {visibleEvents.map((event) => {
                    const statusBadge = getEventStatusBadge(event.status);
                    return (
                      <article key={event.id}>
                        <Link to={`/event/${event.id}`} className="group block h-full">
                          <Card className="h-full overflow-hidden rounded-xl border-border shadow-none transition-shadow hover:shadow-strong">
                            <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                              {event.imageUrl ? (
                                <img
                                  src={event.imageUrl}
                                  alt={`${event.name} - 香港寵物活動，${event.district}帶狗好去處`}
                                  loading="lazy"
                                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center bg-muted">
                                  <Calendar className="h-10 w-10 text-muted-foreground/30" />
                                </div>
                              )}
                              <div className="absolute left-2 top-2 flex flex-wrap gap-1">
                                <span className="rounded-md bg-background/90 px-2 py-0.5 text-[11px] font-medium text-foreground backdrop-blur-sm">
                                  {event.district}
                                </span>
                              </div>
                              <div className="absolute right-2 top-2">
                                <span
                                  className={cn(
                                    "rounded-md px-2 py-0.5 text-[11px] font-medium backdrop-blur-sm",
                                    statusBadge.className,
                                  )}
                                >
                                  {statusBadge.label}
                                </span>
                              </div>
                            </div>
                            <CardContent className="p-4">
                              <h3 className="line-clamp-2 text-[15px] font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
                                {event.name}
                              </h3>
                              {event.category && (
                                <span className="mt-2 inline-flex items-center gap-1 rounded-md border border-border px-2 py-0.5 text-[11px] text-muted-foreground">
                                  <Tag className="h-3 w-3" aria-hidden="true" />
                                  {getCategoryLabel(t, event.category)}
                                </span>
                              )}
                              <div className="mt-3 space-y-1.5 text-[11px] text-muted-foreground">
                                <div className="flex items-start gap-1.5">
                                  <Calendar className="mt-0.5 h-3 w-3 shrink-0" aria-hidden="true" />
                                  <time dateTime={event.dateTime} className="line-clamp-2 leading-relaxed">
                                    {formatDate(event.dateTime)}
                                  </time>
                                </div>
                                <div className="flex items-start gap-1.5">
                                  <MapPin className="mt-0.5 h-3 w-3 shrink-0" aria-hidden="true" />
                                  <span className="line-clamp-1">{event.location}</span>
                                </div>
                                {event.price !== undefined && (
                                  <p className="font-semibold text-primary">
                                    {event.price === 0 ? "免費" : `HK$ ${event.price}`}
                                  </p>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      </article>
                    );
                  })}
                </div>

                {hasMoreEvents && (
                  <div className="mt-10 flex justify-center">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="min-w-36 rounded-lg"
                      onClick={() => setVisibleEventCount((count) => count + EVENTS_PER_PAGE)}
                    >
                      {i18n.language === "zh" ? "載入更多活動" : "Load more events"}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>

          <section id="faq" className="mt-14 scroll-mt-20 border-t border-border pt-10">
            <h2 className="mb-6 text-lg font-bold text-foreground">寵物活動常見問題</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {petActivitiesFAQ.map((faq, index) => (
                <div key={index} className="rounded-xl border border-border bg-background p-5">
                  <h3 className="text-sm font-semibold text-foreground">{faq.question}</h3>
                  <p className="faq-answer mt-2 text-xs leading-relaxed text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <section id="pet-restaurants" className="mt-14 scroll-mt-20 border-t border-border pt-10">
            <Card className="border border-border bg-background p-6 shadow-none md:p-8">
              <div className="text-center">
                <h2 className="text-base font-bold text-foreground md:text-lg">想搵更多寵物友善餐廳？</h2>
                <p className="mt-1.5 text-sm text-muted-foreground">玩完活動，帶埋狗狗去食個飯</p>
                <div className="mt-5 flex flex-wrap justify-center gap-3">
                  <Link to="/restaurants">
                    <Button variant="default" size="sm" className="rounded-lg">
                      瀏覽寵物友善餐廳
                      <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                    </Button>
                  </Link>
                  <Link id="dog-mbti" to="/christmas-dog-mbti-2025">
                    <Button variant="outline" size="sm" className="rounded-lg">
                      <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                      做狗狗性格測驗
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

function normalizeEventCategory(category?: string | null, name?: string | null, description?: string | null): typeof eventCategoryKeys[number] {
  const raw = category?.trim().toUpperCase().replace(/[\s-]+/g, "_");
  if (raw && eventCategoryKeys.includes(raw as typeof eventCategoryKeys[number])) {
    return raw as typeof eventCategoryKeys[number];
  }

  const combined = [category, name, description].filter(Boolean).join(" ").toLowerCase();
  if (/領養|领养|adoption|adopt|rescue|救援/.test(combined)) return "ADOPTION";
  if (/市集|market|bazaar|攤位|摊位|booth|vendor/.test(combined)) return "MARKET";
  if (/展覽|展览|expo|fair|博覽|博览|exhibition/.test(combined)) return "EXPO";
  if (/工作坊|workshop|class|training|訓練|训练|diy|講座|讲座|seminar/.test(combined)) return "WORKSHOP";
  if (/慈善|charity|fundraising|義賣|义卖|捐款|ngo|nonprofit|非牟利/.test(combined)) return "CHARITY";
  if (/meetup|party|派對|派对|聚會|聚会|同樂|同乐|walk|散步|郊遊|郊游/.test(combined)) return "MEETUP";
  if (/pet.?friendly|寵物友善|宠物友善|商場|商场|mall|可帶寵物|可带宠物/.test(combined)) return "PET_FRIENDLY";
  return "OTHER";
}

function getCategoryLabel(t: ReturnType<typeof useTranslation>["t"], category?: string | null): string {
  const normalized = eventCategoryKeys.includes(category as typeof eventCategoryKeys[number])
    ? category
    : "OTHER";
  return t(`event.categories.${normalized}`);
}

export default PetActivities;
