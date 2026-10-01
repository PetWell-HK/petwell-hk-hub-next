"use client";

import type { MouseEvent } from "react";
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
  FESTIVAL_ITEMS,
  formatHkd,
  standalonePrice,
  type FestivalItemId,
} from "@/lib/midAutumnFestivalPricing";
import {
  EVENT_DAYS,
  WORKSHOP_IDS,
  WORKSHOP_SLOTS,
  type WorkshopId,
} from "@/data/midAutumnFestival2026";

const thumbMooncake = "/assets/blog-mid-autumn-pet-hk/workshop-mooncake.jpg";
const thumbScarf = "/assets/blog-mid-autumn-pet-hk/workshop-scarf.jpg";

const PHOTO_IDS: FestivalItemId[] = ["familyPhoto"];

const WORKSHOP_THUMBS: Record<WorkshopId, string> = {
  mooncake: thumbMooncake,
  scarf: thumbScarf,
};

function PriceTag({ id }: { id: FestivalItemId }) {
  const item = FESTIVAL_ITEMS[id];
  const price = standalonePrice(id);
  const special = item.useEarlyBirdAlone && item.earlyBirdPrice < item.regularPrice;
  const label = special
    ? item.kind === "workshop"
      ? "最後3日特價"
      : "早鳥價"
    : null;

  return (
    <div className="shrink-0 text-right">
      {label && <p className="text-[11px] font-semibold text-primary">{label}</p>}
      <p className="text-base font-semibold tabular-nums">{formatHkd(price)}</p>
      {special && (
        <p className="text-xs text-muted-foreground line-through tabular-nums">
          {formatHkd(item.regularPrice)}
        </p>
      )}
    </div>
  );
}

function stopRowToggle(event: MouseEvent) {
  event.stopPropagation();
}

function slotTimeRange(label: string): string {
  return label.split(" ").pop() ?? label;
}

function WorkshopSlotSelect({
  id,
  value,
  onPickSlot,
}: {
  id: WorkshopId;
  value: string;
  onPickSlot: (workshopId: WorkshopId, slotId: string) => void;
}) {
  const selectId = `slot-${id}`;
  return (
    <div className="border-t border-primary/15 px-3 py-3 sm:px-4" onClick={stopRowToggle}>
      <Label htmlFor={selectId} className="text-xs font-medium">
        上課時段
        <span className="ml-0.5 text-destructive">*</span>
      </Label>
      <Select value={value} onValueChange={(next) => onPickSlot(id, next)}>
        <SelectTrigger id={selectId} className="mt-1.5 w-full">
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
}

export function FestivalOfferBoard({
  itemIds,
  workshopSlots,
  overlap,
  slotError,
  onToggleItem,
  onPickSlot,
}: {
  itemIds: FestivalItemId[];
  workshopSlots: Partial<Record<WorkshopId, string>>;
  overlap: boolean;
  slotError?: string;
  onToggleItem: (id: FestivalItemId) => void;
  onPickSlot: (workshopId: WorkshopId, slotId: string) => void;
}) {
  const selectedWorkshops = WORKSHOP_IDS.filter((id) => itemIds.includes(id));
  const hasWorkshop = selectedWorkshops.length > 0;

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-primary/25 bg-primary/[0.04] px-4 py-3">
        <p className="text-sm font-semibold text-primary">最後 3 日報名工作坊</p>
        <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">
          特價發售：花膠月餅 {formatHkd(standalonePrice("mooncake"))}、圍巾{" "}
          {formatHkd(standalonePrice("scarf"))}。名額有限，單項計價。
        </p>
      </div>

      <div className="space-y-2">
        {WORKSHOP_IDS.map((id) => {
          const item = FESTIVAL_ITEMS[id];
          const selected = itemIds.includes(id);
          return (
            <div
              key={id}
              className={cn(
                "rounded-xl border transition-colors",
                selected
                  ? "border-primary bg-primary/[0.05]"
                  : "border-border hover:border-primary/35",
              )}
            >
              <div
                className="flex cursor-pointer items-start gap-3 px-3 py-3 sm:items-center sm:px-4"
                onClick={() => onToggleItem(id)}
              >
                <span onClick={stopRowToggle} className="mt-1.5 shrink-0">
                  <Checkbox
                    checked={selected}
                    onCheckedChange={() => onToggleItem(id)}
                    aria-label={item.name}
                  />
                </span>
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
                    {!selected && " · 選取後顯示時段"}
                  </span>
                </span>
                <PriceTag id={id} />
              </div>
              {selected && (
                <WorkshopSlotSelect
                  id={id}
                  value={workshopSlots[id] ?? ""}
                  onPickSlot={onPickSlot}
                />
              )}
            </div>
          );
        })}
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

      {hasWorkshop && (
        <div className="space-y-2 border-t border-border pt-4">
          <p className="text-sm font-medium">加購攝影服務（選填）</p>
          <p className="text-xs text-muted-foreground">於即場進行，無需預約時段。</p>
          {PHOTO_IDS.map((id) => {
            const item = FESTIVAL_ITEMS[id];
            const selected = itemIds.includes(id);
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
                  onCheckedChange={() => onToggleItem(id)}
                  aria-label={item.name}
                  className="mt-0.5 self-start"
                />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold">{item.name}</span>
                </span>
                <PriceTag id={id} />
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}
