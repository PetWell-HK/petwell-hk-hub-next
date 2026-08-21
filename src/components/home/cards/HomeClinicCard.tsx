import AppLink from "@/components/AppLink";
import { Clock, MapPin } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ClinicImage } from "@/components/ClinicImage";

interface HomeClinicCardProps {
  name: string;
  district: string;
  rating: number;
  image?: string;
  verified?: boolean;
  detailPath: string;
  serviceLabels?: string[];
  is247?: boolean;
  is247Label?: string;
}

/** OpenRice chart-inspired trust card — prominent score badge for clinics */
export function HomeClinicCard({
  name,
  district,
  rating,
  image,
  verified,
  detailPath,
  serviceLabels = [],
  is247,
  is247Label,
}: HomeClinicCardProps) {
  const { t } = useTranslation();
  const visibleServices = serviceLabels.slice(0, 2);
  const scoreDisplay = rating > 0 ? rating.toFixed(1) : null;

  return (
    <article className="home-card home-card--clinic group">
      <AppLink href={detailPath} className="home-card__link">
        <div className="home-card--clinic__media">
          <ClinicImage imageKey={image} alt={name} className="home-card--clinic__img" />
          {scoreDisplay !== null && (
            <span className="home-card--clinic__score">
              <span className="home-card--clinic__score-value">{scoreDisplay}</span>
              <span className="home-card--clinic__score-label">/ 5</span>
            </span>
          )}
          {verified && (
            <span className="home-card--clinic__verified">{t("homePortal.sectors.verified")}</span>
          )}
        </div>

        <div className="home-card--clinic__body">
          <h3 className="home-card--clinic__name">{name}</h3>
          <p className="home-card--clinic__district">
            <MapPin className="home-card--clinic__pin" aria-hidden="true" />
            {district}
          </p>

          {(is247 || visibleServices.length > 0) && (
            <div className="home-card--clinic__tags">
              {is247 && is247Label && (
                <span className="home-card--clinic__tag home-card--clinic__tag--247">
                  <Clock className="home-card--clinic__tag-icon" aria-hidden="true" />
                  {is247Label}
                </span>
              )}
              {visibleServices.map((service) => (
                <span key={service} className="home-card--clinic__tag">
                  {service}
                </span>
              ))}
            </div>
          )}
        </div>
      </AppLink>
    </article>
  );
}
