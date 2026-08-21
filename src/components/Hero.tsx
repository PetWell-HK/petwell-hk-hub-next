import { ArrowRight } from "lucide-react";
import AppLink from "@/components/AppLink";
import { useAppNavigate } from "@/hooks/useAppNavigate";
import { useTranslation } from "react-i18next";
import CountUpStat from "@/components/CountUpStat";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
const appPreview = "/assets/app-preview.png";

interface HeroProps {
  previewImage?: string;
  previewWidth?: number;
  previewHeight?: number;
  /** Landscape triple-phone mockup — larger, static, aligned to the hero grid */
  previewLayout?: "default" | "landscape";
}

const Hero = ({
  previewImage = appPreview,
  previewWidth = 600,
  previewHeight = 800,
  previewLayout = "default",
}: HeroProps) => {
  const isLandscapePreview = previewLayout === "landscape";
  const navigate = useAppNavigate();
  const { t } = useTranslation();

  const stats = [
    {
      end: 200,
      suffix: "+",
      duration: 1600,
      label: t("home.stats.clinicsLabel"),
    },
    {
      end: 1500,
      suffix: "+",
      duration: 2200,
      label: t("home.stats.restaurantsLabel"),
    },
    {
      end: 100,
      suffix: "%",
      duration: 1400,
      label: t("home.stats.freeLabel"),
    },
  ];

  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="home-hero-bg pointer-events-none absolute inset-0" aria-hidden="true" />

      <div className="container relative mx-auto flex min-h-[min(720px,calc(100svh-4rem))] items-center px-4 py-16 md:py-20 lg:py-24">
        <div
          className={cn(
            "grid items-center gap-14 lg:gap-16",
            isLandscapePreview
              ? "lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.35fr)]"
              : "lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]",
          )}
        >
          <div className="mx-auto max-w-2xl text-center lg:mx-0 lg:text-left">
            <div className="home-reveal mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-3 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur-sm">
              <span className="home-pulse-dot h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
              {t("home.eyebrow")}
            </div>

            <h1 className="home-reveal home-reveal-delay-1 text-4xl font-bold leading-[1.05] tracking-tight md:text-5xl lg:text-6xl xl:text-[4.25rem]">
              <span className="block text-foreground">{t("hero.title")}</span>
              <span className="mt-1 block bg-gradient-primary bg-clip-text text-transparent">
                {t("hero.titleHighlight")}
              </span>
            </h1>

            <p className="home-reveal home-reveal-delay-2 mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground md:text-xl lg:mx-0">
              {t("hero.subtitle")}
            </p>

            <p className="hero-summary home-reveal home-reveal-delay-2 mx-auto mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground/80 lg:mx-0">
              {t("home.summary")}
            </p>

            <div className="home-reveal home-reveal-delay-3 mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <Button
                size="lg"
                onClick={() => navigate("/download")}
                className="h-12 min-w-[160px] px-8 text-base shadow-soft"
              >
                {t("hero.cta")}
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-12 border-border bg-background/70 px-8 text-base text-foreground backdrop-blur-sm transition-[color,background-color,border-color,box-shadow] hover:border-primary/35 hover:bg-secondary hover:text-secondary-foreground active:bg-secondary/90 active:text-secondary-foreground [&_svg]:transition-transform hover:[&_svg]:translate-x-0.5"
              >
                <AppLink href="/clinics">
                  {t("home.explorePlatform")}
                  <ArrowRight className="h-4 w-4" />
                </AppLink>
              </Button>
            </div>

            <dl className="home-reveal home-reveal-delay-4 mx-auto mt-12 grid max-w-xl grid-cols-3 gap-4 border-t border-border pt-8 lg:mx-0">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center lg:text-left">
                  <dt className="home-stat-value text-2xl font-bold text-foreground md:text-3xl">
                    <CountUpStat
                      end={stat.end}
                      suffix={stat.suffix}
                      duration={stat.duration}
                    />
                  </dt>
                  <dd className="mt-1 text-xs text-muted-foreground md:text-sm">{stat.label}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div
            className={cn(
              "home-reveal home-reveal-delay-2 relative mx-auto w-full",
              isLandscapePreview
                ? "max-w-3xl sm:max-w-4xl lg:max-w-none lg:justify-self-stretch"
                : "max-w-md lg:max-w-none",
            )}
          >
            <img
              src={previewImage}
              alt={t("home.appPreviewAlt")}
              className={cn(
                "mx-auto h-auto w-full",
                isLandscapePreview
                  ? "w-full max-w-none"
                  : "home-float",
              )}
              loading="eager"
              fetchPriority="high"
              width={previewWidth}
              height={previewHeight}
              decoding="async"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
