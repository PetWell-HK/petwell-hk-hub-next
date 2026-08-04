// Parking-tip overlays for the redesigned pet-friendly malls page.
// Kept separate so the source data files stay untouched.


export const mallParkingTips: Record<string, string> = {
  "THE SOUTHSIDE": "星期一至五晚上6時後，貓狗主人與愛寵同往可享高達3小時免費泊車",
  "Stanley Plaza": "同日電子消費HK$400或以上享2小時免費泊車，HK$800或以上享4小時。",
  "Peak Galleria": "同日電子消費HK$100享1小時，HK$300享3小時，HK$500享5小時免費泊車。hello Ruby會員每月5次免費1小時。",
  "The Pulse": "平日消費HK$200或假日消費HK$400可享2小時免費泊車（憑單張收據）。",
  "IFC Mall": "消費HK$300享2小時，HK$500享3小時免費泊車。繁忙時段附加費適用。",
  "Pacific Place": "同日累積電子消費HK$500（任何時間）或HK$300（下午5時後）可享3小時免費泊車。",
  "Hysan Place": "平日消費HK$200享3小時，週末消費HK$400享2小時免費泊車（Lee Gardens Area各商場通用）。",
  "K11 MUSEA": "KLUB11會員平日消費HK$200享2小時，HK$300享3小時；週末及假日消費HK$400享2小時免費泊車。",
  "Airside": "指定消費可享免費泊車，NF Touch會員額外多1小時，每次最多5小時。EV充電另有優惠。",
  "MegaBox": "指定電子消費可享免費泊車，每日最多5小時。週六於Enterprise Square Three停車場可享免費泊車。",
  "Harbour City": "每HK$100單次電子消費享1小時免費泊車。China Hong Kong City車場高度限制2.00m。",
  "Festival Walk": "下午5時後無需消費享1小時免費泊車。另平日消費HK$200或週末消費HK$500可額外享2小時。",
  "New Town Plaza": "同日電子消費HK$300享2小時，HK$600享4小時免費泊車（沙田廣場停車場）。",
  "Elements": "同日電子消費HK$100享1小時免費泊車，最多5小時。EV充電位閒置費HK$5/分鐘（15分鐘後）。",
  "Langham Place": "平日消費HK$200享1小時，HK$400享2小時；週末消費HK$400享1小時，HK$600享2小時免費泊車。",
};

export type ParkWiseChip = { name: string; distance: string; url: string };
export type ParkWiseInfo = { region: string; chips: ParkWiseChip[] };

export const PARK_WISE_BASE = "https://park-wise.lifetat.com/en";

const HKI = `${PARK_WISE_BASE}/regions/HKIsland`;
const KLN = `${PARK_WISE_BASE}/regions/KLN`;
const NT = `${PARK_WISE_BASE}/regions/NT`;
const cp = (id: string) => `${PARK_WISE_BASE}/carParks/${id}`;

