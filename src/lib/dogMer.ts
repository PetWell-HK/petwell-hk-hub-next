export type MerAgeGroup = "young_active" | "inactive_neutered" | "senior";
export type MerGoal = "maintain" | "lose" | "gain";
export type WeightUnit = "kg" | "lb";

export const AGE_FACTORS: Record<MerAgeGroup, number> = {
  young_active: 1.8,
  inactive_neutered: 1.6,
  senior: 1.4,
};

export const AGE_LABELS: Record<MerAgeGroup, string> = {
  young_active: "日日跑跳、精神旺",
  inactive_neutered: "普通散步／已絕育",
  senior: "年紀大、少郁",
};

export const AGE_HINTS: Record<MerAgeGroup, string> = {
  young_active: "未絕育、成日跑草、工作犬",
  inactive_neutered: "香港最常見：室內狗、已絕育",
  senior: "細隻約 8 歲+、中型 7 歲+、大隻 6 歲+",
};

export type BodyLook = "slim" | "fit" | "round";

export const BODY_LOOKS: Record<
  BodyLook,
  { bcs: number; goal: MerGoal; title: string; hint: string }
> = {
  slim: { bcs: 3, goal: "gain", title: "偏瘦", hint: "肋骨凸、腰好窄" },
  fit: { bcs: 5, goal: "maintain", title: "剛剛好", hint: "摸到肋骨，上望有腰" },
  round: { bcs: 7, goal: "lose", title: "偏圓", hint: "肋骨難摸，腰線唔清" },
};

export function bodyLookFromBcs(bcs: number): BodyLook {
  if (bcs <= 4) return "slim";
  if (bcs >= 6) return "round";
  return "fit";
}

export function suggestedGoal(bcs: number): MerGoal {
  if (bcs >= 6) return "lose";
  if (bcs <= 4) return "gain";
  return "maintain";
}

export const BCS_LABELS: Record<number, string> = {
  1: "嚴重過瘦",
  2: "非常瘦",
  3: "偏瘦",
  4: "輕微過瘦",
  5: "理想體態",
  6: "輕微過重",
  7: "明顯過重",
  8: "肥胖",
  9: "臨床肥胖",
};

const LB_PER_KG = 2.2046226218;

export function toKg(weight: number, unit: WeightUnit): number {
  return unit === "lb" ? weight / LB_PER_KG : weight;
}

export function fromKg(kg: number, unit: WeightUnit): number {
  return unit === "lb" ? kg * LB_PER_KG : kg;
}

/** WSAVA / Purina 9-point BCS: each point from 5 ≈ 10% body weight. */
export function idealWeightKg(currentKg: number, bcs: number): number {
  const clamped = Math.min(9, Math.max(1, bcs));
  return currentKg / (1 + (clamped - 5) * 0.1);
}

export function rerKcal(kg: number): number {
  return 70 * kg ** 0.75;
}

export interface MerResult {
  currentKg: number;
  idealKg: number;
  rerCurrent: number;
  rerIdeal: number;
  factor: number;
  merKcal: number;
  weightUsedKg: number;
  weeklyLossLowKg: number;
  weeklyLossHighKg: number;
}

export function calculateMer(input: {
  weight: number;
  unit: WeightUnit;
  bcs: number;
  ageGroup: MerAgeGroup;
  goal: MerGoal;
}): MerResult | null {
  if (!Number.isFinite(input.weight) || input.weight <= 0) return null;

  const currentKg = toKg(input.weight, input.unit);
  if (currentKg < 0.5 || currentKg > 120) return null;

  const idealKg = idealWeightKg(currentKg, input.bcs);
  const rerCurrent = rerKcal(currentKg);
  const rerIdeal = rerKcal(idealKg);
  const ageFactor = AGE_FACTORS[input.ageGroup];

  let factor: number;
  let weightUsedKg: number;
  let merKcal: number;

  switch (input.goal) {
    case "lose":
      factor = 1;
      weightUsedKg = idealKg;
      merKcal = rerIdeal;
      break;
    case "gain":
      factor = ageFactor;
      weightUsedKg = idealKg;
      merKcal = ageFactor * rerIdeal;
      break;
    case "maintain":
      factor = ageFactor;
      weightUsedKg = idealKg;
      merKcal = ageFactor * rerIdeal;
      break;
    default: {
      const _exhaustive: never = input.goal;
      throw new Error(`Unhandled MER goal: ${_exhaustive}`);
    }
  }

  return {
    currentKg,
    idealKg,
    rerCurrent,
    rerIdeal,
    factor,
    merKcal,
    weightUsedKg,
    weeklyLossLowKg: currentKg * 0.01,
    weeklyLossHighKg: currentKg * 0.02,
  };
}

export function gramsFromKcal(merKcal: number, kcalPer100g: number): number | null {
  if (!Number.isFinite(kcalPer100g) || kcalPer100g <= 0) return null;
  return (merKcal / kcalPer100g) * 100;
}
