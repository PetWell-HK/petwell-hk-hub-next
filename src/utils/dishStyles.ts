export type DishStyleSlug =
  | 'chinese'
  | 'cantonese'
  | 'japanese'
  | 'korean'
  | 'thai'
  | 'vietnamese'
  | 'indian'
  | 'western'
  | 'italian'
  | 'french'
  | 'american'
  | 'mediterranean'
  | 'fusion'
  | 'alaCarte'
  | 'buffet'
  | 'hotPot'
  | 'bbqGrill'
  | 'dimSum'
  | 'cafeLight'
  | 'fastCasual'
  | 'fineDining'
  | 'other';

export type DishStyleOption = {
  slug: DishStyleSlug;
  zh: string;
  en: string;
};

export const DISH_STYLE_OPTIONS: DishStyleOption[] = [
  { slug: 'chinese', zh: '中菜', en: 'Chinese' },
  { slug: 'cantonese', zh: '粵菜', en: 'Cantonese' },
  { slug: 'japanese', zh: '日本菜', en: 'Japanese' },
  { slug: 'korean', zh: '韓國菜', en: 'Korean' },
  { slug: 'thai', zh: '泰國菜', en: 'Thai' },
  { slug: 'vietnamese', zh: '越南菜', en: 'Vietnamese' },
  { slug: 'indian', zh: '印度菜', en: 'Indian' },
  { slug: 'western', zh: '西式', en: 'Western' },
  { slug: 'italian', zh: '意大利菜', en: 'Italian' },
  { slug: 'french', zh: '法國菜', en: 'French' },
  { slug: 'american', zh: '美式', en: 'American' },
  { slug: 'mediterranean', zh: '地中海', en: 'Mediterranean' },
  { slug: 'fusion', zh: '融合菜', en: 'Fusion' },
  { slug: 'alaCarte', zh: '單點', en: 'A la carte' },
  { slug: 'buffet', zh: '自助餐', en: 'Buffet' },
  { slug: 'hotPot', zh: '火鍋', en: 'Hot pot' },
  { slug: 'bbqGrill', zh: '燒烤', en: 'BBQ / Grill' },
  { slug: 'dimSum', zh: '點心', en: 'Dim sum' },
  { slug: 'cafeLight', zh: '咖啡／輕食', en: 'Cafe / Light meals' },
  { slug: 'fastCasual', zh: '休閒快餐', en: 'Fast casual' },
  { slug: 'fineDining', zh: '高級餐飲', en: 'Fine dining' },
  { slug: 'other', zh: '其他', en: 'Other' },
];

const LABEL_BY_SLUG = Object.fromEntries(
  DISH_STYLE_OPTIONS.map((o) => [o.slug, o]),
) as Record<DishStyleSlug, DishStyleOption>;

export function getLocalizedDishStyles(
  slugs: string[] | null | undefined,
  lang: 'zh' | 'en',
): string[] {
  if (!slugs?.length) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of slugs) {
    const slug = typeof raw === 'string' ? raw.trim() : '';
    if (!slug || seen.has(slug)) continue;
    const opt = LABEL_BY_SLUG[slug as DishStyleSlug];
    if (!opt) continue;
    seen.add(slug);
    out.push(lang === 'en' ? opt.en : opt.zh);
  }
  return out;
}
