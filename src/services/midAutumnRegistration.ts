import { graphqlQuery } from "@/services/graphqlClient";
import {
  EVENT_DAYS,
  HEAR_ABOUT,
  PET_COUNTS,
  PET_TYPES,
  discountFromLookup,
  type EventDayId,
  type HearAboutId,
  type MidAutumnDiscountLookup,
  type PetCountId,
  type PetTypeId,
  type WorkshopId,
} from "@/data/midAutumnFestival2026";
import {
  FESTIVAL_ITEMS,
  formatHkd,
  quoteFestivalItems,
  type FestivalDiscountCode,
  type FestivalItemId,
  type PriceQuote,
} from "@/lib/midAutumnFestivalPricing";

const PAYMENT_UPLOAD_URL =
  "https://t6j45xifhcl2xzh4cohf4juowy0xezuv.lambda-url.ap-southeast-1.on.aws/";
const STORAGE_PREFIX = "petwell.midAutumn2026.booking.";
const LAST_ID_KEY = "petwell.midAutumn2026.lastBookingId";

export type BookingStatus = "pending_payment" | "paid" | "registered" | "expired";

export interface MidAutumnBooking {
  id: string;
  createdAt: string;
  payBy: string;
  status: BookingStatus;
  email: string;
  name: string;
  phone: string;
  attendDays: EventDayId[];
  petCount: PetCountId;
  petTypes: PetTypeId[];
  petNames: string;
  itemIds: FestivalItemId[];
  workshopSlots: Partial<Record<WorkshopId, string>>;
  discountCode: string;
  quote: PriceQuote;
  hearAbout: HearAboutId[];
  marketingOptIn: boolean;
  paymentReference?: string;
  receiptUrl?: string;
  paidAt?: string;
  remark?: string;
}

export interface CreateBookingInput {
  email: string;
  name: string;
  phone: string;
  attendDays: EventDayId[];
  petCount: PetCountId;
  petTypes: PetTypeId[];
  petNames: string;
  itemIds: FestivalItemId[];
  workshopSlots: Partial<Record<WorkshopId, string>>;
  discount: FestivalDiscountCode | null;
  hearAbout: HearAboutId[];
  marketingOptIn: boolean;
}

const BOOKING_SELECTION = `
  id
  status
  name
  email
  phone
  attendDays
  petCount
  itemIds
  workshopSlots
  quoteTotal
  quoteOriginal
  quoteJson
  payBy
  marketingOptIn
  receiptUrl
  paymentReference
  paidAt
  remark
  hearAbout
  discountCode
  createdAt
  updatedAt
`;

const SUBMIT_BOOKING = `
  mutation SubmitMidAutumnBooking($input: SubmitMidAutumnBookingInput!) {
    submitMidAutumnBooking(input: $input) {
      ${BOOKING_SELECTION}
    }
  }
`;

const GET_BOOKING = `
  query GetMidAutumnBookingById($id: ID!) {
    getMidAutumnBookingById(id: $id) {
      ${BOOKING_SELECTION}
    }
  }
`;

const ATTACH_PROOF = `
  mutation AttachMidAutumnPaymentProof($id: ID!, $receiptUrl: String!, $paymentReference: String!) {
    attachMidAutumnPaymentProof(id: $id, receiptUrl: $receiptUrl, paymentReference: $paymentReference) {
      ${BOOKING_SELECTION}
    }
  }
`;

const VALIDATE_DISCOUNT = `
  query ValidateMidAutumnDiscountCode($code: String!) {
    validateMidAutumnDiscountCode(code: $code) {
      valid
      code
      kind
      value
      label
    }
  }
`;

/** Validate a promo code via Lambda (codes are not in the web bundle). */
export async function lookupMidAutumnDiscountCode(
  raw: string,
): Promise<FestivalDiscountCode | null> {
  const code = raw.trim();
  if (!code) return null;

  const result = await graphqlQuery<{
    validateMidAutumnDiscountCode: MidAutumnDiscountLookup | null;
  }>(VALIDATE_DISCOUNT, { code }, { authMode: "apiKey" });

  return discountFromLookup(result.validateMidAutumnDiscountCode);
}

const APPLY_DISCOUNT = `
  mutation ApplyMidAutumnBookingDiscount($id: ID!, $code: String!) {
    applyMidAutumnBookingDiscount(id: $id, code: $code) {
      ${BOOKING_SELECTION}
    }
  }
`;

/** Apply a promo on a pending payment booking and persist the new total. */
export async function applyBookingDiscount(
  bookingId: string,
  rawCode: string,
): Promise<MidAutumnBooking> {
  const code = rawCode.trim();
  if (!bookingId || !code) {
    throw new Error("Missing booking or discount code");
  }

  const result = await graphqlQuery<{ applyMidAutumnBookingDiscount: ApiBooking }>(
    APPLY_DISCOUNT,
    { id: bookingId, code },
    { authMode: "apiKey" },
  );

  const row = result.applyMidAutumnBookingDiscount;
  if (!row) {
    throw new Error("Discount was not applied");
  }
  const booking = mapApiBooking(row);
  saveBooking(booking);
  return booking;
}

