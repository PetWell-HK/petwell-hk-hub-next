import { ArrowUpRight, CalendarDays, Stethoscope, UtensilsCrossed } from "lucide-react";
import AppLink from "@/components/AppLink";
import { useTranslation } from "react-i18next";

const HomePlatform = () => {
  const { t } = useTranslation();

  const services = [
    {
      icon: Stethoscope,
      title: t("home.platform.clinics.title"),
      description: t("home.platform.clinics.description"),
      cta: t("home.platform.clinics.cta"),
      to: "/clinics",
    },
    {
      icon: UtensilsCrossed,
      title: t("home.platform.restaurants.title"),
      description: t("home.platform.restaurants.description"),
      cta: t("home.platform.restaurants.cta"),
      to: "/restaurants",
    },
    {
      icon: CalendarDays,
      title: t("home.platform.activities.title"),
      description: t("home.platform.activities.description"),
      cta: t("home.platform.activities.cta"),
      to: "/pet-activities",
    },
  ];

  return (
    <section className="bg-muted/25 py-20 md:py-28">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <p className="home-section-label">{t("home.platform.eyebrow")}</p>
          <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
            {t("home.platform.title")}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">
            {t("home.platform.subtitle")}
          </p>
        </div>

        <div className="mx-auto mt-14 grid max-w-6xl gap-4 md:grid-cols-3">
          {services.map((service) => (
            <article key={service.to} className="home-card group flex h-full flex-col p-6 md:p-8">
              <div className="mb-6 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-background">
                <service.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-xl font-semibold tracking-tight">{service.title}</h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground md:text-base">
                {service.description}
              </p>
              <AppLink href={service.to} className="home-platform-link mt-8">
                {service.cta}
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </AppLink>
            </article>
          ))}
        </div>

        <p className="seo-hidden mx-auto mt-10 max-w-4xl text-center text-sm leading-relaxed text-muted-foreground">
          PetWell 是<strong>寵物香港</strong>首選平台，為香港寵物主人提供最全面的<strong>寵物香港</strong>
          服務資訊。無論您需要獸醫診所、寵物友善餐廳、寵物活動，還是寵物論壇交流，PetWell
          都能為您提供專業建議和優質服務。
        </p>
      </div>
    </section>
  );
};

export default HomePlatform;
