import type { FestivalDiscountCode, FestivalItemId } from "@/lib/midAutumnFestivalPricing";

export const MID_AUTUMN_REGISTRATION_PATH = "/mid-autumn-taiwan-festival";
export const MID_AUTUMN_PAYMENT_PATH = "/mid-autumn-taiwan-festival/pay";
export const MID_AUTUMN_CONFIRMED_PATH = "/mid-autumn-taiwan-festival/confirmed";

/**
 * Public RSVP registration gate.
 * Append `?comingSoon=1` to preview the coming-soon dialog (e.g. for QA).
 */
export function isMidAutumnRegistrationOpen(): boolean {
  if (typeof window !== "undefined") {
    return new URLSearchParams(window.location.search).get("comingSoon") !== "1";
  }
  return true;
}

export const PAYMENT_HOLD_MS = 24 * 60 * 60 * 1000;

export const EVENT_DAYS = [
  { id: "fri", date: "2026-09-25", weekday: "五", dateLabel: "9月25日", hours: "16:00–20:00", label: "9月25日（五）" },
  { id: "sat", date: "2026-09-26", weekday: "六", dateLabel: "9月26日", hours: "15:00–21:00", label: "9月26日（六）" },
  { id: "sun", date: "2026-09-27", weekday: "日", dateLabel: "9月27日", hours: "15:00–21:00", label: "9月27日（日）" },
] as const;

export type EventDayId = (typeof EVENT_DAYS)[number]["id"];

export const PET_COUNTS = [
  { id: "1", label: "攜帶 1 隻寵物" },
  { id: "2", label: "攜帶 2 隻寵物" },
  { id: "3plus", label: "攜帶 3 隻或以上寵物" },
  { id: "none", label: "不攜帶寵物" },
] as const;

export type PetCountId = (typeof PET_COUNTS)[number]["id"];

export const PET_TYPES = [
  { id: "small-dog", label: "小型犬（例如：貴婦犬、松鼠犬、芝娃娃）" },
  { id: "medium-dog", label: "中型犬（例如：柴犬、柯基犬、法國鬥牛犬）" },
  { id: "large-dog", label: "大型犬（例如：金毛尋回犬、哈士奇、唐狗）" },
  { id: "cat", label: "貓咪" },
  { id: "other", label: "其他寵物" },
] as const;

export type PetTypeId = (typeof PET_TYPES)[number]["id"];

export const HEAR_ABOUT = [
  { id: "petwell-social", label: "PetWell Facebook / Instagram / Threads" },
  { id: "aquabeat-social", label: "AquaBeat Facebook / Instagram / Threads" },
  { id: "kol", label: "KOL / 網紅推介" },
  { id: "friend", label: "朋友或家人介紹" },
  { id: "google", label: "Google 搜尋" },
  { id: "other-social", label: "其他社交媒體" },
] as const;

export type HearAboutId = (typeof HEAR_ABOUT)[number]["id"];

export interface WorkshopSlot {
  id: string;
  dayId: EventDayId;
  start: string;
  label: string;
}

