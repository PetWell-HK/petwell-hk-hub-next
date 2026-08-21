import { useState } from 'react';
import AppLink from "@/components/AppLink";
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, Clock, Star, ChevronDown } from 'lucide-react';
import { christmasEvents, getRandomEventsByPersonality, type Personality, type ChristmasEvent } from '@/data/christmasEventData';

interface ChristmasEventListProps {
  mbtiResult: Personality;
  middleContent?: React.ReactNode;
}

const personalityLabels: Record<Personality, string> = {
  party: 'Party 狗狗',
  warm: '暖包狗狗',
  hea: 'Hea 爆狗狗',
};

const ChristmasEventList = ({ mbtiResult, middleContent }: ChristmasEventListProps) => {
  const [showOtherEvents, setShowOtherEvents] = useState(false);
  
  // Get randomly selected recommended events (max 5)
  const recommendedEvents = getRandomEventsByPersonality(mbtiResult, 5);
  
  // Get other events (not recommended for this personality)
  const otherEvents = christmasEvents.filter(e => !e.recommendedFor.includes(mbtiResult));

  return (
    <div className="space-y-8">
      {/* Recommended Events Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          <h3 className="text-lg font-semibold text-foreground whitespace-nowrap">
            ⭐ 頭5位最適合你狗狗嘅活動
          </h3>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {recommendedEvents.map((event) => (
            <EventCard key={event.id} event={event} isRecommended={true} />
          ))}
        </div>
      </div>

      {/* Middle Content (e.g., action buttons) */}
      {middleContent}

      {/* Other Events Section - Collapsible */}
      {otherEvents.length > 0 && (
        <div className="space-y-4 pt-4">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setShowOtherEvents(!showOtherEvents);
            }}
            className="w-full flex items-center gap-3 cursor-pointer group"
          >
            <div className="h-px flex-1 bg-border" />
            <div className="flex items-center gap-2 text-lg font-medium text-muted-foreground whitespace-nowrap group-hover:text-foreground transition-colors">
              <span>🎄 其他聖誕+倒數活動</span>
              <ChevronDown 
                className={`w-5 h-5 transition-transform duration-300 ${showOtherEvents ? 'rotate-180' : ''}`} 
              />
            </div>
            <div className="h-px flex-1 bg-border" />
          </button>
          
          {showOtherEvents && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in-50 slide-in-from-top-2 duration-300">
              {otherEvents.map((event) => (
                <EventCard key={event.id} event={event} isRecommended={false} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

interface EventCardProps {
  event: ChristmasEvent;
  isRecommended: boolean;
}

const EventCard = ({ event, isRecommended }: EventCardProps) => {
  const formatDateRange = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    if (start === end) {
      return startDate.toLocaleDateString('zh-HK', options);
    }
    return `${startDate.toLocaleDateString('zh-HK', options)} - ${endDate.toLocaleDateString('zh-HK', options)}`;
  };

  return (
    <AppLink href={`/christmas-event/${event.id}`}>
      <Card 
        className={`group overflow-hidden transition-all duration-300 hover:shadow-xl cursor-pointer h-full ${
          isRecommended 
            ? 'border-2 border-primary ring-2 ring-primary/20 shadow-lg' 
            : 'border hover:border-primary/50'
        }`}
      >
        {/* Image */}
        <div className="relative aspect-video overflow-hidden">
          <img
            src={event.imageUrl}
            alt={event.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {/* Recommended Badge */}
          {isRecommended && (
            <div className="absolute top-3 left-3">
              <Badge className="bg-primary text-primary-foreground gap-1 px-3 py-1.5 text-sm font-semibold shadow-lg">
                <Star className="w-4 h-4 fill-current" />
                推薦
              </Badge>
            </div>
          )}
          {/* District Badge */}
          <div className="absolute top-3 right-3">
            <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm">
              {event.district}
            </Badge>
          </div>
        </div>

        <CardContent className="p-4 space-y-3">
          {/* Title */}
          <h3 className="font-bold text-lg text-foreground line-clamp-2 group-hover:text-primary transition-colors">
            {event.name}
          </h3>

          {/* Meta Info */}
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <span className="line-clamp-1">{event.address}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 flex-shrink-0" />
              <span>{formatDateRange(event.dateStart, event.dateEnd)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 flex-shrink-0" />
              <span>{event.openTime} - {event.closeTime}</span>
            </div>
          </div>

          {/* Remark preview */}
          <p className="text-sm text-muted-foreground line-clamp-2">
            {event.remark}
          </p>

        </CardContent>
      </Card>
    </AppLink>
  );
};

export default ChristmasEventList;
