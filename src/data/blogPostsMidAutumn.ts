import type { BlogPost } from "./blogData";
const mooncake = "/assets/blog-mid-autumn-pet-hk/mooncake.jpg";
const taiwanSpots = "/assets/blog-mid-autumn-pet-hk/taiwan-spots.jpg";
const lanterns = "/assets/blog-mid-autumn-pet-hk/lanterns.jpg";
const dressModel = "/assets/blog-mid-autumn-pet-hk/dress-model.jpg";
const dressProduct = "/assets/blog-mid-autumn-pet-hk/dress-product.jpg";
const mermaid = "/assets/blog-mid-autumn-pet-hk/mermaid.jpg";
const moonViewing = "/assets/blog-mid-autumn-pet-hk/moon-viewing.jpg";
const posterFamily = "/assets/blog-mid-autumn-pet-hk/poster-family.jpg?v=20260901";
const posterGuide = "/assets/blog-mid-autumn-pet-hk/poster-guide.jpg?v=20260901";

const DRESS_URL =
  "https://www.dlpawradise.com/zh/products/modern-chinese-style-pearl-tassel-dress?variant=64378930200945";
const LCSD_PARK_URL =
  "https://www.lcsd.gov.hk/clpss/tc/webApp/Facility/Details.do?ftid=165&fcid=&did=6";

