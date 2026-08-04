/**
 * District → region membership for listing region tabs / API mapping.
 * Includes neighborhoods (primary stored values) plus residual admin labels.
 * Public SEO district pages use hongKong18Districts.ts instead.
 */
export const HONG_KONG_DISTRICTS = {
  "香港": {
    label: "香港島",
    labelEn: "Hong Kong Island",
    icon: "map-pin",
    districts: [
      { value: "全香港島", label: "全香港島", labelEn: "All Hong Kong Island" },
      { value: "灣仔區", label: "灣仔區", labelEn: "Wan Chai" },
      { value: "南區", label: "南區", labelEn: "Southern" },
      { value: "銅鑼灣", label: "銅鑼灣", labelEn: "Causeway Bay" },
      { value: "天后", label: "天后", labelEn: "Tin Hau" },
      { value: "大坑", label: "大坑", labelEn: "Tai Hang" },
      { value: "跑馬地", label: "跑馬地", labelEn: "Happy Valley" },
      { value: "中環", label: "中環", labelEn: "Central" },
      { value: "金鐘", label: "金鐘", labelEn: "Admiralty" },
      { value: "上環", label: "上環", labelEn: "Sheung Wan" },
      { value: "西營盤", label: "西營盤", labelEn: "Sai Ying Pun" },
      { value: "石塘咀", label: "石塘咀", labelEn: "Shek Tong Tsui" },
      { value: "堅尼地城", label: "堅尼地城", labelEn: "Kennedy Town" },
      { value: "西環", label: "西環", labelEn: "Sai Wan" },
      { value: "半山", label: "半山", labelEn: "Mid-Levels" },
      { value: "山頂", label: "山頂", labelEn: "The Peak" },
      { value: "北角", label: "北角", labelEn: "North Point" },
      { value: "鰂魚涌", label: "鰂魚涌", labelEn: "Quarry Bay" },
      { value: "太古城", label: "太古城", labelEn: "Taikoo Shing" },
      { value: "西灣河", label: "西灣河", labelEn: "Sai Wan Ho" },
      { value: "筲箕灣", label: "筲箕灣", labelEn: "Shau Kei Wan" },
      { value: "杏花邨", label: "杏花邨", labelEn: "Heng Fa Chuen" },
      { value: "柴灣", label: "柴灣", labelEn: "Chai Wan" },
      { value: "香港仔", label: "香港仔", labelEn: "Aberdeen" },
      { value: "黃竹坑", label: "黃竹坑", labelEn: "Wong Chuk Hang" },
      { value: "鴨脷洲", label: "鴨脷洲", labelEn: "Ap Lei Chau" },
      { value: "薄扶林", label: "薄扶林", labelEn: "Pok Fu Lam" },
      { value: "淺水灣", label: "淺水灣", labelEn: "Repulse Bay" },
      { value: "赤柱", label: "赤柱", labelEn: "Stanley" },
      { value: "石澳", label: "石澳", labelEn: "Shek O" },
      // residual admin labels for region mapping
      { value: "中西區", label: "中西區", labelEn: "Central & Western" },
      { value: "東區", label: "東區", labelEn: "Eastern" },
    ]
  },
  "九龍": {
    label: "九龍",
    labelEn: "Kowloon",
    icon: "shopping-bag",
    districts: [
      { value: "全九龍", label: "全九龍", labelEn: "All Kowloon" },
      { value: "尖沙咀", label: "尖沙咀", labelEn: "Tsim Sha Tsui" },
      { value: "佐敦", label: "佐敦", labelEn: "Jordan" },
      { value: "油麻地", label: "油麻地", labelEn: "Yau Ma Tei" },
      { value: "旺角", label: "旺角", labelEn: "Mong Kok" },
      { value: "太子", label: "太子", labelEn: "Prince Edward" },
      { value: "大角咀", label: "大角咀", labelEn: "Tai Kok Tsui" },
      { value: "深水埗", label: "深水埗", labelEn: "Sham Shui Po" },
      { value: "長沙灣", label: "長沙灣", labelEn: "Cheung Sha Wan" },
      { value: "荔枝角", label: "荔枝角", labelEn: "Lai Chi Kok" },
      { value: "美孚", label: "美孚", labelEn: "Mei Foo" },
      { value: "九龍塘", label: "九龍塘", labelEn: "Kowloon Tong" },
      { value: "九龍城", label: "九龍城", labelEn: "Kowloon City" },
      { value: "土瓜灣", label: "土瓜灣", labelEn: "To Kwa Wan" },
      { value: "紅磡", label: "紅磡", labelEn: "Hung Hom" },
      { value: "何文田", label: "何文田", labelEn: "Ho Man Tin" },
      { value: "黃大仙", label: "黃大仙", labelEn: "Wong Tai Sin" },
      { value: "鑽石山", label: "鑽石山", labelEn: "Diamond Hill" },
      { value: "樂富", label: "樂富", labelEn: "Lok Fu" },
      { value: "藍田", label: "藍田", labelEn: "Lam Tin" },
      { value: "油塘", label: "油塘", labelEn: "Yau Tong" },
      { value: "九龍灣", label: "九龍灣", labelEn: "Kowloon Bay" },
      { value: "牛頭角", label: "牛頭角", labelEn: "Ngau Tau Kok" },
      { value: "觀塘", label: "觀塘", labelEn: "Kwun Tong" },
      { value: "新蒲崗", label: "新蒲崗", labelEn: "San Po Kong" },
      { value: "啟德", label: "啟德", labelEn: "Kai Tak" },
      { value: "諾士佛臺", label: "諾士佛臺", labelEn: "Knutsford Terrace" },
      // residual admin labels
      { value: "油尖旺區", label: "油尖旺區", labelEn: "Yau Tsim Mong" },
      { value: "九龍城區", label: "九龍城區", labelEn: "Kowloon City" },
      { value: "觀塘區", label: "觀塘區", labelEn: "Kwun Tong" },
      { value: "深水埗區", label: "深水埗區", labelEn: "Sham Shui Po" },
      { value: "黃大仙區", label: "黃大仙區", labelEn: "Wong Tai Sin" },
    ]
  },
  "新界": {
    label: "新界",
    labelEn: "New Territories",
    icon: "building",
    districts: [
      { value: "全新界", label: "全新界", labelEn: "All New Territories" },
      { value: "葵涌", label: "葵涌", labelEn: "Kwai Chung" },
      { value: "青衣", label: "青衣", labelEn: "Tsing Yi" },
      { value: "荃灣", label: "荃灣", labelEn: "Tsuen Wan" },
      { value: "深井", label: "深井", labelEn: "Sham Tseng" },
      { value: "屯門", label: "屯門", labelEn: "Tuen Mun" },
      { value: "元朗", label: "元朗", labelEn: "Yuen Long" },
      { value: "天水圍", label: "天水圍", labelEn: "Tin Shui Wai" },
      { value: "上水", label: "上水", labelEn: "Sheung Shui" },
      { value: "粉嶺", label: "粉嶺", labelEn: "Fanling" },
      { value: "落馬洲", label: "落馬洲", labelEn: "Lok Ma Chau" },
      { value: "大埔", label: "大埔", labelEn: "Tai Po" },
      { value: "太和", label: "太和", labelEn: "Tai Wo" },
      { value: "白石角", label: "白石角", labelEn: "Pak Shek Kok" },
      { value: "大圍", label: "大圍", labelEn: "Tai Wai" },
      { value: "沙田", label: "沙田", labelEn: "Sha Tin" },
      { value: "馬鞍山", label: "馬鞍山", labelEn: "Ma On Shan" },
      { value: "西貢", label: "西貢", labelEn: "Sai Kung" },
      { value: "將軍澳", label: "將軍澳", labelEn: "Tseung Kwan O" },
      { value: "清水灣", label: "清水灣", labelEn: "Clear Water Bay" },
      // residual admin labels
      { value: "葵青區", label: "葵青區", labelEn: "Kwai Tsing" },
      { value: "荃灣區", label: "荃灣區", labelEn: "Tsuen Wan" },
      { value: "屯門區", label: "屯門區", labelEn: "Tuen Mun" },
      { value: "元朗區", label: "元朗區", labelEn: "Yuen Long" },
      { value: "北區", label: "北區", labelEn: "North" },
      { value: "大埔區", label: "大埔區", labelEn: "Tai Po" },
      { value: "沙田區", label: "沙田區", labelEn: "Sha Tin" },
      { value: "西貢區", label: "西貢區", labelEn: "Sai Kung" },
    ]
  },
  "離島": {
    label: "離島",
    labelEn: "Outlying Islands",
    icon: "list",
    districts: [
      { value: "全離島", label: "全離島", labelEn: "All Outlying Islands" },
      { value: "大嶼山", label: "大嶼山", labelEn: "Lantau Island" },
      { value: "東涌", label: "東涌", labelEn: "Tung Chung" },
      { value: "赤鱲角", label: "赤鱲角", labelEn: "Chek Lap Kok" },
      { value: "愉景灣", label: "愉景灣", labelEn: "Discovery Bay" },
      { value: "梅窩", label: "梅窩", labelEn: "Mui Wo" },
      { value: "大澳", label: "大澳", labelEn: "Tai O" },
      { value: "馬灣", label: "馬灣", labelEn: "Ma Wan" },
      { value: "長洲", label: "長洲", labelEn: "Cheung Chau" },
      { value: "南丫島", label: "南丫島", labelEn: "Lamma Island" },
      { value: "坪洲", label: "坪洲", labelEn: "Peng Chau" },
      { value: "離島區", label: "離島區", labelEn: "Islands" },
    ]
  }
};

