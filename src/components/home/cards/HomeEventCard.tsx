import AppLink from "@/components/AppLink";
import { Calendar, MapPin, Tag } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import type { EventListCardData } from "@/components/EventListCard";

interface HomeEventCardProps {
  event: EventListCardData;
  statusLabel: string;
  statusClassName: string;
  categoryLabel?: string;
  formattedDate: string;
  language: string;
}

function formatShortDate(dateTime: string, language: string) {
  return new Intl.DateTimeFormat(language === "zh" ? "zh-HK" : "en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(dateTime));
}

function formatWeekday(dateTime: string, language: string) {
  return new Intl.DateTimeFormat(language === "zh" ? "zh-HK" : "en-US", {
    weekday: "short",
  }).format(new Date(dateTime));
}

/** Trip.com story-style vertical card — immersive photo with date block */
export function HomeEventCard({
  event,
  statusLabel,
  statusClassName,
  categoryLabel,
  formattedDate,
  language,
}: HomeEventCardProps) {
  const { t } = useTranslation();

  return (
    <article className="home-card home-card--event group">
      <AppLink href={`/event/${event.id}`} className="home-card__link">
        <div className="home-card--event__media">
          {event.imageUrl ? (
            <img
              src={event.imageUrl}
              alt={event.name}
              loading="lazy"
              className="home-card--event__img"
            />
          ) : (
            <div className="home-card--event__placeholder">
              <Calendar className="home-card--event__placeholder-icon" aria-hidden="true" />
            </div>
          )}

          <div className="home-card--event__date-block">
            <span className="home-card--event__weekday">
              {formatWeekday(event.dateTime, language)}
            </span>
            <span className="home-card--event__day">
              {formatShortDate(event.dateTime, language)}
            </span>
          </div>

          <span className={cn("home-card--event__status", statusClassName)}>{statusLabel}</span>

          <div className="home-card--event__overlay">
            <h3 className="home-card--event__title">{event.name}</h3>
            {event.district && (
              <p className="home-card--event__location">
                <MapPin className="home-card--event__pin" aria-hidden="true" />
                {event.district}
              </p>
            )}
          </div>
        </div>

        <div className="home-card--event__body">
          {categoryLabel && (
            <span className="home-card--event__category">
              <Tag className="home-card--event__category-icon" aria-hidden="true" />
              {categoryLabel}
            </span>
          )}
          <time dateTime={event.dateTime} className="home-card--event__full-date">
            {formattedDate}
          </time>
          {event.price !== undefined && event.price !== null && (
            <p className="home-card--event__price">
              {event.price === 0
                ? t("homePortal.cards.freeEntry")
                : t("homePortal.cards.priceFrom", { price: event.price })}
            </p>
          )}
        </div>
      </AppLink>
    </article>
  );
}
