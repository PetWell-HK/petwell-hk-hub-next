import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { GALLERY_IMAGES } from "@/data/otherServicesConfig";
import { buildMosaicColumns, type MosaicColumn, type MosaicWidth } from "@/lib/mosaicGallery";
import { ScrollReveal } from "@/components/other-services/ScrollReveal";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function MosaicCell({
  src,
  index,
  variant,
  onOpen,
  label,
}: {
  src: string;
  index: number;
  variant: "single" | "top" | "bottom";
  onOpen: (index: number) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      className={cn("os-mosaic-cell", `os-mosaic-cell--${variant}`)}
      onClick={() => onOpen(index)}
      aria-label={label}
    >
      <img src={src} alt="" loading="lazy" decoding="async" draggable={false} />
    </button>
  );
}

function MosaicColumnBlock({
  column,
  idPrefix,
  colIndex,
  onOpen,
  t,
}: {
  column: MosaicColumn;
  idPrefix: string;
  colIndex: number;
  onOpen: (index: number) => void;
  t: (key: string, opts?: Record<string, unknown>) => string;
}) {
  const widthClass = `os-mosaic-col--${column.width}` as `os-mosaic-col--${MosaicWidth}`;

  return (
    <div className={cn("os-mosaic-col", widthClass)} data-col={`${idPrefix}-${colIndex}`}>
      {column.layout === "single" ? (
        <MosaicCell
          src={column.image.src}
          index={column.image.index}
          variant="single"
          onOpen={onOpen}
          label={t("otherServices.gallery.openImage", { index: column.image.index + 1 })}
        />
      ) : (
        <>
          <MosaicCell
            src={column.top.src}
            index={column.top.index}
            variant="top"
            onOpen={onOpen}
            label={t("otherServices.gallery.openImage", { index: column.top.index + 1 })}
          />
          <MosaicCell
            src={column.bottom.src}
            index={column.bottom.index}
            variant="bottom"
            onOpen={onOpen}
            label={t("otherServices.gallery.openImage", { index: column.bottom.index + 1 })}
          />
        </>
      )}
    </div>
  );
}

function MosaicTrack({
  columns,
  idPrefix,
  onOpen,
  t,
}: {
  columns: MosaicColumn[];
  idPrefix: string;
  onOpen: (index: number) => void;
  t: (key: string, opts?: Record<string, unknown>) => string;
}) {
  return (
    <div className="flex shrink-0 gap-3 pr-3 md:gap-4 md:pr-4">
      {columns.map((column, colIndex) => (
        <MosaicColumnBlock
          key={`${idPrefix}-${colIndex}-${column.layout === "single" ? column.image.src : `${column.top.src}-${column.bottom.src}`}`}
          column={column}
          idPrefix={idPrefix}
          colIndex={colIndex}
          onOpen={onOpen}
          t={t}
        />
      ))}
    </div>
  );
}

const CaseStudyGallery = () => {
  const { t } = useTranslation();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const imageCount = GALLERY_IMAGES.length;
  const columns = useMemo(() => buildMosaicColumns(GALLERY_IMAGES), []);

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);

  const showPrev = useCallback(() => {
    setLightboxIndex((current) => {
      if (current === null) return null;
      return (current - 1 + imageCount) % imageCount;
    });
  }, [imageCount]);

  const showNext = useCallback(() => {
    setLightboxIndex((current) => {
      if (current === null) return null;
      return (current + 1) % imageCount;
    });
  }, [imageCount]);

  useEffect(() => {
    if (lightboxIndex === null) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") showPrev();
      if (event.key === "ArrowRight") showNext();
      if (event.key === "Escape") closeLightbox();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [lightboxIndex, showNext, showPrev]);

  return (
    <section className="os-section os-section--gallery" aria-labelledby="os-work-heading">
      <div className="container mx-auto px-6 md:px-10 lg:px-12">
        <ScrollReveal className="os-section-header max-w-xl">
            <p className="os-eyebrow">{t("otherServices.gallery.eyebrow")}</p>
            <h2 id="os-work-heading" className="os-section-heading mt-2">
              {t("otherServices.gallery.title")}
            </h2>
            <p className="os-section-lead mt-2">{t("otherServices.gallery.subtitle")}</p>
          </ScrollReveal>
      </div>

      <div className="os-mosaic-marquee mt-12 md:mt-14">
        <div className="os-mosaic-marquee__track" aria-hidden="true">
          <MosaicTrack columns={columns} idPrefix="a" onOpen={openLightbox} t={t} />
          <MosaicTrack columns={columns} idPrefix="b" onOpen={openLightbox} t={t} />
        </div>
      </div>

      <Dialog open={lightboxIndex !== null} onOpenChange={(open) => !open && closeLightbox()}>
        <DialogContent className="max-w-[min(92vw,52rem)] border-none bg-black/95 p-2 sm:p-4">
          <DialogTitle className="sr-only">
            {t("otherServices.gallery.lightboxTitle", {
              current: (lightboxIndex ?? 0) + 1,
              total: imageCount,
            })}
          </DialogTitle>
          {lightboxIndex !== null ? (
            <div className="relative flex items-center justify-center">
              <img
                src={GALLERY_IMAGES[lightboxIndex]}
                alt=""
                className="max-h-[78vh] w-full rounded-lg object-contain"
              />
              <Button
                type="button"
                variant="secondary"
                size="icon"
                className="absolute left-1 top-1/2 -translate-y-1/2 sm:left-2"
                onClick={showPrev}
                aria-label={t("otherServices.gallery.prev")}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 sm:right-2"
                onClick={showNext}
                aria-label={t("otherServices.gallery.next")}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
              <p className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-xs text-white">
                {lightboxIndex + 1} / {imageCount}
              </p>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default CaseStudyGallery;
