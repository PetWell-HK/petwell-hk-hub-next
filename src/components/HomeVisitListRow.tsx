import { Link } from "react-router-dom";
import { Clock, MapPin, Star } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import { ClinicImage } from "@/components/ClinicImage";
import type { HomeVisitListOffering } from "@/services/homeVisitApi";

const VISIBLE_OFFERING_LIMIT = 3;

interface HomeVisitListRowProps {
  name: string;
  coverageSummary: string;
  district?: string;
  image?: string;
  detailPath: string;
  offerings?: HomeVisitListOffering[];
  speciesLabels?: string[];
  is247?: boolean;
  is247Label?: string;
  rating?: number;
}

export function HomeVisitListRow({
  name,
  coverageSummary,
  district,
  image,
  detailPath,
  offerings = [],
  speciesLabels = [],
  is247,
  is247Label,
  rating = 0,
}: HomeVisitListRowProps) {
  const { t } = useTranslation();
  const visibleOfferings = offerings.slice(0, VISIBLE_OFFERING_LIMIT);
  const extraOfferingCount = Math.max(offerings.length - visibleOfferings.length, 0);
  const coverageLine = coverageSummary || district || "";
  const metaLine = [coverageLine, ...speciesLabels.slice(0, 3)].filter(Boolean).join(" · ");

  return (
    <article>
      <Card className="overflow-hidden rounded-xl transition-shadow hover:shadow-strong">
        <Link to={detailPath} className="block">
          <div className="flex min-h-[96px] flex-row">
            <div className="relative w-[88px] shrink-0 self-stretch overflow-hidden bg-muted sm:w-[108px]">
              <ClinicImage
                imageKey={image}
                alt={name}
                objectFit="contain"
                className="h-full w-full p-1.5"
              />
              {is247 && is247Label ? (
                <span className="absolute left-1 top-1 inline-flex items-center gap-0.5 rounded-full bg-white/95 px-1.5 py-0.5 text-[10px] font-semibold text-primary shadow-sm">
                  <Clock className="h-2.5 w-2.5" aria-hidden="true" />
                  {is247Label}
                </span>
              ) : null}
            </div>

            <div className="flex min-w-0 flex-1 flex-col justify-center gap-1 px-3 py-2.5 sm:px-4">
              <header className="flex items-start justify-between gap-3">
                <h2 className="text-[15px] font-bold leading-snug text-foreground sm:text-[17px]">
                  {name}
                </h2>
                {rating > 0 ? (
                  <span className="inline-flex shrink-0 items-center gap-1 text-sm text-muted-foreground">
                    <Star className="h-3.5 w-3.5 fill-primary text-primary" aria-hidden="true" />
                    <span className="font-medium text-foreground">{rating.toFixed(1)}</span>
                  </span>
                ) : null}
              </header>
              {metaLine ? (
                <p className="flex min-w-0 items-start gap-1.5 text-xs text-muted-foreground sm:text-sm">
                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
                  <span className="line-clamp-2">{metaLine}</span>
                </p>
              ) : null}
            </div>
          </div>

          {visibleOfferings.length > 0 ? (
            <div className="border-t border-border bg-muted/35">
              {visibleOfferings.map((offering) => (
                <div
                  key={offering.key}
                  className="flex items-baseline justify-between gap-3 border-b border-border/60 px-3 py-2 last:border-b-0 sm:px-4"
                >
                  <span className="min-w-0 truncate text-sm text-foreground">{offering.name}</span>
                  {offering.price ? (
                    <span className="max-w-[42%] shrink-0 truncate text-sm font-semibold tabular-nums text-primary">
                      {offering.price}
                    </span>
                  ) : null}
                </div>
              ))}
              {extraOfferingCount > 0 ? (
                <p className="px-3 py-2 text-xs font-medium text-primary sm:px-4">
                  {t("homeVisitPlaces.moreServices", { count: extraOfferingCount })}
                </p>
              ) : null}
            </div>
          ) : null}
        </Link>
      </Card>
    </article>
  );
}
