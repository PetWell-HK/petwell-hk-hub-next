const festivalBanner = "/assets/blog-mid-autumn-pet-hk/festival-rsvp-banner.jpg";

export function FestivalRsvpHero() {
  return (
    <figure className="overflow-hidden rounded-2xl border border-border">
      <img
        src={festivalBanner}
        alt="毛孩沉浸式台灣中秋祭：2026年9月25至27日，觀塘海濱 AquaBeat，免費入場歡迎帶毛孩"
        className="block h-auto w-full"
        width={1024}
        height={576}
        fetchPriority="high"
      />
    </figure>
  );
}
