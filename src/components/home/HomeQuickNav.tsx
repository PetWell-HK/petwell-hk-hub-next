import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  BookOpen,
  CalendarDays,
  Home,
  MessageCircle,
  Scissors,
  Stethoscope,
  TrendingDown,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickNavItem {
  id: string;
  labelKey: string;
  href: string;
  icon: LucideIcon;
  tone: string;
}

const QUICK_NAV: QuickNavItem[] = [
  { id: "review", labelKey: "homePortal.quickNav.review", href: "/review", icon: TrendingDown, tone: "review" },
  { id: "clinics", labelKey: "nav.clinics", href: "/clinics", icon: Stethoscope, tone: "clinics" },
  { id: "restaurants", labelKey: "nav.restaurants", href: "/restaurants", icon: UtensilsCrossed, tone: "restaurants" },
  { id: "salons", labelKey: "nav.salons", href: "/salons", icon: Scissors, tone: "salons" },
  { id: "lodging", labelKey: "nav.lodging", href: "/lodging", icon: Home, tone: "lodging" },
  { id: "activities", labelKey: "nav.petActivities", href: "/pet-activities", icon: CalendarDays, tone: "activities" },
  { id: "forum", labelKey: "nav.forum", href: "/forum", icon: MessageCircle, tone: "forum" },
  { id: "ownerZone", labelKey: "nav.blog", href: "/owner-zone", icon: BookOpen, tone: "ownerZone" },
];

const HomeQuickNav = () => {
  const { t } = useTranslation();

  return (
    <section className="home-quick-nav" aria-label={t("homePortal.quickNav.label")}>
      <div className="container mx-auto px-4">
        <div className="home-quick-nav__grid">
          {QUICK_NAV.map((item, index) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.id}
                to={item.href}
                className={cn(
                  "home-quick-nav__item home-reveal",
                  `home-quick-nav__item--${item.tone}`,
                  `home-reveal-delay-${Math.min(index + 1, 4)}`,
                )}
              >
                <span className="home-quick-nav__icon-wrap">
                  <Icon className="home-quick-nav__icon" aria-hidden="true" />
                </span>
                <span className="home-quick-nav__label">{t(item.labelKey)}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HomeQuickNav;
