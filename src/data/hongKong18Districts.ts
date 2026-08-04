export type HkRegionKey = "香港" | "九龍" | "新界" | "離島";

export interface Hk18District {
  id: string;
  slug: string;
  labelZh: string;
  labelEn: string;
  regionKey: HkRegionKey;
  regionLabelZh: string;
  regionLabelEn: string;
  filterValues: string[];
}

export interface HkRegionHub {
  slug: string;
  labelZh: string;
  labelEn: string;
  regionKey: HkRegionKey;
  filterRegion: string;
}

export const HONG_KONG_REGION_HUBS: HkRegionHub[] = [
  {
    slug: "hong-kong-island",
    labelZh: "香港島",
    labelEn: "Hong Kong Island",
    regionKey: "香港",
    filterRegion: "Hong Kong",
  },
  {
    slug: "kowloon",
    labelZh: "九龍",
    labelEn: "Kowloon",
    regionKey: "九龍",
    filterRegion: "Kowloon",
  },
  {
    slug: "new-territories",
    labelZh: "新界",
    labelEn: "New Territories",
    regionKey: "新界",
    filterRegion: "New Territories",
  },
];

export const HONG_KONG_18_DISTRICTS: Hk18District[] = [
  {
    id: "central-and-western",
    slug: "central-and-western",
    labelZh: "中西區",
    labelEn: "Central & Western",
    regionKey: "香港",
    regionLabelZh: "香港島",
    regionLabelEn: "Hong Kong Island",
    filterValues: [
      "中西區", "中環", "金鐘", "上環", "西營盤", "石塘咀", "堅尼地城", "西環", "半山", "山頂",
      "Central", "Admiralty", "Sheung Wan", "Sai Ying Pun", "Kennedy Town", "Sai Wan", "Mid-Levels", "The Peak",
    ],
  },
  {
    id: "wan-chai",
    slug: "wan-chai",
    labelZh: "灣仔區",
    labelEn: "Wan Chai",
    regionKey: "香港",
    regionLabelZh: "香港島",
    regionLabelEn: "Hong Kong Island",
    filterValues: [
      "灣仔區", "灣仔", "銅鑼灣", "天后", "大坑", "跑馬地",
      "Wan Chai", "Causeway Bay", "Tin Hau", "Tai Hang", "Happy Valley",
    ],
  },
  {
    id: "eastern",
    slug: "eastern",
    labelZh: "東區",
    labelEn: "Eastern",
    regionKey: "香港",
    regionLabelZh: "香港島",
    regionLabelEn: "Hong Kong Island",
    filterValues: [
      "東區", "北角", "鰂魚涌", "太古城", "西灣河", "筲箕灣", "杏花邨", "柴灣",
      "Eastern", "North Point", "Quarry Bay", "Taikoo Shing", "Sai Wan Ho", "Shau Kei Wan", "Heng Fa Chuen", "Chai Wan",
    ],
  },
  {
    id: "southern",
    slug: "southern",
    labelZh: "南區",
    labelEn: "Southern",
    regionKey: "香港",
    regionLabelZh: "香港島",
    regionLabelEn: "Hong Kong Island",
    filterValues: [
      "南區", "香港仔", "黃竹坑", "鴨脷洲", "薄扶林", "淺水灣", "赤柱", "石澳",
      "Southern", "Aberdeen", "Wong Chuk Hang", "Ap Lei Chau", "Pok Fu Lam", "Repulse Bay", "Stanley", "Shek O",
    ],
  },
  {
    id: "yau-tsim-mong",
    slug: "yau-tsim-mong",
    labelZh: "油尖旺區",
    labelEn: "Yau Tsim Mong",
    regionKey: "九龍",
    regionLabelZh: "九龍",
    regionLabelEn: "Kowloon",
    filterValues: ["油尖旺區", "尖沙咀", "佐敦", "油麻地", "旺角", "太子", "大角咀", "諾士佛臺", "Tsim Sha Tsui", "Jordan", "Yau Ma Tei", "Mong Kok", "Prince Edward", "Tai Kok Tsui"],
  },
  {
    id: "sham-shui-po",
    slug: "sham-shui-po",
    labelZh: "深水埗區",
    labelEn: "Sham Shui Po",
    regionKey: "九龍",
    regionLabelZh: "九龍",
    regionLabelEn: "Kowloon",
    filterValues: [
      "深水埗區", "深水埗", "長沙灣", "荔枝角", "美孚",
      "Sham Shui Po", "Cheung Sha Wan", "Lai Chi Kok", "Mei Foo",
    ],
  },
  {
    id: "kowloon-city",
    slug: "kowloon-city",
    labelZh: "九龍城區",
    labelEn: "Kowloon City",
    regionKey: "九龍",
    regionLabelZh: "九龍",
    regionLabelEn: "Kowloon",
    filterValues: ["九龍城區", "九龍城", "土瓜灣", "紅磡", "何文田", "啟德", "Kowloon City", "To Kwa Wan", "Hung Hom", "Ho Man Tin", "Kai Tak"],
  },
  {
    id: "wong-tai-sin",
    slug: "wong-tai-sin",
    labelZh: "黃大仙區",
    labelEn: "Wong Tai Sin",
    regionKey: "九龍",
    regionLabelZh: "九龍",
    regionLabelEn: "Kowloon",
    filterValues: ["黃大仙區", "黃大仙", "鑽石山", "樂富", "新蒲崗", "Wong Tai Sin", "Diamond Hill", "Lok Fu", "San Po Kong"],
  },
  {
    id: "kwun-tong",
    slug: "kwun-tong",
    labelZh: "觀塘區",
    labelEn: "Kwun Tong",
    regionKey: "九龍",
    regionLabelZh: "九龍",
    regionLabelEn: "Kowloon",
    filterValues: ["觀塘區", "觀塘", "藍田", "油塘", "九龍灣", "牛頭角", "Kwun Tong", "Lam Tin", "Yau Tong", "Kowloon Bay", "Ngau Tau Kok"],
  },
  {
    id: "kwai-tsing",
    slug: "kwai-tsing",
    labelZh: "葵青區",
    labelEn: "Kwai Tsing",
    regionKey: "新界",
    regionLabelZh: "新界",
    regionLabelEn: "New Territories",
    filterValues: ["葵青區", "葵涌", "青衣", "Kwai Tsing", "Kwai Chung", "Tsing Yi"],
  },
  {
    id: "tsuen-wan",
    slug: "tsuen-wan",
    labelZh: "荃灣區",
    labelEn: "Tsuen Wan",
    regionKey: "新界",
    regionLabelZh: "新界",
    regionLabelEn: "New Territories",
    filterValues: ["荃灣區", "荃灣", "深井", "Tsuen Wan", "Sham Tseng"],
  },
  {
    id: "tuen-mun",
    slug: "tuen-mun",
    labelZh: "屯門區",
    labelEn: "Tuen Mun",
    regionKey: "新界",
    regionLabelZh: "新界",
    regionLabelEn: "New Territories",
    filterValues: ["屯門區", "屯門", "Tuen Mun"],
  },
  {
    id: "yuen-long",
    slug: "yuen-long",
    labelZh: "元朗區",
    labelEn: "Yuen Long",
    regionKey: "新界",
    regionLabelZh: "新界",
    regionLabelEn: "New Territories",
    filterValues: ["元朗區", "元朗", "天水圍", "Yuen Long", "Tin Shui Wai"],
  },
  {
    id: "north",
    slug: "north",
    labelZh: "北區",
    labelEn: "North",
    regionKey: "新界",
    regionLabelZh: "新界",
    regionLabelEn: "New Territories",
    filterValues: ["北區", "上水", "粉嶺", "落馬洲", "North", "Sheung Shui", "Fanling", "Lok Ma Chau"],
  },
  {
    id: "tai-po",
    slug: "tai-po",
    labelZh: "大埔區",
    labelEn: "Tai Po",
    regionKey: "新界",
    regionLabelZh: "新界",
    regionLabelEn: "New Territories",
    filterValues: ["大埔區", "大埔", "太和", "白石角", "Tai Po", "Tai Wo", "Pak Shek Kok"],
  },
  {
    id: "sha-tin",
    slug: "sha-tin",
    labelZh: "沙田區",
    labelEn: "Sha Tin",
    regionKey: "新界",
    regionLabelZh: "新界",
    regionLabelEn: "New Territories",
    filterValues: ["沙田區", "沙田", "大圍", "馬鞍山", "Sha Tin", "Tai Wai", "Ma On Shan"],
  },
  {
    id: "sai-kung",
    slug: "sai-kung",
    labelZh: "西貢區",
    labelEn: "Sai Kung",
    regionKey: "新界",
    regionLabelZh: "新界",
    regionLabelEn: "New Territories",
    filterValues: ["西貢區", "西貢", "將軍澳", "清水灣", "Sai Kung", "Tseung Kwan O", "Clear Water Bay"],
  },
  {
    id: "islands",
    slug: "islands",
    labelZh: "離島區",
    labelEn: "Islands",
    regionKey: "離島",
    regionLabelZh: "離島",
    regionLabelEn: "Outlying Islands",
    filterValues: [
      "離島區", "離島", "大嶼山", "東涌", "赤鱲角", "愉景灣", "梅窩", "大澳", "馬灣", "長洲", "南丫島", "坪洲",
      "Islands", "Lantau Island", "Tung Chung", "Chek Lap Kok", "Discovery Bay", "Mui Wo", "Tai O", "Ma Wan",
      "Cheung Chau", "Lamma Island", "Peng Chau",
    ],
  },
];