// Get all district values for a region
export function getDistrictsForRegion(regionKey: string): string[] {
  const region = HONG_KONG_DISTRICTS[regionKey as keyof typeof HONG_KONG_DISTRICTS];
  if (!region) return [];
  return region.districts.map(d => d.value);
}

// Fuzzy match district - matches if:
// 1. Exactly equals any district, OR
// 2. Contains district (if district ≥2 chars), OR  
// 3. Is contained in district (if item ≥2 chars)
function fuzzyMatchDistrict(itemDistrict: string | undefined | null, targetDistrict: any): boolean {
  if (!itemDistrict || !targetDistrict) return false;
  
  const item = itemDistrict.trim().toLowerCase();
  
  // We need to match against value, label, and labelEn
  const targetValue = (targetDistrict.value || '').trim().toLowerCase();
  const targetLabel = (targetDistrict.label || '').trim().toLowerCase();
  const targetLabelEn = (targetDistrict.labelEn || '').trim().toLowerCase();
  
  if (!item || !targetValue) return false;
  
  const targets = [targetValue, targetLabel, targetLabelEn].filter(Boolean);
  
  for (const target of targets) {
    // Exact match
    if (item === target) return true;
    
    // Item contains target (if target ≥2 chars)
    if (target.length >= 2 && item.includes(target)) return true;
    
    // Target contains item (if item ≥2 chars)
    if (item.length >= 2 && target.includes(item)) return true;
  }
  
  return false;
}

