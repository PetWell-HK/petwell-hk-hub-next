// Hardcoded "in-mall restaurants" overrides per mall.
// Keyed by the mall's `id` from petFriendlyMalls.ts.
// Only malls listed here will show the 🍴 商場內餐廳 section.

export interface MallDiningEntry {
  name: string;
  floor?: string;
  hours?: string;
  image?: string;
  link?: string;
}

export const mallDiningOverrides: Record<string, MallDiningEntry[]> = {
  "the-southside": [
    {
      name: "N+ BURGER",
      floor: "LG01, LG",
      hours: "11:00 - 22:00",
      link: "https://www.thesouthside.com.hk/tch/dining/n-burger",
    },
    {
      name: "stain+",
      floor: "141, L1",
      hours: "08:00 - 19:00",
      link: "https://www.thesouthside.com.hk/tch/dining/stain",
    },
    {
      name: "table",
      floor: "LG03, LG",
      hours: "07:00 - 21:30",
      image:
        "https://www.thesouthside.com.hk/v3/assets/blt554f32f983fc66a3/blt2b8cd4a3bbbe02ad/66535692c9024c95dfad9089/table_shop_logo_810_x_540.png",
      link: "https://www.thesouthside.com.hk/tch/dining/table",
    },
  ],
};