function fuzzyMatchDistrict(itemDistrict: string | undefined | null, filterValue: string): boolean {
  if (!itemDistrict || !filterValue) return false;

  const item = itemDistrict.trim().toLowerCase();
  const target = filterValue.trim().toLowerCase();
  if (!item || !target) return false;

  if (item === target) return true;
  if (target.length >= 2 && item.includes(target)) return true;
  if (item.length >= 2 && target.includes(item)) return true;
  return false;
}

export function getDistrictBySlug(slug: string | undefined): Hk18District | undefined {
  if (!slug) return undefined;
  return HONG_KONG_18_DISTRICTS.find((d) => d.slug === slug);
}

export function getRegionHubBySlug(slug: string | undefined): HkRegionHub | undefined {
  if (!slug) return undefined;
  return HONG_KONG_REGION_HUBS.find((r) => r.slug === slug);
}

export function getDistrictsByRegion(regionKey: HkRegionKey): Hk18District[] {
  return HONG_KONG_18_DISTRICTS.filter((d) => d.regionKey === regionKey);
}

export function matchRestaurantToDistrict(
  restaurantDistrict: string | undefined | null,
  district: Hk18District,
): boolean {
  if (!restaurantDistrict) return false;
  return district.filterValues.some((value) => fuzzyMatchDistrict(restaurantDistrict, value));
}

export function resolveAreaSlug(slug: string | undefined):
  | { type: "district"; district: Hk18District }
  | { type: "region"; region: HkRegionHub }
  | { type: "index" }
  | null {
  if (!slug) return null;
  if (slug === "districts") return { type: "index" };

  const district = getDistrictBySlug(slug);
  if (district) return { type: "district", district };

  const region = getRegionHubBySlug(slug);
  if (region) return { type: "region", region };

  return null;
}

export const ALL_AREA_SEO_SLUGS = [
  "districts",
  ...HONG_KONG_REGION_HUBS.map((r) => r.slug),
  ...HONG_KONG_18_DISTRICTS.map((d) => d.slug),
];
