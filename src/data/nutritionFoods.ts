// 糧食評分資料庫
// 每筆資料保留原始營養標籤 + 成份 flags，分數由 src/lib/nutritionScoring.ts 計算
import { calculateScore, type FoodForm, type NutritionInput } from "@/lib/nutritionScoring";

export type FoodSpecies = "cat" | "dog";

export interface NutritionFood extends NutritionInput {
  id: string;
  species: FoodSpecies;
  brand: string;
  name: string;
  lifeStage: string;
  form: FoodForm;
  firstIngredients: string[]; // 顯示用
  pros: string[];
  cons: string[];
  buyUrl?: string;
  imageUrl?: string;
}

export const NUTRITION_FOODS: NutritionFood[] = [
  // ===== CAT =====
  {
    id: "orijen-cat-original",
    species: "cat",
    brand: "Orijen",
    name: "Original Cat",
    lifeStage: "全貓齡 All Life Stages",
    form: "dry",
    label: { protein: 40, fat: 20, fiber: 3, moisture: 10, ash: 8.5 },
    ingredients: {
      firstIngredientNamedMeat: true,
      hasAnonymousMeatOrByproduct: false,
      carbSourceQuality: "low-gi",
      hasArtificialPreservative: false,
      hasArtificialColorOrSweetener: false,
    },
    firstIngredients: ["走地雞", "火雞", "比目魚", "整顆雞蛋"],
    pros: ["首5位全部係肉", "高動物性蛋白", "低 GI 碳水"],
    cons: ["價錢偏貴", "脂肪較高，唔啱肥胖貓"],
    buyUrl: "https://example.com/orijen-cat",
  },
  {
    id: "royal-canin-indoor-27",
    species: "cat",
    brand: "Royal Canin",
    name: "Indoor 27",
    lifeStage: "成貓 Adult",
    form: "dry",
    label: { protein: 27, fat: 13, fiber: 6, moisture: 6, ash: 6.7 },
    ingredients: {
      firstIngredientNamedMeat: false, // 首位係粟米
      hasAnonymousMeatOrByproduct: true, // 「脫水家禽蛋白」屬模糊
      carbSourceQuality: "high-gi", // 粟米 + 小麥
      hasArtificialPreservative: false,
      hasArtificialColorOrSweetener: false,
    },
    firstIngredients: ["粟米", "脫水家禽蛋白", "小麥", "玉米麩"],
    pros: ["室內貓專用配方", "供應穩定"],
    cons: ["碳水偏高", "首位係粟米唔係肉", "用模糊嘅「家禽蛋白」"],
    buyUrl: "https://example.com/rc-indoor",
  },
  {
    id: "ziwi-peak-cat-mackerel",
    species: "cat",
    brand: "Ziwi Peak",
    name: "Mackerel & Lamb",
    lifeStage: "全貓齡",
    form: "freeze-dried",
    label: { protein: 44, fat: 32, fiber: 2, moisture: 14, ash: 9 },
    ingredients: {
      firstIngredientNamedMeat: true,
      hasAnonymousMeatOrByproduct: false,
      carbSourceQuality: "low-gi",
      hasArtificialPreservative: false,
      hasArtificialColorOrSweetener: false,
    },
    firstIngredients: ["鯖魚", "羊肉", "羊肝", "羊心"],
    pros: ["極低碳水", "高動物蛋白", "接近天然飲食"],
    cons: ["價錢非常昂貴", "脂肪極高（FPR 偏高）"],
    buyUrl: "https://example.com/ziwi-cat",
  },
  // ===== DOG =====
  {
    id: "acana-adult-dog",
    species: "dog",
    brand: "Acana",
    name: "Adult Dog Recipe",
    lifeStage: "成犬 Adult",
    form: "dry",
    label: { protein: 29, fat: 17, fiber: 6, moisture: 12, ash: 8 },
    ingredients: {
      firstIngredientNamedMeat: true,
      hasAnonymousMeatOrByproduct: false,
      carbSourceQuality: "low-gi",
      hasArtificialPreservative: false,
      hasArtificialColorOrSweetener: false,
    },
    firstIngredients: ["新鮮雞肉", "火雞", "雞肝", "全蛋"],
    pros: ["首位係新鮮肉", "蛋白來源多樣化", "無人造添加"],
    cons: ["價錢中上"],
    buyUrl: "https://example.com/acana-adult",
  },
  {
    id: "royal-canin-medium-adult",
    species: "dog",
    brand: "Royal Canin",
    name: "Medium Adult",
    lifeStage: "成犬 11-25kg",
    form: "dry",
    label: { protein: 25, fat: 14, fiber: 4, moisture: 9.5, ash: 6.5 },
    ingredients: {
      firstIngredientNamedMeat: false,
      hasAnonymousMeatOrByproduct: true,
      carbSourceQuality: "high-gi",
      hasArtificialPreservative: false,
      hasArtificialColorOrSweetener: false,
    },
    firstIngredients: ["粟米", "脫水家禽蛋白", "動物脂肪", "小麥"],
    pros: ["營養均衡", "獸醫常推介"],
    cons: ["碳水高", "用「動物脂肪」呢類模糊字眼"],
    buyUrl: "https://example.com/rc-medium",
  },
  {
    id: "k9-natural-lamb",
    species: "dog",
    brand: "K9 Natural",
    name: "Lamb Feast",
    lifeStage: "全犬齡",
    form: "freeze-dried",
    label: { protein: 38, fat: 32, fiber: 2, moisture: 12, ash: 9 },
    ingredients: {
      firstIngredientNamedMeat: true,
      hasAnonymousMeatOrByproduct: false,
      carbSourceQuality: "low-gi",
      hasArtificialPreservative: false,
      hasArtificialColorOrSweetener: false,
    },
    firstIngredients: ["羊肉", "羊心", "羊肝", "羊腎"],
    pros: ["接近 BARF 生食", "極低碳水", "高肉量"],
    cons: ["價錢極貴", "需要加水回潮"],
    buyUrl: "https://example.com/k9-lamb",
  },
];

// 預先計算每隻產品嘅評分（純函數，build time / runtime 都 OK）
export const SCORED_FOODS = NUTRITION_FOODS.map((food) => ({
  ...food,
  scoreBreakdown: calculateScore(food),
}));

export type ScoredFood = (typeof SCORED_FOODS)[number];
