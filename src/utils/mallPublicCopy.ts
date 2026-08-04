/** Research / call-log phrasing that should never appear in public UI. */
const INTERNAL_NOTE_PATTERN =
  /未讀出|未報出|未說|未主動|未全列|未提供店名|未提供具體|未完整|店名未全|第五間未清|讀出|通話中|通話顯示|通話|職員舉例|職員讀出|職員可|職員稱|職員表示|職員提到|職員手頭|代查|心水店名|金額未|手頭無|手頭亦無|不太清楚具體|完整list|official\s*website|IVR|檔名|依檔名|誤稱|前後不一|要覆電|改口/i;

const INCOMPLETE_VENUE_PATTERN = /店名未全|未全|一兩間餐廳|^bakery$|^Pizza$/i;

export function isInternalResearchNote(text: string | null | undefined): boolean {
  const value = text?.trim();
  if (!value) return true;
  return INTERNAL_NOTE_PATTERN.test(value);
}

export function isIncompleteVenueName(text: string | null | undefined): boolean {
  const value = text?.trim();
  if (!value) return true;
  return INCOMPLETE_VENUE_PATTERN.test(value);
}

/** Strip staff-call attribution while keeping the useful policy sentence. */
export function sanitizePublicNote(text: string | null | undefined): string {
  if (!text?.trim()) return '';
  if (isInternalResearchNote(text)) return '';

  return text
    .replace(/^(職員稱|職員表示)[：:\s]*/u, '')
    .replace(/\bground floor\b/gi, '地下')
    .replace(/\bfood court\b/gi, '美食廣場')
    .replace(/\bpet friendly\b/gi, '寵物友善')
    .replace(/\s+/g, ' ')
    .trim();
}

export function formatMallFloorLabel(
  floor: string,
  _lang: 'zh' | 'en',
  t: (key: string, options?: Record<string, unknown>) => string,
): string {
  const raw = floor.trim();
  if (!raw) return '';

  // Already localized labels like 一期 / 天台 / G/F
  if (/[樓期層]|天台|地下|G\/F|B\d/i.test(raw) || /期$/.test(raw)) {
    return raw;
  }

  if (/^(G|GF|LG|UG)$/i.test(raw)) {
    return t('mallPlaces.detail.floorGround');
  }

  if (/^\d+$/.test(raw)) {
    return t('mallPlaces.detail.floorN', { n: raw });
  }

  return raw;
}

export function formatMallZoneType(
  zoneType: string | null | undefined,
  t: (key: string) => string,
): string | null {
  if (!zoneType || zoneType === 'UNKNOWN') return null;
  const key = `mallPlaces.detail.zoneType.${zoneType}`;
  const label = t(key);
  return label === key ? null : label;
}
