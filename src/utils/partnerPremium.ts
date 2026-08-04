export type PartnerPlanPlace = {
  partnerPlan?: string | null;
  partnerPlanExpiresAt?: string | null;
  isPremium?: boolean;
};

/** Effective Partner Hub premium: PREMIUM and not past partnerPlanExpiresAt. */
export function isEffectivePremium(
  place: PartnerPlanPlace | null | undefined,
  now: number = Date.now(),
): boolean {
  if (!place) return false;
  if (place.isPremium === true) return true;
  if (place.partnerPlan !== 'PREMIUM') return false;
  const expires = place.partnerPlanExpiresAt;
  if (expires) {
    const t = Date.parse(expires);
    if (!Number.isNaN(t) && t <= now) return false;
  }
  return true;
}

/** Sort comparator: premium first (stable for equal premium status). */
export function comparePremiumFirst<T extends PartnerPlanPlace>(
  a: T,
  b: T,
  now: number = Date.now(),
): number {
  const premiumA = isEffectivePremium(a, now) ? 1 : 0;
  const premiumB = isEffectivePremium(b, now) ? 1 : 0;
  return premiumB - premiumA;
}

/** Stable reorder: premium before free for rating/catalog lists (not nearby/location). */
export function sortPremiumFirst<T extends PartnerPlanPlace>(
  items: readonly T[],
  now: number = Date.now(),
): T[] {
  const premium: T[] = [];
  const rest: T[] = [];
  for (const item of items) {
    if (isEffectivePremium(item, now)) premium.push(item);
    else rest.push(item);
  }
  return [...premium, ...rest];
}

/**
 * Pick up to `count` items with premium first, then shuffle within each tier
 * so home rails stay varied without burying paid listings.
 */
export function pickFeaturedWithPremiumFirst<T extends PartnerPlanPlace>(
  items: readonly T[],
  count: number,
  shuffle: <U>(arr: readonly U[]) => U[],
  now: number = Date.now(),
): T[] {
  const premium = shuffle(items.filter((item) => isEffectivePremium(item, now)));
  const rest = shuffle(items.filter((item) => !isEffectivePremium(item, now)));
  return [...premium, ...rest].slice(0, count);
}
