import type { BlogPost } from "./blogData";
const mooncake = "/assets/blog-mid-autumn-pet-hk/mooncake.jpg";
const taiwanSpots = "/assets/blog-mid-autumn-pet-hk/taiwan-spots.jpg";
const lanterns = "/assets/blog-mid-autumn-pet-hk/lanterns.jpg";
const dressModel = "/assets/blog-mid-autumn-pet-hk/dress-model.jpg";
const dressProduct = "/assets/blog-mid-autumn-pet-hk/dress-product.jpg";
const mermaid = "/assets/blog-mid-autumn-pet-hk/mermaid.jpg";
const moonViewing = "/assets/blog-mid-autumn-pet-hk/moon-viewing.jpg";
const festivalHeroBanner = "/assets/blog-mid-autumn-pet-hk/festival-hero-banner.jpg";

const DRESS_URL =
  "https://www.dlpawradise.com/zh/products/modern-chinese-style-pearl-tassel-dress?variant=64378930200945";
const LCSD_PARK_URL =
  "https://www.lcsd.gov.hk/clpss/tc/webApp/Facility/Details.do?ftid=165&fcid=&did=6";
const MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=%E8%A7%80%E5%A1%98%E6%B5%B7%E6%BF%B1%E8%8A%B1%E5%9C%92%20AquaBeat";
const RSVP_PATH = "/mid-autumn-taiwan-festival";

const H2 =
  'font-size:26px;font-weight:700;margin:40px 0 18px;padding-bottom:10px;border-bottom:2px solid #FF6B35;scroll-margin-top:88px;';
const H3 = "font-size:21px;font-weight:700;margin:28px 0 12px;scroll-margin-top:88px;";
const H4 = "font-size:17px;font-weight:700;margin:20px 0 10px;scroll-margin-top:88px;";
const P = "font-size:16px;line-height:1.85;margin-bottom:16px;";
const P_LG = "font-size:17px;line-height:1.85;margin-bottom:16px;";
const CAPTION = "font-size:13px;color:#6B7280;margin-top:8px;";
const BTN_PRIMARY =
  "cursor:pointer;border:0;background:#FF6B35;color:#fff;font-weight:800;font-size:14px;padding:10px 18px;border-radius:10px;";
const BTN_OUTLINE =
  "cursor:pointer;border:1.5px solid #FF6B35;background:#fff;color:#C2410C;font-weight:700;font-size:14px;padding:10px 18px;border-radius:10px;";
const LINK = "color:#FF6B35;font-weight:600;";

function figure(src: string, alt: string, caption: string): string {
  return `
      <figure style="margin:0 0 28px;">
        <img src="${src}" alt="${alt}" style="width:100%;border-radius:12px;" width="1600" height="900" loading="lazy" />
        <figcaption style="${CAPTION}">${caption}</figcaption>
      </figure>`;
}

const GOGOX_SLOT = '<div data-component="gogox-voucher"></div>';

