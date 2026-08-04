// Chinese (Traditional, HK) translations of mall parking details.
// Keys MUST match those in mallParkingDetails.ts.
import type { MallParkingDetail } from "./mallParkingDetails";

export const mallParkingDetailsZh: Record<string, MallParkingDetail> = {
  "THE SOUTHSIDE": {
    parking: "推廣期至2026年7月31日。逢星期一至五晚上6時後，貓狗主人與愛寵同往可享高達3小時免費泊車（入車18:00–23:59，優惠即日23:59截止）。2026年7月1日起須以MTR Mobile會員二維碼於GF禮賓處（07:30–23:30）換領。不可與其他額外泊車優惠同時使用。設235個車位，時租HK$24，備有AC（7kW）及DC（50kW）充電。",
    openingHours: "07:00–23:00",
    parkingWebsite: "https://www.thesouthside.com.hk/tch/parking",
    nearbyCarParks: [
      { name: "港鐵海洋公園站停車場", distance: "步行 51 米", address: "香港南區黃竹坑道", height: "2.1 米" },
    ],
  },
  "Stanley Plaza": {
    parking: "設有赤柱廣場停車場（直達商場），共 228 個地庫車位。限高 2.2 米，按小時收費。此停車場暫未確認設有電動車充電。",
    openingHours: "每日 8:00–23:00",
    nearbyCarParks: [
      { name: "赤柱廣場停車場", distance: "步行 421 米", address: "香港赤柱佳美道 23 號赤柱廣場", height: "2.2 米" },
    ],
  },
  "Peak Galleria": {
    parking: "設有地庫停車場，共 367 個車位。3 個電動車充電站位於 60 號停車場 B1（英式插座、Type 2 Tesla Destination）。",
    openingHours: "每日上午 10 時至晚上 10 時",
    nearbyCarParks: [
      { name: "山頂廣場", distance: "步行 146 米", address: "山頂道 118 號", height: "—" },
    ],
  },
  "The Pulse": {
    parking: "約 50 個車位。設有 Tesla 超級充電站及其他電動車充電器。",
    openingHours: "星期一至四 10:00–22:00；星期五至日 10:00–00:00",
    nearbyCarParks: [],
  },
  "Harbour North Phase 1/2": {
    parking: "1 至 3 期停車場提供免費時租泊車優惠。2 及 3 期停車場設有 The Point 電動車超級充電站。",
    openingHours: "每日 10:00–22:00",
    nearbyCarParks: [
      { name: "海濱滙 2 及 3 期 B2/F A 區", distance: "步行 283 米", address: "香港北角渣華道 133 號", height: "2.1 米" },
    ],
  },
  "Hopewell Mall": {
    parking: "合和中心停車場（堅尼地道入口）共 250 個車位。設有電動車充電（BMW Fast/Medium、Tesla 超充/中速、Porsche 超充）。泊車費 HK$35/小時，按消費可享免費泊車。",
    openingHours: "未確認",
    nearbyCarParks: [
      { name: "胡忠大廈", distance: "步行 352 米", address: "香港灣仔皇后大道東 213 號", height: "1.9 米" },
      { name: "合和中心", distance: "步行 406 米", address: "香港灣仔皇后大道東 183 號（堅尼地道入口）", height: "2 米" },
      { name: "新鴻基中心", distance: "步行 478 米", address: "香港灣仔港灣道 30 號新鴻基中心 B1/F", height: "1.8 米" },
    ],
  },
  "The Arcade Cyberport": {
    parking: "停車場 1 及 2、停車場 3 均有提供，按小時收費。1 及 2 號停車場 2 樓設有電動車充電站（包括 Tesla 超充）。",
    openingHours: "每日 10:00–22:00（顧客服務時間，預計與商場相同）",
    nearbyCarParks: [
      { name: "數碼港停車場 1 及 2", distance: "步行 160 米", address: "香港南區數碼港道 100 號", height: "—" },
      { name: "數碼港停車場 3", distance: "步行 239 米", address: "香港南區數碼港道 100 號", height: "—" },
    ],
  },
  "Central Market": {
    parking: "商場本身沒有停車場。附近設有公共停車場（例如華光中環中心停車場、天星碼頭停車場）。",
    openingHours: "每日 10:00–22:00",
    nearbyCarParks: [
      { name: "港鐵香港站停車場", distance: "步行 395 米", address: "香港中西區國際金融中心二期", height: "2.1 米" },
      { name: "林士街停車場", distance: "步行 446 米", address: "香港上環林士街 2 號", height: "—" },
    ],
  },
  "IFC Mall": {
    parking: "設有停車場。HK$32/小時（07:01–23:00）、HK$18/小時（23:01–07:00）。提供代客泊車及消費免費泊車優惠。",
    openingHours: "每日 10:00–22:00",
    nearbyCarParks: [
      { name: "港鐵香港站停車場", distance: "步行 56 米", address: "香港中西區國際金融中心", height: "2.1 米" },
      { name: "天星碼頭停車場", distance: "步行 409 米", address: "香港中環愛丁堡廣場 9 號", height: "—" },
      { name: "林士街停車場", distance: "步行 516 米", address: "香港上環林士街 2 號", height: "—" },
    ],
  },
  "World Trade Centre (wtc mall)": {
    parking: "共 81 個車位，2 個電動車充電站。時租：HK$40/小時（星期一至四）、HK$48/小時（星期五至日及公眾假期）。夜間泊車 HK$10/小時（星期一至五 23:00–08:00）、日泊 HK$220（星期一至四 08:00–18:00）。",
    openingHours: "每日 10:00–23:00",
    nearbyCarParks: [
      { name: "希慎廣場停車場", distance: "步行 104 米", address: "香港灣仔軒尼詩道 500 號", height: "3.5 米" },
      { name: "One Causeway Bay 停車場", distance: "步行 162 米", address: "香港銅鑼灣告士打道 281 號", height: "2.4 米" },
      { name: "利園一期停車場", distance: "步行 268 米", address: "香港灣仔希慎道 33 號", height: "2 米" },
    ],
  },
  "Pacific Place": {
    parking: "超過 400 個車位。泊車費 HK$39/小時（2026 年 1 月 1 日起）。同日電子消費滿 HK$500（任何時段）或 HK$300（下午 5 時後）可享 3 小時免費泊車。電動車充電：未確認。",
    openingHours: "每日 10:00–22:00",
    nearbyCarParks: [
      { name: "金鐘道政府合署", distance: "步行 143 米", address: "香港金鐘道 66 號", height: "—" },
    ],
  },
  "Hysan Place": {
    parking: "希慎廣場（66 個車位）、利園一至三期及禮頓停車場均有提供。電動車充電資訊未確認。",
    openingHours: "商店：星期日至四 10:00–22:00、星期五六及假期前夕 10:00–23:00；餐廳：星期日至四 11:00–23:00、星期五六及假期前夕 11:00–24:00",
    nearbyCarParks: [
      { name: "希慎廣場停車場", distance: "步行 98 米", address: "香港灣仔軒尼詩道 500 號", height: "3.5 米" },
      { name: "利園一期停車場", distance: "步行 122 米", address: "香港灣仔希慎道 33 號", height: "2 米" },
      { name: "利園二期停車場", distance: "步行 207 米", address: "香港灣仔恩平道 28 號", height: "2.1 米" },
    ],
  },
  "D2 Place": {
    parking: "HAPI Club 會員電子消費可享免費泊車（HK$300 換 1 小時、HK$500 換 2 小時、HK$800 換 3 小時），適用於私家車及客貨車。車位數目及電動車充電未有確認資料。",
    openingHours: "每日 10:00–22:00",
    nearbyCarParks: [
      { name: "深水埗運動場", distance: "步行 239 米", address: "九龍長沙灣興華街 3 號", height: "2.45 米" },
      { name: "幸俊苑停車場", distance: "步行 427 米", address: "幸祥街 2 號", height: "2.4 米" },
      { name: "海麗邨停車場", distance: "步行 465 米", address: "九龍長沙灣深旺道 100 號", height: "—" },
    ],
  },
  "Lai Sun Commercial Centre": {
    parking: "565 個車位（資料來自 laisun.com）／408 個車位（資料來自 Parkopedia）。提供月租及時租，未有明確電動車充電資訊。",
    openingHours: "未確認",
    nearbyCarParks: [
      { name: "深水埗運動場", distance: "步行 261 米", address: "九龍長沙灣興華街 3 號", height: "2.45 米" },
      { name: "幸俊苑停車場", distance: "步行 474 米", address: "幸祥街 2 號", height: "2.4 米" },
      { name: "海麗邨停車場", distance: "步行 517 米", address: "九龍長沙灣深旺道 100 號", height: "—" },
    ],
  },
  "Mikiki": {
    parking: "共 420 個車位。B2 停車場設有 8 個 The Point 電動車超級充電站及 4 個 Tesla 超充。收費 HK$28–30/小時。The Point 會員可享免費泊車。",
    openingHours: "未確認",
    nearbyCarParks: [
      { name: "東頭（二）邨停車場 A", distance: "步行 345 米", address: "九龍黃大仙東頭村道 183 號", height: "2 米" },
      { name: "黃大仙中心南館停車場 A", distance: "步行 388 米", address: "九龍黃大仙正德街 103 號", height: "2 米" },
      { name: "下黃大仙（二）邨（第 9 期）停車場", distance: "步行 404 米", address: "九龍黃大仙正德街 103 號", height: "2 米" },
    ],
  },
  "K11 Musea": {
    parking: "K11 MUSEA B4 設有公眾電動車充電站。KLUB11 會員可按同日消費享免費泊車優惠（例如星期五至日及公眾假期消費 HK$500 可享 2 小時）。一般泊車費 HK$30/小時（星期一至四）、HK$41/小時（星期五至日及公眾假期）。",
    openingHours: "每日 10:00–22:00",
    nearbyCarParks: [],
  },
  "Airside": {
    parking: "共 851 個車位，全部設有電動車充電設施（位於 B3/F 及 B4/F）。另設 48 個室內單車泊位。",
    openingHours: "每日 10:00–22:00",
    nearbyCarParks: [
      { name: "Airside", distance: "步行 5 米", address: "九龍啟德協調道 2 號", height: "2.4 米" },
      { name: "天璽．海", distance: "步行 151 米", address: "協調道 10 號", height: "2.4 米" },
      { name: "工業貿易大樓停車場", distance: "步行 167 米", address: "九龍啟德協調道 3 號", height: "—" },
    ],
  },
  "MegaBox": {
    parking: "多層停車場（L5–L16 及地庫）。收費 HK$23/小時（星期一至五，公眾假期除外）、HK$26/小時（星期六、日及公眾假期）。超過 1000 個車位。電動車充電未有明確資料。",
    openingHours: "每日 10:00–22:00",
    nearbyCarParks: [
      { name: "京士頓國際中心", distance: "步行 150 米", address: "九龍灣宏照道 19 號", height: "—" },
      { name: "THE CENDAS 停車場", distance: "步行 150 米", address: "九龍灣常悅道 15 號 THE CENDAS", height: "—" },
      { name: "九龍灣運動場 B", distance: "步行 367 米", address: "九龍灣啟樂街 1 號", height: "—" },
    ],
  },
  "Olympian City": {
    parking: "奧海城 1、2、3 期停車場均有提供，按小時收費，亦設消費免費泊車優惠。奧海城 1 期 UG/F 設電動車充電服務。",
    openingHours: "每日 10:00–22:00（未確認，資料來自 Trip.com）",
    nearbyCarParks: [
      { name: "海富停車場", distance: "步行 552 米", address: "九龍旺角海庭道 2 號海富苑商場", height: "—" },
      { name: "海庭道", distance: "步行 598 米", address: "九龍油麻地海庭道", height: "—" },
    ],
  },
  "Langham Place": {
    parking: "B4 設有電動車充電站。泊車費 HK$37/小時（星期一至四）、HK$41/小時（星期五至日及公眾假期）。夜間泊車 HK$120（22:00–08:00）。LP CLUB 會員可享免取票泊車。",
    openingHours: "每日 10:30–22:30",
    nearbyCarParks: [
      { name: "始創中心停車場", distance: "步行 329 米", address: "西洋菜南街 133 號", height: "—" },
      { name: "MOKO 新世紀廣場停車場", distance: "步行 556 米", address: "九龍旺角太子道西 193 號", height: "—" },
      { name: "海富停車場", distance: "步行 566 米", address: "九龍旺角海庭道 2 號海富苑商場", height: "—" },
    ],
  },
  "MOKO": {
    parking: "提供泊車服務。The Point 會員可按消費享免費泊車（星期一至五消費 HK$200+ 換 3 小時、星期六日及公眾假期消費 HK$400+ 換 2 小時）。指定餐飲或戲院消費 HK$100+ 另加 1 小時免費泊車，星期一至五最多 4 小時、星期六日及公眾假期最多 3 小時。設有電動車充電（可用積分享超充）。",
    openingHours: "每日 10:00–22:00",
    nearbyCarParks: [
      { name: "始創中心停車場", distance: "步行 208 米", address: "西洋菜南街 133 號", height: "—" },
      { name: "MOKO 新世紀廣場停車場", distance: "步行 308 米", address: "九龍旺角太子道西 193 號", height: "—" },
      { name: "旺角大球場", distance: "步行 532 米", address: "九龍旺角花墟道 37 號", height: "2.45 米" },
    ],
  },
  "Elements": {
    parking: "提供泊車，HK$26/小時。設約 131 個電動車充電站（DC HK$3/kWh、AC HK$2.6/kWh）。按消費或戲院門票可享泊車優惠。",
    openingHours: "每日 11:00–22:00",
    nearbyCarParks: [
      { name: "圓方停車場", distance: "步行 92 米", address: "九龍柯士甸道西 1 號", height: "2.2 米" },
      { name: "港鐵九龍站停車場", distance: "步行 125 米", address: "九龍油麻地雅翔道港鐵九龍站", height: "2.1 米" },
      { name: "M+ 停車場", distance: "步行 340 米", address: "九龍西九文化區博物館道 38 號", height: "2.1 米" },
    ],
  },
  "Harbour City": {
    parking: "海運大廈停車場（P5）：07:00–22:59 $17/30 分鐘、23:00–06:59 $6/30 分鐘，設 30 個電動車充電位。海洋中心停車場（P6）、港威停車場（P1）、3 號碼頭停車場（P3）日間 $19/30 分鐘、夜間 $6/30 分鐘。",
    openingHours: "每日 10:00–22:00",
    nearbyCarParks: [
      { name: "戲曲中心停車場", distance: "步行 319 米", address: "九龍尖沙咀柯士甸道西 88 號", height: "2.45 米" },
      { name: "九龍公園", distance: "步行 430 米", address: "九龍尖沙咀柯士甸道 22 號", height: "—" },
    ],
  },
  "Festival Walk": {
    parking: "共 830 個車位。2 個電動車快速充電站（P1）、30 個中速充電站（P3）、6 個 Tesla 超充（P1）。",
    openingHours: "每日 10:00–22:00",
    nearbyCarParks: [
      { name: "歌和老街公園", distance: "步行 375 米", address: "九龍塘歌和老街 17 號", height: "2.45 米" },
      { name: "石硤尾公園體育館", distance: "步行 597 米", address: "深水埗南山邨道", height: "2.45 米" },
    ],
  },
  "SOGO Kai Tak": {
    parking: "The Twins 停車場提供泊車。時租：HK$20/小時（星期一至五）、HK$22/小時（星期六日及公眾假期）。電動車中速充電：HK$2.2/kWh。按消費可享免費泊車。",
    openingHours: "星期一至五 11:00–20:00；星期六日及公眾假期 11:00–21:00",
    nearbyCarParks: [
      { name: "德朗邨停車場 A", distance: "步行 354 米", address: "九龍九龍城承啟道", height: "2 米" },
      { name: "Airside", distance: "步行 446 米", address: "九龍啟德協調道 2 號", height: "2.4 米" },
      { name: "啟晴邨停車場", distance: "步行 478 米", address: "九龍九龍城沐虹街 12 號啟晴邨", height: "2.4 米" },
    ],
  },
  "APM": {
    parking: "提供泊車，並設 3 小時免費泊車優惠及電動車超級充電。車位數目未確認。",
    openingHours: "每日 11:00–02:00",
    nearbyCarParks: [
      { name: "鱷魚恤中心", distance: "步行 48 米", address: "九龍觀塘開源道 79 號", height: "—" },
      { name: "Prosperity Place 停車場", distance: "步行 106 米", address: "九龍觀塘成業街 6 號", height: "—" },
      { name: "apm 停車場", distance: "步行 133 米", address: "九龍觀塘觀塘道 418 號", height: "2.2 米" },
    ],
  },
  "V Walk": {
    parking: "標準時租：HK$24/小時（星期一至五）、HK$26/小時（星期六日及公眾假期）。夜泊 HK$80（22:00–07:00）。The Point 會員按消費享免費泊車。全場車位均設約 7kW 中速充電器，亦可用積分享電動車超充。",
    openingHours: "每日 10:00–22:00",
    nearbyCarParks: [
      { name: "榮昌邨停車場", distance: "步行 189 米", address: "深水埗西邨路 20 號", height: "—" },
      { name: "V Walk 停車場", distance: "步行 191 米", address: "深水埗深旺道 28 號", height: "—" },
      { name: "南昌邨停車場", distance: "步行 245 米", address: "九龍深水埗長新里 3 號南昌邨", height: "2.3 米" },
    ],
  },
  "We Go Mall": {
    parking: "時租：星期一至五 $20/小時，星期六日及公眾假期 $24/小時。日泊（星期一至五 08:00–18:00）$100、夜泊（22:00–08:00）$90、月租夜泊（21:00–08:00）$2,000/月。按消費可享免費泊車（如消費 HK$200+ 享 2 小時、HK$300+ 享 3 小時）。設電動車充電，包括 Tesla 及 4 個 AC 中速充電位（最高 21kW）。",
    openingHours: "每日 07:00–23:00",
    nearbyCarParks: [
      { name: "馬鞍山游泳池", distance: "步行 529 米", address: "沙田馬鞍山鞍駿街 33 號", height: "2.45 米" },
    ],
  },
  "The Mills": {
    parking: "$25/小時（只限私家車），可用八達通付款。設 6 個電動車充電站。",
    openingHours: "每日 10:00–22:00",
    nearbyCarParks: [
      { name: "荃灣廣場停車場", distance: "步行 191 米", address: "荃灣大壩街 4–30 號", height: "—" },
      { name: "Technology Plaza", distance: "步行 313 米", address: "新界荃灣沙咀道 29–35 號", height: "—" },
      { name: "海盛路 NEVAS 智能停車場", distance: "步行 368 米", address: "荃灣海盛路與海角街交界", height: "—" },
    ],
  },
  "Go Park Sai Sha": {
    parking: "GO PARK 西沙提供按消費免費泊車優惠。標準收費：HK$20/小時（星期一至五）、HK$24/小時（星期六日及公眾假期）。日泊或夜泊 HK$90。車位數目及電動車充電未有確認。",
    openingHours: "每日 10:00–22:00",
    nearbyCarParks: [],
  },
  "Monterey Place": {
    parking: "O'South 海岸城共 259 個車位。私家車／客貨車 $14/小時。未有明確電動車充電資訊。",
    openingHours: "星期一至五 10:00–23:00；星期六 10:00–23:00；星期日（未確認）",
    nearbyCarParks: [
      { name: "新都城一期停車場", distance: "步行 82 米", address: "新界西貢將軍澳唐賢街 9 號", height: "2.2 米" },
      { name: "Park Central 商場停車場", distance: "步行 167 米", address: "香港新界將軍澳唐德街 9 號", height: "2 米" },
      { name: "唐明苑停車場", distance: "步行 371 米", address: "新界將軍澳唐明街 15 號唐明苑", height: "2 米" },
    ],
  },
  "PopCorn": {
    parking: "提供泊車。同日消費可享免費泊車（星期一至五 HK$200 換 2 小時、星期六日及公眾假期 HK$400 換 3 小時）。設寵物優先停車位（C75）及電動車充電站。泊車費 HK$20/小時。",
    openingHours: "每日 11:00–22:00",
    nearbyCarParks: [
      { name: "新都城一期停車場", distance: "步行 82 米", address: "新界西貢將軍澳唐賢街 9 號", height: "2.2 米" },
      { name: "Park Central 商場停車場", distance: "步行 167 米", address: "香港新界將軍澳唐德街 9 號", height: "2 米" },
      { name: "唐明苑停車場", distance: "步行 371 米", address: "新界將軍澳唐明街 15 號唐明苑", height: "2 米" },
    ],
  },
  "YOHO Mall": {
    parking: "設有停車場，並提供多項會員及指定車輛優惠。另設電動車充電。",
    openingHours: "每日 10:00–22:00",
    nearbyCarParks: [
      { name: "元朗政府合署", distance: "步行 130 米", address: "新界元朗青山公路 269 號", height: "—" },
      { name: "朗屏停車場 D", distance: "步行 339 米", address: "新界元朗朗屏路 1 號朗屏商業中心", height: "2 米" },
      { name: "水邊圍邨", distance: "步行 435 米", address: "新界元朗水邊圍路", height: "2.9 米" },
    ],
  },
  "Metroplaza": {
    parking: "共 674 個車位。時租：私家車／客貨車 $14/小時、貨車 $24/小時。日泊（0800–1900）私家車／客貨車 $85。會員或可享免費泊車。",
    openingHours: "未確認",
    nearbyCarParks: [
      { name: "新都會廣場", distance: "步行 238 米", address: "新界葵芳興芳路 223 號", height: "—" },
      { name: "葵芳停車場", distance: "步行 287 米", address: "葵芳葵義路 19 號", height: "—" },
      { name: "興芳路遊樂場", distance: "步行 412 米", address: "葵涌興芳路", height: "2.45 米" },
    ],
  },
  "New Town Plaza": {
    parking: "1 期及 3 期均有泊車。設有電動車充電站。車位數目未確認。",
    openingHours: "每日 10:00–22:00",
    nearbyCarParks: [
      { name: "新城市廣場 1 期", distance: "步行 129 米", address: "沙田沙田正街 18–19 號", height: "1.95 米" },
      { name: "新城市廣場 3 期", distance: "步行 205 米", address: "沙田沙田正街 2–8 號", height: "1.95 米" },
      { name: "沙田大會堂停車場", distance: "步行 215 米", address: "沙田源禾路 1 號", height: "2.45 米" },
    ],
  },
  "The Wai": {
    parking: "共 390 個車位，包括 18 個電動車充電位。按消費可享免費泊車優惠。",
    openingHours: "每日 10:00–22:00",
    nearbyCarParks: [
      { name: "新翠停車場 B", distance: "步行 450 米", address: "新界沙田大圍翠田街 2 號新翠商場", height: "2.1 米" },
      { name: "隆亨 A 停車場", distance: "步行 507 米", address: "新界沙田大圍田心街 1 號隆亨商業中心", height: "1.9 米" },
      { name: "大圍名城 The Met Acappella 公眾停車場", distance: "步行 524 米", address: "大圍沙田嶺路 7838 號", height: "2.45 米" },
    ],
  },
  "Citywalk": {
    parking: "電子付款消費 HK$200（1 小時）或 HK$400（2 小時）可享免費泊車。Citywalk 停車場 1/F 及 Citywalk 2 停車場 B1/F 設 Shell Recharge 電動車充電（DC 及 AC）。時租 HK$18（星期一至五）、HK$25（星期六日及公眾假期）。",
    openingHours: "每日 10:00–22:00",
    nearbyCarParks: [
      { name: "荃灣廣場停車場", distance: "步行 191 米", address: "荃灣大壩街 4–30 號", height: "—" },
      { name: "Technology Plaza", distance: "步行 313 米", address: "新界荃灣沙咀道 29–35 號", height: "—" },
      { name: "海盛路 NEVAS 智能停車場", distance: "步行 368 米", address: "荃灣海盛路與海角街交界", height: "—" },
    ],
  },
  "OP Mall": {
    parking: "提供泊車。時租：星期一至五 HK$22、星期六日及公眾假期 HK$10（2/F 停車位）。車位數目及電動車充電未確認。",
    openingHours: "每日 10:00–22:00",
    nearbyCarParks: [
      { name: "荃灣廣場停車場", distance: "步行 191 米", address: "荃灣大壩街 4–30 號", height: "—" },
      { name: "Technology Plaza", distance: "步行 313 米", address: "新界荃灣沙咀道 29–35 號", height: "—" },
      { name: "海盛路 NEVAS 智能停車場", distance: "步行 368 米", address: "荃灣海盛路與海角街交界", height: "—" },
    ],
  },
  "The Laguna Mall": {
    parking: "超過 200 個有蓋車位，按小時收費。未有電動車充電資訊。",
    openingHours: "商場：每日 7:00–22:00；停車場：每日 9:00–21:00",
    nearbyCarParks: [
      { name: "紅磡邨第二期停車場", distance: "步行 233 米", address: "九龍紅磡大環道 28 號紅磡邨第二期停車場", height: "—" },
      { name: "紅磡停車場", distance: "步行 254 米", address: "九龍紅磡戴亞街 9 號紅磡邨商場", height: "2.2 米" },
    ],
  },
  "PopCorn Mall": {
    parking: "共 115 個車位。AC 充電器（最高 21kW）HK$2.6/kWh。設寵物優先泊車位 C75。按消費享免費泊車優惠。",
    openingHours: "新都城 1 期：11:00–22:00；2 期：12:00–21:00",
    nearbyCarParks: [
      { name: "新都城一期停車場", distance: "步行 82 米", address: "新界西貢將軍澳唐賢街 9 號", height: "2.2 米" },
      { name: "Park Central 商場停車場", distance: "步行 167 米", address: "香港新界將軍澳唐德街 9 號", height: "2 米" },
      { name: "唐明苑停車場", distance: "步行 371 米", address: "新界將軍澳唐明街 15 號唐明苑", height: "2 米" },
    ],
  },
  "East Point City": {
    parking: "提供泊車。標準收費：星期一至五 HK$20/小時、星期六日及公眾假期 HK$22/小時。The Point 會員享泊車優惠。B1 設 6 個 The Point 電動車超充及 6 個 Tesla 超充。",
    openingHours: "未確認",
    nearbyCarParks: [
      { name: "香港單車館停車場", distance: "步行 99 米", address: "將軍澳寶康路 107 號", height: "3.8 米" },
      { name: "將軍澳運動場", distance: "步行 245 米", address: "將軍澳寶康路 109 號", height: "—" },
      { name: "TKO Spot 停車場 A", distance: "步行 286 米", address: "新界將軍澳唐明街 2 號 TKO Spot", height: "2.1 米" },
    ],
  },
  "The LOHAS": {
    parking: "康城停車場共 333 個車位，包括 52 個電動車充電位。",
    openingHours: "每日 10:00–22:00（約）",
    nearbyCarParks: [
      { name: "石角路", distance: "步行 214 米", address: "新界將軍澳第 85 區石角路", height: "—" },
      { name: "康城", distance: "步行 277 米", address: "新界將軍澳康城路 1 號", height: "—" },
      { name: "環保大道停車場", distance: "步行 438 米", address: "新界將軍澳第 85 區環保大道", height: "2.45 米" },
    ],
  },
  "Tuen Mun Town Plaza": {
    parking: "1、2、3 期停車場均有提供。指定電子消費可享免費泊車。1、2、3 期停車場設電動車充電站（Tesla、BMW、中電、SINOPEC、13A 插座）。時租及月租按期數及日子有所不同。",
    openingHours: "每日 10:00–22:00",
    nearbyCarParks: [
      { name: "V city 港鐵停車場", distance: "步行 181 米", address: "屯門鄉事會路 83 號 3/F", height: "—" },
      { name: "V city 商業停車場", distance: "步行 190 米", address: "屯門鄉事會路 83 號 3/F", height: "—" },
      { name: "杯渡路停車場", distance: "步行 283 米", address: "新界屯門第 10A 區杯渡路", height: "—" },
    ],
  },
  "Sheung Shui Centre": {
    parking: "超過 200 個車位。B1 設電動車充電站。提供時租及按消費免費泊車優惠。",
    openingHours: "每日 08:00–22:00",
    nearbyCarParks: [
      { name: "上水廣場停車場", distance: "步行 118 米", address: "新界上水龍琛路 39 號", height: "2.1 米" },
      { name: "彩園停車場 D", distance: "步行 156 米", address: "新界上水彩園路 8 號彩園廣場", height: "—" },
      { name: "彩園停車場 A", distance: "步行 171 米", address: "新界上水彩園路 8 號彩園廣場", height: "2 米" },
    ],
  },
};