type ApiBooking = {
  id: string;
  status: string;
  name: string;
  email: string;
  phone: string;
  attendDays?: string | null;
  petCount?: string | null;
  itemIds?: string | null;
  workshopSlots?: string | null;
  quoteTotal?: number | null;
  quoteOriginal?: number | null;
  quoteJson?: string | null;
  payBy?: string | null;
  marketingOptIn?: boolean | null;
  receiptUrl?: string | null;
  paymentReference?: string | null;
  paidAt?: string | null;
  remark?: string | null;
  hearAbout?: string | null;
  discountCode?: string | null;
  createdAt?: string | null;
};

function storageKey(id: string): string {
  return `${STORAGE_PREFIX}${id}`;
}

function parseJson<T>(raw: string | null | undefined, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function mapStatus(status: string): BookingStatus {
  switch (status) {
    case "REGISTERED":
      return "registered";
    case "PENDING_PAYMENT":
      return "pending_payment";
    case "PAID":
      return "paid";
    case "EXPIRED":
      return "expired";
    case "registered":
    case "pending_payment":
    case "paid":
    case "expired":
      return status;
    default:
      return "pending_payment";
  }
}

function mapApiBooking(row: ApiBooking): MidAutumnBooking {
  const itemIds = parseJson<FestivalItemId[]>(row.itemIds, []);
  const quote = parseJson<PriceQuote | null>(row.quoteJson, null) ?? {
    itemIds,
    lines: [],
    originalTotal: row.quoteOriginal ?? row.quoteTotal ?? 0,
    subtotal: row.quoteTotal ?? 0,
    discountAmount: 0,
    total: row.quoteTotal ?? 0,
  };

  return {
    id: row.id,
    createdAt: row.createdAt ?? new Date().toISOString(),
    payBy: row.payBy ?? "",
    status: mapStatus(row.status),
    email: row.email,
    name: row.name,
    phone: row.phone,
    attendDays: parseJson<EventDayId[]>(row.attendDays, []),
    petCount: (row.petCount as PetCountId) || "none",
    petTypes: [],
    petNames: "",
    itemIds,
    workshopSlots: parseJson<Partial<Record<WorkshopId, string>>>(row.workshopSlots, {}),
    discountCode: row.discountCode ?? "",
    quote,
    hearAbout: parseJson<HearAboutId[]>(row.hearAbout, []),
    marketingOptIn: Boolean(row.marketingOptIn),
    paymentReference: row.paymentReference ?? undefined,
    receiptUrl: row.receiptUrl ?? undefined,
    paidAt: row.paidAt ?? undefined,
    remark: row.remark ?? undefined,
  };
}

export function saveBooking(booking: MidAutumnBooking): void {
  try {
    localStorage.setItem(storageKey(booking.id), JSON.stringify(booking));
    localStorage.setItem(LAST_ID_KEY, booking.id);
  } catch {
    // Cache is optional; GraphQL is the source of truth.
  }
}

export function loadCachedBooking(id: string): MidAutumnBooking | null {
  try {
    const raw = localStorage.getItem(storageKey(id));
    if (!raw) return null;
    return JSON.parse(raw) as MidAutumnBooking;
  } catch {
    return null;
  }
}

/** @deprecated Use fetchBooking. Kept so existing callers compile during the switch. */
export function loadBooking(id: string): MidAutumnBooking | null {
  return loadCachedBooking(id);
}

export function loadLastBookingId(): string | null {
  try {
    return localStorage.getItem(LAST_ID_KEY);
  } catch {
    return null;
  }
}

export async function fetchBooking(id: string): Promise<MidAutumnBooking | null> {
  const result = await graphqlQuery<{ getMidAutumnBookingById: ApiBooking | null }>(
    GET_BOOKING,
    { id },
    { authMode: "apiKey" },
  );
  const row = result.getMidAutumnBookingById;
  if (!row) return loadCachedBooking(id);
  const booking = mapApiBooking(row);
  saveBooking(booking);
  return booking;
}

function dayLabel(id: EventDayId): string {
  return EVENT_DAYS.find((day) => day.id === id)?.label ?? id;
}

function itemName(id: FestivalItemId): string {
  return FESTIVAL_ITEMS[id].name;
}

export function formatBookingMessage(
  booking: MidAutumnBooking,
  stage: "hold" | "paid" | "free",
): string {
  const quote = booking.quote;
  const slotLines = (["mooncake", "scarf", "magnet"] as WorkshopId[])
    .map((id) => {
      const slot = booking.workshopSlots[id];
      if (!slot) return null;
      return `${itemName(id)} 時段: ${slot}`;
    })
    .filter(Boolean);

  const header =
    stage === "paid"
      ? "[Mid-Autumn RSVP] PAID 毛孩沉浸式台灣中秋祭"
      : stage === "free"
        ? "[Mid-Autumn RSVP] FREE 毛孩沉浸式台灣中秋祭"
        : "[Mid-Autumn RSVP] HOLD 毛孩沉浸式台灣中秋祭";

  return [
    header,
    `Booking ID: ${booking.id}`,
    `Status: ${booking.status}`,
    `Pay by: ${booking.payBy}`,
    `出席日期: ${booking.attendDays.map(dayLabel).join("、") || "—"}`,
    `寵物數量: ${PET_COUNTS.find((p) => p.id === booking.petCount)?.label ?? booking.petCount}`,
    booking.petTypes.length
      ? `寵物種類: ${booking.petTypes.map((id) => PET_TYPES.find((t) => t.id === id)?.label ?? id).join("、")}`
      : null,
    booking.petNames ? `寵物名字: ${booking.petNames}` : null,
    `已選項目: ${booking.itemIds.map(itemName).join("、") || "不預約工作坊"}`,
    ...slotLines,
    booking.discountCode ? `優惠碼: ${booking.discountCode}` : null,
    `原價合計: ${formatHkd(quote.originalTotal)}`,
    `應付: ${formatHkd(quote.total)}`,
    `得知途徑: ${booking.hearAbout.map((id) => HEAR_ABOUT.find((h) => h.id === id)?.label ?? id).join("、") || "—"}`,
    `接收資訊: ${booking.marketingOptIn ? "是" : "否"}`,
    booking.paymentReference ? `付款備註: ${booking.paymentReference}` : null,
    booking.receiptUrl ? `收據: ${booking.receiptUrl}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}

export async function submitHoldBooking(
  input: CreateBookingInput,
  _reporterId: string | null,
): Promise<MidAutumnBooking> {
  const quote = quoteFestivalItems(input.itemIds, input.discount);
  const result = await graphqlQuery<{ submitMidAutumnBooking: ApiBooking }>(
    SUBMIT_BOOKING,
    {
      input: {
        name: input.name.trim(),
        email: input.email.trim().toLowerCase(),
        phone: input.phone.trim(),
        attendDays: JSON.stringify(input.attendDays),
        petCount: input.petCount,
        itemIds: JSON.stringify(input.itemIds),
        workshopSlots: JSON.stringify(input.workshopSlots),
        quoteTotal: quote.total,
        quoteOriginal: quote.originalTotal,
        quoteJson: JSON.stringify(quote),
        marketingOptIn: input.marketingOptIn,
        hearAbout: JSON.stringify(input.hearAbout),
        discountCode: input.discount?.code ?? "",
      },
    },
    { authMode: "apiKey" },
  );

  const row = result.submitMidAutumnBooking;
  if (!row) {
    throw new Error("Booking was not created");
  }
  const booking = mapApiBooking(row);
  saveBooking(booking);
  return booking;
}

export async function submitPaymentProof(input: {
  booking: MidAutumnBooking;
  file: File;
  paymentReference: string;
  reporterId: string | null;
}): Promise<MidAutumnBooking> {
  const safeName = input.file.name.replace(/[^\w.\-]+/g, "_");
  const contentType = input.file.type || "image/jpeg";
  const uploadSession = await fetch(PAYMENT_UPLOAD_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      id: input.booking.id,
      fileName: safeName,
      contentType,
    }),
  });
  const uploadPayload = (await uploadSession.json().catch(() => ({}))) as {
    uploadUrl?: string;
    receiptUrl?: string;
    error?: string;
  };
  if (!uploadSession.ok || !uploadPayload.uploadUrl || !uploadPayload.receiptUrl) {
    throw new Error(uploadPayload.error || "Could not start receipt upload");
  }

  const putResult = await fetch(uploadPayload.uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": contentType },
    body: input.file,
  });
  if (!putResult.ok) {
    throw new Error(`Receipt upload failed: ${putResult.status}`);
  }

  const result = await graphqlQuery<{ attachMidAutumnPaymentProof: ApiBooking }>(
    ATTACH_PROOF,
    {
      id: input.booking.id,
      receiptUrl: uploadPayload.receiptUrl,
      paymentReference: input.paymentReference.trim(),
    },
    { authMode: "apiKey" },
  );

  const row = result.attachMidAutumnPaymentProof;
  if (!row) {
    throw new Error("Payment proof was not saved");
  }
  const paid = mapApiBooking(row);
  saveBooking(paid);
  return paid;
}
