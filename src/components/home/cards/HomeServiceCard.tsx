import { Link } from "react-router-dom";
import { Clock, MapPin, Star } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ClinicImage } from "@/components/ClinicImage";

type ServiceVariant = "salon" | "lodging";

interface HomeServiceCardProps {
  variant: ServiceVariant;
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

/** Trip.com hotel-style listing — structured info panel for salons & lodging */
export function HomeServiceCard({
  variant,
  name,
  district,
  rating,
  image,
  verified,
  detailPath,
  serviceLabels = [],
  is247,
  is247Label,
}: HomeServiceCardProps) {
  const { t } = useTranslation();
  const visibleServices = serviceLabels.slice(0, 2);
  const extraCount = serviceLabels.length - visibleServices.length;

  return (
    <article
      className={`home-card home-card--service home-card--service--${variant} group`}
    >
      <Link to={detailPath} className="home-card__link">
        <div className="home-card--service__media">
          <ClinicImage imageKey={image} alt={name} className="home-card--service__img" />
          {verified && (
            <span className="home-card--service__verified">{t("homePortal.sectors.verified")}</span>
          )}
        </div>

        <div className="home-card--service__body">
          <p className="home-card--service__location">{district}</p>
          <h3 className="home-card--service__name">{name}</h3>

          {rating > 0 && (
            <div className="home-card--service__rating-row">
              <span className="home-card--service__stars" aria-hidden="true">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={
                      i < Math.round(rating)
                        ? "home-card--service__star home-card--service__star--filled"
                        : "home-card--service__star"
                    }
                  />
                ))}
              </span>
              <span className="home-card--service__score">{rating.toFixed(1)}</span>
            </div>
          )}

          <div className="home-card--service__tags">
            {is247 && is247Label && (
              <span className="home-card--service__tag">
                <Clock className="home-card--service__tag-icon" aria-hidden="true" />
                {is247Label}
              </span>
            )}
            {visibleServices.map((service) => (
              <span key={service} className="home-card--service__tag">
                {service}
              </span>
            ))}
            {extraCount > 0 && (
              <span className="home-card--service__tag home-card--service__tag--more">
                +{extraCount}
              </span>
            )}
          </div>

          <p className="home-card--service__district-line">
            <MapPin className="home-card--service__pin" aria-hidden="true" />
            {district}
          </p>
        </div>
      </Link>
    </article>
  );
}
