import { Link } from "react-router-dom";
import { Calendar, MapPin, Tag } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { EventStatus } from "@/services/eventApi";

export interface EventListCardData {
  id: string;
  name: string;
  dateTime: string;
  location?: string | null;
  district: string;
  imageUrl?: string;
  category?: string | null;
  price?: number | null;
  status: EventStatus;
}

interface EventListCardProps {
  event: EventListCardData;
  statusLabel: string;
  statusClassName: string;
  categoryLabel?: string;
  formattedDate: string;
}

export function EventListCard({
  event,
  statusLabel,
  statusClassName,
  categoryLabel,
  formattedDate,
}: EventListCardProps) {
  return (
    <article>
      <Link to={`/event/${event.id}`} className="group block h-full">
        <Card className="h-full overflow-hidden rounded-xl border-border shadow-none transition-shadow hover:shadow-strong">
          <div className="relative aspect-[4/3] overflow-hidden bg-muted">
            {event.imageUrl ? (
              <img
                src={event.imageUrl}
                alt={event.name}
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
                  statusClassName,
                )}
              >
                {statusLabel}
              </span>
            </div>
          </div>
          <CardContent className="p-4">
            <h3 className="line-clamp-2 text-[15px] font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
              {event.name}
            </h3>
            {categoryLabel && (
              <span className="mt-2 inline-flex items-center gap-1 rounded-md border border-border px-2 py-0.5 text-[11px] text-muted-foreground">
                <Tag className="h-3 w-3" aria-hidden="true" />
                {categoryLabel}
              </span>
            )}
            <div className="mt-3 space-y-1.5 text-[11px] text-muted-foreground">
              <div className="flex items-start gap-1.5">
                <Calendar className="mt-0.5 h-3 w-3 shrink-0" aria-hidden="true" />
                <time dateTime={event.dateTime} className="line-clamp-2 leading-relaxed">
                  {formattedDate}
                </time>
              </div>
              {event.location && (
                <div className="flex items-start gap-1.5">
                  <MapPin className="mt-0.5 h-3 w-3 shrink-0" aria-hidden="true" />
                  <span className="line-clamp-1">{event.location}</span>
                </div>
              )}
              {event.price !== undefined && event.price !== null && (
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
}
