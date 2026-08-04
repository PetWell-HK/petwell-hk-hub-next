import { useMemo, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  Baby,
  Check,
  ChevronDown,
  Coffee,
  Footprints,
  Link2,
  MapPin,
  Scale,
  Train,
} from "lucide-react";
import type { Mall } from "@/services/mallApi";
import {
  getMallMovementLabel,
  getMallPetsAllowedLabel,
} from "@/services/mallApi";
import {
  formatMallFloorLabel,
  formatMallZoneType,
} from "@/utils/mallPublicCopy";

type Lang = "zh" | "en";

const NOTE_PREVIEW_LEN = 120;

function notesRepeatDeposit(notes: string, depositHkd: number | null | undefined) {
  if (!notes || depositHkd == null) return false;
  const digits = String(depositHkd);
  return notes.includes(digits) && /按金|deposit/i.test(notes);
}

function SoftTag({ label }: { label: string }) {
  return <span className="mall-soft-tag">{label}</span>;
}

function ExpandableNote({ text }: { text: string }) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const needsExpand = text.length > NOTE_PREVIEW_LEN;
  const shown =
    !needsExpand || expanded ? text : `${text.slice(0, NOTE_PREVIEW_LEN).trim()}…`;

  return (
    <div className="mt-2 space-y-1">
      <p className="text-sm leading-relaxed text-muted-foreground">{shown}</p>
      {needsExpand ? (
        <button
          type="button"
          className="inline-flex items-center gap-0.5 text-xs font-medium text-foreground/70 transition-colors hover:text-foreground"
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded
            ? t("mallPlaces.detail.showLess")
            : t("mallPlaces.detail.showMore")}
          <ChevronDown
            className={`h-3.5 w-3.5 transition-transform ${expanded ? "rotate-180" : ""}`}
            aria-hidden
          />
        </button>
      ) : null}
    </div>
  );
}

function SectionLabel({ children }: { children: ReactNode }) {
  return <p className="mall-section-label mb-2.5">{children}</p>;
}

function FactRow({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: ReactNode;
  icon?: LucideIcon;
}) {
  return (
    <div className="flex items-start gap-3 py-2.5">
      {Icon ? (
        <Icon
          className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground"
          aria-hidden
        />
      ) : null}
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <div className="mt-0.5 text-sm font-medium leading-relaxed text-foreground">
          {value}
        </div>
      </div>
    </div>
  );
}

interface MallPolicySectionProps {
  mall: Mall;
  lang: Lang;
}