const zhContent = `
      <p style="font-size: 13px; color: #666; margin-bottom: 20px; letter-spacing: 0.4px;">最後更新：2026 年 9 月 2 日　｜　2026 中秋：9 月 25 日（星期五）</p>

      <p style="font-size:18px;line-height:1.8;margin-bottom:28px;font-weight:300;">每年中秋前後，搜尋欄總會出現同一句：<strong>「中秋可以帶狗狗去哪裡？」</strong>今年有一個更輕鬆的答案：去觀塘海濱，一次過免費租借中秋漢服、同美人魚打卡、放許願天燈，再整月餅、打卡，最後留喺海邊賞月。商場花燈同維港草地依然值得去——但如果你想過一個完整嘅台式中秋，<strong>走到海濱便已齊全。</strong></p>

      <h2 id="one-stop" style="${H2}">觀塘海濱：寵物友善海濱，今年再加台式一條龍</h2>

      <p style="${P_LG}"><a href="${LCSD_PARK_URL}" target="_blank" rel="noopener noreferrer" style="${LINK}">康文署觀塘海濱花園（指定位置）</a>本身已是 24 小時寵物共享公園，面積廣闊、坐擁海景，由牛頭角站步行可達。</p>
      <p style="${P_LG}">2026 年 9 月 25–27 日，同一條海濱將加設 PetWell × AquaBeat「毛孩沉浸式台灣中秋祭」：免費中秋服租借、美人魚表演、十分天燈、九份夜市、手作工作坊。換句話說，<strong>只要走到海濱，便已同時過節、打卡、賞月。</strong></p>

      <h2 id="experiences" style="${H2}">一條龍行程：建議先玩呢幾樣</h2>

      <h3 id="outfit" style="${H3}">1. 免費租借中秋漢服</h3>
      <p style="${P}">打卡場景再美，毛孩穿着日常胸帶總略嫌失色。現場<strong>免費租借</strong>新中式節慶服裝同和服——其中一套為 <a href="${DRESS_URL}" target="_blank" rel="noopener noreferrer" style="${LINK}">D&amp;L² pawradise 中秋限定珍珠流蘇裙</a>：薄荷色立領披肩配珍珠流蘇，下身是繡有亭臺花卉的香檳金泡泡裙，胸部位置預留了胸背帶開口（harness portal），拍完照仍可繼續暢遊海濱。</p>
      <p style="${P}">品牌的設計靈感為「月光下的古園」。你無需自行預購並等候 7–14 天；活動當日租一件，拍完照歸還便可。</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:8px;">
        <figure style="margin:0;">
          <img src="${dressModel}" alt="D&amp;L pawradise 現代中式珍珠流蘇寵物裙，中秋免費租借服裝" style="width:100%;border-radius:12px;" loading="lazy" />
        </figure>
        <figure style="margin:0;">
          <img src="${dressProduct}" alt="D&amp;L pawradise 珍珠流蘇裙模特兒展示：薄荷披肩與香檳金繡花裙" style="width:100%;border-radius:12px;" loading="lazy" />
        </figure>
      </div>
      <p style="font-size:13px;color:#6B7280;margin:0 0 32px;">圖片來源：<a href="${DRESS_URL}" target="_blank" rel="noopener noreferrer" style="color:#FF6B35;">D&amp;L² pawradise</a>。尺碼 XXS–XL，出發前可對照胸圍／背長／頸圍。</p>

      <h3 id="mermaid" style="${H3}">2. 美人魚表演</h3>
      <p style="${P}">現場設有美人魚表演，毛孩可以站在水缸前與表演者打招呼、一齊打卡。狗狗、貓貓都歡迎靠近觀看；人多時請用短牽繩，輪候時揀陰涼位等。</p>
      ${figure(
        mermaid,
        "美人魚表演：小狗站在水缸前，與缸內的美人魚揮手打招呼",
        "美人魚表演，毛孩可以在缸邊近距離欣賞。",
      )}

      <h3 id="taiwan" style="${H3}">3. 沉浸式台式體驗：許願天燈</h3>
      <p style="${P}">活動全名為「毛孩沉浸式台灣中秋祭」，並非只掛上幾盞燈飾。十分天燈區採用<strong>寵物友善 LED 環保天燈</strong>，保留「寫下願望、舉過頭頂」的儀式感，同時避開明火與煙霧。毛孩靠近亦更安心。</p>
      ${figure(
        lanterns,
        "十分天燈：兩位主人同兩隻小狗喺觀塘海濱舉住寵物友善 LED 天燈賞月",
        "十分天燈打卡位：現場採用寵物友善 LED 天燈，無需明火。",
      )}

      <h3 id="workshops" style="${H3}">4. 手作工作坊：月餅、圍巾、磁石貼</h3>
      <p style="${P}">人類月餅又甜又油，蓮蓉、糖分及油脂對狗的腸胃負擔較大，部分更可能含有木糖醇。與其偷偷分牠一小塊，不如預先報名，在室內課室親手製作一款<strong>寵物可食用</strong>的養生花膠月餅。</p>
      <p style="${P}">今次<strong>只設花膠月餅，不設凍乾月餅</strong>。餡料包括花膠、雞肉、鱷魚肉、茯苓、鯊魚軟骨、杞子、鴨肝、蝦、吞拿魚、山藥、蛋黃、鵪鶉肉等食材。工作坊於室內課室進行，<strong>不設即場體驗，必須預先報名</strong>。</p>
      <p style="${P}">另外亦有寵物圍巾 DIY（繡名、自選公仔）及立體狗頭磁石貼上色。早鳥套餐詳見<a href="${RSVP_PATH}" style="${LINK}">提早登記頁</a>。</p>
      <div style="display:flex;flex-wrap:wrap;gap:10px;margin:0 0 20px;">
        <a href="${RSVP_PATH}" style="display:inline-block;${BTN_PRIMARY};text-decoration:none;">提早登記・工作坊早鳥</a>
        <button type="button" onclick="window.dispatchEvent(new CustomEvent('petwell:open-contact',{detail:{topic:'mooncake'}}))" style="${BTN_OUTLINE}">聯絡我們報名</button>
      </div>
      ${figure(
        mooncake,
        "室內課室寵物花膠月餅工作坊：主人以爪印模製作養生花膠月餅，小狗在旁觀看",
        "室內課室養生花膠月餅工作坊，須預先報名，不設即場體驗。",
      )}

      <h3 id="photo" style="${H3}">5. 中秋打卡：十分車站 × 九份夜市攤檔</h3>
      <p style="${P}">往年的中秋打卡點，多是商場的巨型月亮。今年主題換上台灣：<strong>十分車站與九份</strong>連成一個沉浸式場景，兩者相距不遠。重點是現場設有<strong>寵物尺寸的夜市攤檔</strong>，毛孩可以扮演台灣夜市檔主，站在迷你檔口後面拍照留念。</p>
      ${figure(
        taiwanSpots,
        "九份寵物夜市打卡：狗與貓在寵物尺寸夜市攤檔扮演檔主，設有大腸包小腸及臭豆腐攤檔佈景",
        "九份夜市打卡攤：寵物尺寸檔口，毛孩可以扮演檔主拍照。",
      )}

      <h3 id="moon" style="${H3}">6. 賞月：海風、圓月、維港燈光</h3>
      <p style="${P}">玩完服裝、美人魚同天燈，再留低賞月剛剛好。觀塘海濱面向維港東面，九月下旬日落後氣溫宜人，草地與木板步道都適合小坐。2026 年中秋正是 9 月 25 日（星期五）——活動首日便是佳節當日。<strong>市集散場後，轉身已是海邊。</strong></p>
      ${figure(
        moonViewing,
        "觀塘海濱賞月：一家大細同小狗喺草地野餐，望住維港同圓月",
        "海濱草地賞月，毛孩、小朋友同長輩都可以一齊過中秋。",
      )}

      <h2 id="sixty-seconds" style="${H2}">出發前重點</h2>

      <ul style="list-style:none;padding:0;margin:0 0 14px;font-size:15px;line-height:1.7;">
        <li style="display:flex;gap:10px;padding:9px 0;border-bottom:1px solid #FED7AA;"><span><strong style="color:#9A3412;">歡迎所有毛孩參加：</strong>貓、狗、兔——所有寵物都歡迎；小朋友、長輩、一家大細都可以嚟。</span></li>
        <li style="display:flex;gap:10px;padding:9px 0;border-bottom:1px solid #FED7AA;"><span><strong style="color:#9A3412;">牽繩：</strong>必須使用 1.5 米以內的短牽繩；人多時可使用外出袋或寵物推車。</span></li>
        <li style="display:flex;gap:10px;padding:9px 0;border-bottom:1px solid #FED7AA;"><span><strong style="color:#9A3412;">雨天安排：</strong>以 @petwell_hk 當日公布為準。</span></li>
        <li style="display:flex;gap:10px;padding:9px 0;border-bottom:1px solid #FED7AA;"><span><strong style="color:#9A3412;">洗手間／休息處：</strong>海濱長廊沿途設有洗手間及休息處。</span></li>
        <li style="display:flex;gap:10px;padding:9px 0;border-bottom:1px solid #FED7AA;"><span><strong style="color:#9A3412;">花膠月餅工作坊：</strong>須預先報名，不設即場體驗；名額有限。</span></li>
        <li style="display:flex;gap:10px;padding:9px 0;"><span><strong style="color:#9A3412;">入場：</strong>免費入場，無需預約；登記可獲贈全家福 soft copy 一張。</span></li>
      </ul>
      <p style="font-size:13px;color:#6B7280;margin:0 0 28px;">最後更新：2026 年 9 月 2 日　·　免費入場，無需預約　·　花膠月餅工作坊須預先報名</p>

      <p style="font-size:15px;line-height:1.7;margin-bottom:18px;color:#4B5563;">場地時間：25 日（星期五）16:00–20:00；26–27 日（星期六、日）15:00–21:00。交通及地圖詳見下方。</p>

      <div style="display:flex;flex-wrap:wrap;gap:10px;margin-bottom:32px;">
        <a href="${MAPS_URL}" target="_blank" rel="noopener noreferrer" style="display:inline-block;border:1.5px solid #FF6B35;color:#C2410C;font-weight:700;font-size:14px;padding:10px 16px;border-radius:10px;text-decoration:none;">Google Maps 開啟地點</a>
        <a href="#mtr" style="display:inline-block;border:1.5px solid #FED7AA;color:#C2410C;font-weight:700;font-size:14px;padding:10px 16px;border-radius:10px;text-decoration:none;">港鐵路線</a>
        <a href="#ferry" style="display:inline-block;border:1.5px solid #FED7AA;color:#C2410C;font-weight:700;font-size:14px;padding:10px 16px;border-radius:10px;text-decoration:none;">渡輪航線</a>
        <a href="#gogox" style="display:inline-block;border:1.5px solid #FED7AA;color:#C2410C;font-weight:700;font-size:14px;padding:10px 16px;border-radius:10px;text-decoration:none;">GOGOX 優惠</a>
      </div>

      <h2 id="practical" style="${H2}">出發前：交通與現場提示</h2>

      <h3 style="font-size:20px;font-weight:700;margin:24px 0 12px;">如何前往觀塘海濱</h3>

      <h4 id="mtr" style="${H4}">方法一：港鐵</h4>
      <p style="font-size:16px;line-height:1.85;margin:0 0 16px;">由牛頭角站 B6 出口出發，穿過地底行人隧道，到達地面後沿勵業街一直前行，便可到達 AquaBeat 活動空間 02。</p>

      <h4 id="parking" style="${H4}">方法二：私家車</h4>
      <p style="font-size:16px;line-height:1.85;margin:0 0 16px;">活動場地附近 NEO 停車場日泊收費只需 $50，相當相宜。<span style="font-size:13px;color:#6B7280;">（價格以停車場當日公布為準）</span></p>

      <h4 id="ferry" style="${H4}">方法三：渡輪</h4>
      <p style="font-size:16px;line-height:1.85;margin:0 0 12px;">有兩條航線可供選擇：</p>
      <ul style="font-size:16px;line-height:1.9;margin:0 0 16px;padding-left:22px;">
        <li>觀塘 ↔ 北角（經啟德）</li>
        <li>觀塘 ↔ 西灣河</li>
      </ul>
      <p style="font-size:16px;line-height:1.85;margin:0 0 20px;">下船後沿海旁步行 10–15 分鐘便可到達。途中會經過觀塘公眾碼頭及兩個噴水池，左邊是有蓋通道（瓦遮頭）、右邊是洗手間，經過餐廳 LUNASY 後轉右即達。</p>

      <h4 id="gogox-heading" style="${H4}">方法四：GOGOX</h4>
      ${GOGOX_SLOT}

      <div style="background:#FFF7ED;border-left:4px solid #FF6B35;border-radius:12px;padding:18px 20px;margin:0 0 24px;">
        <p style="margin:0 0 10px;font-size:15px;font-weight:700;color:#9A3412;">現場小提示</p>
        <ul style="margin:0;padding-left:20px;font-size:15px;line-height:1.8;color:#4B5563;">
          <li>自備清水及摺疊碗，定時為毛孩補水；九月下旬的黃昏仍然偏熱。</li>
          <li>打卡位或需排隊，輪候時請在陰涼處等候。</li>
          <li>如毛孩開始喘氣、躲避人群或不願前行，應帶牠離開人群，到海濱休息片刻。</li>
        </ul>
      </div>

      <h2 style="${H2}">如果今年只去一個地方</h2>
      <p style="${P_LG}">寵物公園依然值得一去，商場花燈依然值得一拍。但 2026 年中秋，觀塘海濱是少數能於同日完成「免費漢服、美人魚、天燈、工作坊、打卡、賞月」的地方。帶着毛孩走進海風之中，已無需再問「下一站去哪裡」。</p>
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
          <p style="margin:0 0 18px;font-size:14px;line-height:1.75;color:#44403C !important;">免費入場。中秋服租借、美人魚表演、許願天燈、九份打卡一應俱全。想免費拎全家福 soft copy，先登記；花膠月餅工作坊須預先報名。</p>
          <div style="display:flex;flex-wrap:wrap;gap:10px;">
            <a href="${RSVP_PATH}" style="display:inline-block;border:0;background:#FF6B35;color:#ffffff !important;font-weight:800;padding:11px 18px;border-radius:10px;text-decoration:none;">提早登記・工作坊早鳥</a>
            <a href="${RSVP_PATH}" style="display:inline-block;border:1.5px solid #FF6B35;background:#ffffff;color:#C2410C !important;font-weight:800;padding:11px 18px;border-radius:10px;text-decoration:none;">報名花膠月餅</a>
            <a href="${MAPS_URL}" target="_blank" rel="noopener noreferrer" style="display:inline-block;border:1.5px solid #D6D3D1;background:#ffffff;color:#1C1917 !important;font-weight:700;padding:11px 18px;border-radius:10px;text-decoration:none;">開啟地圖</a>
          </div>
          <p style="margin:16px 0 0;font-size:13px;line-height:1.6;color:#78716C !important;">檔主、傳媒或品牌請於 <a href="/vendor-application" style="color:#C2410C !important;font-weight:700;text-decoration:underline;">開檔申請</a>。免費入場，無需預約 · 最後更新：2026 年 9 月 2 日</p>
        </div>
      </div>

      <p style="font-size:12px;line-height:1.6;color:#9CA3AF;margin:28px 0 0;">圖片只供參考。現場佈置、服裝及工作坊成品或有出入。</p>
    `;

