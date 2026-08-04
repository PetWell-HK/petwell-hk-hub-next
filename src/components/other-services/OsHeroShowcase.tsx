import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  HERO_SHOWCASE_ITEMS,
  type HeroShowcaseServiceId,
} from "@/data/otherServicesConfig";
import { cn } from "@/lib/utils";

type PointerOffset = { x: number; y: number };

const CARD_LAYOUT = [
  "os-hero-showcase__card--0",
  "os-hero-showcase__card--1",
  "os-hero-showcase__card--2",
  "os-hero-showcase__card--3",
] as const;

function getCardTransform(
  index: number,
  pointer: PointerOffset,
  factor: number,
  isActive: boolean,
  isHoveredGroup: boolean,
): string {
  const baseRotations = [-8, 5, -4, 7];
  const spreadX = isHoveredGroup && !isActive ? (index % 2 === 0 ? -6 : 6) : 0;
  const spreadY = isHoveredGroup && !isActive ? (index < 2 ? -4 : 4) : 0;
  const lift = isActive ? -10 : 0;
  const scale = isActive ? 1.06 : 1;
  const px = pointer.x * factor * 28 + spreadX;
  const py = pointer.y * factor * 22 + spreadY + lift;

  return `translate3d(${px}px, ${py}px, 0) rotate(${baseRotations[index]}deg) scale(${scale})`;
}

const OsHeroShowcase = () => {
  const { t } = useTranslation();
  const [pointer, setPointer] = useState<PointerOffset>({ x: 0, y: 0 });
  const [activeId, setActiveId] = useState<HeroShowcaseServiceId | null>(null);
  const [motionEnabled, setMotionEnabled] = useState(true);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setMotionEnabled(!media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  const onPointerMove = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (!motionEnabled) return;
    const rect = event.currentTarget.getBoundingClientRect();
    setPointer({
      x: (event.clientX - rect.left) / rect.width - 0.5,
      y: (event.clientY - rect.top) / rect.height - 0.5,
    });
  }, [motionEnabled]);

  const onPointerLeave = useCallback(() => {
    setPointer({ x: 0, y: 0 });
    setActiveId(null);
  }, []);

  return (
    <div
      className="os-hero-showcase"
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      aria-label={t("otherServices.hero.kolVisualLabel")}
    >
      {HERO_SHOWCASE_ITEMS.map((item, index) => {
        const isActive = activeId === item.id;
        const isHoveredGroup = activeId !== null;

        return (
          <button
            key={item.id}
            type="button"
            className={cn(
              "os-hero-showcase__card",
              CARD_LAYOUT[index],
              isActive && "os-hero-showcase__card--active",
            )}
            style={{
              transform: motionEnabled
                ? getCardTransform(index, pointer, item.parallaxFactor, isActive, isHoveredGroup)
                : undefined,
            }}
            onPointerEnter={() => setActiveId(item.id)}
            onFocus={() => setActiveId(item.id)}
            onBlur={() => setActiveId(null)}
            aria-label={t(`otherServices.channels.${item.id}.title`)}
          >
            <img
              src={item.image}
              alt=""
              loading="eager"
              decoding="async"
              draggable={false}
              style={{ objectPosition: item.objectPosition }}
            />
            <span className="os-hero-showcase__overlay" aria-hidden={!isActive}>
              <span className="os-hero-showcase__overlay-title">
                {t(`otherServices.channels.${item.id}.title`)}
              </span>
              <span className="os-hero-showcase__overlay-kpi">
                <strong>{t(`otherServices.channels.${item.id}.kpis.a.value`)}</strong>
                {" · "}
                {t(`otherServices.channels.${item.id}.kpis.a.label`)}
              </span>
              <span className="os-hero-showcase__overlay-desc">
                {t(`otherServices.channels.${item.id}.summary`)}
              </span>
            </span>
          </button>
        );
      })}

    </div>
  );
};

export default OsHeroShowcase;
