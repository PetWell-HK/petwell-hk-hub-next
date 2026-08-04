// PetWell 糧食評分公式
// 參考：AAFCO + FEDIAF + NRC
// 100 分制 = 核心營養 40% + 成分質素 40% + 紅旗扣分 -20%

export type FoodForm = "dry" | "wet" | "freeze-dried" | "raw" | "treat";

export interface NutritionLabel {
  protein: number;   // % As-Fed (粗蛋白)
  fat: number;       // % As-Fed (粗脂肪)
  fiber: number;     // % As-Fed (粗纖維)
  moisture: number;  // % As-Fed (水分)
  ash?: number;      // % As-Fed (灰分；冇就用預設)
}

export interface IngredientFlags {
  firstIngredientNamedMeat: boolean;     // 第一成份係咪具名肉 (e.g. 雞肉、三文魚)
  hasAnonymousMeatOrByproduct: boolean;  // 有冇「肉類副產品」、「動物脂肪」等模糊字眼
  carbSourceQuality: "low-gi" | "mixed" | "high-gi"; // 番薯/南瓜/燕麥 vs 玉米/小麥/白米
  hasArtificialPreservative: boolean;    // BHA / BHT / Ethoxyquin / Propylene glycol
  hasArtificialColorOrSweetener: boolean;
}

export interface NutritionInput {
  label: NutritionLabel;
  form: FoodForm;
  ingredients: IngredientFlags;
}

export interface ScoreBreakdown {
  total: number; // 0-100
  dmb: { protein: number; fat: number; carbs: number; fiber: number };
  carbsAsFed: number;
  fpr: number; // fat-to-protein ratio %
  parts: {
    proteinScore: number;      // /15
    carbsScore: number;        // /15
    fprScore: number;          // /10
    firstIngredientScore: number; // /20
    noByproductScore: number;     // /20
    carbQualityScore: number;     // /20
    redFlagDeduction: number;     // -0..-25
  };
  warnings: string[];
}

// 預設灰分（標籤未提供時）
function defaultAsh(form: FoodForm) {
  if (form === "wet") return 2.5;
  return 8; // dry / freeze-dried / raw / treat
}

export function calculateScore(input: NutritionInput): ScoreBreakdown {
  const { label, form, ingredients } = input;
  const ash = label.ash ?? defaultAsh(form);

  // 1.2 NFE 碳水化合物估算 (As-Fed)
  const carbsAsFed = Math.max(
    0,
    100 - label.protein - label.fat - label.moisture - label.fiber - ash
  );

  // 1.1 Dry Matter Basis 轉換
  const dryMatter = Math.max(1, 100 - label.moisture);
  const dmb = {
    protein: (label.protein / dryMatter) * 100,
    fat: (label.fat / dryMatter) * 100,
    carbs: (carbsAsFed / dryMatter) * 100,
    fiber: (label.fiber / dryMatter) * 100,
  };

  // 1.3 FPR
  const fpr = label.protein > 0 ? (label.fat / label.protein) * 100 : 0;

  // ===== 2.1 核心營養 (40 分) =====
  // 蛋白質 /15 (DMB)
  let proteinScore = 0;
  if (dmb.protein >= 35) proteinScore = 15;
  else if (dmb.protein >= 28) proteinScore = 10;
  else if (dmb.protein >= 22.5) proteinScore = 5;

  // 碳水 /15 (DMB)
  let carbsScore = 0;
  if (dmb.carbs <= 25) carbsScore = 15;
  else if (dmb.carbs <= 35) carbsScore = 10;
  else if (dmb.carbs <= 45) carbsScore = 5;

  // FPR /10
  let fprScore = 0;
  if (fpr <= 60) fprScore = 10;
  else if (fpr <= 75) fprScore = 8;
  else if (fpr <= 89) fprScore = 5;

  // ===== 2.2 成分質素 (60 分) =====
  const firstIngredientScore = ingredients.firstIngredientNamedMeat ? 20 : 0;
  const noByproductScore = ingredients.hasAnonymousMeatOrByproduct ? 0 : 20;
  let carbQualityScore = 0;
  if (ingredients.carbSourceQuality === "low-gi") carbQualityScore = 20;
  else if (ingredients.carbSourceQuality === "mixed") carbQualityScore = 10;

  // ===== 2.3 紅旗扣分 =====
  let redFlagDeduction = 0;
  if (ingredients.hasArtificialPreservative) redFlagDeduction -= 15;
  if (ingredients.hasArtificialColorOrSweetener) redFlagDeduction -= 10;

  const subtotal =
    proteinScore +
    carbsScore +
    fprScore +
    firstIngredientScore +
    noByproductScore +
    carbQualityScore;

  // 核心 (40) + 成分 (60) = 100，再加紅旗扣分
  // 但題目寫 40+40+(-20)；我哋按文件數字實作：40+60 部份後 cap 100，再扣紅旗
  const beforeRedFlag = Math.min(100, subtotal);
  const total = Math.max(0, Math.min(100, beforeRedFlag + redFlagDeduction));

  // ===== Warnings =====
  const warnings: string[] = [];
  if (fpr >= 90) warnings.push("FPR ≥ 90%：肉類質素極可疑");
  else if (fpr >= 80) warnings.push("FPR 介乎 80-89%：可能用咗廉價脂肪湊數");
  if (dmb.carbs > 45) warnings.push("碳水偏高，可能含大量廉價填充物");
  if (dmb.protein < 22.5) warnings.push("蛋白質偏低，未必符合幼犬 AAFCO 標準");
  if (ingredients.hasArtificialPreservative) warnings.push("含人工防腐劑 (BHA/BHT/Ethoxyquin)");
  if (ingredients.hasAnonymousMeatOrByproduct) warnings.push("含匿名肉類或副產品");

  return {
    total: Math.round(total),
    dmb: {
      protein: Math.round(dmb.protein * 10) / 10,
      fat: Math.round(dmb.fat * 10) / 10,
      carbs: Math.round(dmb.carbs * 10) / 10,
      fiber: Math.round(dmb.fiber * 10) / 10,
    },
    carbsAsFed: Math.round(carbsAsFed * 10) / 10,
    fpr: Math.round(fpr),
    parts: {
      proteinScore,
      carbsScore,
      fprScore,
      firstIngredientScore,
      noByproductScore,
      carbQualityScore,
      redFlagDeduction,
    },
    warnings,
  };
}
