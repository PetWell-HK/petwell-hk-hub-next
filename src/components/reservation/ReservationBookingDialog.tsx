import { FormEvent, useEffect, useMemo, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { CalendarDays, CheckCircle2, ChevronDown, Loader2, Minus, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { RestaurantReservationSettings } from "@/services/restaurantApi";
import {
  getMaxPetsPerBooking,
  isValidReservationSlot,
  listAvailableDates,
  listAvailableTimes,
  parseReservationSettings,
  toLocalDateString,
} from "@/utils/restaurantReservationAvailability";
import { cn } from "@/lib/utils";

const QUICK_DATE_COUNT = 5;

export type ReservationSubmitPayload = {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  reservationAt: string;
  partySize: number;
  petCount: number;
  petSummary: string;
  specialRequest: string;
};

type ReservationBookingDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  placeName: string;
  reservationSettings?: RestaurantReservationSettings | string | null;
  onSubmit: (payload: ReservationSubmitPayload) => Promise<void>;
};

type ReservationForm = {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  reservationDate: string;
  reservationTime: string;
  partySize: number;
  petCount: number;
  petSummary: string;
  specialRequest: string;
  termsAccepted: boolean;
};

const initialForm: ReservationForm = {
  customerName: "",
  customerPhone: "",
  customerEmail: "",
  reservationDate: "",
  reservationTime: "",
  partySize: 2,
  petCount: 1,
  petSummary: "",
  specialRequest: "",
  termsAccepted: false,
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const toAwsDateTime = (dateValue: string, timeValue: string) => {
  if (!dateValue || !timeValue) return null;
  const date = new Date(`${dateValue}T${timeValue}`);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
};

const formatDateChip = (value: string, language: string) => {
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return { weekday: value, day: "" };
  const weekday = new Intl.DateTimeFormat(language === "en" ? "en-HK" : "zh-HK", {
    weekday: "short",
  }).format(date);
  const day = new Intl.DateTimeFormat(language === "en" ? "en-HK" : "zh-HK", {
    month: "numeric",
    day: "numeric",
  }).format(date);
  return { weekday, day };
};

export function ReservationBookingDialog({
  open,
  onOpenChange,
  placeName,
  reservationSettings,
  onSubmit,
}: ReservationBookingDialogProps) {
  const { t, i18n } = useTranslation();
  const [form, setForm] = useState<ReservationForm>(initialForm);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof ReservationForm, string>>
  >({});
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showExtras, setShowExtras] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const settings = useMemo(
    () => parseReservationSettings(reservationSettings),
    [reservationSettings],
  );
  const availableDates = useMemo(() => listAvailableDates(settings), [settings]);
  const availableDateSet = useMemo(
    () => new Set(availableDates),
    [availableDates],
  );
  const quickDates = useMemo(() => {
    const leading = availableDates.slice(0, QUICK_DATE_COUNT);
    if (
      !form.reservationDate ||
      leading.includes(form.reservationDate)
    ) {
      return leading;
    }
    return [
      form.reservationDate,
      ...leading.filter((value) => value !== form.reservationDate),
    ].slice(0, QUICK_DATE_COUNT);
  }, [availableDates, form.reservationDate]);
  const availableTimes = useMemo(
    () => listAvailableTimes(settings, form.reservationDate),
    [settings, form.reservationDate],
  );
  const selectedCalendarDate = form.reservationDate
    ? new Date(`${form.reservationDate}T12:00:00`)
    : undefined;
  const calendarFromDate = availableDates[0]
    ? new Date(`${availableDates[0]}T12:00:00`)
    : undefined;
  const calendarToDate = availableDates[availableDates.length - 1]
    ? new Date(`${availableDates[availableDates.length - 1]}T12:00:00`)
    : undefined;

  const maxPetsPerBooking = getMaxPetsPerBooking(settings);
  const maxPets = Math.max(0, maxPetsPerBooking ?? 20);
  const depositThreshold = settings?.depositThresholdPets ?? 0;
  const requiresDeposit =
    depositThreshold > 0 && form.petCount >= depositThreshold;
  const hasTerms = Boolean(settings?.terms?.trim());
  const hasExtras =
    Boolean(form.customerEmail.trim()) ||
    Boolean(form.petSummary.trim()) ||
    Boolean(form.specialRequest.trim());

  useEffect(() => {
    if (!open) return;
    if (!form.reservationDate && availableDates[0]) {
      setForm((current) => ({ ...current, reservationDate: availableDates[0] }));
    }
  }, [open, availableDates, form.reservationDate]);

  useEffect(() => {
    if (!form.reservationDate) return;
    if (availableTimes.includes(form.reservationTime)) return;
    setForm((current) => ({
      ...current,
      reservationTime: availableTimes[0] || "",
    }));
  }, [form.reservationDate, form.reservationTime, availableTimes]);

  const updateField = <K extends keyof ReservationForm>(
    field: K,
    value: ReservationForm[K],
  ) => {
    setForm((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
    setSubmitError("");
  };

  const resetState = () => {
    setForm(initialForm);
    setFieldErrors({});
    setSubmitError("");
    setIsSubmitting(false);
    setSubmitted(false);
    setShowExtras(false);
    setShowTerms(false);
    setCalendarOpen(false);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) resetState();
    onOpenChange(nextOpen);
  };

  const validate = () => {
    const errors: Partial<Record<keyof ReservationForm, string>> = {};
    const reservationAt = toAwsDateTime(
      form.reservationDate,
      form.reservationTime,
    );

    if (!form.customerName.trim()) {
      errors.customerName = t("restaurantReservation.validation.required");
    }
    if (!form.customerPhone.trim()) {
      errors.customerPhone = t("restaurantReservation.validation.required");
    }
    if (
      form.customerEmail.trim() &&
      !emailPattern.test(form.customerEmail.trim())
    ) {
      errors.customerEmail = t("restaurantReservation.validation.email");
      setShowExtras(true);
    }
    if (!form.reservationDate) {
      errors.reservationDate = t("restaurantReservation.validation.required");
    } else if (
      availableDates.length > 0 &&
      !availableDates.includes(form.reservationDate)
    ) {
      errors.reservationDate = t(
        "restaurantReservation.validation.unavailableDate",
      );
    }
    if (!form.reservationTime) {
      errors.reservationTime = t("restaurantReservation.validation.required");
    } else if (
      !isValidReservationSlot(
        settings,
        form.reservationDate,
        form.reservationTime,
      )
    ) {
      errors.reservationTime = t(
        "restaurantReservation.validation.unavailableTime",
      );
    }
    if (form.reservationDate && form.reservationTime && !reservationAt) {
      errors.reservationDate = t("restaurantReservation.validation.required");
    }
    if (!Number.isInteger(form.partySize) || form.partySize < 1) {
      errors.partySize = t("restaurantReservation.validation.partySize");
    }
    if (!Number.isInteger(form.petCount) || form.petCount < 0) {
      errors.petCount = t("restaurantReservation.validation.petCount");
    } else if (maxPetsPerBooking != null && form.petCount > maxPetsPerBooking) {
      errors.petCount = t("restaurantReservation.validation.maxPets", {
        count: maxPetsPerBooking,
      });
    }
    if (hasTerms && !form.termsAccepted) {
      errors.termsAccepted = t("restaurantReservation.validation.terms");
    }

    setFieldErrors(errors);
    return { valid: Object.keys(errors).length === 0, reservationAt };
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const { valid, reservationAt } = validate();
    if (!valid || !reservationAt) return;

    setIsSubmitting(true);
    setSubmitError("");

    try {
      await onSubmit({
        customerName: form.customerName.trim(),
        customerPhone: form.customerPhone.trim(),
        customerEmail: form.customerEmail.trim(),
        reservationAt,
        partySize: form.partySize,
        petCount: form.petCount,
        petSummary: form.petSummary,
        specialRequest: form.specialRequest,
      });
      setSubmitted(true);
    } catch (error) {
      console.error("Failed to create reservation:", error);
      setSubmitError(
        error instanceof Error
          ? error.message
          : t("restaurantReservation.errorDesc"),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex max-h-[90vh] w-[calc(100%-1.5rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-md">
        {submitted ? (
          <div className="flex flex-col items-center gap-4 px-6 py-10 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-6 w-6" aria-hidden />
            </div>
            <DialogHeader className="space-y-2">
              <DialogTitle className="text-center text-xl tracking-tight">
                {t("restaurantReservation.successTitle")}
              </DialogTitle>
              <DialogDescription className="text-center text-[13px] leading-relaxed">
                {t("restaurantReservation.successDesc", {
                  restaurantName: placeName,
                })}
              </DialogDescription>
            </DialogHeader>
            <Button
              onClick={() => handleOpenChange(false)}
              className="mt-1 h-11 w-full font-semibold"
            >
              {t("restaurantReservation.close")}
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader className="shrink-0 space-y-1 border-b px-5 pb-4 pt-5 pr-12 text-left">
              <DialogTitle className="text-lg tracking-tight">
                {t("restaurantReservation.title")}
              </DialogTitle>
              <DialogDescription className="text-[13px] leading-snug">
                {t("restaurantReservation.subtitle", {
                  restaurantName: placeName,
                })}
              </DialogDescription>
            </DialogHeader>

            <form
              onSubmit={handleSubmit}
              className="flex min-h-0 flex-1 flex-col"
            >
              <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-4">
                {/* When */}
                <section className="space-y-3">
                  <SectionLabel>{t("restaurantReservation.when")}</SectionLabel>

                  {availableDates.length > 0 ? (
                    <div className="flex items-stretch gap-2">
                      <div className="-mx-0.5 flex min-w-0 flex-1 gap-2 overflow-x-auto px-0.5 pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                        {quickDates.map((date) => {
                          const label = formatDateChip(date, i18n.language);
                          const selected = form.reservationDate === date;
                          return (
                            <button
                              key={date}
                              type="button"
                              onClick={() => updateField("reservationDate", date)}
                              className={cn(
                                "flex min-w-[4.25rem] shrink-0 flex-col items-center rounded-xl border px-2.5 py-2 transition-colors duration-150",
                                selected
                                  ? "border-primary bg-primary text-primary-foreground"
                                  : "border-border/80 bg-background hover:border-primary/35",
                              )}
                            >
                              <span className="text-[11px] font-medium opacity-80">
                                {label.weekday}
                              </span>
                              <span className="text-sm font-semibold tabular-nums">
                                {label.day}
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      {availableDates.length > QUICK_DATE_COUNT ? (
                        <Popover
                          open={calendarOpen}
                          onOpenChange={setCalendarOpen}
                          modal
                        >
                          <PopoverTrigger asChild>
                            <button
                              type="button"
                              className={cn(
                                "flex shrink-0 flex-col items-center justify-center gap-0.5 rounded-xl border border-dashed px-2.5 py-2 text-muted-foreground transition-colors duration-150 hover:border-primary/40 hover:text-foreground",
                                calendarOpen && "border-primary/50 text-foreground",
                              )}
                              aria-label={t("restaurantReservation.moreDates")}
                            >
                              <CalendarDays className="h-4 w-4" aria-hidden />
                              <span className="text-[10px] font-medium leading-none">
                                {t("restaurantReservation.moreDates")}
                              </span>
                            </button>
                          </PopoverTrigger>
                          <PopoverContent
                            align="end"
                            sideOffset={8}
                            className="z-[60] w-auto p-0"
                          >
                            <Calendar
                              mode="single"
                              selected={selectedCalendarDate}
                              onSelect={(day) => {
                                if (!day) return;
                                const value = toLocalDateString(day);
                                if (!availableDateSet.has(value)) return;
                                updateField("reservationDate", value);
                                setCalendarOpen(false);
                              }}
                              disabled={(day) =>
                                !availableDateSet.has(toLocalDateString(day))
                              }
                              fromDate={calendarFromDate}
                              toDate={calendarToDate}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      ) : null}
                    </div>
                  ) : (
                    <p className="rounded-lg border border-dashed px-3 py-6 text-center text-[13px] text-muted-foreground">
                      {t("restaurantReservation.noAvailableDates")}
                    </p>
                  )}
                  {fieldErrors.reservationDate && (
                    <FieldError>{fieldErrors.reservationDate}</FieldError>
                  )}

                  {availableDates.length > 0 && (
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="reservation-time"
                        className="text-[12px] text-muted-foreground"
                      >
                        {t("restaurantReservation.reservationTime")}
                      </Label>
                      {availableTimes.length > 0 ? (
                        <Select
                          value={form.reservationTime}
                          onValueChange={(value) =>
                            updateField("reservationTime", value)
                          }
                        >
                          <SelectTrigger
                            id="reservation-time"
                            className="h-11 tabular-nums"
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {availableTimes.map((time) => (
                              <SelectItem
                                key={time}
                                value={time}
                                className="tabular-nums"
                              >
                                {time}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <p className="rounded-lg border border-dashed px-3 py-3 text-[13px] text-muted-foreground">
                          {form.reservationDate
                            ? t("restaurantReservation.noAvailableTimes")
                            : t("restaurantReservation.pickDateFirst")}
                        </p>
                      )}
                      {fieldErrors.reservationTime && (
                        <FieldError>{fieldErrors.reservationTime}</FieldError>
                      )}
                    </div>
                  )}
                </section>

                {/* Party */}
                {availableDates.length > 0 && (
                  <section className="grid grid-cols-2 gap-3">
                    <StepperField
                      label={t("restaurantReservation.partySize")}
                      value={form.partySize}
                      min={1}
                      max={30}
                      onChange={(value) => updateField("partySize", value)}
                      error={fieldErrors.partySize}
                      decreaseLabel={t("restaurantReservation.fewer")}
                      increaseLabel={t("restaurantReservation.more")}
                    />
                    <StepperField
                      label={t("restaurantReservation.petCount")}
                      value={form.petCount}
                      min={0}
                      max={maxPets}
                      onChange={(value) => updateField("petCount", value)}
                      error={fieldErrors.petCount}
                      decreaseLabel={t("restaurantReservation.fewer")}
                      increaseLabel={t("restaurantReservation.more")}
                      hint={
                        maxPets > 0
                          ? t("restaurantReservation.maxPetsHint", {
                              count: maxPets,
                            })
                          : undefined
                      }
                    />
                  </section>
                )}

                {requiresDeposit && (
                  <p className="rounded-lg bg-amber-50 px-3 py-2.5 text-[12px] leading-relaxed text-amber-950">
                    {t("restaurantReservation.depositNotice", {
                      count: depositThreshold,
                    })}
                  </p>
                )}

                {/* Contact */}
                {availableDates.length > 0 && (
                  <section className="space-y-3">
                    <SectionLabel>
                      {t("restaurantReservation.contact")}
                    </SectionLabel>
                    <div className="space-y-2.5">
                      <div className="space-y-1.5">
                        <Label
                          htmlFor="reservation-name"
                          className="text-[12px] text-muted-foreground"
                        >
                          {t("restaurantReservation.customerName")}
                        </Label>
                        <Input
                          id="reservation-name"
                          value={form.customerName}
                          onChange={(event) =>
                            updateField("customerName", event.target.value)
                          }
                          placeholder={t(
                            "restaurantReservation.customerNamePlaceholder",
                          )}
                          autoComplete="name"
                          className="h-11"
                        />
                        {fieldErrors.customerName && (
                          <FieldError>{fieldErrors.customerName}</FieldError>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        <Label
                          htmlFor="reservation-phone"
                          className="text-[12px] text-muted-foreground"
                        >
                          {t("restaurantReservation.customerPhone")}
                        </Label>
                        <Input
                          id="reservation-phone"
                          value={form.customerPhone}
                          onChange={(event) =>
                            updateField("customerPhone", event.target.value)
                          }
                          placeholder={t(
                            "restaurantReservation.customerPhonePlaceholder",
                          )}
                          autoComplete="tel"
                          inputMode="tel"
                          className="h-11"
                        />
                        {fieldErrors.customerPhone && (
                          <FieldError>{fieldErrors.customerPhone}</FieldError>
                        )}
                      </div>
                    </div>

                    <Collapsible open={showExtras} onOpenChange={setShowExtras}>
                      <CollapsibleTrigger asChild>
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground"
                        >
                          <ChevronDown
                            className={cn(
                              "h-3.5 w-3.5 transition-transform duration-150",
                              showExtras && "rotate-180",
                            )}
                            aria-hidden
                          />
                          {hasExtras
                            ? t("restaurantReservation.editExtras")
                            : t("restaurantReservation.addExtras")}
                        </button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="space-y-2.5 pt-3 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-top-1">
                        <div className="space-y-1.5">
                          <Label
                            htmlFor="reservation-email"
                            className="text-[12px] text-muted-foreground"
                          >
                            {t("restaurantReservation.customerEmail")}
                          </Label>
                          <Input
                            id="reservation-email"
                            type="email"
                            value={form.customerEmail}
                            onChange={(event) =>
                              updateField("customerEmail", event.target.value)
                            }
                            placeholder={t(
                              "restaurantReservation.customerEmailPlaceholder",
                            )}
                            autoComplete="email"
                            className="h-11"
                          />
                          {fieldErrors.customerEmail && (
                            <FieldError>{fieldErrors.customerEmail}</FieldError>
                          )}
                        </div>
                        <div className="space-y-1.5">
                          <Label
                            htmlFor="reservation-pet-summary"
                            className="text-[12px] text-muted-foreground"
                          >
                            {t("restaurantReservation.petSummary")}
                          </Label>
                          <Input
                            id="reservation-pet-summary"
                            value={form.petSummary}
                            onChange={(event) =>
                              updateField("petSummary", event.target.value)
                            }
                            placeholder={t(
                              "restaurantReservation.petSummaryPlaceholder",
                            )}
                            className="h-11"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label
                            htmlFor="reservation-request"
                            className="text-[12px] text-muted-foreground"
                          >
                            {t("restaurantReservation.specialRequest")}
                          </Label>
                          <Textarea
                            id="reservation-request"
                            value={form.specialRequest}
                            onChange={(event) =>
                              updateField("specialRequest", event.target.value)
                            }
                            placeholder={t(
                              "restaurantReservation.specialRequestPlaceholder",
                            )}
                            className="min-h-[72px] resize-none"
                          />
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </section>
                )}

                {hasTerms && availableDates.length > 0 && (
                  <section className="space-y-2">
                    <Collapsible open={showTerms} onOpenChange={setShowTerms}>
                      <div className="flex items-start gap-2.5">
                        <Checkbox
                          id="reservation-terms"
                          checked={form.termsAccepted}
                          onCheckedChange={(checked) =>
                            updateField("termsAccepted", checked === true)
                          }
                          className="mt-0.5"
                        />
                        <div className="min-w-0 flex-1 space-y-1">
                          <label
                            htmlFor="reservation-terms"
                            className="cursor-pointer text-[13px] leading-snug"
                          >
                            {t("restaurantReservation.termsAccept")}
                          </label>
                          <CollapsibleTrigger asChild>
                            <button
                              type="button"
                              className="block text-[12px] font-medium text-primary underline-offset-2 hover:underline"
                            >
                              {showTerms
                                ? t("restaurantReservation.hideTerms")
                                : t("restaurantReservation.viewTerms")}
                            </button>
                          </CollapsibleTrigger>
                        </div>
                      </div>
                      <CollapsibleContent className="mt-2 rounded-lg border bg-muted/40 px-3 py-2.5 data-[state=open]:animate-in data-[state=open]:fade-in-0">
                        <p className="max-h-28 overflow-y-auto whitespace-pre-wrap text-[12px] leading-relaxed text-muted-foreground">
                          {settings?.terms}
                        </p>
                      </CollapsibleContent>
                    </Collapsible>
                    {fieldErrors.termsAccepted && (
                      <FieldError>{fieldErrors.termsAccepted}</FieldError>
                    )}
                  </section>
                )}

                {submitError && (
                  <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2.5 text-[13px] text-destructive">
                    {submitError}
                  </div>
                )}
              </div>

              <div className="shrink-0 border-t bg-background px-5 py-3.5">
                <Button
                  type="submit"
                  className="h-11 w-full text-[15px] font-semibold"
                  disabled={isSubmitting || availableDates.length === 0}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2
                        className="mr-2 h-4 w-4 animate-spin"
                        aria-hidden
                      />
                      {t("restaurantReservation.submitting")}
                    </>
                  ) : (
                    t("restaurantReservation.submit")
                  )}
                </Button>
                <p className="mt-2 text-center text-[11px] leading-relaxed text-muted-foreground">
                  {t("restaurantReservation.notice")}
                </p>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
      {children}
    </p>
  );
}

function FieldError({ children }: { children: ReactNode }) {
  return <p className="text-[12px] text-destructive">{children}</p>;
}

function StepperField({
  label,
  value,
  min,
  max,
  onChange,
  error,
  decreaseLabel,
  increaseLabel,
  hint,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  error?: string;
  decreaseLabel: string;
  increaseLabel: string;
  hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <p className="text-[12px] font-medium text-muted-foreground">{label}</p>
      <div className="flex h-11 items-center justify-between rounded-xl border border-border/80 px-1">
        <button
          type="button"
          className="grid h-9 w-9 place-content-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-30"
          disabled={value <= min}
          onClick={() => onChange(Math.max(min, value - 1))}
          aria-label={decreaseLabel}
        >
          <Minus className="h-3.5 w-3.5" />
        </button>
        <span className="text-base font-semibold tabular-nums">{value}</span>
        <button
          type="button"
          className="grid h-9 w-9 place-content-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-30"
          disabled={value >= max}
          onClick={() => onChange(Math.min(max, value + 1))}
          aria-label={increaseLabel}
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>
      {hint ? (
        <p className="text-[11px] text-muted-foreground">{hint}</p>
      ) : null}
      {error ? <FieldError>{error}</FieldError> : null}
    </div>
  );
}
