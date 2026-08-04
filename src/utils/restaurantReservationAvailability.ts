import type { RestaurantReservationSettings } from '@/services/restaurantApi';

const DAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;

export type DayKey = (typeof DAYS)[number];

export type ReservationInterval = { open: string; close: string };

export type DayReservationWindow = {
  enabled: boolean;
  intervals?: ReservationInterval[];
  /** @deprecated legacy single-interval fields */
  open?: string;
  close?: string;
};

export type NormalizedDayReservationWindow = {
  enabled: boolean;
  intervals: ReservationInterval[];
};

export function parseReservationSettings(
  value: RestaurantReservationSettings | string | null | undefined,
): RestaurantReservationSettings | null {
  if (!value) return null;
  try {
    const parsed = typeof value === 'string' ? JSON.parse(value) : value;
    return parsed && typeof parsed === 'object' ? (parsed as RestaurantReservationSettings) : null;
  } catch {
    return null;
  }
}

export function normalizeDayWindow(
  dayWindow: DayReservationWindow | null | undefined,
): NormalizedDayReservationWindow {
  const raw = dayWindow;
  if (!raw || typeof raw !== 'object') {
    return { enabled: false, intervals: [{ open: '11:00', close: '21:00' }] };
  }

  const enabled = Boolean(raw.enabled);
  if (Array.isArray(raw.intervals) && raw.intervals.length > 0) {
    return {
      enabled,
      intervals: raw.intervals
        .map((interval) => ({
          open: String(interval?.open || '').trim(),
          close: String(interval?.close || '').trim(),
        }))
        .filter((interval) => interval.open && interval.close),
    };
  }

  if (raw.open && raw.close) {
    return {
      enabled,
      intervals: [{ open: String(raw.open), close: String(raw.close) }],
    };
  }

  return { enabled, intervals: [{ open: '11:00', close: '21:00' }] };
}

export function getMaxPetsPerBooking(
  settings: RestaurantReservationSettings | null | undefined,
): number | null {
  if (!settings) return null;
  if (typeof settings.maxPetsPerBooking === 'number') return settings.maxPetsPerBooking;
  if (typeof settings.maxPetsPerSlot === 'number') return settings.maxPetsPerSlot;
  return null;
}

/** True when the place is connected to an approved Partner Hub merchant. */
export function canShowPartnerBooking(
  ownerSub: string | null | undefined,
  reservationSettings?: RestaurantReservationSettings | string | null,
): boolean {
  const connectedOwnerSub = ownerSub?.trim();
  // Partner Hub sets place.ownerSub only after application approval + admin connect.
  if (!connectedOwnerSub) return false;
  if (/^(unassigned|null|undefined)$/i.test(connectedOwnerSub)) return false;

  const settings = parseReservationSettings(reservationSettings);
  // Explicit global off switch (if present on saved rules).
  if (settings && 'enabled' in settings && (settings as { enabled?: boolean }).enabled === false) {
    return false;
  }
  // Claimed but booking rules not saved yet → still show CTA (dialog uses default hours).
  if (!settings?.window) return true;
  // If rules exist, require at least one enabled day.
  return Object.values(settings.window).some((day) => day?.enabled);
}

function pad(n: number) {
  return String(n).padStart(2, '0');
}

export function toLocalDateString(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function timeToMinutes(value: string) {
  const match = /^(\d{2}):(\d{2})$/.exec(value);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;
  return hours * 60 + minutes;
}

export function minutesToTime(total: number) {
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  return `${pad(hours)}:${pad(minutes)}`;
}

function dayForDate(value: string): DayKey | null {
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime()) ? null : DAYS[date.getDay()];
}

function earliestBookableDate(cutoffMinutes: number) {
  const earliest = new Date();
  earliest.setMinutes(earliest.getMinutes() + cutoffMinutes);
  return earliest;
}

export function listAvailableDates(
  settings: RestaurantReservationSettings | null,
  options: { daysAhead?: number; cutoffMinutes?: number } = {},
): string[] {
  const daysAhead = options.daysAhead ?? 30;
  const cutoffMinutes = options.cutoffMinutes ?? settings?.cutoffMinutes ?? 30;
  const earliest = earliestBookableDate(cutoffMinutes);
  const blackouts = new Set(settings?.blackoutDates ?? []);
  const dates: string[] = [];

  for (let offset = 0; offset < daysAhead; offset += 1) {
    const date = new Date(earliest);
    date.setHours(12, 0, 0, 0);
    date.setDate(earliest.getDate() + offset);
    const dateValue = toLocalDateString(date);
    if (blackouts.has(dateValue)) continue;

    const day = dayForDate(dateValue);
    if (!day) continue;

    if (settings?.window) {
      const window = settings.window[day];
      if (!window?.enabled) continue;
      const slots = listAvailableTimes(settings, dateValue, { cutoffMinutes });
      if (slots.length === 0) continue;
    }

    dates.push(dateValue);
  }

  return dates;
}

export function listAvailableTimes(
  settings: RestaurantReservationSettings | null,
  dateValue: string,
  options: { cutoffMinutes?: number } = {},
): string[] {
  if (!dateValue) return [];

  const cutoffMinutes = options.cutoffMinutes ?? settings?.cutoffMinutes ?? 30;
  const slotMinutes = settings?.slotMinutes && settings.slotMinutes > 0 ? settings.slotMinutes : 30;
  const day = dayForDate(dateValue);
  if (!day) return [];

  if (settings?.blackoutDates?.includes(dateValue)) return [];

  let intervals: ReservationInterval[];
  if (!settings?.window) {
    intervals = [{ open: '11:00', close: '21:00' }];
  } else {
    const dayWindow = normalizeDayWindow(settings.window[day]);
    if (!dayWindow.enabled || dayWindow.intervals.length === 0) return [];
    intervals = dayWindow.intervals;
  }

  const earliest = earliestBookableDate(cutoffMinutes);
  const earliestDate = toLocalDateString(earliest);
  const earliestMinutes = earliest.getHours() * 60 + earliest.getMinutes();

  const times: string[] = [];
  for (const interval of intervals) {
    const openMinutes = timeToMinutes(interval.open);
    const closeMinutes = timeToMinutes(interval.close);
    if (openMinutes === null || closeMinutes === null || closeMinutes <= openMinutes) continue;

    for (let cursor = openMinutes; cursor + slotMinutes <= closeMinutes; cursor += slotMinutes) {
      if (dateValue < earliestDate) continue;
      if (dateValue === earliestDate && cursor < earliestMinutes) continue;
      times.push(minutesToTime(cursor));
    }
  }

  return [...new Set(times)].sort();
}

export function isValidReservationSlot(
  settings: RestaurantReservationSettings | null,
  dateValue: string,
  timeValue: string,
): boolean {
  if (!dateValue || !timeValue) return false;
  return listAvailableTimes(settings, dateValue).includes(timeValue);
}
