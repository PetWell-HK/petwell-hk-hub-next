// Types
export interface TimeSlot {
  start?: string | null;
  end?: string | null;
}

export interface NormalizedAvailableHours {
  mon: TimeSlot[];
  tue: TimeSlot[];
  wed: TimeSlot[];
  thu: TimeSlot[];
  fri: TimeSlot[];
  sat: TimeSlot[];
  sun: TimeSlot[];
  otherConditions?: string;
}

type DayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

const DAYS: DayKey[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

// Normalize available hours from various formats (GraphQL, DynamoDB, OpenSearch)
export function normalizeAvailableHours(availableHours: unknown): NormalizedAvailableHours | null {
  if (!availableHours || typeof availableHours !== 'object') return null;

  const hours = availableHours as Record<string, unknown>;
  const normalized: NormalizedAvailableHours = {
    mon: [],
    tue: [],
    wed: [],
    thu: [],
    fri: [],
    sat: [],
    sun: [],
  };

  // Check for OpenSearch flat format
  const hasFlatKeys = Object.keys(hours).some(
    (key) =>
      typeof key === 'string' &&
      key.includes('availableHours.') &&
      (key.includes('.start') || key.includes('.end'))
  );

  if (hasFlatKeys) {
    // Transform flat format to nested format
    for (const day of DAYS) {
      normalized[day] = [];
      const startKey = `availableHours.${day}.start`;
      const endKey = `availableHours.${day}.end`;

      let slotIndex = 0;
      while (
        hours[`${startKey}[${slotIndex}]`] ||
        hours[`${endKey}[${slotIndex}]`]
      ) {
        const start = (hours[`${startKey}[${slotIndex}]`] || hours[startKey]) as string | undefined;
        const end = (hours[`${endKey}[${slotIndex}]`] || hours[endKey]) as string | undefined;
        if (start || end) {
          normalized[day].push({ start, end });
        }
        slotIndex++;
      }

      // Fallback: single keys without index
      if (normalized[day].length === 0 && (hours[startKey] || hours[endKey])) {
        normalized[day].push({
          start: hours[startKey] as string | undefined,
          end: hours[endKey] as string | undefined,
        });
      }
    }
    return normalized;
  }

  // Check for DynamoDB format
  let isDynamoDBFormat = false;
  for (const day of DAYS) {
    const dayData = hours[day];
    if (dayData && typeof dayData === 'object' && !Array.isArray(dayData) && 'L' in (dayData as object)) {
      isDynamoDBFormat = true;
      break;
    }
  }

  if (isDynamoDBFormat) {
    // Convert DynamoDB format
    for (const day of DAYS) {
      const dayData = hours[day] as { L?: Array<{ M?: { start?: { S?: string }; end?: { S?: string } } }> } | undefined;
      if (!dayData) {
        normalized[day] = [];
        continue;
      }

      if (typeof dayData === 'object' && 'L' in dayData) {
        const listData = dayData.L;
        if (!Array.isArray(listData) || listData.length === 0) {
          normalized[day] = [];
          continue;
        }

        normalized[day] = listData
          .map((item): TimeSlot | null => {
            if (!item || typeof item !== 'object') return null;

            if (item.M && typeof item.M === 'object') {
              const start = item.M.start?.S ?? (item.M.start as unknown as string) ?? null;
              const end = item.M.end?.S ?? (item.M.end as unknown as string) ?? null;
              return { start, end };
            }

            const simpleItem = item as unknown as { start?: string; end?: string };
            if (simpleItem.start || simpleItem.end) {
              return { start: simpleItem.start ?? null, end: simpleItem.end ?? null };
            }
            return null;
          })
          .filter((item): item is TimeSlot => item !== null && (!!item?.start || !!item?.end));
      } else {
        normalized[day] = [];
      }
    }
  } else {
    // Already normalized or needs minor cleanup
    for (const day of DAYS) {
      const dayData = hours[day];
      if (dayData === null || dayData === undefined) {
        normalized[day] = [];
      } else if (Array.isArray(dayData)) {
        normalized[day] = dayData;
      } else if (typeof dayData === 'object' && ('start' in (dayData as object) || 'end' in (dayData as object))) {
        // Single object, wrap in array
        normalized[day] = [dayData as TimeSlot];
      } else {
        normalized[day] = [];
      }
    }
  }

  // Preserve otherConditions
  if (hours.otherConditions) {
    const otherCond = hours.otherConditions as { S?: string } | string;
    normalized.otherConditions =
      typeof otherCond === 'object' && 'S' in otherCond
        ? otherCond.S
        : (otherCond as string);
  }

  return normalized;
}

// Get today's opening hours
export function getTodayOpeningHours(
  availableHours: unknown,
  is247 = false,
  t?: (key: string) => string
): string | null {
  // If 24/7, return immediately
  if (is247) {
    return t ? t('hours.open247') : 'Open 24/7';
  }

  if (!availableHours) return null;

  const normalized = normalizeAvailableHours(availableHours);
  if (!normalized) return null;

  // Get today's day key (0 = Sunday, 1 = Monday, etc.)
  const day = new Date().getDay();
  const dayMap: Record<number, DayKey> = {
    0: 'sun',
    1: 'mon',
    2: 'tue',
    3: 'wed',
    4: 'thu',
    5: 'fri',
    6: 'sat',
  };
  const todayKey = dayMap[day];
  const todaySlots = normalized[todayKey];

  if (!todaySlots || (Array.isArray(todaySlots) && todaySlots.length === 0)) {
    return null;
  }

  // Format time slots
  const entries = Array.isArray(todaySlots) ? todaySlots : [todaySlots];
  const ranges = entries
    .map((entry) => {
      if (!entry) return null;
      const start = entry.start ?? null;
      const end = entry.end ?? null;
      if (!start && !end) return null;
      return `${start ?? ''}${start && end ? ' - ' : ''}${end ?? ''}`;
    })
    .filter(Boolean);

  return ranges.length > 0 ? ranges.join(', ') : null;
}

// Format all opening hours for display
export function formatAvailableHours(
  availableHours: unknown,
  t: (key: string) => string,
  is247 = false,
  language: string = 'zh',
): string {
  // If 24/7, return immediately
  if (is247) {
    return t('hours.open247');
  }

  if (!availableHours) {
    return t('hours.noInfo');
  }

  const normalized = normalizeAvailableHours(availableHours);
  if (!normalized) {
    return t('hours.noInfo');
  }

  const lines: string[] = [];

  for (const day of DAYS) {
    const dayVal = normalized[day];

    // Skip if null, undefined, or empty array
    if (!dayVal || (Array.isArray(dayVal) && dayVal.length === 0)) {
      continue;
    }

    // Accept either a single object or an array of objects
    const entries = Array.isArray(dayVal) ? dayVal : [dayVal];

    const ranges = entries
      .map((entry) => {
        if (!entry || typeof entry !== 'object') return null;
        const start = entry.start ?? null;
        const end = entry.end ?? null;
        if (!start && !end) return null;
        return `${start ?? ''}${start && end ? ' - ' : ''}${end ?? ''}`;
      })
      .filter(Boolean);

    if (ranges.length > 0) {
      lines.push(`${t(`hours.${day}`)}: ${ranges.join(', ')}`);
    }
  }

  if (normalized.otherConditions) {
    lines.push(
      localizeOpeningHoursText(String(normalized.otherConditions), language),
    );
  }

  if (lines.length === 0) {
    return t('hours.noInfo');
  }

  return lines.join('\n');
}

// Get normalized hours for rendering in components
export function getFormattedHoursForDay(
  normalizedHours: NormalizedAvailableHours | null,
  day: DayKey
): string | null {
  if (!normalizedHours) return null;

  const daySlots = normalizedHours[day];
  if (!daySlots || daySlots.length === 0) return null;

  const ranges = daySlots
    .map((slot) => {
      if (!slot.start && !slot.end) return null;
      return `${slot.start ?? ''}${slot.start && slot.end ? ' - ' : ''}${slot.end ?? ''}`;
    })
    .filter(Boolean);

  return ranges.length > 0 ? ranges.join(', ') : null;
}

/**
 * Localize common English fragments in free-text opening-hours strings
 * (e.g. otherConditions / mall summaries that contain "daily").
 */
export function localizeOpeningHoursText(
  text: string | null | undefined,
  language: string = 'zh',
): string {
  if (!text) return '';
  const isEn = language.toLowerCase().startsWith('en');
  if (isEn) return text;

  return text
    .replace(/\bdaily\b/gi, '每日')
    .replace(/\bunverified\b/gi, '未確認')
    .replace(/\bapproximate\b/gi, '約')
    .replace(/\bCustomer Service Counter hours, likely mall hours\b/gi, '顧客服務時間，預計與商場相同')
    .replace(/\bfrom Trip\.com\b/gi, '資料來自 Trip.com')
    .replace(/\bEve of Public Holidays\b/gi, '公眾假期前夕')
    .replace(/\bShops:\s*/gi, '商店：')
    .replace(/\bRestaurants:\s*/gi, '餐廳：')
    .replace(/\bSun(?:day)?\s*[-–—]\s*Thu(?:rsday)?\b/gi, '星期日至四')
    .replace(/\bFri(?:day)?\s*[-–—]\s*Sat(?:urday)?\b/gi, '星期五至六')
    .replace(/\bMon(?:day)?\s*[-–—]\s*Thu(?:rsday)?\b/gi, '星期一至四')
    .replace(/\bFri(?:day)?\s*[-–—]\s*Sun(?:day)?\b/gi, '星期五至日')
    .replace(/\bMonday to Friday\b/gi, '星期一至五')
    .replace(/\bSaturday, Sunday & Public Holiday\b/gi, '星期六日及公眾假期')
    .replace(/\bPublic Holiday\b/gi, '公眾假期');
}
