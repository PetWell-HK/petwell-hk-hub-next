import { Clock, Database, Gift, Heart } from "lucide-react";
import { useTranslation } from "react-i18next";

const Features = () => {
  const { t } = useTranslation();

  const features = [
    {
      icon: Clock,
      title: t("home.features.saveTime.title"),
      description: t("home.features.saveTime.description"),
      className: "lg:col-span-2",
    },
    {
      icon: Heart,
      title: t("home.features.advocacy.title"),
      description: t("home.features.advocacy.description"),
      className: "",
    },
    {
      icon: Database,
      title: t("home.features.records.title"),
      description: t("home.features.records.description"),
      className: "",
    },
    {
      icon: Gift,
      title: t("home.features.free.title"),
      description: t("home.features.free.description"),
      className: "lg:col-span-2",
    },
  ];

  return (
    <section className="border-b border-border py-20 md:py-28">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <p className="home-section-label">{t("home.features.eyebrow")}</p>
          <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
            {t("home.features.title")}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">
            {t("home.features.subtitle")}
          </p>
        </div>

        <div className="mx-auto mt-14 grid max-w-5xl gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <article
              key={feature.title}
              className={`home-bento-feature p-6 md:p-8 ${feature.className}`}
            >
              <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-secondary/60">
                <feature.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-lg font-semibold tracking-tight text-foreground md:text-xl">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground md:text-base">
                {feature.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