function padTime(hours: number, minutes: number): string {
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function addMinutes(start: string, minutes: number): string {
  const [h, m] = start.split(":").map(Number);
  const total = h * 60 + m + minutes;
  return padTime(Math.floor(total / 60), total % 60);
}

function slotsFor(
  itemId: FestivalItemId,
  dayId: EventDayId,
  starts: string[],
  durationMin: number,
): WorkshopSlot[] {
  const day = EVENT_DAYS.find((d) => d.id === dayId);
  return starts.map((start) => {
    const end = addMinutes(start, durationMin);
    return {
      id: `${itemId}|${dayId}|${start}`,
      dayId,
      start,
      label: `${day?.label ?? dayId} ${start}–${end}`,
    };
  });
}

const MOONCAKE_STARTS: Record<EventDayId, string[]> = {
  fri: ["16:00", "18:00"],
  sat: ["15:00", "16:30", "18:00", "19:30"],
  sun: ["15:00", "16:30", "18:00", "19:30"],
};

const SCARF_STARTS: Record<EventDayId, string[]> = {
  fri: ["16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30"],
  sat: ["15:00", "16:00", "17:00", "18:00", "19:00", "20:00"],
  sun: ["15:00", "16:00", "17:00", "18:00", "19:00", "20:00"],
};

const MAGNET_STARTS: Record<EventDayId, string[]> = {
  fri: ["16:30", "17:00", "17:30", "18:30", "19:00", "19:30"],
  sat: ["15:30", "16:30", "17:30", "18:30", "19:30", "20:30"],
  sun: ["15:30", "16:30", "17:30", "18:30", "19:30", "20:30"],
};

function allSlots(
  itemId: FestivalItemId,
  starts: Record<EventDayId, string[]>,
  durationMin: number,
): WorkshopSlot[] {
  return EVENT_DAYS.flatMap((day) => slotsFor(itemId, day.id, starts[day.id], durationMin));
}

export const WORKSHOP_SLOTS: Record<"mooncake" | "scarf" | "magnet", WorkshopSlot[]> = {
  mooncake: allSlots("mooncake", MOONCAKE_STARTS, 90),
  scarf: allSlots("scarf", SCARF_STARTS, 30),
  magnet: allSlots("magnet", MAGNET_STARTS, 30),
};

export type WorkshopId = "mooncake" | "scarf" | "magnet";

export function slotsForDays(itemId: WorkshopId, dayIds: EventDayId[]): WorkshopSlot[] {
  if (dayIds.length === 0) return [];
  return WORKSHOP_SLOTS[itemId].filter((slot) => dayIds.includes(slot.dayId));
}

export function parseWorkshopSlotId(
  id: string,
): { itemId: WorkshopId; dayId: EventDayId; start: string } | null {
  const [itemId, dayId, start] = id.split("|");
  if (!itemId || !dayId || !start) return null;
  if (itemId !== "mooncake" && itemId !== "scarf" && itemId !== "magnet") return null;
  if (dayId !== "fri" && dayId !== "sat" && dayId !== "sun") return null;
  return { itemId, dayId, start };
}

function timeToMinutes(start: string): number {
  const [hours, minutes] = start.split(":").map(Number);
  return hours * 60 + minutes;
}

export function workshopSlotsOverlap(
  slots: Partial<Record<WorkshopId, string>>,
): boolean {
  const ranges = (Object.values(slots).filter(Boolean) as string[])
    .map(parseWorkshopSlotId)
    .filter((slot): slot is NonNullable<typeof slot> => Boolean(slot))
    .map((slot) => {
      const duration = slot.itemId === "mooncake" ? 90 : 30;
      const start = timeToMinutes(slot.start);
      return { dayId: slot.dayId, start, end: start + duration };
    });

  for (let i = 0; i < ranges.length; i += 1) {
    for (let j = i + 1; j < ranges.length; j += 1) {
      const a = ranges[i];
      const b = ranges[j];
      if (a.dayId === b.dayId && a.start < b.end && b.start < a.end) return true;
    }
  }
  return false;
}

export const PAYMENT_DETAILS = {
  accountName: "PetWell HK Limited",
  bankCode: "016",
  branchCode: "478",
  bankName: "DBS Bank (Hong Kong) Limited",
  accountNumber: "7950149375",
  paymeUrl: "https://payme.hsbc/petwell",
  whatsapp: "85262722164",
  whatsappDisplay: "6272 2164",
};

export const GOGOX_VOUCHER = {
  code: "GOPETWELL",
  rewardTrips: 2,
  rewardAmount: 20,
  expiresAt: "2026-12-31T23:59:00+08:00",
  expiryLabelZh: "2026年12月31日 23:59",
  expiryLabelEn: "31 December 2026, 23:59",
} as const;

/**
 * Promo codes are NOT stored in the web bundle.
 * Authoritative list lives in manageMidAutumnBooking Lambda.
 * Use `lookupMidAutumnDiscountCode` (GraphQL) to validate + apply.
 */
export type MidAutumnDiscountLookup = {
  valid: boolean;
  code?: string | null;
  kind?: string | null;
  value?: number | null;
  label?: string | null;
};

/** Map a successful backend lookup into a pricing discount object. */
export function discountFromLookup(
  lookup: MidAutumnDiscountLookup | null | undefined,
): FestivalDiscountCode | null {
  if (!lookup?.valid || !lookup.code || lookup.kind !== "percent" || !lookup.value) {
    return null;
  }
  return {
    code: lookup.code,
    kind: "percent",
    value: lookup.value,
    label: lookup.label?.trim() || "推廣碼九折",
  };
}

export const WRISTBAND_PERKS = [
  "免費全家福電子相片一張",
  "嫦娥服免費租借",
];
