import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { translateServiceOfferings } from "@/utils/serviceOfferings";

type PlaceServicesSectionProps = {
  title?: string;
  services?: string | string[] | null;
};

const DEFAULT_VISIBLE_COUNT = 6;

const PlaceServicesSection = ({
  title,
  services,
}: PlaceServicesSectionProps) => {
  const { i18n } = useTranslation();
  const [showAll, setShowAll] = useState(false);
  const isEnglish = i18n.language === "en";

  const normalizedServices = useMemo(
    () => translateServiceOfferings(services, i18n.language),
    [i18n.language, services]
  );

  if (normalizedServices.length === 0) {
    return null;
  }

  const visibleServices = showAll
    ? normalizedServices
    : normalizedServices.slice(0, DEFAULT_VISIBLE_COUNT);
  const hiddenCount = Math.max(0, normalizedServices.length - DEFAULT_VISIBLE_COUNT);

  return (
    <section aria-labelledby="place-services-heading">
      <Card className="p-6 md:p-8 mb-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h2 id="place-services-heading" className="text-2xl font-bold">
              {title || (isEnglish ? "Services" : "服務項目")}
            </h2>
            <p className="text-sm text-muted-foreground">
              {isEnglish
                ? "Browse the main services available at this place."
                : "更清楚睇到呢間店／診所提供咩服務。"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {visibleServices.map((service) => (
            <span
              key={service}
              className="rounded-full border border-primary/15 bg-primary/5 px-3 py-2 text-sm font-medium text-foreground"
            >
              {service}
            </span>
          ))}
        </div>

        {hiddenCount > 0 && (
          <div className="mt-4">
            <Button
              type="button"
              variant="ghost"
              className="px-0 text-primary hover:bg-transparent hover:text-primary-hover"
              onClick={() => setShowAll((current) => !current)}
            >
              {showAll ? (
                <>
                  <ChevronUp className="mr-2 h-4 w-4" />
                  {isEnglish ? "Show less" : "顯示較少"}
                </>
              ) : (
                <>
                  <ChevronDown className="mr-2 h-4 w-4" />
                  {isEnglish ? `Show ${hiddenCount} more` : `顯示更多 (${hiddenCount})`}
                </>
              )}
            </Button>
          </div>
        )}
      </Card>
    </section>
  );
};

export default PlaceServicesSection;
