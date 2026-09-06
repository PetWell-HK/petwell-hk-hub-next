export const FESTIVAL_ITEM_IDS = [
  "mooncake",
  "scarf",
  "magnet",
  "familyPhoto",
] as const;

export type FestivalItemId = (typeof FESTIVAL_ITEM_IDS)[number];

export type FestivalItemKind = "workshop" | "photo";

export interface FestivalItem {
  id: FestivalItemId;
  name: string;
  shortName: string;
  durationMin: number;
  capacity: number | null;
  regularPrice: number;
  earlyBirdPrice: number;
  /** Early-bird form uses 早鳥價 only for mooncake (and All-in via bundle). */
  useEarlyBirdAlone: boolean;
  kind: FestivalItemKind;
}

export const FESTIVAL_ITEMS: Record<FestivalItemId, FestivalItem> = {
  mooncake: {
    id: "mooncake",
    name: "寵物養生花膠月餅工作坊",
    shortName: "花膠月餅",
    durationMin: 90,
    capacity: 10,
    regularPrice: 688,
    earlyBirdPrice: 638,
    useEarlyBirdAlone: true,
    kind: "workshop",
  },
  scarf: {
    id: "scarf",
    name: "寵物圍巾手作工作坊",
    shortName: "寵物圍巾",
    durationMin: 30,
    capacity: 10,
    regularPrice: 288,
    earlyBirdPrice: 238,
    useEarlyBirdAlone: false,
    kind: "workshop",
  },
  magnet: {
    id: "magnet",
    name: "手繪寵物磁石貼工作坊",
    shortName: "手繪磁石貼",
    durationMin: 30,
    capacity: 5,
    regularPrice: 288,
    earlyBirdPrice: 238,
    useEarlyBirdAlone: false,
    kind: "workshop",
  },
  familyPhoto: {
    id: "familyPhoto",
    name: "全家福攝影（2 張執相＋1 張印相連紙相框）",
    shortName: "全家福攝影",
    durationMin: 20,
    capacity: null,
    regularPrice: 200,
    earlyBirdPrice: 150,
    useEarlyBirdAlone: true,
    kind: "photo",
  },
};

export interface FestivalBundle {
  id: string;
  label: string;
  blurb: string;
  items: FestivalItemId[];
  price: number;
  featured: boolean;
}

export const FESTIVAL_BUNDLES: FestivalBundle[] = [
  {
    id: "all-in",
    label: "全場通行套餐",
    blurb: "三個工作坊及全家福攝影，全場最完整套餐",
    items: ["mooncake", "scarf", "magnet", "familyPhoto"],
    price: 1100,
    featured: true,
  },
  {
    id: "mooncake-scarf",
    label: "月餅 + 圍巾",
    blurb: "親手製作應節月餅及寵物圍巾",
    items: ["mooncake", "scarf"],
    price: 888,
    featured: true,
  },
  {
    id: "mooncake-magnet",
    label: "月餅 + 磁石貼",
    blurb: "完成課堂後可帶走手作紀念品",
    items: ["mooncake", "magnet"],
    price: 888,
    featured: true,
  },
  {
    id: "mooncake-family",
    label: "月餅 + 全家福",
    blurb: "月餅工作坊連全家福攝影",
    items: ["mooncake", "familyPhoto"],
    price: 788,
    featured: true,
  },
  {
    id: "scarf-magnet",
    label: "圍巾 + 磁石貼",
    blurb: "兩節各三十分鐘，輕鬆完成",
    items: ["scarf", "magnet"],
    price: 528,
    featured: true,
  },
  {
    id: "scarf-family",
    label: "圍巾 + 全家福",
    blurb: "",
    items: ["scarf", "familyPhoto"],
    price: 438,
    featured: false,
  },
  {
    id: "magnet-family",
    label: "磁石貼 + 全家福",
    blurb: "",
    items: ["magnet", "familyPhoto"],
    price: 438,
    featured: false,
  },
];

