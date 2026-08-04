import { useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
const elaineAvatar = "/assets/testimonial-elaine.jpg";
const matthewAvatar = "/assets/testimonial-matthew.jpg";
const minnieAvatar = "/assets/testimonial-minnie.jpg";
import { useTranslation } from "react-i18next";

const TESTIMONIAL_KEYS = ["minnie", "elaine", "matthew"] as const;

const TESTIMONIAL_AVATARS = {
  minnie: { avatar: minnieAvatar, initials: "ML" },
  elaine: { avatar: elaineAvatar, initials: "EY" },
  matthew: { avatar: matthewAvatar, initials: "MC" },
} as const;

const Testimonials = () => {
  const { t } = useTranslation();

  const testimonials = useMemo(
    () =>
      TESTIMONIAL_KEYS.map((key) => ({
        key,
        text: t(`home.testimonials.${key}.text`),
        author: t(`home.testimonials.${key}.author`),
        ...TESTIMONIAL_AVATARS[key],
      })),
    [t],
  );

  return (
    <section className="border-t border-border py-20 md:py-28">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <p className="home-section-label">{t("home.testimonials.eyebrow")}</p>
          <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
            {t("home.testimonials.title")}
          </h2>
        </div>

        <div className="mx-auto mt-14 grid max-w-6xl gap-4 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <article
              key={testimonial.key}
              className="home-card flex h-full flex-col p-6 md:p-8"
            >
              <p className="flex-1 text-sm leading-relaxed text-foreground md:text-base">
                &ldquo;{testimonial.text}&rdquo;
              </p>
              <div className="mt-8 flex items-center gap-3 border-t border-border pt-6">
                <Avatar className="h-10 w-10 border border-border">
                  <AvatarImage src={testimonial.avatar} alt={testimonial.author} />
                  <AvatarFallback>{testimonial.initials}</AvatarFallback>
                </Avatar>
                <p className="text-sm font-semibold text-foreground">{testimonial.author}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