export const mallParkWise: Record<string, ParkWiseInfo> = {
  "THE SOUTHSIDE": { region: HKI, chips: [{ name: "MTR Ocean Park Station Car Park", distance: "56m", url: cp("tdc8p11") }] },
  "Stanley Plaza": { region: HKI, chips: [{ name: "Stanley Plaza Car Park", distance: "333m", url: cp("tdc14p6401") }] },
  "Peak Galleria": { region: HKI, chips: [{ name: "Peak Galleria", distance: "468m", url: cp("tdc21p1") }] },
  "Harbour North": { region: HKI, chips: [{ name: "Harbour North Phase 2&3 B2/F Zone A", distance: "298m", url: cp("tdc328p1") }] },
  "Hopewell Mall": { region: HKI, chips: [
    { name: "Wu Chung House", distance: "333m", url: cp("tdc5p3") },
    { name: "Hopewell Centre", distance: "365m", url: cp("tdc5p1") },
  ]},
  "The Arcade Cyberport": { region: HKI, chips: [
    { name: "Cyberport Carpark 1&2", distance: "89m", url: cp("tdc113p1") },
    { name: "Cyberport Carpark 3", distance: "287m", url: cp("tdc113p2") },
  ]},
  "Central Market": { region: HKI, chips: [
    { name: "MTR Hong Kong Station Car Park", distance: "357m", url: cp("tdc8p3") },
    { name: "Rumsey Street Car Park", distance: "437m", url: cp("tdcp2") },
  ]},
  "IFC Mall": { region: HKI, chips: [
    { name: "MTR Hong Kong Station Car Park", distance: "56m", url: cp("tdc8p3") },
    { name: "Star Ferry Car Park", distance: "409m", url: cp("tdcp8") },
  ]},
  "World Trade Centre": { region: HKI, chips: [
    { name: "Hysan Place Car Park", distance: "48m", url: cp("tdc1p4") },
    { name: "One Causeway Bay", distance: "218m", url: cp("tdc262p1") },
  ]},
  "Pacific Place": { region: HKI, chips: [{ name: "Queensway Government Offices", distance: "126m", url: cp("tdc95p1") }] },
  "Hysan Place": { region: HKI, chips: [
    { name: "Hysan Place Car Park", distance: "65m", url: cp("tdc1p4") },
    { name: "Lee Garden One", distance: "144m", url: cp("tdc1p1") },
  ]},
  "The Pulse": { region: HKI, chips: [] },

  "D2 Place": { region: KLN, chips: [
    { name: "Hang Chun Court", distance: "88m", url: cp("tdc292p1") },
    { name: "Sham Shui Po Sports Ground", distance: "250m", url: cp("tdc48p3") },
  ]},
  "Lai Sun Commercial Centre": { region: KLN, chips: [{ name: "Sham Shui Po Sports Ground", distance: "121m", url: cp("tdc48p3") }] },
  "Mikiki": { region: KLN, chips: [
    { name: "The Twins Carpark Tower I", distance: "250m", url: cp("tdc168p1") },
    { name: "Kai Ching Estate", distance: "315m", url: cp("tdc93p1") },
  ]},
  "K11 MUSEA": { region: KLN, chips: [] },
  "Airside": { region: KLN, chips: [
    { name: "Kowloon Bay Sports Ground B", distance: "205m", url: cp("tdc74p11") },
    { name: "Kowloon Bay Park", distance: "273m", url: cp("tdc350p1") },
  ]},
  "MegaBox": { region: KLN, chips: [
    { name: "Telford Plaza I", distance: "70m", url: cp("31") },
    { name: "Telford Plaza II", distance: "187m", url: cp("32") },
  ]},
  "Olympian City": { region: KLN, chips: [{ name: "Nam Cheong Car Park", distance: "725m", url: cp("tdc14p5421") }] },
  "Langham Place": { region: KLN, chips: [
    { name: "Pioneer Centre", distance: "339m", url: cp("tdc26p2") },
    { name: "MOKO Car Park", distance: "576m", url: cp("tdc368p1") },
  ]},
  "apm": { region: KLN, chips: [
    { name: "apm Car Park", distance: "20m", url: cp("tdc332p1") },
    { name: "Crocodile Centre", distance: "67m", url: cp("tdc73p1") },
  ]},
  "Moko": { region: KLN, chips: [
    { name: "Pioneer Centre", distance: "159m", url: cp("tdc26p2") },
    { name: "MOKO Car Park", distance: "311m", url: cp("tdc368p1") },
  ]},
  "Festival Walk": { region: KLN, chips: [{ name: "Cornwall Street Park", distance: "455m", url: cp("tdc58p4") }] },
  "Telford Plaza": { region: KLN, chips: [
    { name: "Telford Plaza I", distance: "70m", url: cp("31") },
    { name: "Telford Plaza II", distance: "187m", url: cp("32") },
  ]},
  "Grand Century Place": { region: KLN, chips: [{ name: "Pioneer Centre", distance: "70m", url: cp("tdc26p2") }] },
  "Harbour City": { region: KLN, chips: [
    { name: "Xiqu Centre", distance: "284m", url: cp("tdc17p1") },
    { name: "Kowloon Park", distance: "391m", url: cp("tdc51p1") },
  ]},
  "K11 Art Mall": { region: KLN, chips: [{ name: "Kowloon Park", distance: "562m", url: cp("tdc51p1") }] },
  "The ONE": { region: KLN, chips: [{ name: "Kowloon Park", distance: "434m", url: cp("tdc51p1") }] },
  "iSQUARE": { region: KLN, chips: [{ name: "Kowloon Park", distance: "540m", url: cp("tdc51p1") }] },
  "Elements": { region: KLN, chips: [
    { name: "ELEMENTS Carpark", distance: "98m", url: cp("tdc8p10") },
    { name: "MTR Kowloon Station", distance: "102m", url: cp("tdc8p2") },
  ]},
  "PopCorn": { region: KLN, chips: [
    { name: "Popcorn I Carpark", distance: "184m", url: cp("tdc8p8") },
    { name: "Park Central", distance: "275m", url: cp("tdc322p1") },
  ]},
  "LOHAS Park Mall": { region: KLN, chips: [{ name: "The LOHAS", distance: "215m", url: cp("tdc8p16") }] },

  "Citygate Outlets": { region: NT, chips: [] },
  "New Town Plaza": { region: NT, chips: [
    { name: "New Town Plaza I", distance: "180m", url: cp("tdc279p1") },
    { name: "New Town Plaza III", distance: "208m", url: cp("tdc280p1") },
    { name: "Sha Tin Town Hall", distance: "261m", url: cp("tdc94p1") },
  ]},
  "HomeSquare": { region: NT, chips: [
    { name: "New Town Plaza I", distance: "180m", url: cp("tdc279p1") },
    { name: "New Town Plaza III", distance: "208m", url: cp("tdc280p1") },
  ]},
  "Shatin Plaza": { region: NT, chips: [
    { name: "New Town Plaza I", distance: "180m", url: cp("tdc279p1") },
    { name: "Sha Tin Town Hall", distance: "261m", url: cp("tdc94p1") },
  ]},
  "Landmark North": { region: NT, chips: [
    { name: "Landmark North Car Park", distance: "115m", url: cp("tdc325p1") },
    { name: "Choi Yuen Car Park D", distance: "162m", url: cp("tdc14p2121") },
  ]},
  "Metroplaza": { region: NT, chips: [
    { name: "Hing Fong Road Playground", distance: "287m", url: cp("tdc81p1") },
    { name: "Metroplaza", distance: "372m", url: cp("tdc312p1") },
  ]},
  "Tuen Mun Town Plaza": { region: NT, chips: [
    { name: "Tuen Mun Town Plaza Phase 2", distance: "36m", url: cp("tdc25p43") },
    { name: "Pui To Road", distance: "130m", url: cp("tdstt59") },
  ]},
  "Yoho Mall": { region: NT, chips: [
    { name: "Yuen Long District Office", distance: "111m", url: cp("tdc59p1") },
    { name: "Long Ping Car Park D", distance: "272m", url: cp("tdc14p4237") },
  ]},
  "Kingswood Ginza": { region: NT, chips: [
    { name: "Yuen Long District Office", distance: "111m", url: cp("tdc59p1") },
    { name: "Long Ping Car Park D", distance: "272m", url: cp("tdc14p4237") },
  ]},
  "Sunshine City Plaza": { region: NT, chips: [] },
};

export function getMallParkWise(name: string): ParkWiseInfo {
  return mallParkWise[name] ?? { region: HKI, chips: [] };
}