export const FEATURED_BUNDLES = FESTIVAL_BUNDLES.filter((bundle) => bundle.featured);

/** Calm RSVP menu: one full-day offer + two easy pairs. */
export const PRIMARY_BUNDLES = FESTIVAL_BUNDLES.filter((bundle) =>
  bundle.id === "all-in" || bundle.id === "mooncake-scarf" || bundle.id === "mooncake-family",
);

export type DiscountKind = "percent" | "fixed";

export interface FestivalDiscountCode {
  code: string;
  kind: DiscountKind;
  value: number;
  label: string;
}

export type QuoteLine =
  | {
      kind: "item";
      itemId: FestivalItemId;
      label: string;
      original: number;
      price: number;
    }
  | {
      kind: "bundle";
      bundleId: string;
      itemIds: FestivalItemId[];
      label: string;
      original: number;
      price: number;
    }
  | { kind: "gift"; label: string; price: 0 }
  | { kind: "discount"; code: string; label: string; amount: number };

export interface PriceQuote {
  itemIds: FestivalItemId[];
  lines: QuoteLine[];
  originalTotal: number;
  subtotal: number;
  discountAmount: number;
  total: number;
}

function itemIndex(id: FestivalItemId): number {
  return FESTIVAL_ITEM_IDS.indexOf(id);
}

export function sortFestivalItems(ids: FestivalItemId[]): FestivalItemId[] {
  return [...new Set(ids)]
    .filter((id) => itemIndex(id) >= 0)
    .sort((a, b) => itemIndex(a) - itemIndex(b));
}

export function standalonePrice(id: FestivalItemId): number {
  const item = FESTIVAL_ITEMS[id];
  return item.useEarlyBirdAlone ? item.earlyBirdPrice : item.regularPrice;
}

export function regularTotal(ids: FestivalItemId[]): number {
  return ids.reduce((sum, id) => sum + FESTIVAL_ITEMS[id].regularPrice, 0);
}

function includesAll(haystack: FestivalItemId[], needles: FestivalItemId[]): boolean {
  return needles.every((id) => haystack.includes(id));
}

function linePrice(line: QuoteLine): number {
  switch (line.kind) {
    case "item":
    case "bundle":
      return line.price;
    case "gift":
      return 0;
    case "discount":
      return 0;
    default: {
      const _exhaustive: never = line;
      return _exhaustive;
    }
  }
}

function computeDiscountAmount(subtotal: number, discount: FestivalDiscountCode): number {
  if (subtotal <= 0) return 0;
  const raw =
    discount.kind === "percent"
      ? Math.round((subtotal * discount.value) / 100)
      : discount.value;
  return Math.min(Math.max(0, raw), subtotal);
}

function cheapestPartition(itemIds: FestivalItemId[]): { price: number; lines: QuoteLine[] } {
  let best: { price: number; lines: QuoteLine[] } | null = null;

  const search = (remaining: FestivalItemId[], lines: QuoteLine[]) => {
    if (remaining.length === 0) {
      const price = lines.reduce((sum, line) => sum + linePrice(line), 0);
      if (!best || price < best.price) best = { price, lines };
      return;
    }

    const [head, ...tail] = remaining;
    const item = FESTIVAL_ITEMS[head];
    search(tail, [
      ...lines,
      {
        kind: "item",
        itemId: head,
        label: item.name,
        original: item.regularPrice,
        price: standalonePrice(head),
      },
    ]);

    for (const bundle of FESTIVAL_BUNDLES) {
      if (!bundle.items.includes(head)) continue;
      if (!includesAll(remaining, bundle.items)) continue;
      const canonicalHead = sortFestivalItems(bundle.items)[0];
      if (canonicalHead !== head) continue;
      const next = remaining.filter((id) => !bundle.items.includes(id));
      search(next, [
        ...lines,
        {
          kind: "bundle",
          bundleId: bundle.id,
          itemIds: sortFestivalItems(bundle.items),
          label: bundle.label,
          original: regularTotal(bundle.items),
          price: bundle.price,
        },
      ]);
    }
  };

  search(sortFestivalItems(itemIds), []);
  return best ?? { price: 0, lines: [] };
}

