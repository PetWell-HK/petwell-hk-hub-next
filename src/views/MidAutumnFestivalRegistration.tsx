"use client";

import { useAppNavigate } from "@/hooks/useAppNavigate";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { z } from "zod";
import { MessageCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { FestivalRsvpHero } from "@/components/mid-autumn-rsvp/FestivalRsvpHero";
import { FestivalOfferBoard } from "@/components/mid-autumn-rsvp/FestivalOfferBoard";
import { FestivalTicketBar } from "@/components/mid-autumn-rsvp/FestivalTicketBar";
import { FormSection } from "@/components/mid-autumn-rsvp/FormSection";
import { ComingSoonDialog } from "@/components/mid-autumn-rsvp/ComingSoonDialog";
import { PromoCodePanel } from "@/components/mid-autumn-rsvp/PromoCodePanel";
import {
  EVENT_DAYS,
  MID_AUTUMN_CONFIRMED_PATH,
  MID_AUTUMN_PAYMENT_PATH,
  PET_COUNTS,
  isMidAutumnRegistrationOpen,
  parseWorkshopSlotId,
  workshopSlotsOverlap,
  type EventDayId,
  type PetCountId,
  type WorkshopId,
} from "@/data/midAutumnFestival2026";
import {
  FESTIVAL_ITEM_IDS,
  quoteFestivalItems,
  type FestivalDiscountCode,
  type FestivalItemId,
} from "@/lib/midAutumnFestivalPricing";
import { lookupMidAutumnDiscountCode, submitHoldBooking } from "@/services/midAutumnRegistration";

const perkFamily = "/assets/blog-mid-autumn-pet-hk/perk-family.jpg";
const perkCostume = "/assets/blog-mid-autumn-pet-hk/perk-costume.jpg";

const WORKSHOP_IDS: WorkshopId[] = ["mooncake", "scarf", "magnet"];

const ENQUIRY_WHATSAPP = "85262722164";
const ENQUIRY_WHATSAPP_DISPLAY = "6272 2164";
const ENQUIRY_WHATSAPP_URL =
  `https://wa.me/${ENQUIRY_WHATSAPP}?text=` +
  encodeURIComponent("你好，我想查詢毛孩沉浸式台灣中秋祭的報名。");

const FREE_PERKS = [
  {
    thumb: perkFamily,
    title: "全家福電子相片一張",
    description: "由駐場攝影師拍攝，活動後經電郵送上",
  },
  {
    thumb: perkCostume,
    title: "嫦娥服免費租借",
    description: "現場試身，於台式打卡場景拍照",
  },
] as const;

const contactSchema = z.object({
  email: z.string().trim().email("請填寫有效電郵").max(255),
  name: z.string().trim().min(1, "請填寫姓名").max(80),
  phone: z
    .string()
    .trim()
    .regex(/^(?:\+?852[\s-]?)?\d{8}$/, "請填寫有效香港電話"),
});

const Field = ({
  id,
  label,
  required,
  error,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
}) => (
  <div className="grid gap-1.5">
    <Label htmlFor={id} className="text-sm font-medium">
      {label}
      {required && <span className="ml-0.5 text-destructive">*</span>}
    </Label>
    {children}
    {error && (
      <p className="text-xs text-destructive" role="alert">
        {error}
      </p>
    )}
  </div>
);

const MidAutumnFestivalRegistration = () => {
  const navigate = useAppNavigate();
  const { isAuthenticated, userInfo } = useAuth();

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [attendDays, setAttendDays] = useState<EventDayId[]>([]);
  const [petCount, setPetCount] = useState<PetCountId | "">("");
  const [itemIds, setItemIds] = useState<FestivalItemId[]>([]);
  const [workshopSlots, setWorkshopSlots] = useState<Partial<Record<WorkshopId, string>>>({});
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [liabilityOptIn, setLiabilityOptIn] = useState(false);
  const [promoInput, setPromoInput] = useState("");
  const [promoApplying, setPromoApplying] = useState(false);
  const [promoError, setPromoError] = useState("");
  const [discount, setDiscount] = useState<FestivalDiscountCode | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const registrationOpen = isMidAutumnRegistrationOpen();
  const [comingSoonOpen, setComingSoonOpen] = useState(!registrationOpen);

  const quote = useMemo(() => quoteFestivalItems(itemIds, discount), [itemIds, discount]);
  const overlap = workshopSlotsOverlap(workshopSlots);

  useEffect(() => {
    setWorkshopSlots((prev) => {
      let changed = false;
      const next = { ...prev };
      for (const id of WORKSHOP_IDS) {
        if (!itemIds.includes(id) && next[id]) {
          delete next[id];
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [itemIds]);

  const setItems = (next: FestivalItemId[]) => {
    setItemIds(FESTIVAL_ITEM_IDS.filter((id) => next.includes(id)));
  };

  const toggleItem = (id: FestivalItemId) => {
    setItems(itemIds.includes(id) ? itemIds.filter((item) => item !== id) : [...itemIds, id]);
  };

  const toggleDay = (id: EventDayId) => {
    setAttendDays((prev) =>
      prev.includes(id) ? prev.filter((day) => day !== id) : [...prev, id],
    );
  };

  const pickSlot = (workshopId: WorkshopId, slotId: string) => {
    setWorkshopSlots((prev) => ({ ...prev, [workshopId]: slotId }));
    const parsed = parseWorkshopSlotId(slotId);
    if (parsed && !attendDays.includes(parsed.dayId)) {
      setAttendDays((prev) => [...prev, parsed.dayId]);
    }
  };

  const applyPromo = async () => {
    const trimmed = promoInput.trim();
    if (!trimmed) {
      setPromoError("請輸入優惠碼");
      return;
    }
    setPromoApplying(true);
    setPromoError("");
    try {
      const found = await lookupMidAutumnDiscountCode(trimmed);
      if (!found) {
        setPromoError("優惠碼無效，請再試一次");
        return;
      }
      setDiscount(found);
      setPromoInput(found.code);
    } catch (error) {
      console.error("Failed to lookup mid-autumn discount:", error);
      setPromoError("暫時未能套用優惠碼，請稍後再試");
    } finally {
      setPromoApplying(false);
    }
  };

  const clearPromo = () => {
    setDiscount(null);
    setPromoInput("");
    setPromoError("");
  };

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    const parsed = contactSchema.safeParse({ email, name, phone });
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (typeof key === "string" && !errors[key]) errors[key] = issue.message;
      }
    }
    if (attendDays.length === 0) errors.attendDays = "請選擇出席日期";
    if (!petCount) errors.petCount = "請選擇是否攜帶寵物";
    for (const id of WORKSHOP_IDS) {
      if (itemIds.includes(id) && !workshopSlots[id]) {
        errors.slots = "請為已選工作坊選擇上課時段";
      }
    }
    if (!liabilityOptIn) errors.terms = "請確認寵物照顧及責任聲明";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const gateForm = (event: { preventDefault: () => void; stopPropagation: () => void }) => {
    if (registrationOpen) return;
    event.preventDefault();
    event.stopPropagation();
    setComingSoonOpen(true);
  };

  const handleSubmit = async () => {
    if (!registrationOpen) {
      setComingSoonOpen(true);
      return;
    }
    if (!validate()) {
      toast.error("尚有必填項目未完成", { duration: 3000 });
      return;
    }
    setSubmitting(true);
    try {
      const booking = await submitHoldBooking(
        {
          email,
          name,
          phone,
          attendDays,
          petCount: petCount as PetCountId,
          petTypes: [],
          petNames: "",
          itemIds,
          workshopSlots,
          discount,
          hearAbout: [],
          marketingOptIn,
        },
        isAuthenticated === true ? userInfo?.userId ?? null : null,
      );
      const next =
        booking.quote.total > 0
          ? `${MID_AUTUMN_PAYMENT_PATH}?ref=${encodeURIComponent(booking.id)}`
          : `${MID_AUTUMN_CONFIRMED_PATH}?ref=${encodeURIComponent(booking.id)}`;
      navigate(next, { replace: true });
    } catch (error) {
      console.error("Failed to submit mid-autumn registration:", error);
      toast.error("暫時未能提交，請稍後再試", { duration: 3000 });
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-background">
      <div className="container mx-auto max-w-2xl px-4 pb-32 pt-6 lg:pt-10">
        <FestivalRsvpHero />

          <main className="mt-8 space-y-8">
        <div className="space-y-2">
          <h1 className="review-display text-3xl tracking-tight lg:text-4xl">活動報名表</h1>
          <p className="text-sm text-muted-foreground">
            2026年9月25日至27日 · 觀塘海濱 AquaBeat 02 · 免費入場
          </p>
          <p className="text-sm text-muted-foreground">
            填妥以下資料即可預留入場手帶，費用全免。
          </p>
          <a
            href={ENQUIRY_WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 pt-1 text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            <MessageCircle className="h-4 w-4" />
            活動查詢 · WhatsApp {ENQUIRY_WHATSAPP_DISPLAY}
          </a>
        </div>

        <div onPointerDownCapture={gateForm}>
        <section className="rounded-2xl border border-primary/25 bg-primary/[0.05] px-5 py-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">
            免費報名禮遇
          </p>
          <p className="mt-1.5 text-base font-semibold leading-snug">
            入場費用全免。填妥此表格完成報名，即可免費獲得：
          </p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {FREE_PERKS.map((perk) => (
              <div
                key={perk.title}
                className="flex items-start gap-3 rounded-xl border border-primary/20 bg-background px-3 py-3 sm:items-center sm:px-4"
              >
                <img
                  src={perk.thumb}
                  alt=""
                  width={160}
                  height={160}
                  className="size-[4.5rem] shrink-0 rounded-lg object-cover ring-1 ring-black/10 sm:size-20"
                />
                <span>
                  <span className="block text-sm font-semibold leading-snug">{perk.title}</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {perk.description}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </section>
        </div>

        <div className="space-y-8" onPointerDownCapture={gateForm}>
        <FormSection
          step={1}
          title="出席日期"
          required
          description="可選擇多於一天。"
        >
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {EVENT_DAYS.map((day) => {
              const selected = attendDays.includes(day.id);
              return (
                <label
                  key={day.id}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-colors",
                    selected
                      ? "border-primary bg-primary/[0.05]"
                      : "border-border hover:border-primary/35",
                  )}
                >
                  <Checkbox
                    checked={selected}
                    onCheckedChange={() => toggleDay(day.id)}
                    aria-label={`${day.dateLabel}（星期${day.weekday}）`}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-base font-semibold">{day.dateLabel}</span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      星期{day.weekday} · {day.hours}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
          {fieldErrors.attendDays && (
            <p className="mt-2 text-sm text-destructive">{fieldErrors.attendDays}</p>
          )}
        </FormSection>

        <FormSection step={2} title="聯絡資料" required>
          <div className="space-y-3">
            <Field id="name" label="姓名" required error={fieldErrors.name}>
              <Input
                id="name"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Field>
            <Field id="phone" label="電話" required error={fieldErrors.phone}>
              <Input
                id="phone"
                type="tel"
                autoComplete="tel"
                inputMode="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </Field>
            <Field
              id="email"
              label="電郵"
              required
              error={fieldErrors.email}
            >
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Field>
          </div>
        </FormSection>

        <FormSection step={3} title="攜帶寵物" required>
          <RadioGroup
            value={petCount}
            onValueChange={(value) => setPetCount(value as PetCountId)}
            className="gap-2 sm:grid-cols-2"
          >
            {PET_COUNTS.map((option) => {
              const selected = petCount === option.id;
              return (
                <label
                  key={option.id}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm transition-colors",
                    selected
                      ? "border-primary bg-primary/[0.05] font-medium"
                      : "border-border hover:border-primary/35",
                  )}
                >
                  <RadioGroupItem value={option.id} aria-label={option.label} />
                  {option.label}
                </label>
              );
            })}
          </RadioGroup>
          {fieldErrors.petCount && (
            <p className="mt-2 text-sm text-destructive">{fieldErrors.petCount}</p>
          )}
        </FormSection>

        <FormSection
          step={4}
          title="報名工作坊（選填）"
          description="工作坊為自費項目，可自由選購，名額有限。同時報名多個工作坊可享組合優惠。"
        >
          <FestivalOfferBoard
            itemIds={itemIds}
            workshopSlots={workshopSlots}
            overlap={overlap}
            slotError={fieldErrors.slots}
            onToggleItem={toggleItem}
            onSetItems={setItems}
            onPickSlot={pickSlot}
          />
          <div className="mt-4">
            <PromoCodePanel
              value={promoInput}
              onChange={(next) => {
                setPromoInput(next);
                if (promoError) setPromoError("");
              }}
              onApply={() => void applyPromo()}
              onClear={clearPromo}
              applying={promoApplying}
              appliedCode={discount?.code ?? null}
              discountAmount={quote.discountAmount}
              message={promoError ? { tone: "err", text: promoError } : null}
            />
          </div>
        </FormSection>

        <FormSection step={5} title="聲明及同意" required>
          <div className="space-y-3">
            <label className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed">
              <Checkbox
                checked={liabilityOptIn}
                onCheckedChange={(value) => setLiabilityOptIn(value === true)}
                className="mt-0.5"
              />
              <span>
                本人會自行照顧所攜寵物。活動期間如有意外、損傷或損失，責任由本人承擔。
                <span className="text-destructive">*</span>
              </span>
            </label>
            {fieldErrors.terms && (
              <p className="text-xs text-destructive">{fieldErrors.terms}</p>
            )}
            <label className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-muted-foreground">
              <Checkbox
                checked={marketingOptIn}
                onCheckedChange={(value) => setMarketingOptIn(value === true)}
                className="mt-0.5"
              />
              本人願意接收 PetWell 及 AquaBeat 的活動資訊（選填）
            </label>
          </div>
        </FormSection>

        <p className="text-sm text-muted-foreground">
          如有查詢，歡迎
          <a
            href={ENQUIRY_WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-1 inline-flex items-center gap-1 font-medium text-primary underline-offset-4 hover:underline"
            onPointerDownCapture={(event) => event.stopPropagation()}
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp {ENQUIRY_WHATSAPP_DISPLAY}
          </a>
        </p>
        </div>
          </main>
      </div>

      <FestivalTicketBar
        quote={quote}
        submitting={submitting}
        locked={!registrationOpen}
        onSubmit={handleSubmit}
      />
      <ComingSoonDialog open={comingSoonOpen} onOpenChange={setComingSoonOpen} />
    </div>
  );
};

export default MidAutumnFestivalRegistration;
