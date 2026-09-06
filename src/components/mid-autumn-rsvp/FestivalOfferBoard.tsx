"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FESTIVAL_ITEM_IDS,
  FESTIVAL_ITEMS,
  allInOffer,
  formatHkd,
  formatPercentOff,
  quoteFestivalItems,
  standalonePrice,
  type FestivalItemId,
} from "@/lib/midAutumnFestivalPricing";
import {
  EVENT_DAYS,
  WORKSHOP_SLOTS,
  type WorkshopId,
} from "@/data/midAutumnFestival2026";
const thumbMooncake = "/assets/blog-mid-autumn-pet-hk/workshop-mooncake.jpg";
const thumbScarf = "/assets/blog-mid-autumn-pet-hk/workshop-scarf.jpg";
const thumbMagnet = "/assets/blog-mid-autumn-pet-hk/workshop-magnet.jpg";

const WORKSHOP_IDS: WorkshopId[] = ["mooncake", "scarf", "magnet"];
const PHOTO_IDS: FestivalItemId[] = ["familyPhoto"];

const WORKSHOP_THUMBS: Record<WorkshopId, string> = {
  mooncake: thumbMooncake,
  scarf: thumbScarf,
  magnet: thumbMagnet,
};

interface RowPricing {
  displayed: number;
  standalone: number;
  savings: number;
}

/** Add-on cost of this item on top of the current cart (item not yet selected). */
function addOnPricing(itemIds: FestivalItemId[], id: FestivalItemId): RowPricing {
  const current = quoteFestivalItems(itemIds).total;
  const next = quoteFestivalItems([...itemIds, id]).total;
  const displayed = next - current;
  const standalone = standalonePrice(id);
  return { displayed, standalone, savings: standalone - displayed };
}

function PriceTag({
  id,
  pricing,
  inPackage,
}: {
  id: FestivalItemId;
  pricing: RowPricing;
  inPackage?: boolean;
}) {
  const item = FESTIVAL_ITEMS[id];
  if (inPackage) {
    return (
      <div className="shrink-0 text-right">
        <p className="text-[11px] font-semibold text-primary">已包含</p>
        <p className="text-xs text-muted-foreground line-through tabular-nums">
          {formatHkd(pricing.standalone)}
        </p>
      </div>
    );
  }
  if (pricing.savings > 0) {
    return (
      <div className="shrink-0 text-right">
        <p className="text-[11px] font-semibold text-primary">加購價</p>
        <p className="text-base font-semibold tabular-nums">{formatHkd(pricing.displayed)}</p>
        <p className="text-xs text-muted-foreground line-through tabular-nums">
          {formatHkd(pricing.standalone)}
        </p>
      </div>
    );
  }
  const earlyBird = item.useEarlyBirdAlone && item.earlyBirdPrice < item.regularPrice;
  return (
    <div className="shrink-0 text-right">
      {earlyBird && (
        <p className="text-[11px] font-semibold text-primary">早鳥價</p>
      )}
      <p className="text-base font-semibold tabular-nums">{formatHkd(pricing.displayed)}</p>
      {earlyBird && (
        <p className="text-xs text-muted-foreground line-through tabular-nums">
          {formatHkd(item.regularPrice)}
        </p>
      )}
    </div>
  );
}

