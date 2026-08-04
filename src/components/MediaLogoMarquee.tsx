import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
const hktdcLogo = "/assets/media-logos/hktdc.png";
const rthkLogo = "/assets/media-logos/rthk.png";
const viutvLogo = "/assets/media-logos/viutv.png";
const singTaoLogo = "/assets/media-logos/sing-tao.png";
const startupExpressLogo = "/assets/media-logos/startup-express.png";
const unwireLogo = "/assets/media-logos/unwire.png";
const yahooLogo = "/assets/media-logos/yahoo.png";
const am730Logo = "/assets/media-logos/am730.png";
const aquabeatLogo = "/assets/media-logos/aquabeat.png";
const hkustEntrepreneurshipLogo = "/assets/media-logos/hkust-entrepreneurship.png";
const ydcLogo = "/assets/media-logos/ydc.png";
const hyabLogo = "/assets/media-logos/hyab.png";
const govYouthProgrammeLogo = "/assets/media-logos/gov-youth-programme.png";
const weVentureLogo = "/assets/media-logos/we-venture.png";

const MEDIA_LOGOS = [
  { src: viutvLogo, alt: "ViuTV" },
  { src: yahooLogo, alt: "Yahoo" },
  { src: am730Logo, alt: "am730" },
  { src: rthkLogo, alt: "RTHK é¦™æ¸¯é›»å°" },
  { src: singTaoLogo, alt: "æ˜Ÿå³¶æ—¥å ± Sing Tao Daily" },
  { src: hktdcLogo, alt: "HKTDC é¦™æ¸¯è²¿ç™¼å±€" },
  { src: startupExpressLogo, alt: "Start-up Express å‰µæ¥­å¿«ç¶«" },
  { src: unwireLogo, alt: "unwire.hk" },
  { src: aquabeatLogo, alt: "AQUABEAT è§€å¡˜æµ·æ¿±æ´»å‹•ç©ºé–“" },
  { src: hkustEntrepreneurshipLogo, alt: "HKUST Entrepreneurship Center é¦™æ¸¯ç§‘æŠ€å¤§å­¸å‰µæ¥­ä¸­å¿ƒ", wide: true },
  { src: ydcLogo, alt: "é’å¹´ç™¼å±•å§”å“¡æœƒ Youth Development Commission", wide: true },
  { src: hyabLogo, alt: "æ°‘æ”¿åŠé’å¹´äº‹å‹™å±€ Home and Youth Affairs Bureau", wide: true },
  { src: govYouthProgrammeLogo, alt: "æ”¿åºœé’å¹´è¨ˆåŠƒ Government Youth Programme" },
  { src: weVentureLogo, alt: "We Venture é’å‰µåŒè¡Œ", wide: true },
] as const;

const FEATURED_ALTS = new Set(["ViuTV", "Yahoo", "am730", "RTHK é¦™æ¸¯é›»å°", "æ˜Ÿå³¶æ—¥å ± Sing Tao Daily"]);

type MediaLogoMarqueeProps = {
  variant?: "default" | "grayscaleHover";
  embedded?: boolean;
  featured?: boolean;
};

function LogoStrip({
  idPrefix,
  grayscaleHover,
  logos,
}: {
  idPrefix: string;
  grayscaleHover: boolean;
  logos: ReadonlyArray<(typeof MEDIA_LOGOS)[number]>;
}) {
  return (
    <>
      {logos.map((logo) => (
        <div
          key={`${idPrefix}-${logo.alt}`}
          className={cn(
            "media-logo-marquee__item flex h-11 shrink-0 items-center justify-center px-3 md:h-12 md:px-4",
            "wide" in logo && logo.wide ? "w-[150px] md:w-[180px]" : "w-[108px] md:w-[128px]",
            grayscaleHover && "media-logo-marquee__item--grayscale",
          )}
        >
          <img
            src={logo.src}
            alt={logo.alt}
            className="max-h-7 w-full object-contain object-center transition-[filter,opacity,transform] duration-300 md:max-h-8"
            loading="lazy"
            decoding="async"
            draggable={false}
          />
        </div>
      ))}
    </>
  );
}

const MediaLogoMarquee = ({ variant = "default", embedded = false, featured = false }: MediaLogoMarqueeProps) => {
  const { t } = useTranslation();
  const grayscaleHover = variant === "grayscaleHover";
  const logos = featured
    ? [...MEDIA_LOGOS.filter((l) => FEATURED_ALTS.has(l.alt)), ...MEDIA_LOGOS.filter((l) => !FEATURED_ALTS.has(l.alt))]
    : MEDIA_LOGOS;

  const track = (
    <div className="media-logo-marquee">
      <div className="media-logo-marquee__track" aria-hidden="true">
        <div className="flex items-center gap-5 pr-5 md:gap-7 md:pr-7">
          <LogoStrip idPrefix="a" grayscaleHover={grayscaleHover} logos={logos} />
        </div>
        <div className="flex items-center gap-5 pr-5 md:gap-7 md:pr-7">
          <LogoStrip idPrefix="b" grayscaleHover={grayscaleHover} logos={logos} />
        </div>
      </div>
    </div>
  );

  if (embedded) {
    return (
      <div aria-label={t("about.media.ariaLabel")} className="pb-1">
        {track}
      </div>
    );
  }

  return (
    <section className="border-b border-border bg-muted/20 py-10 md:py-12" aria-label={t("about.media.ariaLabel")}>
      {track}
    </section>
  );
};

export default MediaLogoMarquee;
