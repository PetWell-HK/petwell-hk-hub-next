import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { NAMETAG_TESTIMONIAL_IMAGES, splitTestimonialRows } from "@/data/nametagTestimonials";

type NametagTestimonialMarqueeProps = {
  variant?: "section" | "hero";
};

function TestimonialStrip({ images, idPrefix }: { images: string[]; idPrefix: string }) {
  return (
    <>
      {images.map((src, index) => (
        <div key={`${idPrefix}-${index}`} className="nametag-testimonial-marquee__card">
          <img src={src} alt="" loading="lazy" decoding="async" draggable={false} />
        </div>
      ))}
    </>
  );
}

function TestimonialRow({
  images,
  idPrefix,
  reverse = false,
}: {
  images: string[];
  idPrefix: string;
  reverse?: boolean;
}) {
  if (images.length === 0) return null;

  return (
    <div className="nametag-testimonial-marquee__row">
      <div
        className={
          reverse
            ? "nametag-testimonial-marquee__track nametag-testimonial-marquee__track--reverse"
            : "nametag-testimonial-marquee__track"
        }
        aria-hidden="true"
      >
        <div className="nametag-testimonial-marquee__strip">
          <TestimonialStrip images={images} idPrefix={`${idPrefix}-a`} />
        </div>
        <div className="nametag-testimonial-marquee__strip">
          <TestimonialStrip images={images} idPrefix={`${idPrefix}-b`} />
        </div>
      </div>
    </div>
  );
}

const NametagTestimonialMarquee = ({ variant = "section" }: NametagTestimonialMarqueeProps) => {
  const { t } = useTranslation();
  const [rowOne, rowTwo] = splitTestimonialRows(NAMETAG_TESTIMONIAL_IMAGES);
  const isHero = variant === "hero";

  if (NAMETAG_TESTIMONIAL_IMAGES.length === 0) return null;

  const marquee = (
    <div
      className={cn("nametag-testimonial-marquee", isHero && "nametag-testimonial-marquee--hero")}
      aria-label={t("nametagPage.socialProof.ariaLabel")}
    >
      <TestimonialRow images={rowOne} idPrefix="row1" />
      <TestimonialRow images={rowTwo} idPrefix="row2" reverse />
    </div>
  );

  if (isHero) {
    return marquee;
  }

  return (
    <section className="nametag-social-proof" aria-labelledby="nametag-social-proof-heading">
      <div className="container mx-auto max-w-5xl px-4 md:px-6">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">{t("nametagPage.socialProof.eyebrow")}</p>
          <h2 id="nametag-social-proof-heading" className="mt-2 text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            {t("nametagPage.socialProof.title")}
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
            {t("nametagPage.socialProof.subtitle")}
          </p>
        </div>
      </div>

      <div className="mt-8 md:mt-10">{marquee}</div>
    </section>
  );
};

export default NametagTestimonialMarquee;