export function MallPolicySection({ mall, lang }: MallPolicySectionProps) {
  const { t } = useTranslation();
  const policy = mall.petPolicy;
  const common = policy?.commonArea;

  const ruleItems = useMemo(() => {
    const items: Array<{ key: string; icon: LucideIcon; label: string }> = [];
    if (common?.leashRequired === true) {
      items.push({
        key: "leash",
        icon: Link2,
        label: t("mallPlaces.detail.ruleLeash"),
      });
    }
    if (common?.carrierOrStrollerOrHeldRequired === true) {
      items.push({
        key: "carrier",
        icon: Baby,
        label: t("mallPlaces.detail.ruleCarrier"),
      });
    } else if (common?.carrierOrStrollerOrHeldRequired === false) {
      items.push({
        key: "carrier-ok",
        icon: Check,
        label: t("mallPlaces.detail.ruleNoCarrier"),
      });
    }
    if (common?.muzzleSuggestedForLargeDogs === true) {
      items.push({
        key: "muzzle",
        icon: AlertTriangle,
        label: t("mallPlaces.detail.ruleMuzzle"),
      });
    }
    if (common?.maxWeightKg != null) {
      items.push({
        key: "weight",
        icon: Scale,
        label: t("mallPlaces.detail.ruleMaxWeight", { kg: common.maxWeightKg }),
      });
    }
    return items;
  }, [common, t]);

  const facilityItems = useMemo(() => {
    const items: Array<{ key: string; label: string; detail: string }> = [];

    if (policy?.amenities?.petParkOrGarden === true) {
      items.push({
        key: "park",
        label: t("mallPlaces.detail.amenityPark"),
        detail: policy.amenities.petParkLocation || t("mallPlaces.detail.tagPetPark"),
      });
    }
    if (policy?.diningAvailable === true || (policy?.diningVenues?.length ?? 0) > 0) {
      const count = policy?.diningVenues?.length ?? 0;
      items.push({
        key: "dining",
        label: t("mallPlaces.detail.amenityDining"),
        detail:
          count > 0
            ? t("mallPlaces.detail.venueCount", { count })
            : t("mallPlaces.detail.tagDiningYes"),
      });
    } else if (policy?.diningAvailable === false) {
      items.push({
        key: "dining-no",
        label: t("mallPlaces.detail.amenityDining"),
        detail: t("mallPlaces.detail.tagDiningNo"),
      });
    }
    if (policy?.stroller) {
      items.push({
        key: "stroller",
        label: t("mallPlaces.detail.amenityStroller"),
        detail:
          policy.stroller.depositHkd != null
            ? t("mallPlaces.detail.depositAmount", {
                amount: policy.stroller.depositHkd,
              })
            : t("mallPlaces.detail.tagStroller"),
      });
    } else if (policy?.strollerUnavailable) {
      items.push({
        key: "stroller-no",
        label: t("mallPlaces.detail.amenityStroller"),
        detail: t("mallPlaces.detail.tagStrollerNo"),
      });
    }
    if (policy?.amenities?.petToilet === true) {
      items.push({
        key: "toilet",
        label: t("mallPlaces.detail.amenityToilet"),
        detail: t("mallPlaces.detail.tagPetToilet"),
      });
    }
    if (mall.parking?.hasOwnCarPark === true || mall.parkingWebsite) {
      const rate =
        mall.parking?.weekdayRateHkd != null
          ? t("mallPlaces.detail.ratePerHour", {
              amount: mall.parking.weekdayRateHkd,
            })
          : t("mallPlaces.detail.tagParking");
      items.push({
        key: "parking",
        label: t("mallPlaces.detail.amenityParking"),
        detail: rate,
      });
    }
    return items;
  }, [policy, mall.parking, mall.parkingWebsite, t]);

  const hasWalk = (policy?.walkZones.length ?? 0) > 0;
  const hasRestricted = (policy?.restrictedZones.length ?? 0) > 0;
  const hasStrollerDetail = !!policy?.stroller;
  const hasDiningVenues = (policy?.diningVenues.length ?? 0) > 0;
  const hasMtr = !!mall.mtrAccess?.trim();
  const parking = mall.parking;
  const hasParkingDetails =
    !!parking &&
    (parking.weekdayRateHkd != null ||
      parking.weekendRateHkd != null ||
      parking.heightLimitM != null ||
      !!parking.tips);

  const noteLines: string[] = [];
  if (common?.sizeLimitNotes) noteLines.push(common.sizeLimitNotes);
  if (policy?.diningNotes) noteLines.push(policy.diningNotes);
  if (policy?.amenities?.other) noteLines.push(policy.amenities.other);
  if (
    policy?.stroller?.notes &&
    !notesRepeatDeposit(policy.stroller.notes, policy.stroller.depositHkd)
  ) {
    noteLines.push(policy.stroller.notes);
  }
  if (mall.petPolicyNotes) noteLines.push(mall.petPolicyNotes);

  const hasAnything =
    ruleItems.length > 0 ||
    facilityItems.length > 0 ||
    hasWalk ||
    hasRestricted ||
    hasStrollerDetail ||
    hasDiningVenues ||
    hasMtr ||
    hasParkingDetails ||
    noteLines.length > 0 ||
    !!mall.petsAllowed;

  if (!hasAnything) {
    return (
      <div>
        <h2 className="mall-title text-2xl md:text-[1.75rem]">
          {t("mallPlaces.detail.policyTitle")}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("mallPlaces.detail.policySubtitle")}
        </p>
      </div>
    );
  }

  const petsAllowedLabel = getMallPetsAllowedLabel(mall.petsAllowed, lang);
  const movementLabel = getMallMovementLabel(mall.petMovementMode, lang);
  const isWelcome = mall.petsAllowed === "YES";
  const isNoPets = mall.petsAllowed === "NO";

  return (
    <div className="space-y-7 md:space-y-8">
      {/* Header + verdict */}
      <div>
        <p className="mall-kicker">{t("mallPlaces.detail.visitGuideTitle")}</p>
        <h2 className="mall-title mt-1.5 text-2xl md:text-[1.75rem]">
          {petsAllowedLabel}
        </h2>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {t("mallPlaces.detail.policySubtitle")}
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <span
            className={
              isWelcome
                ? "mall-identity-pill mall-identity-pill--emphasis"
                : "mall-identity-pill"
            }
          >
            {isNoPets ? (
              <AlertTriangle className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
            ) : (
              <Check className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
            )}
            {petsAllowedLabel}
          </span>
          <span className="mall-identity-pill">
            <Footprints className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
            {movementLabel}
          </span>
        </div>
      </div>

      {/* Before you go */}
      {ruleItems.length > 0 ? (
        <div>
          <SectionLabel>{t("mallPlaces.detail.rulesTitle")}</SectionLabel>
          <ul className="divide-y divide-[hsl(var(--mall-line))] rounded-xl border border-[hsl(var(--mall-line))] bg-[hsl(var(--mall-canvas))]/60">
            {ruleItems.map((item) => {
              const Icon = item.icon;
              return (
                <li
                  key={item.key}
                  className="flex items-center gap-3 px-3.5 py-3 text-sm font-medium text-foreground"
                >
                  <Icon
                    className="h-4 w-4 shrink-0 text-muted-foreground"
                    aria-hidden
                  />
                  {item.label}
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}

      {/* Facilities at a glance */}
      {facilityItems.length > 0 ? (
        <div>
          <SectionLabel>{t("mallPlaces.detail.facilitiesTitle")}</SectionLabel>
          <dl className="grid overflow-hidden rounded-xl border border-[hsl(var(--mall-line))] sm:grid-cols-2">
            {facilityItems.map((item, index) => {
              const isLast = index === facilityItems.length - 1;
              const isOddLone =
                facilityItems.length % 2 === 1 && isLast;
              return (
                <div
                  key={item.key}
                  className={[
                    "bg-[hsl(var(--mall-panel))] px-3.5 py-3",
                    index >= 2 ? "border-t border-[hsl(var(--mall-line))]" : "",
                    index % 2 === 1
                      ? "sm:border-l sm:border-[hsl(var(--mall-line))]"
                      : "",
                    isOddLone ? "sm:col-span-2" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    {item.label}
                  </dt>
                  <dd className="mt-1 text-sm font-semibold text-foreground">
                    {item.detail}
                  </dd>
                </div>
              );
            })}
          </dl>
        </div>
      ) : null}

      {/* Walk zones */}
      {hasWalk ? (
        <div>
          <div className="mb-2.5 flex items-baseline justify-between gap-3">
            <p className="mall-section-label">{t("mallPlaces.detail.walkZonesTitle")}</p>
            <span className="text-xs text-muted-foreground">
              {t("mallPlaces.detail.zoneCount", {
                count: policy!.walkZones.length,
              })}
            </span>
          </div>
          <div className="space-y-2">
            {policy!.walkZones.map((zone) => {
              const zoneTypeLabel = formatMallZoneType(zone.zoneType, t);
              return (
                <div
                  key={`${zone.label}-${zone.floors.join("-")}`}
                  className="mall-zone-card"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">
                      {zone.label}
                    </span>
                    {zone.floors.map((floor) => (
                      <SoftTag
                        key={floor}
                        label={formatMallFloorLabel(floor, lang, t)}
                      />
                    ))}
                    {zoneTypeLabel ? <SoftTag label={zoneTypeLabel} /> : null}
                  </div>
                  {zone.notes && zone.notes !== zone.label ? (
                    <ExpandableNote text={zone.notes} />
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* Restricted */}
      {hasRestricted ? (
        <div>
          <SectionLabel>{t("mallPlaces.detail.restrictedTitle")}</SectionLabel>
          <div className="space-y-2">
            {policy!.restrictedZones.map((zone) => (
              <div key={zone.label} className="mall-zone-card mall-zone-card--restricted">
                <div className="flex items-start gap-2">
                  <AlertTriangle
                    className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground"
                    aria-hidden
                  />
                  <div>
                    <p className="text-sm font-semibold text-foreground">{zone.label}</p>
                    {zone.notes && zone.notes !== zone.label ? (
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                        {zone.notes}
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Dining */}
      {hasDiningVenues ? (
        <div>
          <div className="mb-2.5 flex items-baseline justify-between gap-3">
            <p className="mall-section-label">{t("mallPlaces.detail.diningVenues")}</p>
            <span className="text-xs text-muted-foreground">
              {t("mallPlaces.detail.venueCount", {
                count: policy!.diningVenues.length,
              })}
            </span>
          </div>
          <ul className="divide-y divide-[hsl(var(--mall-line))] rounded-xl border border-[hsl(var(--mall-line))]">
            {policy!.diningVenues.map((venue) => {
              const floorLabel = venue.floor
                ? formatMallFloorLabel(venue.floor, lang, t)
                : "";
              return (
                <li
                  key={`${venue.name}-${venue.floor || ""}`}
                  className="flex items-center gap-3 px-3.5 py-3"
                >
                  <Coffee
                    className="h-4 w-4 shrink-0 text-muted-foreground"
                    aria-hidden
                  />
                  <span className="min-w-0 flex-1 text-sm font-medium text-foreground">
                    {venue.name}
                  </span>
                  {floorLabel ? <SoftTag label={floorLabel} /> : null}
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}

      {/* Stroller */}
      {hasStrollerDetail && policy?.stroller ? (
        <div>
          <SectionLabel>{t("mallPlaces.detail.strollerTitle")}</SectionLabel>
          <div className="rounded-xl border border-[hsl(var(--mall-line))] bg-[hsl(var(--mall-canvas))]/60 px-3.5">
            {policy.stroller.depositHkd != null ? (
              <FactRow
                label={t("mallPlaces.detail.depositLabel")}
                value={`HK$${policy.stroller.depositHkd}`}
              />
            ) : null}
            {policy.stroller.requiresMembership || policy.stroller.membershipName ? (
              <FactRow
                label={t("mallPlaces.detail.membership")}
                value={
                  policy.stroller.membershipName ||
                  t("mallPlaces.detail.membershipRequired")
                }
              />
            ) : null}
            {policy.stroller.locations.length > 0 ? (
              <div className="flex items-start gap-3 py-2.5">
                <MapPin
                  className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground"
                  aria-hidden
                />
                <p className="text-sm font-medium leading-relaxed text-foreground">
                  {policy.stroller.locations.join(" · ")}
                </p>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {/* Getting there */}
      {hasMtr || hasParkingDetails ? (
        <div>
          <SectionLabel>{t("mallPlaces.detail.gettingThere")}</SectionLabel>
          <div className="rounded-xl border border-[hsl(var(--mall-line))] bg-[hsl(var(--mall-canvas))]/60 px-3.5">
            {hasMtr ? (
              <FactRow
                icon={Train}
                label={t("mallPlaces.mtrAccess")}
                value={mall.mtrAccess}
              />
            ) : null}

            {hasParkingDetails && parking ? (
              <div
                className={
                  hasMtr
                    ? "border-t border-[hsl(var(--mall-line))] py-3"
                    : "py-3"
                }
              >
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  {t("mallPlaces.detail.parkingDetails")}
                </p>
                {(parking.weekdayRateHkd != null ||
                  parking.weekendRateHkd != null) && (
                  <div className="mt-2 grid grid-cols-2 gap-3">
                    {parking.weekdayRateHkd != null ? (
                      <div>
                        <p className="text-xs text-muted-foreground">
                          {t("mallPlaces.detail.weekdayRate")}
                        </p>
                        <p className="mt-0.5 text-lg font-semibold tracking-tight text-foreground">
                          HK${parking.weekdayRateHkd}
                          <span className="ml-1 text-xs font-medium text-muted-foreground">
                            {t("mallPlaces.detail.perHour")}
                          </span>
                        </p>
                      </div>
                    ) : null}
                    {parking.weekendRateHkd != null ? (
                      <div>
                        <p className="text-xs text-muted-foreground">
                          {t("mallPlaces.detail.weekendRate")}
                        </p>
                        <p className="mt-0.5 text-lg font-semibold tracking-tight text-foreground">
                          HK${parking.weekendRateHkd}
                          <span className="ml-1 text-xs font-medium text-muted-foreground">
                            {t("mallPlaces.detail.perHour")}
                          </span>
                        </p>
                      </div>
                    ) : null}
                  </div>
                )}
                {parking.heightLimitM != null ? (
                  <p className="mt-2 text-sm text-muted-foreground">
                    {t("mallPlaces.detail.heightLimitValue", {
                      meters: parking.heightLimitM,
                    })}
                  </p>
                ) : null}
                {parking.tips ? (
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {parking.tips}
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {noteLines.length > 0 ? (
        <div>
          <SectionLabel>{t("mallPlaces.detail.notesTitle")}</SectionLabel>
          <div className="space-y-1.5 text-sm leading-relaxed text-muted-foreground">
            {noteLines.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