const enContent = `
      <p style="font-size: 13px; color: #666; margin-bottom: 20px; letter-spacing: 0.4px;">Last updated: 2 September 2026　｜　Mid-Autumn 2026: 25 September (Friday)</p>

      <p style="font-size:18px;line-height:1.8;margin-bottom:28px;font-weight:300;">Every year around Mid-Autumn, the same search pops up: <strong>“Where can I take my dog for Mid-Autumn Festival?”</strong> This year the easier answer is Kwun Tong Promenade — free festive hanfu rental, a mermaid photo moment, sky lanterns, then workshops and check-in sets, and the harbour moon at the end. Mall lanterns and Victoria Harbour lawns are still lovely. If you want a full Taiwan-style night with your pet, <strong>one waterfront covers it.</strong></p>

      <h2 id="one-stop" style="${H2}">Kwun Tong Promenade: a pet-friendly waterfront, plus a Taiwan-style trail</h2>

      <p style="${P_LG}"><a href="${LCSD_PARK_URL}" target="_blank" rel="noopener noreferrer" style="${LINK}">LCSD Kwun Tong Promenade Garden (designated areas)</a> is already a 24-hour pet-sharing park — wide paths, harbour views, and a walk from Ngau Tau Kok station.</p>
      <p style="${P_LG}">From 25–27 September 2026, the same stretch hosts PetWell × AquaBeat “Furry Kids Immersive Taiwan Mid-Autumn Festival”: free Mid-Autumn costume rental, a mermaid show, Shifen lanterns, Jiufen night-market sets, and handmade workshops. In short, <strong>walk to the waterfront and the festival is already there.</strong></p>

      <h2 id="experiences" style="${H2}">One trail: start with these</h2>

      <h3 id="outfit" style="${H3}">1. Free Mid-Autumn hanfu rental</h3>
      <p style="${P}">A beautiful set still looks unfinished if your pet is in an everyday harness. On site you can <strong>rent festive neo-Chinese looks and kimono for free</strong> — including the <a href="${DRESS_URL}" target="_blank" rel="noopener noreferrer" style="${LINK}">D&amp;L² pawradise Mid-Autumn pearl tassel dress</a>: a mint mandarin cape with pearls, a champagne bubble skirt embroidered with pavilions and flowers, and a harness portal at the chest so you can keep walking the promenade after photos.</p>
      <p style="${P}">The design is inspired by a moonlit garden. No need to pre-order and wait 7–14 days — borrow one on the day, photograph, and return it.</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:8px;">
        <figure style="margin:0;">
          <img src="${dressModel}" alt="D&amp;L pawradise modern Chinese pearl tassel pet dress, free Mid-Autumn costume rental" style="width:100%;border-radius:12px;" loading="lazy" />
        </figure>
        <figure style="margin:0;">
          <img src="${dressProduct}" alt="D&amp;L pawradise pearl tassel dress on a model: mint cape and champagne embroidered skirt" style="width:100%;border-radius:12px;" loading="lazy" />
        </figure>
      </div>
      <p style="font-size:13px;color:#6B7280;margin:0 0 32px;">Image source: <a href="${DRESS_URL}" target="_blank" rel="noopener noreferrer" style="color:#FF6B35;">D&amp;L² pawradise</a>. Sizes XXS–XL; check chest, back length and neck before you go.</p>

      <h3 id="mermaid" style="${H3}">2. Mermaid show</h3>
      <p style="${P}">A mermaid performs on site. Pets can stand by the tank, say hello and take photos. Dogs and cats are welcome; please keep a short leash in crowds, and wait in the shade if there is a queue.</p>
      ${figure(
        mermaid,
        "Mermaid show: a small dog greets a mermaid through the glass",
        "Mermaid show — pets can watch up close at the tank.",
      )}

      <h3 id="taiwan" style="${H3}">3. Immersive Taiwan night: wishing sky lanterns</h3>
      <p style="${P}">The event is called “Furry Kids Immersive Taiwan Mid-Autumn Festival” for a reason. The Shifen lantern area uses <strong>pet-friendly LED lanterns</strong> — you still write a wish and lift it overhead, without open flame or smoke. Safer for pets standing nearby.</p>
      ${figure(
        lanterns,
        "Shifen sky lanterns: two owners and two dogs hold pet-friendly LED lanterns at Kwun Tong Promenade",
        "Shifen lantern photo spot: pet-friendly LED lanterns, no open flame.",
      )}

      <h3 id="workshops" style="${H3}">4. Workshops: mooncakes, scarves, magnets</h3>
      <p style="${P}">Human mooncakes are sweet and oily. Lotus paste, sugar and fat are hard on a dog’s stomach, and some fillings may contain xylitol. Instead of sneaking a bite, pre-book an indoor class and make a <strong>pet-safe</strong> fish-maw mooncake together.</p>
      <p style="${P}">This year we run <strong>fish-maw mooncakes only — no freeze-dried mooncakes</strong>. Fillings may include fish maw, chicken, crocodile, poria, shark cartilage, goji, duck liver, shrimp, tuna, yam, egg yolk and quail. Classes are indoors. <strong>No walk-in spots; booking is required.</strong></p>
      <p style="${P}">There are also pet-scarf DIY (name embroidery, charms) and 3D dog-head magnet painting. Early-bird bundles are on the <a href="${RSVP_PATH}" style="${LINK}">RSVP page</a>.</p>
      <div style="display:flex;flex-wrap:wrap;gap:10px;margin:0 0 20px;">
        <a href="${RSVP_PATH}" style="display:inline-block;${BTN_PRIMARY};text-decoration:none;">RSVP · workshop early bird</a>
        <button type="button" onclick="window.dispatchEvent(new CustomEvent('petwell:open-contact',{detail:{topic:'mooncake'}}))" style="${BTN_OUTLINE}">Contact us to book</button>
      </div>
      ${figure(
        mooncake,
        "Indoor pet fish-maw mooncake workshop: an owner presses a paw-print mould while a dog watches",
        "Indoor fish-maw mooncake workshop — book ahead, no walk-ins.",
      )}

      <h3 id="photo" style="${H3}">5. Mid-Autumn photo sets: Shifen station × Jiufen stalls</h3>
      <p style="${P}">Most Mid-Autumn photo spots are giant mall moons. This year the theme is Taiwan: <strong>Shifen station and Jiufen</strong> sit close together as one immersive set. The highlight is <strong>pet-scale night-market stalls</strong> — your fur kid can play vendor behind a mini counter.</p>
      ${figure(
        taiwanSpots,
        "Jiufen pet night-market photo set: a dog and a cat pose as vendors at pet-scale sausage and stinky-tofu stalls",
        "Jiufen night-market stalls: pet-scale counters for photos.",
      )}

      <h3 id="moon" style="${H3}">6. Moon viewing: harbour breeze, full moon, Victoria Harbour lights</h3>
      <p style="${P}">After costumes, the mermaid and lanterns, stay for the moon. Kwun Tong Promenade faces the east of Victoria Harbour. Late September evenings are mild; the lawn and boardwalk are easy to sit on. Mid-Autumn 2026 falls on Friday 25 September — the festival’s first day. <strong>When the market winds down, the waterfront is right behind you.</strong></p>
      ${figure(
        moonViewing,
        "Moon viewing at Kwun Tong Promenade: a family picnics on the lawn with a small dog, looking at Victoria Harbour and the full moon",
        "Lawn moon viewing — pets, kids and grandparents can all come.",
      )}

      <h2 id="sixty-seconds" style="${H2}">Before you go</h2>

      <ul style="list-style:none;padding:0;margin:0 0 14px;font-size:15px;line-height:1.7;">
        <li style="display:flex;gap:10px;padding:9px 0;border-bottom:1px solid #FED7AA;"><span><strong style="color:#9A3412;">All pets welcome:</strong> cats, dogs, rabbits — plus kids, elders and the whole family.</span></li>
        <li style="display:flex;gap:10px;padding:9px 0;border-bottom:1px solid #FED7AA;"><span><strong style="color:#9A3412;">Leash:</strong> keep a short leash of 1.5 m or less; bring a carrier or pet stroller in crowds.</span></li>
        <li style="display:flex;gap:10px;padding:9px 0;border-bottom:1px solid #FED7AA;"><span><strong style="color:#9A3412;">Rain:</strong> follow @petwell_hk on the day.</span></li>
        <li style="display:flex;gap:10px;padding:9px 0;border-bottom:1px solid #FED7AA;"><span><strong style="color:#9A3412;">Toilets / rest:</strong> along the promenade.</span></li>
        <li style="display:flex;gap:10px;padding:9px 0;border-bottom:1px solid #FED7AA;"><span><strong style="color:#9A3412;">Fish-maw mooncake class:</strong> book ahead; no walk-ins; limited seats.</span></li>
        <li style="display:flex;gap:10px;padding:9px 0;"><span><strong style="color:#9A3412;">Entry:</strong> free, no booking. Register for a complimentary family-portrait soft copy.</span></li>
      </ul>
      <p style="font-size:13px;color:#6B7280;margin:0 0 28px;">Last updated: 2 September 2026　·　Free entry, no booking　·　Mooncake workshop requires registration</p>

      <p style="font-size:15px;line-height:1.7;margin-bottom:18px;color:#4B5563;">Hours: 25 Sep (Fri) 16:00–20:00; 26–27 Sep (Sat–Sun) 15:00–21:00. Transport and maps below.</p>

      <div style="display:flex;flex-wrap:wrap;gap:10px;margin-bottom:32px;">
        <a href="${MAPS_URL}" target="_blank" rel="noopener noreferrer" style="display:inline-block;border:1.5px solid #FF6B35;color:#C2410C;font-weight:700;font-size:14px;padding:10px 16px;border-radius:10px;text-decoration:none;">Open in Google Maps</a>
        <a href="#mtr" style="display:inline-block;border:1.5px solid #FED7AA;color:#C2410C;font-weight:700;font-size:14px;padding:10px 16px;border-radius:10px;text-decoration:none;">MTR</a>
        <a href="#ferry" style="display:inline-block;border:1.5px solid #FED7AA;color:#C2410C;font-weight:700;font-size:14px;padding:10px 16px;border-radius:10px;text-decoration:none;">Ferry</a>
        <a href="#gogox" style="display:inline-block;border:1.5px solid #FED7AA;color:#C2410C;font-weight:700;font-size:14px;padding:10px 16px;border-radius:10px;text-decoration:none;">GOGOX voucher</a>
      </div>

      <h2 id="practical" style="${H2}">Getting there</h2>

      <h3 style="font-size:20px;font-weight:700;margin:24px 0 12px;">How to reach Kwun Tong Promenade</h3>

      <h4 id="mtr" style="${H4}">Option 1: MTR</h4>
      <p style="font-size:16px;line-height:1.85;margin:0 0 16px;">Leave Ngau Tau Kok station at Exit B6, walk through the underground passage, then continue along Lai Yip Street to AquaBeat Space 02.</p>

      <h4 id="parking" style="${H4}">Option 2: Car</h4>
      <p style="font-size:16px;line-height:1.85;margin:0 0 16px;">Day parking at nearby NEO is $50.<span style="font-size:13px;color:#6B7280;"> (Check the car park on the day.)</span></p>

      <h4 id="ferry" style="${H4}">Option 3: Ferry</h4>
      <p style="font-size:16px;line-height:1.85;margin:0 0 12px;">Two routes:</p>
      <ul style="font-size:16px;line-height:1.9;margin:0 0 16px;padding-left:22px;">
        <li>Kwun Tong ↔ North Point (via Kai Tak)</li>
        <li>Kwun Tong ↔ Sai Wan Ho</li>
      </ul>
      <p style="font-size:16px;line-height:1.85;margin:0 0 20px;">Then 10–15 minutes along the waterfront. You will pass Kwun Tong Public Pier and two fountains; covered walkway on the left, toilets on the right; turn right after LUNASY.</p>

      <h4 id="gogox-heading" style="${H4}">Option 4: GOGOX</h4>
      ${GOGOX_SLOT}

      <div style="background:#FFF7ED;border-left:4px solid #FF6B35;border-radius:12px;padding:18px 20px;margin:0 0 24px;">
        <p style="margin:0 0 10px;font-size:15px;font-weight:700;color:#9A3412;">On-site notes</p>
        <ul style="margin:0;padding-left:20px;font-size:15px;line-height:1.8;color:#4B5563;">
          <li>Bring water and a collapsible bowl; late-September evenings can still run warm.</li>
          <li>Photo spots may queue — wait in the shade.</li>
          <li>If your pet pants, hides or refuses to walk, step away from the crowd and rest by the water.</li>
        </ul>
      </div>

      <h2 style="${H2}">If you only go one place this year</h2>
      <p style="${P_LG}">Pet parks and mall lanterns are still worth it. For Mid-Autumn 2026, Kwun Tong Promenade is one of the few places where free hanfu, a mermaid show, lanterns, workshops, photo sets and moon viewing sit on the same night. Walk into the harbour breeze with your pet — no need to ask “where next?”</p>
      <p style="font-size:17px;line-height:1.85;margin-bottom:24px;">Hours, stalls and rental details may shift; check <a href="https://www.instagram.com/petwell_hk/" target="_blank" rel="noopener noreferrer" style="color:#FF6B35;">@petwell_hk</a> before you go. For other weekend ideas, save our <a href="/weekend-pet-events-hong-kong-2026" style="color:#FF6B35;">weekly pet outings</a>.</p>

      <div id="rsvp" style="overflow:hidden;background:#ffffff;border:1px solid #E7E5E4;border-radius:16px;margin-bottom:8px;scroll-margin-top:88px;">
        <div style="position:relative;height:168px;background:#1C1917;">
          <img src="${lanterns}" alt="Pet-friendly LED sky lanterns at Kwun Tong Promenade" width="1600" height="900" style="display:block;width:100%;height:168px;object-fit:cover;object-position:center 28%;margin:0;" />
          <span style="position:absolute;left:16px;top:14px;background:#FF6B35;color:#ffffff !important;font-size:12px;font-weight:700;padding:5px 10px;border-radius:999px;">Free entry · No booking</span>
        </div>
        <div style="padding:20px 20px 22px;background:#ffffff;">
          <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:.12em;color:#9A3412 !important;">AQUABEAT × PETWELL</p>
          <p style="margin:0 0 14px;font-size:22px;font-weight:800;line-height:1.3;color:#1C1917 !important;">Furry Kids Immersive Taiwan Mid-Autumn Festival</p>
          <p style="margin:0 0 6px;font-size:14px;line-height:1.7;color:#44403C !important;">Dates: 25–27 September 2026</p>
          <p style="margin:0 0 6px;font-size:14px;line-height:1.7;color:#44403C !important;">Hours: Fri 16:00–20:00 · Sat–Sun 15:00–21:00</p>
          <p style="margin:0 0 14px;font-size:14px;line-height:1.7;color:#44403C !important;">Venue: AquaBeat Space 02, Kwun Tong Promenade</p>
          <p style="margin:0 0 18px;font-size:14px;line-height:1.75;color:#44403C !important;">Free entry. Costume rental, mermaid show, sky lanterns and Jiufen sets included. Register for a free family-portrait soft copy. Fish-maw mooncake workshop requires booking.</p>
          <div style="display:flex;flex-wrap:wrap;gap:10px;">
            <a href="${RSVP_PATH}" style="display:inline-block;border:0;background:#FF6B35;color:#ffffff !important;font-weight:800;padding:11px 18px;border-radius:10px;text-decoration:none;">RSVP · workshop early bird</a>
            <a href="${RSVP_PATH}" style="display:inline-block;border:1.5px solid #FF6B35;background:#ffffff;color:#C2410C !important;font-weight:800;padding:11px 18px;border-radius:10px;text-decoration:none;">Book mooncake class</a>
            <a href="${MAPS_URL}" target="_blank" rel="noopener noreferrer" style="display:inline-block;border:1.5px solid #D6D3D1;background:#ffffff;color:#1C1917 !important;font-weight:700;padding:11px 18px;border-radius:10px;text-decoration:none;">Open map</a>
          </div>
          <p style="margin:16px 0 0;font-size:13px;line-height:1.6;color:#78716C !important;">Vendors, press or brands: <a href="/vendor-application" style="color:#C2410C !important;font-weight:700;text-decoration:underline;">apply here</a>. Free entry, no booking · Last updated: 2 September 2026</p>
        </div>
      </div>

      <p style="font-size:12px;line-height:1.6;color:#9CA3AF;margin:28px 0 0;">Photos are for reference only. On-site sets, costumes and workshop pieces may differ.</p>
    `;

