"use client";

import { useEffect } from 'react';
import { useParams } from "next/navigation";
import AppLink from "@/components/AppLink";
import NearbyRestaurants from '@/components/NearbyRestaurants';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Calendar, 
  Clock, 
  ExternalLink, 
  ArrowLeft,
  Building2,
  Share2
} from 'lucide-react';
import { getEventById, type Personality } from '@/data/christmasEventData';
import { useToast } from '@/hooks/use-toast';

const personalityLabels: Record<Personality, string> = {
  party: 'Party 狗狗',
  warm: '暖包狗狗',
  hea: 'Hea 爆狗狗',
};

const ChristmasEventDetail = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const { toast } = useToast();
  const event = eventId ? getEventById(eventId) : undefined;

  // SEO: Dynamic meta tags and structured data for individual event
  useEffect(() => {
    if (!event) return;
    
    const originalTitle = document.title;
    const originalDescription = document.querySelector('meta[name="description"]')?.getAttribute('content');
    
    // Set page title
    document.title = `${event.name} | 2025 香港狗狗聖誕活動 | PetWell`;
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 
        `${event.name} - ${event.organiser}聖誕活動。地點：${event.address}。${event.remark.substring(0, 100)}...`
      );
    }
    
    // Update OG tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const ogDescription = document.querySelector('meta[property="og:description"]');
    const ogUrl = document.querySelector('meta[property="og:url"]');
    const ogImage = document.querySelector('meta[property="og:image"]');
    if (ogTitle) ogTitle.setAttribute('content', `${event.name} | 狗狗聖誕活動`);
    if (ogDescription) ogDescription.setAttribute('content', event.remark.substring(0, 150));
    if (ogUrl) ogUrl.setAttribute('content', `https://petwellhk.com/christmas-event/${event.id}`);
    if (ogImage) ogImage.setAttribute('content', event.imageUrl);
    
    // Set canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', `https://petwellhk.com/christmas-event/${event.id}`);
    
    // Add Event structured data
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'event-schema';
    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Event",
      "name": event.name,
      "description": event.remark,
      "startDate": event.dateStart,
      "endDate": event.dateEnd,
      "eventStatus": "https://schema.org/EventScheduled",
      "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
      "location": {
        "@type": "Place",
        "name": event.organiser,
        "address": {
          "@type": "PostalAddress",
          "streetAddress": event.address,
          "addressLocality": "Hong Kong",
          "addressCountry": "HK"
        },
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": event.latitude,
          "longitude": event.longitude
        }
      },
      "organizer": {
        "@type": "Organization",
        "name": event.organiser,
        "url": event.sourceUrl
      },
      "image": event.imageUrl,
      "url": `https://petwellhk.com/christmas-event/${event.id}`
    });
    document.head.appendChild(script);
    
    // Cleanup on unmount
    return () => {
      document.title = originalTitle;
      if (metaDescription && originalDescription) {
        metaDescription.setAttribute('content', originalDescription);
      }
      const schemaScript = document.getElementById('event-schema');
      if (schemaScript) schemaScript.remove();
    };
  }, [event]);

  if (!event) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 mt-[72px] flex items-center justify-center">
          <div className="text-center space-y-4 p-8">
            <h1 className="text-2xl font-bold text-foreground">找不到活動</h1>
            <p className="text-muted-foreground">呢個活動可能已經結束或者唔存在。</p>
            <AppLink href="/christmas-events-2025">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                返回測驗
              </Button>
            </AppLink>
          </div>
        </main>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-HK', { 
      year: 'numeric',
      month: 'long', 
      day: 'numeric',
      weekday: 'long'
    });
  };

  const handleShare = async () => {
    const shareData = {
      title: event.name,
      text: `🎄 ${event.name} - 聖誕狗狗活動推介`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // User cancelled sharing
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast({
        title: '已複製連結',
        description: '活動連結已複製到剪貼簿！',
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      
      <main className="flex-1 mt-0">
        {/* Hero Image */}
        <div className="relative h-[300px] md:h-[400px] overflow-hidden">
          <img
            src={event.imageUrl}
            alt={`${event.name} - ${event.organiser}聖誕活動，位於${event.address}`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
          
          {/* Back button */}
          <div className="absolute top-4 left-4">
            <AppLink href="/christmas-events-2025">
              <Button variant="secondary" size="sm" className="gap-2 bg-background/80 backdrop-blur-sm">
                <ArrowLeft className="w-4 h-4" />
                返回
              </Button>
            </AppLink>
          </div>

          {/* Share button */}
          <div className="absolute top-4 right-4">
            <Button 
              variant="secondary" 
              size="sm" 
              className="gap-2 bg-background/80 backdrop-blur-sm"
              onClick={handleShare}
            >
              <Share2 className="w-4 h-4" />
              分享
            </Button>
          </div>

          {/* District badge */}
          <div className="absolute bottom-4 right-4">
            <Badge className="text-sm px-4 py-1.5">{event.district}</Badge>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Title Section */}
          <div className="space-y-4 mb-8">
            <h1 className="text-2xl md:text-4xl font-bold text-foreground">
              {event.name}
            </h1>
            
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Date & Time Card */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <h3 className="font-semibold text-lg text-foreground flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  日期時間
                </h3>
                <div className="space-y-2 text-muted-foreground">
                  <p>
                    <span className="font-medium text-foreground">開始：</span>
                    <time dateTime={event.dateStart}>{formatDate(event.dateStart)}</time>
                  </p>
                  {event.dateStart !== event.dateEnd && (
                    <p>
                      <span className="font-medium text-foreground">結束：</span>
                      <time dateTime={event.dateEnd}>{formatDate(event.dateEnd)}</time>
                    </p>
                  )}
                  <p className="flex items-center gap-2 pt-2">
                    <Clock className="w-4 h-4" />
                    {event.openTime} - {event.closeTime}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Location Card */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <h3 className="font-semibold text-lg text-foreground flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  地點
                </h3>
                <div className="space-y-2 text-muted-foreground">
                  <p className="text-foreground font-medium">{event.address}</p>
                  <p className="flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    主辦：{event.organiser}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Remarks */}
          <Card className="mb-8">
            <CardContent className="p-6 space-y-4">
              <h3 className="font-semibold text-lg text-foreground">
                📝 活動詳情
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {event.remark}
              </p>
            </CardContent>
          </Card>

          {/* Nearby Restaurants */}
          <NearbyRestaurants 
            eventLat={event.latitude} 
            eventLon={event.longitude} 
          />

          {/* External Link */}
          {event.sourceUrl && event.sourceUrl !== 'https://example.com' && (
            <div className="flex justify-center mb-8">
              <a 
                href={event.sourceUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-primary hover:text-primary/80 underline underline-offset-4 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                查看活動官網
              </a>
            </div>
          )}

          {/* Back to quiz */}
          <div className="text-center pt-8 border-t">
            <p className="text-muted-foreground mb-4">
              想知狗狗最啱去邊度過聖誕？
            </p>
            <AppLink href="/christmas-dog-mbti-2025">
              <Button variant="outline" className="gap-2">
                🐕 測下狗狗 MBTI 話你知佢想去邊
              </Button>
            </AppLink>
          </div>
        </div>
      </main>
      
    </div>
  );
};

export default ChristmasEventDetail;