export const blogPostsMidAutumn: BlogPost[] = [
  {
    id: "38",
    slug: "mid-autumn-pet-outings-hong-kong-2026",
    title: "中秋可以帶狗狗去哪裡？2026 寵物中秋好去處｜寵物一生有多少個中秋",
    excerpt:
      "狗狗一生大約只有十幾個中秋。2026 年中秋（9 月 25 日）想帶毛孩賞月、製作月餅、打卡？一文看清全港寵物中秋好去處，以及觀塘海濱台式中秋一條龍行程。",
    imageUrl: posterFamily,
    author: "PetWell HK",
    date: "2026-08-31",
    category: "生活娛樂",
    pinned: true,
    seoKeywords: [
      "寵物中秋好去處",
      "中秋可以帶狗狗去邊",
      "中秋帶狗去邊",
      "帶狗中秋賞月",
      "2026寵物中秋",
      "寵物中秋市集",
      "寵物中秋活動",
      "毛孩中秋好去處",
      "狗狗中秋好去處",
      "中秋寵物活動香港",
      "觀塘海濱寵物",
      "觀塘海濱賞月",
      "寵物月餅工作坊",
      "寵物中秋打卡",
      "台式中秋 寵物",
      "毛孩沉浸台式中秋節",
      "AquaBeat 寵物市集",
      "寵物友善天燈",
      "新中式寵物服裝",
      "D&L pawradise",
      "中秋野餐 寵物",
      "寵物一生有幾多個中秋",
    ],
    seoDescription:
      "2026 年中秋想帶狗外出？本文拆解寵物一生有多少個中秋、全港賞月好去處，以及觀塘海濱台式中秋一條龍：賞月、養生花膠月餅、十分／九份打卡、LED 天燈、美人魚表演及服裝租借。9 月 25–27 日免費入場，無需預約。",
    relatedTopics: ["寵物好去處", "帶狗活動", "寵物市集", "中秋賞月", "寵物友善海濱"],
    faqItems: [
      {
        question: "中秋可以帶狗狗去哪裡？",
        answer:
          "全港常見選擇包括觀塘海濱花園、西九海濱、將軍澳環保大道寵物公園、山頂花園及啟德跑道公園一帶。2026 年 9 月 25–27 日，觀塘海濱 AquaBeat 另設「毛孩沉浸台式中秋節」，賞月、養生花膠月餅、十分／九份打卡、美人魚表演及服裝租借，均可一次完成。",
      },
      {
        question: "寵物一生有多少個中秋？",
        answer:
          "中秋一年一度。小型犬約 12–16 個，中型犬約 10–13 個，大型犬約 8–12 個，貓則約 12–18 個。若你開始飼養牠時牠已一兩歲，能共度的中秋實際會更少。",
      },
      {
        question: "2026 年哪裡有寵物中秋市集？",
        answer:
          "PetWell × AquaBeat「毛孩沉浸台式中秋節」於 2026 年 9 月 25–27 日在觀塘海濱 AquaBeat 活動空間 02 舉行，免費入場，無需預約。現場設有許願天燈、十分車站／九份寵物夜市攤檔打卡位、美人魚表演，以及和服與新中式服裝租借。養生花膠月餅工作坊須預先報名。",
      },
      {
        question: "觀塘海濱寵物中秋市集何時前往最理想？",
        answer:
          "9 月 25 日（星期五）16:00–20:00；9 月 26–27 日（星期六、日）15:00–21:00。賞月建議日落後到場。三天均可即場入場。",
      },
      {
        question: "狗狗可以食用人類月餅嗎？",
        answer:
          "不建議。蓮蓉、糖分及油脂對狗的腸胃負擔較大，部分月餅更可能含有木糖醇。現場僅提供養生花膠月餅工作坊，餡料包括花膠、雞肉、鱷魚肉、茯苓、鯊魚軟骨、杞子、鴨肝、蝦、吞拿魚、山藥、蛋黃、鵪鶉肉等，須預先報名，不設即場體驗。",
      },
      {
        question: "帶狗到中秋市集需要準備甚麼？",
        answer:
          "必須使用 1.5 米以內的短牽繩、清水及摺疊碗、尿墊、濕紙巾、毛巾及少量零食。人多時可攜帶外出袋或寵物推車。現場天燈為寵物友善 LED 款式，無需自備明火燈籠。",
      },
      {
        question: "入場需要預約嗎？",
        answer:
          "免費入場，無需預約，歡迎所有毛孩參加。如想獲贈全家福 soft copy 一張，可先行登記。養生花膠月餅工作坊不設即場體驗，必須預先報名。",
      },
    ],
    content: `
      <p style="font-size: 13px; color: #666; margin-bottom: 20px; letter-spacing: 0.4px;">最後更新：2026 年 8 月 31 日　｜　2026 中秋：9 月 25 日（星期五）</p>

      <p style="font-size:18px;line-height:1.8;margin-bottom:28px;font-weight:300;">每年中秋前後，搜尋欄總會出現同一句：<strong>「中秋可以帶狗狗去哪裡？」</strong>商場有花燈、海濱有草地、公園有月亮——但大多數行程都要分開幾天、輾轉幾個場地。今年有另一個答案：如果你想賞月、製作寵物月餅、打卡、沉浸於台式夜市，<strong>到觀塘海濱一次便可完成。</strong>今年中秋，帶毛孩在海風與月光之下，留下一晚屬於你們的回憶。</p>

      <h2 id="one-stop" style="font-size:26px;font-weight:700;margin:40px 0 18px;padding-bottom:10px;border-bottom:2px solid #FF6B35;scroll-margin-top:88px;">觀塘海濱：傳統賞月熱點，今年再加一條龍體驗</h2>

      <p style="font-size:17px;line-height:1.85;margin-bottom:16px;"><a href="${LCSD_PARK_URL}" target="_blank" rel="noopener noreferrer" style="color:#FF6B35;font-weight:600;">康文署觀塘海濱花園（指定位置）</a>本身已是 24 小時寵物共享公園，面積廣闊、坐擁海景，由牛頭角站步行可達，每年中秋的野餐名單總有它的一席。</p>
      <p style="font-size:17px;line-height:1.85;margin-bottom:20px;">2026 年 9 月 25–27 日，同一條海濱將加設 PetWell × AquaBeat「毛孩沉浸式台灣中秋祭」：九份夜市、十分天燈、養生花膠月餅、美人魚表演，以及中秋服租借。換句話說，<strong>只要走到海濱，便已同時賞月、過節、打卡。</strong></p>

      <figure style="margin:0 0 32px;">
        <img src="${posterGuide}" alt="毛孩沉浸式台灣中秋祭活動一覽：九份夜市、十分天燈、中秋服租借、攝影服務、寵物月餅、DIY 圍巾、磁石貼同美人魚表演" style="width:100%;border-radius:12px;" loading="lazy" />
        <figcaption style="font-size:13px;color:#6B7280;margin-top:8px;">一個海濱・四個台灣景：九份夜市、十分天燈、中秋服租借、手作工作坊，全家一齊過中秋。</figcaption>
      </figure>

      <h2 id="experiences" style="font-size:26px;font-weight:700;margin:40px 0 18px;padding-bottom:10px;border-bottom:2px solid #FF6B35;scroll-margin-top:88px;">一條龍行程：一次完成的五件事</h2>

      <h3 id="moon" style="font-size:21px;font-weight:700;margin:28px 0 12px;scroll-margin-top:88px;">1. 賞月：海風、圓月、維港燈光</h3>
      <p style="font-size:16px;line-height:1.85;margin-bottom:16px;">觀塘海濱面向維港東面，九月下旬日落後氣溫宜人，草地與木板步道都適合小坐。2026 年中秋正是 9 月 25 日（星期五）——活動首日便是佳節當日。你無需專程另覓賞月地點：<strong>市集散場後，轉身已是海邊。</strong></p>
      <figure style="margin:0 0 28px;">
        <img src="${moonViewing}" alt="觀塘海濱賞月：一家大細同小狗喺草地野餐，望住維港同圓月" style="width:100%;border-radius:12px;" width="1600" height="900" loading="lazy" />
        <figcaption style="font-size:13px;color:#6B7280;margin-top:8px;">海濱草地賞月，毛孩、小朋友同長輩都可以一齊過中秋。</figcaption>
      </figure>

      <h3 id="mooncake" style="font-size:21px;font-weight:700;margin:28px 0 12px;scroll-margin-top:88px;">2. 為寵物製作月餅：室內課室養生花膠月餅工作坊</h3>
      <p style="font-size:16px;line-height:1.85;margin-bottom:16px;">人類月餅又甜又油，蓮蓉、糖分及油脂對狗的腸胃負擔較大，部分更可能含有木糖醇。與其偷偷分牠一小塊，不如預先報名，在室內課室親手製作一款<strong>寵物可食用</strong>的養生花膠月餅。</p>
      <p style="font-size:16px;line-height:1.85;margin-bottom:16px;">今次<strong>只設花膠月餅，不設凍乾月餅</strong>。餡料包括花膠、雞肉、鱷魚肉、茯苓、鯊魚軟骨、杞子、鴨肝、蝦、吞拿魚、山藥、蛋黃、鵪鶉肉等食材。工作坊於室內課室進行，<strong>不設即場體驗，必須預先報名</strong>。</p>
      <p style="font-size:16px;line-height:1.85;margin-bottom:16px;">名額有限。如想參加，可按下方按鈕即時報名，或聯絡我們留位。</p>
      <div style="display:flex;flex-wrap:wrap;gap:10px;margin:0 0 20px;">
        <button type="button" onclick="window.dispatchEvent(new CustomEvent('petwell:open-contact',{detail:{topic:'mooncake'}}))" style="cursor:pointer;border:0;background:#FF6B35;color:#fff;font-weight:800;font-size:14px;padding:10px 18px;border-radius:10px;">即時報名花膠月餅工作坊</button>
        <button type="button" onclick="window.dispatchEvent(new CustomEvent('petwell:open-contact',{detail:{topic:'event'}}))" style="cursor:pointer;border:1.5px solid #FF6B35;background:#fff;color:#C2410C;font-weight:700;font-size:14px;padding:10px 18px;border-radius:10px;">聯絡我們報名</button>
      </div>
      <figure style="margin:0 0 28px;">
        <img src="${mooncake}" alt="室內課室寵物花膠月餅工作坊：主人以爪印模製作養生花膠月餅，小狗在旁觀看" style="width:100%;border-radius:12px;" width="1600" height="900" loading="lazy" />
        <figcaption style="font-size:13px;color:#6B7280;margin-top:8px;">室內課室養生花膠月餅工作坊，須預先報名，不設即場體驗。</figcaption>
      </figure>

      <h3 id="photo" style="font-size:21px;font-weight:700;margin:28px 0 12px;scroll-margin-top:88px;">3. 寵物中秋打卡：十分車站 × 九份夜市攤檔</h3>
      <p style="font-size:16px;line-height:1.85;margin-bottom:16px;">往年的中秋打卡點，多是商場的巨型月亮。今年主題換上台灣：<strong>十分車站與九份</strong>連成一個沉浸式場景，兩者相距不遠。重點是現場設有<strong>寵物尺寸的夜市攤檔</strong>，毛孩可以扮演台灣夜市檔主，站在迷你檔口後面拍照留念。</p>
      <figure style="margin:0 0 28px;">
        <img src="${taiwanSpots}" alt="九份寵物夜市打卡：狗與貓在寵物尺寸夜市攤檔扮演檔主，設有大腸包小腸及臭豆腐攤檔" style="width:100%;border-radius:12px;" width="1600" height="900" loading="lazy" />
        <figcaption style="font-size:13px;color:#6B7280;margin-top:8px;">九份夜市打卡攤：寵物尺寸大腸包小腸、臭豆腐檔口，毛孩可以扮演檔主拍照。</figcaption>
      </figure>

      <h3 id="taiwan" style="font-size:21px;font-weight:700;margin:28px 0 12px;scroll-margin-top:88px;">4. 台式沉浸體驗：許願天燈、美人魚表演</h3>
      <p style="font-size:16px;line-height:1.85;margin-bottom:16px;">活動全名為「毛孩沉浸式台灣中秋祭」，並非只掛上幾盞燈飾。現場設有：</p>
      <ul style="font-size:16px;line-height:1.9;margin:0 0 20px;padding-left:22px;">
        <li><strong>許願天燈區：</strong>採用寵物友善 LED 環保天燈，保留「寫下願望、舉過頭頂」的儀式感，同時避開明火與煙霧。</li>
        <li><strong>美人魚表演：</strong>現場設有美人魚表演，毛孩可以站在水缸前與表演者打招呼。</li>
        <li><strong>手作工作坊：</strong>除花膠月餅外，現場亦有寵物圍巾 DIY（繡名、自選公仔）及立體狗頭磁石貼上色。</li>
        <li><strong>和服租借：</strong>現場可租借和服拍照，與打卡場景十分相配；新中式節慶服裝詳見下文第 5 點。</li>
      </ul>
      <figure style="margin:0 0 16px;">
        <img src="${lanterns}" alt="十分天燈：兩位主人同兩隻小狗喺觀塘海濱舉住寵物友善 LED 天燈賞月" style="width:100%;border-radius:12px;" width="1600" height="900" loading="lazy" />
        <figcaption style="font-size:13px;color:#6B7280;margin-top:8px;">十分天燈打卡位：現場採用寵物友善 LED 天燈，無需明火，毛孩靠近亦更安心。</figcaption>
      </figure>
      <figure style="margin:0 0 28px;">
        <img src="${mermaid}" alt="美人魚表演：小狗站在水缸前，與缸內的美人魚揮手打招呼" style="width:100%;border-radius:12px;" width="1600" height="900" loading="lazy" />
        <figcaption style="font-size:13px;color:#6B7280;margin-top:8px;">美人魚表演，毛孩可以在缸邊近距離欣賞。</figcaption>
      </figure>

      <h3 id="outfit" style="font-size:21px;font-weight:700;margin:28px 0 12px;scroll-margin-top:88px;">5. 租借新中式服裝，拍下屬於今年的中秋照</h3>
      <p style="font-size:16px;line-height:1.85;margin-bottom:16px;">打卡場景再美，毛孩穿着日常胸帶總略嫌失色。現場除了可租借和服，亦可租借新中式節慶服裝——其中一套為 <a href="${DRESS_URL}" target="_blank" rel="noopener noreferrer" style="color:#FF6B35;font-weight:600;">D&amp;L² pawradise 中秋限定珍珠流蘇裙</a>：薄荷色立領披肩配珍珠流蘇，下身是繡有亭臺花卉的香檳金泡泡裙，胸部位置預留了胸背帶開口（harness portal），拍完照仍可繼續暢遊海濱。</p>
      <p style="font-size:16px;line-height:1.85;margin-bottom:16px;">品牌的設計靈感為「月光下的古園」，與賞月及海濱燈籠相得益彰。你無需自行預購並等候 7–14 天；活動當日租借一件，拍完照歸還便可。</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:8px;">
        <figure style="margin:0;">
          <img src="${dressModel}" alt="D&amp;L pawradise 現代中式珍珠流蘇寵物裙商品照，中秋打卡服裝" style="width:100%;border-radius:12px;" loading="lazy" />
        </figure>
        <figure style="margin:0;">
          <img src="${dressProduct}" alt="D&amp;L pawradise 珍珠流蘇裙模特兒展示：薄荷披肩與香檳金繡花裙" style="width:100%;border-radius:12px;" loading="lazy" />
        </figure>
      </div>
      <p style="font-size:13px;color:#6B7280;margin:0 0 32px;">圖片來源：<a href="${DRESS_URL}" target="_blank" rel="noopener noreferrer" style="color:#FF6B35;">D&amp;L² pawradise</a>。尺碼 XXS–XL，出發前可對照胸圍／背長／頸圍。</p>

      <h2 id="sixty-seconds" style="font-size:26px;font-weight:700;margin:40px 0 18px;padding-bottom:10px;border-bottom:2px solid #FF6B35;scroll-margin-top:88px;">出發前重點</h2>

      <ul style="list-style:none;padding:0;margin:0 0 14px;font-size:15px;line-height:1.7;">
        <li style="display:flex;gap:10px;padding:9px 0;border-bottom:1px solid #FED7AA;"><span aria-hidden="true">🐾</span><span><strong style="color:#9A3412;">歡迎所有毛孩參加：</strong>貓、狗、兔——所有寵物都歡迎；小朋友、長輩、一家大細都可以嚟。</span></li>
        <li style="display:flex;gap:10px;padding:9px 0;border-bottom:1px solid #FED7AA;"><span aria-hidden="true">🦮</span><span><strong style="color:#9A3412;">牽繩：</strong>必須使用 1.5 米以內的短牽繩；人多時可使用外出袋或寵物推車。</span></li>
        <li style="display:flex;gap:10px;padding:9px 0;border-bottom:1px solid #FED7AA;"><span aria-hidden="true">🌦️</span><span><strong style="color:#9A3412;">雨天安排：</strong>以 @petwell_hk 當日公布為準。</span></li>
        <li style="display:flex;gap:10px;padding:9px 0;border-bottom:1px solid #FED7AA;"><span aria-hidden="true">🚻</span><span><strong style="color:#9A3412;">洗手間／休息處：</strong>海濱長廊沿途設有洗手間及休息處。</span></li>
        <li style="display:flex;gap:10px;padding:9px 0;border-bottom:1px solid #FED7AA;"><span aria-hidden="true">🥮</span><span><strong style="color:#9A3412;">花膠月餅工作坊：</strong>須預先報名，不設即場體驗；名額有限。</span></li>
        <li style="display:flex;gap:10px;padding:9px 0;"><span aria-hidden="true">🎟️</span><span><strong style="color:#9A3412;">入場：</strong>免費入場，無需預約；登記可獲贈全家福 soft copy 一張。</span></li>
      </ul>
      <p style="font-size:13px;color:#6B7280;margin:0 0 28px;">最後更新：2026 年 8 月 31 日　·　免費入場，無需預約　·　花膠月餅工作坊須預先報名</p>

      <p style="font-size:15px;line-height:1.7;margin-bottom:18px;color:#4B5563;">場地時間：25 日（星期五）16:00–20:00；26–27 日（星期六、日）15:00–21:00。交通及地圖詳見下方。</p>

      <div style="display:flex;flex-wrap:wrap;gap:10px;margin-bottom:32px;">
        <a href="https://www.google.com/maps/search/?api=1&query=%E8%A7%80%E5%A1%98%E6%B5%B7%E6%BF%B1%E8%8A%B1%E5%9C%92%20AquaBeat" target="_blank" rel="noopener noreferrer" style="display:inline-block;border:1.5px solid #FF6B35;color:#C2410C;font-weight:700;font-size:14px;padding:10px 16px;border-radius:10px;text-decoration:none;">🗺️ Google Maps 開啟地點</a>
        <a href="#mtr" style="display:inline-block;border:1.5px solid #FED7AA;color:#C2410C;font-weight:700;font-size:14px;padding:10px 16px;border-radius:10px;text-decoration:none;">🚇 港鐵路線</a>
        <a href="#ferry" style="display:inline-block;border:1.5px solid #FED7AA;color:#C2410C;font-weight:700;font-size:14px;padding:10px 16px;border-radius:10px;text-decoration:none;">⛴️ 渡輪航線</a>
        <a href="#parking" style="display:inline-block;border:1.5px solid #FED7AA;color:#C2410C;font-weight:700;font-size:14px;padding:10px 16px;border-radius:10px;text-decoration:none;">🅿️ 泊車資訊</a>
      </div>

      <h2 id="practical" style="font-size:26px;font-weight:700;margin:40px 0 18px;padding-bottom:10px;border-bottom:2px solid #FF6B35;scroll-margin-top:88px;">出發前：交通與現場提示</h2>

      <h3 style="font-size:20px;font-weight:700;margin:24px 0 12px;">如何前往觀塘海濱</h3>

      <h4 id="mtr" style="font-size:17px;font-weight:700;margin:20px 0 10px;scroll-margin-top:88px;">方法一：港鐵</h4>
      <p style="font-size:16px;line-height:1.85;margin:0 0 16px;">由牛頭角站 B6 出口出發，穿過地底行人隧道，到達地面後沿勵業街一直前行，便可到達 AquaBeat 活動空間 02。</p>

      <h4 id="parking" style="font-size:17px;font-weight:700;margin:20px 0 10px;scroll-margin-top:88px;">方法二：私家車</h4>
      <p style="font-size:16px;line-height:1.85;margin:0 0 16px;">活動場地附近 NEO 停車場日泊收費只需 $50，相當相宜。<span style="font-size:13px;color:#6B7280;">（價格以停車場當日公布為準）</span></p>

      <h4 id="ferry" style="font-size:17px;font-weight:700;margin:20px 0 10px;scroll-margin-top:88px;">方法三：渡輪</h4>
      <p style="font-size:16px;line-height:1.85;margin:0 0 12px;">有兩條航線可供選擇：</p>
      <ul style="font-size:16px;line-height:1.9;margin:0 0 16px;padding-left:22px;">
        <li>觀塘 ↔ 北角（經啟德）</li>
        <li>觀塘 ↔ 西灣河</li>
      </ul>
      <p style="font-size:16px;line-height:1.85;margin:0 0 20px;">下船後沿海旁步行 10–15 分鐘便可到達。途中會經過觀塘公眾碼頭及兩個噴水池，左邊是有蓋通道（瓦遮頭）、右邊是洗手間，經過餐廳 LUNASY 後轉右即達。</p>

      <h4 style="font-size:17px;font-weight:700;margin:20px 0 10px;">方法四：GOGOX</h4>
      <p style="font-size:16px;line-height:1.85;margin:0 0 24px;">活動贊助 GOGOX，每程減 $20，連毛孩一齊上車都得。</p>

      <div style="background:#FFF7ED;border-left:4px solid #FF6B35;border-radius:12px;padding:18px 20px;margin:0 0 24px;">
        <p style="margin:0 0 10px;font-size:15px;font-weight:700;color:#9A3412;">🐶 現場小提示</p>
        <ul style="margin:0;padding-left:20px;font-size:15px;line-height:1.8;color:#4B5563;">
          <li>自備清水及摺疊碗，定時為毛孩補水；九月下旬的黃昏仍然偏熱。</li>
          <li>打卡位或需排隊，輪候時請在陰涼處等候。</li>
          <li>如毛孩開始喘氣、躲避人群或不願前行，應帶牠離開人群，到海濱休息片刻。</li>
        </ul>
      </div>

      <h2 style="font-size:26px;font-weight:700;margin:40px 0 18px;padding-bottom:10px;border-bottom:2px solid #FF6B35;">如果今年只去一個地方</h2>
      <p style="font-size:17px;line-height:1.85;margin-bottom:16px;">寵物公園依然值得一去，商場花燈依然值得一拍。但 2026 年中秋，觀塘海濱是少數能於同日完成「賞月 + 過節 + 打卡 + 製作月餅」的地方。帶着毛孩走進海風之中，已無需再問「下一站去哪裡」。</p>
      <p style="font-size:17px;line-height:1.85;margin-bottom:24px;">時間、攤檔及租借安排或有微調，出發前瀏覽 <a href="https://www.instagram.com/petwell_hk/" target="_blank" rel="noopener noreferrer" style="color:#FF6B35;">@petwell_hk</a> 即可。想順道了解其他週末活動，可以收藏<a href="/weekend-pet-events-hong-kong-2026" style="color:#FF6B35;">每週寵物好去處</a>。</p>

      <div id="rsvp" style="overflow:hidden;background:#ffffff;border:1px solid #E7E5E4;border-radius:16px;margin-bottom:8px;scroll-margin-top:88px;">
        <div style="position:relative;height:168px;background:#1C1917;">
          <img src="${lanterns}" alt="觀塘海濱寵物友善 LED 天燈" width="1600" height="900" style="display:block;width:100%;height:168px;object-fit:cover;object-position:center 28%;margin:0;" />
          <span style="position:absolute;left:16px;top:14px;background:#FF6B35;color:#ffffff !important;font-size:12px;font-weight:700;padding:5px 10px;border-radius:999px;">免費入場 · 無需預約</span>
        </div>
        <div style="padding:20px 20px 22px;background:#ffffff;">
          <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:.12em;color:#9A3412 !important;">AQUABEAT × PETWELL</p>
          <p style="margin:0 0 14px;font-size:22px;font-weight:800;line-height:1.3;color:#1C1917 !important;">毛孩沉浸式台灣中秋祭</p>
          <p style="margin:0 0 6px;font-size:14px;line-height:1.7;color:#44403C !important;">日期：2026 年 9 月 25–27 日</p>
          <p style="margin:0 0 6px;font-size:14px;line-height:1.7;color:#44403C !important;">時間：星期五 16:00–20:00 · 星期六、日 15:00–21:00</p>
          <p style="margin:0 0 14px;font-size:14px;line-height:1.7;color:#44403C !important;">地點：觀塘海濱 AquaBeat 活動空間 02</p>
          <p style="margin:0 0 18px;font-size:14px;line-height:1.75;color:#44403C !important;">免費入場，帶毛孩即場參加就得。賞月、九份夜市、十分天燈、美人魚表演、服裝租借一應俱全。想免費拎全家福 soft copy，先登記；花膠月餅工作坊須預先報名。</p>
          <div style="display:flex;flex-wrap:wrap;gap:10px;">
            <button type="button" onclick="window.dispatchEvent(new CustomEvent('petwell:open-contact',{detail:{topic:'family-photo'}}))" style="cursor:pointer;border:0;background:#FF6B35;color:#ffffff;font-weight:800;padding:11px 18px;border-radius:10px;">立即登記・免費送全家福</button>
            <button type="button" onclick="window.dispatchEvent(new CustomEvent('petwell:open-contact',{detail:{topic:'mooncake'}}))" style="cursor:pointer;border:1.5px solid #FF6B35;background:#ffffff;color:#C2410C;font-weight:800;padding:11px 18px;border-radius:10px;">報名花膠月餅</button>
            <a href="https://www.google.com/maps/search/?api=1&query=%E8%A7%80%E5%A1%98%E6%B5%B7%E6%BF%B1%E8%8A%B1%E5%9C%92%20AquaBeat" target="_blank" rel="noopener noreferrer" style="display:inline-block;border:1.5px solid #D6D3D1;background:#ffffff;color:#1C1917 !important;font-weight:700;padding:11px 18px;border-radius:10px;text-decoration:none;">開啟地圖</a>
          </div>
          <p style="margin:16px 0 0;font-size:13px;line-height:1.6;color:#78716C !important;">檔主、傳媒或品牌請於 <a href="/vendor-application" style="color:#C2410C !important;font-weight:700;text-decoration:underline;">開檔申請</a>。免費入場，無需預約 · 最後更新：2026 年 8 月 31 日</p>
        </div>
      </div>
    `,
  },
];
