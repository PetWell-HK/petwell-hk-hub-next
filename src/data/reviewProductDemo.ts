export type DemoPricePoint = { date: string; price: number };

export const DEMO_SPECS_FALLBACK: { label: string; value: string }[] = [
  { label: "適用階段", value: "成犬 (1歲以上)" },
  { label: "主要成份", value: "脫水家禽蛋白、米、動物脂肪" },
  { label: "蛋白質含量", value: "25%" },
  { label: "脂肪含量", value: "14%" },
  { label: "產地", value: "法國" },
  { label: "保存期", value: "18個月" },
];

export const PRICE_HISTORY_RANGES = [
  { id: "3m", label: "近3個月", months: 3 },
  { id: "6m", label: "近6個月", months: 6 },
  { id: "1y", label: "近1年", months: 12 },
  { id: "all", label: "歷史", months: 24 },
] as const;

export type PriceHistoryRangeId = (typeof PRICE_HISTORY_RANGES)[number]["id"];

export function generateDemoPriceHistory(basePrice: number, seed: number, months = 24): DemoPricePoint[] {
  const out: DemoPricePoint[] = [];
  const now = new Date();
  let rng = seed;
  for (let i = months - 1; i >= 0; i--) {
    rng = (rng * 9301 + 49297) % 233280;
    const noise = (rng / 233280 - 0.5) * 0.18;
    const trend = Math.sin((months - i) / 4) * 0.05;
    const price = Math.round(basePrice * (1 + noise + trend));
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    out.push({
      date: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      price,
    });
  }
  return out;
}