export function FestivalOfferBoard({
  itemIds,
  workshopSlots,
  overlap,
  slotError,
  onToggleItem,
  onSetItems,
  onPickSlot,
}: {
  itemIds: FestivalItemId[];
  workshopSlots: Partial<Record<WorkshopId, string>>;
  overlap: boolean;
  slotError?: string;
  onToggleItem: (id: FestivalItemId) => void;
  onSetItems: (ids: FestivalItemId[]) => void;
  onPickSlot: (workshopId: WorkshopId, slotId: string) => void;
}) {
  const [lockedPrices, setLockedPrices] = useState<Partial<Record<FestivalItemId, number>>>({});
  const selectedWorkshops = WORKSHOP_IDS.filter((id) => itemIds.includes(id));
  const hasWorkshop = selectedWorkshops.length > 0;
  const offer = allInOffer(itemIds);

  const pricingFor = (id: FestivalItemId): RowPricing => {
    const standalone = standalonePrice(id);
    if (itemIds.includes(id)) {
      const displayed = lockedPrices[id] ?? standalone;
      return { displayed, standalone, savings: standalone - displayed };
    }
    return addOnPricing(itemIds, id);
  };

  const toggle = (id: FestivalItemId) => {
    if (itemIds.includes(id)) {
      setLockedPrices((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    } else {
      const { displayed } = addOnPricing(itemIds, id);
      setLockedPrices((prev) => ({ ...prev, [id]: displayed }));
    }
    onToggleItem(id);
  };

  const applyAllIn = () => {
    const nextLocked: Partial<Record<FestivalItemId, number>> = {};
    for (const id of FESTIVAL_ITEM_IDS) {
      nextLocked[id] = itemIds.includes(id) ? (lockedPrices[id] ?? standalonePrice(id)) : 0;
    }
    setLockedPrices(nextLocked);
    onSetItems([...FESTIVAL_ITEM_IDS]);
  };

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        {WORKSHOP_IDS.map((id) => {
          const item = FESTIVAL_ITEMS[id];
          const selected = itemIds.includes(id);
          const pricing = pricingFor(id);
          const combo = !offer.applied && pricing.savings > 0;
          return (
            <label
              key={id}
              className={cn(
                "flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-3 transition-colors sm:items-center sm:px-4",
                selected
                  ? "border-primary bg-primary/[0.05]"
                  : "border-border hover:border-primary/35",
              )}
            >
              <Checkbox
                checked={selected}
                onCheckedChange={() => toggle(id)}
                aria-label={item.name}
                className="mt-1.5 shrink-0"
              />
              <img
                src={WORKSHOP_THUMBS[id]}
                alt=""
                width={160}
                height={160}
                className="size-[4.5rem] shrink-0 rounded-lg object-cover ring-1 ring-black/10 sm:size-20"
              />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold leading-snug">{item.name}</span>
                <span className="mt-0.5 block text-xs text-muted-foreground">
                  約 {item.durationMin} 分鐘
                  {item.capacity ? ` · 每場限 ${item.capacity} 位` : ""}
                </span>
                {combo && (
                  <span className="mt-1 block text-xs font-medium text-primary">
                    組合優惠 · 節省 {formatHkd(pricing.savings)}
                  </span>
                )}
              </span>
              <PriceTag id={id} pricing={pricing} inPackage={offer.applied && selected} />
            </label>
          );
        })}
      </div>

      {hasWorkshop && (
        <>
          <AllInBanner offer={offer} onApply={applyAllIn} />
          <div className="space-y-2 border-t border-border pt-4">
            <p className="text-sm font-medium">加購攝影服務（選填）</p>
            <p className="text-xs text-muted-foreground">
              於即場進行，無需預約時段。
            </p>
            {PHOTO_IDS.map((id) => {
              const item = FESTIVAL_ITEMS[id];
              const selected = itemIds.includes(id);
              const pricing = pricingFor(id);
              const combo = !offer.applied && pricing.savings > 0;
              return (
                <label
                  key={id}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-colors",
                    selected
                      ? "border-primary bg-primary/[0.05]"
                      : "border-border hover:border-primary/35",
                  )}
                >
                  <Checkbox
                    checked={selected}
                    onCheckedChange={() => toggle(id)}
                    aria-label={item.name}
                    className="mt-0.5 self-start"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold">{item.name}</span>
                    {combo && (
                      <span className="mt-1 block text-xs font-medium text-primary">
                        組合優惠 · 節省 {formatHkd(pricing.savings)}
                      </span>
                    )}
                  </span>
                  <PriceTag id={id} pricing={pricing} inPackage={offer.applied && selected} />
                </label>
              );
            })}
          </div>
        </>
      )}

      {selectedWorkshops.length > 0 && (
        <SlotPicker
          workshopIds={selectedWorkshops}
          workshopSlots={workshopSlots}
          overlap={overlap}
          slotError={slotError}
          onPickSlot={onPickSlot}
        />
      )}
    </div>
  );
}