export const blogPostsMidAutumn: BlogPost[] = [
  {
    id: "38",
    slug: "mid-autumn-pet-outings-hong-kong-2026",
    title: "中秋可以帶狗狗去哪裡？2026 寵物中秋好去處｜寵物一生有多少個中秋",
    titleEn: "Where to Take Your Dog for Mid-Autumn Festival 2026 | Pet-Friendly Hong Kong Outings",
    excerpt:
      "狗狗一生大約只有十幾個中秋。2026 年中秋（9 月 25 日）想帶毛孩免費租漢服、睇美人魚、放天燈、整月餅？一文看清觀塘海濱台式中秋一條龍。",
    excerptEn:
      "Dogs only get about a dozen Mid-Autumn nights. On 25 September 2026, take your pet to Kwun Tong Promenade for free hanfu, a mermaid show, sky lanterns and mooncakes — one Taiwan-style trail by the harbour.",
    imageUrl: festivalHeroBanner,
    author: "PetWell HK",
    date: "2026-08-31",
    category: "生活娛樂",
    categoryEn: "Lifestyle",
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
      "免費租借寵物漢服",
      "寵物美人魚表演",
      "D&L pawradise",
      "中秋野餐 寵物",
      "寵物一生有幾多個中秋",
    ],
    seoKeywordsEn: [
      "pet-friendly Mid-Autumn Festival Hong Kong",
      "where to take dog Mid-Autumn Hong Kong",
      "Kwun Tong Promenade pets",
      "AquaBeat pet festival",
      "free pet hanfu rental Hong Kong",
      "pet mermaid show Hong Kong",
      "pet-friendly sky lanterns",
      "pet mooncake workshop",
      "Taiwan Mid-Autumn pet event",
      "Jiufen pet photo booth Hong Kong",
      "Shifen lanterns pets",
      "take dog moon viewing Victoria Harbour",
      "PetWell AquaBeat 2026",
      "pet costume rental Mid-Autumn",
    ],
    seoDescription:
      "2026 寵物中秋好去處：觀塘海濱 9 月 25–27 日免費入場。先免費租中秋漢服、睇美人魚、許願天燈，再參加月餅工作坊同九份打卡，最後喺維港賞月。",
    seoDescriptionEn:
      "Pet-friendly Mid-Autumn Festival 2026 at Kwun Tong Promenade, 25–27 Sep. Free entry: complimentary hanfu rental, mermaid show, LED sky lanterns, mooncake workshops and Jiufen photo sets — then moon viewing on Victoria Harbour.",
    relatedTopics: ["寵物好去處", "帶狗活動", "寵物市集", "中秋賞月", "寵物友善海濱"],
    faqItems: [
      {
        question: "寵物中秋好去處有邊啲？",
        answer:
          "2026 年寵物中秋好去處首選觀塘海濱：9 月 25–27 日 PetWell × AquaBeat「毛孩沉浸式台灣中秋祭」免費入場，有免費中秋服租借、美人魚表演、許願天燈、工作坊同打卡。其他選擇包括西九海濱、山頂花園及啟德跑道公園一帶。",
      },
      {
        question: "中秋可以帶狗狗去哪裡？",
        answer:
          "想一次過玩齊，去觀塘海濱 AquaBeat：免費漢服、美人魚、天燈、月餅工作坊同九份打卡，最後可以喺海邊賞月。全港其他常見選擇包括西九海濱、將軍澳環保大道寵物公園、山頂花園及啟德跑道公園一帶。",
      },
      {
        question: "現場有冇免費服裝租借？",
        answer:
          "有。活動當日可免費租借新中式中秋服及和服拍照，拍完歸還即可。其中一套為 D&L² pawradise 珍珠流蘇裙，尺碼 XXS–XL。",
      },
      {
        question: "寵物一生有多少個中秋？",
        answer:
          "中秋一年一度。小型犬約 12–16 個，中型犬約 10–13 個，大型犬約 8–12 個，貓則約 12–18 個。若你開始飼養牠時牠已一兩歲，能共度的中秋實際會更少。",
      },
      {
        question: "2026 年哪裡有寵物中秋市集？",
        answer:
          "PetWell × AquaBeat「毛孩沉浸式台灣中秋祭」於 2026 年 9 月 25–27 日在觀塘海濱 AquaBeat 活動空間 02 舉行，免費入場，無需預約。現場有許願天燈、十分／九份打卡、美人魚表演，以及和服與新中式服裝免費租借。養生花膠月餅工作坊須預先報名。",
      },
      {
        question: "觀塘海濱寵物中秋市集何時前往最理想？",
        answer:
          "9 月 25 日（星期五）16:00–20:00；9 月 26–27 日（星期六、日）15:00–21:00。賞月建議日落後到場。三天均可即場入場。",
      },
      {
        question: "狗狗可以食用人類月餅嗎？",
        answer:
          "不建議。蓮蓉、糖分及油脂對狗的腸胃負擔較大，部分月餅更可能含有木糖醇。現場僅提供養生花膠月餅工作坊，須預先報名，不設即場體驗。",
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
    faqItemsEn: [
      {
        question: "Where can I take my pet for Mid-Autumn Festival in Hong Kong?",
        answer:
          "For 2026, start at Kwun Tong Promenade: PetWell × AquaBeat’s Furry Kids Immersive Taiwan Mid-Autumn Festival (25–27 Sep) is free to enter, with complimentary costume rental, a mermaid show, sky lanterns, workshops and photo sets. Other options include the West Kowloon waterfront, The Peak Garden and Kai Tak Runway Park.",
      },
      {
        question: "Where can I take my dog for Mid-Autumn?",
        answer:
          "If you want everything in one trip, go to AquaBeat on Kwun Tong Promenade: free hanfu, mermaid photos, lanterns, mooncake class and Jiufen sets, then moon viewing by the harbour. Classic alternatives include West Kowloon, Tseung Kwan O pet parks, The Peak Garden and Kai Tak.",
      },
      {
        question: "Is costume rental really free?",
        answer:
          "Yes. Borrow neo-Chinese Mid-Autumn looks and kimono on the day, then return them after photos. One option is the D&L² pawradise pearl tassel dress, sizes XXS–XL.",
      },
      {
        question: "How many Mid-Autumn Festivals does a pet get?",
        answer:
          "Once a year. Small dogs about 12–16, medium dogs 10–13, large dogs 8–12, cats about 12–18. If you adopted them at one or two years old, you will share even fewer.",
      },
      {
        question: "Is there a pet Mid-Autumn fair in 2026?",
        answer:
          "Yes. PetWell × AquaBeat, 25–27 September 2026, AquaBeat Space 02, Kwun Tong Promenade. Free entry, no booking. LED lanterns, Shifen/Jiufen sets, mermaid show, and free hanfu/kimono rental. Fish-maw mooncake workshop must be booked ahead.",
      },
      {
        question: "When should I go?",
        answer:
          "25 Sep (Fri) 16:00–20:00; 26–27 Sep (Sat–Sun) 15:00–21:00. For the moon, arrive after sunset. Walk-in all three days.",
      },
      {
        question: "Can dogs eat human mooncakes?",
        answer:
          "We do not recommend it. Lotus paste, sugar and fat are hard on dogs, and some cakes may contain xylitol. The on-site class makes pet-safe fish-maw mooncakes and requires advance booking.",
      },
      {
        question: "What should I pack?",
        answer:
          "A short leash (1.5 m or less), water and a collapsible bowl, pee pads, wipes, a towel and a few treats. Bring a carrier or stroller in crowds. Lanterns are pet-friendly LEDs — no open flame.",
      },
      {
        question: "Do I need to book entry?",
        answer:
          "No. Entry is free and open to all pets. Register if you want a complimentary family-portrait soft copy. The fish-maw mooncake workshop is book-only.",
      },
    ],
    content: zhContent,
    contentEn: enContent,
  },
];
