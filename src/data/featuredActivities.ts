export const MID_AUTUMN_EVENT_ID = "petwell-mid-autumn-2026";
export const MID_AUTUMN_EVENT_HREF = "/mid-autumn-pet-outings-hong-kong-2026";
export const MID_AUTUMN_EVENT_NAME = "毛孩沉浸台式中秋節";

export const MID_AUTUMN_FEATURED_ACTIVITY = {
  id: MID_AUTUMN_EVENT_ID,
  name: MID_AUTUMN_EVENT_NAME,
  description:
    "2026年9月25–27日於觀塘海濱 AquaBeat：台式夜市、許願天燈、台灣打卡景、寵物月餅與新中式服裝租借。免費入場，歡迎帶毛孩。",
  dateTime: "2026-09-25T08:00:00.000Z",
  deadline: "2026-09-27T13:00:00.000Z",
  location: "觀塘海濱 AquaBeat 活動空間 02",
  district: "觀塘",
  imageUrl: "https://events.petwellhk.com/images/art/hero-autumn.jpg",
  organizerName: "PetWell × AquaBeat",
  category: "MARKET" as const,
  price: 0,
  href: MID_AUTUMN_EVENT_HREF,
  photos: ["https://events.petwellhk.com/images/art/hero-autumn.jpg"],
  createdAt: "2026-08-01T00:00:00.000Z",
  updatedAt: "2026-08-23T00:00:00.000Z",
};

export function isFeaturedActivity(event: { id?: string | null; name?: string | null }): boolean {
  if (event.id === MID_AUTUMN_EVENT_ID) return true;
  return Boolean(event.name && event.name.includes("毛孩沉浸台式中秋"));
}

interface FeaturedActivityLike {
  id?: string | null;
  name?: string | null;
  href?: string | null;
}

export function mergeFeaturedActivityFirst<T extends FeaturedActivityLike>(
  events: T[],
  featured: T,
): T[] {
  const existing = events.find((event) => isFeaturedActivity(event));
  const rest = events.filter((event) => !isFeaturedActivity(event));
  return [existing ? { ...featured, ...existing, href: (featured as FeaturedActivityLike).href } : featured, ...rest];
}