function AllInBanner({
  offer,
  onApply,
}: {
  offer: ReturnType<typeof allInOffer>;
  onApply: () => void;
}) {
  const off = formatPercentOff(offer.originalTotal, offer.allInPrice);
  if (offer.applied) {
    return (
      <div className="rounded-xl border border-primary/30 bg-primary/[0.05] px-4 py-3">
        <p className="text-sm font-semibold">已套用全場通行套餐</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          三個工作坊及全家福攝影，合計 {formatHkd(offer.allInPrice)}
          {off ? `（${off}）` : ""}
        </p>
      </div>
    );
  }

  const cheaperToUpgrade = offer.extraToUpgrade <= 0;
  return (
    <div className="rounded-xl border border-primary/30 bg-primary/[0.05] px-4 py-3">
      <p className="text-sm font-semibold">全場通行套餐 {formatHkd(offer.allInPrice)}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">
        包含三個工作坊及全家福攝影
        {off ? ` · 原價 ${formatHkd(offer.originalTotal)}，${off}` : ""}
      </p>
      <p className="mt-1.5 text-xs font-medium text-primary">
        {cheaperToUpgrade
          ? `加購餘下 ${offer.remainingCount} 項，合計再減 ${formatHkd(-offer.extraToUpgrade)}`
          : `再加 ${offer.remainingCount} 項只需多 ${formatHkd(offer.extraToUpgrade)}`}
      </p>
      <button
        type="button"
        onClick={onApply}
        className="mt-2 text-sm font-medium text-primary underline-offset-4 hover:underline"
      >
        {cheaperToUpgrade ? "領取全場套餐" : "升級至全場套餐"}
      </button>
    </div>
  );
}

function slotTimeRange(label: string): string {
  return label.split(" ").pop() ?? label;
}

function SlotPicker({
  workshopIds,
  workshopSlots,
  overlap,
  slotError,
  onPickSlot,
}: {
  workshopIds: WorkshopId[];
  workshopSlots: Partial<Record<WorkshopId, string>>;
  overlap: boolean;
  slotError?: string;
  onPickSlot: (workshopId: WorkshopId, slotId: string) => void;
}) {
  return (
    <div className="space-y-4 border-t border-border pt-5">
      <div>
        <h3 className="text-base font-semibold">選擇上課時段</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          請為每個已選工作坊選擇日期及時間。攝影服務於即場進行，無需預約時段。
        </p>
      </div>
      <div className="space-y-4">
        {workshopIds.map((id) => {
          const item = FESTIVAL_ITEMS[id];
          const selectId = `slot-${id}`;
          return (
            <div key={id} className="grid gap-2">
              <Label htmlFor={selectId} className="flex items-center gap-2.5 text-sm font-medium">
                <img
                  src={WORKSHOP_THUMBS[id]}
                  alt=""
                  width={40}
                  height={40}
                  className="size-10 shrink-0 rounded-md object-cover ring-1 ring-black/10"
                />
                <span>
                  {item.name}
                  <span className="ml-0.5 text-destructive">*</span>
                </span>
              </Label>
              <Select
                value={workshopSlots[id] ?? ""}
                onValueChange={(value) => onPickSlot(id, value)}
              >
                <SelectTrigger id={selectId} className="w-full">
                  <SelectValue placeholder="請選擇日期及時間" />
                </SelectTrigger>
                <SelectContent>
                  {EVENT_DAYS.map((day) => (
                    <SelectGroup key={day.id}>
                      <SelectLabel>
                        {day.dateLabel}（星期{day.weekday}）
                      </SelectLabel>
                      {WORKSHOP_SLOTS[id]
                        .filter((slot) => slot.dayId === day.id)
                        .map((slot) => (
                          <SelectItem key={slot.id} value={slot.id}>
                            {slotTimeRange(slot.label)}
                          </SelectItem>
                        ))}
                    </SelectGroup>
                  ))}
                </SelectContent>
              </Select>
            </div>
          );
        })}
      </div>
      {overlap && (
        <p className="text-sm text-amber-800">
          所選時段互相重疊，請調整其中一個時段，或安排於不同日期上課。
        </p>
      )}
      {slotError && (
        <p className="text-sm text-destructive" role="alert">
          {slotError}
        </p>
      )}
    </div>
  );
}
