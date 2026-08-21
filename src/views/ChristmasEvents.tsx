"use client";

import { useEffect } from 'react';
import AppLink from "@/components/AppLink";
import { ArrowRight, Sparkles, MapPin, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { christmasEvents, Personality } from '@/data/christmasEventData';

const personalityLabels: Partial<Record<Personality, string>> = {
  hea: '😌 Hea 住過',
};

const ChristmasEvents = () => {
  // SEO: Dynamic meta tags and structured data
  useEffect(() => {
    const originalTitle = document.title;
    const originalDescription = document.querySelector('meta[name="description"]')?.getAttribute('content');
    
    // Set page title
    document.title = '2025 香港狗狗聖誕+倒數活動攻略 | 寵物活動、寵物好去處 | PetWell';
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 
        '精選2025香港聖誕及跨年倒數狗狗活動，寵物活動、寵物好去處推薦。包括太古廣場、利東街、K11等商場活動，配對PetWell Verified寵物友善餐廳，幫你由玩到食都照顧到狗狗需要。'
      );
    }
    
    // Add meta keywords for 寵物活動
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.setAttribute('name', 'keywords');
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.setAttribute('content', '聖誕寵物活動,寵物活動,寵物好去處,帶狗活動,狗狗聖誕活動,香港寵物活動,聖誕帶狗好去處,跨年寵物活動,新年寵物活動,寵物友善商場活動');
    
    // Update OG tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const ogDescription = document.querySelector('meta[property="og:description"]');
    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogTitle) ogTitle.setAttribute('content', '2025 香港狗狗聖誕+倒數活動攻略 | PetWell');
    if (ogDescription) ogDescription.setAttribute('content', '精選適合帶毛孩去玩的聖誕同跨年倒數活動，配對寵物友善餐廳推薦');
    if (ogUrl) ogUrl.setAttribute('content', 'https://petwellhk.com/christmas-events-2025');
    
    // Set canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', 'https://petwellhk.com/christmas-events-2025');
    
    // Add structured data (Event schema)
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'christmas-events-schema';
    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": "2025 香港狗狗聖誕活動",
      "description": "精選適合帶毛孩去玩的聖誕同跨年倒數活動",
      "numberOfItems": christmasEvents.length,
      "itemListElement": christmasEvents.map((event, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "Event",
          "name": event.name,
          "description": event.remark,
          "startDate": event.dateStart,
          "endDate": event.dateEnd,
          "location": {
            "@type": "Place",
            "name": event.organiser,
            "address": event.address
          },
          "organizer": {
            "@type": "Organization",
            "name": event.organiser
          },
          "image": event.imageUrl,
          "url": `https://petwellhk.com/christmas-event/${event.id}`
        }
      }))
    });
    document.head.appendChild(script);
    
    // Cleanup on unmount
    return () => {
      document.title = originalTitle;
      if (metaDescription && originalDescription) {
        metaDescription.setAttribute('content', originalDescription);
      }
      const schemaScript = document.getElementById('christmas-events-schema');
      if (schemaScript) schemaScript.remove();
    };
  }, []);

  const formatDate = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const formatOptions: Intl.DateTimeFormatOptions = { month: 'numeric', day: 'numeric' };
    
    if (startDate === endDate) {
      return start.toLocaleDateString('zh-HK', { ...formatOptions, year: 'numeric' });
    }
    return `${start.toLocaleDateString('zh-HK', formatOptions)} - ${end.toLocaleDateString('zh-HK', { ...formatOptions, year: 'numeric' })}`;
  };

  return (
    <div className="min-h-screen bg-background">
      
      <main className="pt-2">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-red-500/10 via-green-500/5 to-background py-16 md:py-24 overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-10 left-10 text-6xl opacity-20">🎄</div>
            <div className="absolute top-20 right-20 text-4xl opacity-20">❄️</div>
            <div className="absolute bottom-10 left-1/4 text-5xl opacity-20">🎁</div>
            <div className="absolute bottom-20 right-10 text-4xl opacity-20">⭐</div>
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center max-w-4xl mx-auto">
              <Badge className="mb-4 bg-red-500/10 text-red-600 border-red-200">
                🎄 2025 聖誕x倒數
              </Badge>
              <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 leading-tight">
                2025 香港狗狗聖誕＋倒數
                <br className="hidden md:block" />
                <span className="md:hidden"> </span>
                活動＋餐廳出街攻略
              </h1>
              <p className="text-base md:text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                精選適合帶毛孩去玩的聖誕同跨年倒數活動，再配對 PetWell Verified 真・寵物友善餐廳，幫你由玩到食都照顧到狗狗需要。
              </p>
            </div>
          </div>
        </section>

        {/* MBTI CTA Section */}
        <section className="py-8 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-y border-amber-200/50">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 max-w-4xl mx-auto">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                  <Sparkles className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground mb-1">
                    唔知帶狗狗去邊好？🐕
                  </h2>
                  <p className="text-muted-foreground">
                    做個簡單測驗，搵出你狗狗嘅「MBTI」，我哋會推薦最適合佢嘅活動！
                  </p>
                </div>
              </div>
              <AppLink href="/christmas-dog-mbti-2025">
                <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg whitespace-nowrap">
                  測試狗狗MBTI
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </AppLink>
            </div>
          </div>
        </section>

        {/* Events Grid */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-foreground">
                所有活動 ({christmasEvents.length})
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {christmasEvents.map((event) => (
                <article key={event.id}>
                  <AppLink href={`/christmas-event/${event.id}`}>
                    <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full">
                      <div className="aspect-[16/10] overflow-hidden relative">
                        <img 
                          src={event.imageUrl} 
                          alt={`${event.name} - ${event.organiser}聖誕活動，位於${event.address}`}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-3 left-3">
                          <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm">
                            {event.district}
                          </Badge>
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-bold text-lg text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                          {event.name}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          {event.organiser}
                        </p>
                        
                        <div className="space-y-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 flex-shrink-0" />
                            <time dateTime={event.dateStart}>{formatDate(event.dateStart, event.dateEnd)}</time>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 flex-shrink-0" />
                            <span className="line-clamp-1">{event.address}</span>
                          </div>
                        </div>

                        {/* Personality Tags */}
                        {event.recommendedFor.some(p => personalityLabels[p]) && (
                          <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-border">
                            {event.recommendedFor.map((personality) => (
                              personalityLabels[personality] ? (
                                <span
                                  key={personality}
                                  className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
                                >
                                  {personalityLabels[personality]}
                                </span>
                              ) : null
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </AppLink>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="py-12 bg-muted/50">
          <div className="container mx-auto px-4 text-center">
            <p className="text-muted-foreground mb-4">
              想知道邊個活動最適合你嘅狗狗？
            </p>
            <AppLink href="/christmas-dog-mbti-2025">
              <Button variant="outline" size="lg">
                <Sparkles className="w-4 h-4 mr-2" />
                做狗狗性格測驗
              </Button>
            </AppLink>
          </div>
        </section>
      </main>

    </div>
  );
};

export default ChristmasEvents;