export function quoteFestivalItems(
  selected: FestivalItemId[],
  discount?: FestivalDiscountCode | null,
): PriceQuote {
  const itemIds = sortFestivalItems(selected);
  const originalTotal = regularTotal(itemIds);

  if (itemIds.length === 0) {
    return {
      itemIds,
      lines: [],
      originalTotal: 0,
      subtotal: 0,
      discountAmount: 0,
      total: 0,
    };
  }

  const partition = cheapestPartition(itemIds);
  const lines: QuoteLine[] = [...partition.lines];

  const discountAmount = discount ? computeDiscountAmount(partition.price, discount) : 0;
  if (discount && discountAmount > 0) {
    lines.push({
      kind: "discount",
      code: discount.code,
      label: discount.label,
      amount: discountAmount,
    });
  }

  return {
    itemIds,
    lines,
    originalTotal,
    subtotal: partition.price,
    discountAmount,
    total: partition.price - discountAmount,
  };
}

export function formatHkd(amount: number): string {
  if (amount < 0) return `−$${Math.abs(amount).toLocaleString("en-HK")}`;
  return `$${amount.toLocaleString("en-HK")}`;
}

/** Percent saved versus original, rounded to the nearest whole number. */
export function percentOff(original: number, now: number): number {
  if (original <= 0 || now >= original) return 0;
  return Math.round(((original - now) / original) * 100);
}

export function formatPercentOff(original: number, now: number): string {
  const pct = percentOff(original, now);
  return pct > 0 ? `省 ${pct}%` : "";
}

export function quoteSavings(quote: PriceQuote): number {
  return Math.max(0, quote.originalTotal - quote.total);
}

export function quotePercentOff(quote: PriceQuote): number {
  return percentOff(quote.originalTotal, quote.total);
}

export function isExactBundle(itemIds: FestivalItemId[], bundle: FestivalBundle): boolean {
  const selected = sortFestivalItems(itemIds);
  const wanted = sortFestivalItems(bundle.items);
  return selected.length === wanted.length && selected.every((id, index) => id === wanted[index]);
}

export function appliedBundleLines(quote: PriceQuote): Extract<QuoteLine, { kind: "bundle" }>[] {
  return quote.lines.filter((line): line is Extract<QuoteLine, { kind: "bundle" }> => line.kind === "bundle");
}

export function isWorkshopItem(id: FestivalItemId): boolean {
  return FESTIVAL_ITEMS[id].kind === "workshop";
}

export function workshopItemIds(ids: FestivalItemId[]): FestivalItemId[] {
  return ids.filter(isWorkshopItem);
}

export const ALL_IN_BUNDLE = FESTIVAL_BUNDLES.find((bundle) => bundle.id === "all-in")!;

export interface AllInOffer {
  remainingIds: FestivalItemId[];
  remainingCount: number;
  currentTotal: number;
  allInPrice: number;
  originalTotal: number;
  extraToUpgrade: number;
  applied: boolean;
}

/** What it would cost to jump from the current cart to the All-in package. */
export function allInOffer(selected: FestivalItemId[]): AllInOffer {
  const remainingIds = FESTIVAL_ITEM_IDS.filter((id) => !selected.includes(id));
  const currentTotal = quoteFestivalItems(selected).total;
  return {
    remainingIds,
    remainingCount: remainingIds.length,
    currentTotal,
    allInPrice: ALL_IN_BUNDLE.price,
    originalTotal: regularTotal([...FESTIVAL_ITEM_IDS]),
    extraToUpgrade: ALL_IN_BUNDLE.price - currentTotal,
    applied: remainingIds.length === 0,
  };
}