// Get region key from a district value using fuzzy matching
export function getRegionFromDistrict(district: string | undefined | null): string {
  if (!district) return 'Others';
  
  const trimmedDistrict = district.trim();
  if (!trimmedDistrict) return 'Others';
  
  for (const [regionKey, regionData] of Object.entries(HONG_KONG_DISTRICTS)) {
    const found = regionData.districts.some(d => fuzzyMatchDistrict(trimmedDistrict, d));
    if (found) {
      return regionKey;
    }
  }
  return 'Others';
}

// Check if a district belongs to a region using fuzzy matching
export function districtBelongsToRegion(itemDistrict: string | undefined | null, regionKey: string): boolean {
  if (!itemDistrict) return false;
  
  const region = HONG_KONG_DISTRICTS[regionKey as keyof typeof HONG_KONG_DISTRICTS];
  if (!region) return false;
  
  return region.districts.some(d => fuzzyMatchDistrict(itemDistrict, d));
}

// Map region filter value (English) to region key (Chinese)
export function mapFilterToRegionKey(filterValue: string): string | null {
  const filterMap: Record<string, string> = {
    'Hong Kong': '香港',
    'Kowloon': '九龍',
    'New Territories': '新界',
    'Islands': '離島',
    'Others': 'Others',
  };
  return filterMap[filterValue] || null;
}
