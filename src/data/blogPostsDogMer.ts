import type { BlogPost } from "./blogData";

const blogDogMerCover = "/assets/blog-dog-mer-cover.jpg";
const blogDogMerFeed = "/assets/blog-dog-mer/inline-feed.jpg";
const blogDogMerBody = "/assets/blog-dog-mer/inline-body.jpg";
const blogDogMerBag = "/assets/blog-dog-mer/inline-bag.jpg";

export const blogPostsDogMer: BlogPost[] = [
  {
    id: "37",
    slug: "dog-mer-calorie-calculator-hk",
    title: "狗狗一日要食幾多？MER 熱量計算機＋BCS 體態教學｜PetWell HK",
    excerpt:
      "先填體重、揀身形，即知今日大約餵幾多克。袋表係平均狗；下文再講點睇糧標、同點用手判斷體態。",
    content: `
      <p style="font-size: 13px; color: #666; margin-bottom: 20px; text-transform: uppercase; letter-spacing: 0.5px;">最後更新：2026 年 8 月 21 日</p>

      <div style="background:#FFF7ED;border-left:4px solid #FF6B35;padding:16px 20px;border-radius:10px;margin-bottom:28px;">
        <h2 style="font-size:18px;font-weight:700;margin:0 0 8px;color:#C2410C;">一分鐘結論</h2>
        <p style="font-size:15px;line-height:1.75;margin:0;color:#111827;">袋面「每公斤餵幾多 g」係平均狗，唔係你隻。上面計算機填體重、身形、活躍程度，再輸入糧袋 kcal，就會出今日大約幾多克。數字係起步，唔係處方；兩週後摸肋骨、睇腰線，再加減糧。</p>
      </div>

      <div style="border-radius:14px;overflow:hidden;border:1px solid #E5E7EB;margin-bottom:28px;">
        <img src="${blogDogMerFeed}" alt="香港屋企用秤同勺子量狗糧，狗喺旁邊等食" style="width:100%;display:block;" loading="lazy" />
        <p style="font-size:13px;color:#666;text-align:center;margin:10px 16px 14px;line-height:1.6;">用秤、唔好用杯估。同一隻杯，膨化糧可以差 20–30 g。</p>
      </div>

      <h2 style="font-size: 24px; font-weight: 700; margin: 36px 0 16px; padding-bottom: 10px; border-bottom: 2px solid #FF6B35;">點用上面個計算機</h2>
      <p style="font-size:15px;line-height:1.8;color:#374151;margin-bottom:16px;">唔使識 MER。四步就有今日餵幾多：</p>
      <div style="display:grid;grid-template-columns:1fr;gap:12px;margin-bottom:28px;">
        <div style="border:1px solid #E5E7EB;border-radius:14px;padding:16px 18px;background:#fff;">
          <div style="display:inline-block;background:#FF6B35;color:#fff;font-weight:700;font-size:13px;padding:4px 12px;border-radius:999px;margin-bottom:10px;">1 · 體重</div>
          <p style="font-size:15px;line-height:1.75;margin:0;color:#374151;">填而家體重。香港多數用 kg。</p>
        </div>
        <div style="border:1px solid #E5E7EB;border-radius:14px;padding:16px 18px;background:#fff;">
          <div style="display:inline-block;background:#FF6B35;color:#fff;font-weight:700;font-size:13px;padding:4px 12px;border-radius:999px;margin-bottom:10px;">2 · 身形</div>
          <p style="font-size:15px;line-height:1.75;margin:0;color:#374151;">由上望落：肋骨凸就揀「瘦」；摸到肋骨又有腰就「剛好」；摸唔到肋骨就「圓」。</p>
        </div>
        <div style="border:1px solid #E5E7EB;border-radius:14px;padding:16px 18px;background:#fff;">
          <div style="display:inline-block;background:#FF6B35;color:#fff;font-weight:700;font-size:13px;padding:4px 12px;border-radius:999px;margin-bottom:10px;">3 · 活動</div>
          <p style="font-size:15px;line-height:1.75;margin:0;color:#374151;">日日跑揀「活躍」；室內、已絕育、普通散步揀「普通」；年紀大少郁揀「高齡」。</p>
        </div>
        <div style="border:1px solid #E5E7EB;border-radius:14px;padding:16px 18px;background:#fff;">
          <div style="display:inline-block;background:#FF6B35;color:#fff;font-weight:700;font-size:13px;padding:4px 12px;border-radius:999px;margin-bottom:10px;">4 · 糧袋</div>
          <p style="font-size:15px;line-height:1.75;margin:0;color:#374151;">背面搵「代謝能」或 kcal / 100g，填入就會出今日幾多克、分幾餐每餐幾多。</p>
        </div>
      </div>

      <h2 style="font-size: 24px; font-weight: 700; margin: 40px 0 16px; padding-bottom: 10px; border-bottom: 2px solid #FF6B35;">點睇身形：用手，唔使識 BCS</h2>
      <div style="border-radius:14px;overflow:hidden;border:1px solid #E5E7EB;margin-bottom:20px;">
        <img src="${blogDogMerBody}" alt="主人由上用手摸狗肋骨同腰線，判斷體態" style="width:100%;display:block;" loading="lazy" />
        <p style="font-size:13px;color:#666;text-align:center;margin:10px 16px 14px;line-height:1.6;">理想係輕輕摸到肋骨，唔會一排骨凸出；由上望有腰線，側面肚會收上去。</p>
      </div>
      <p style="font-size:15px;line-height:1.8;color:#374151;margin-bottom:16px;">揀「圓」會當隻狗偏重，用較低嘅理想體重計，目標預設「減重」。揀「瘦」就相反。目標可以自己改——例如身形圓但你想先維持，唔使跟預設。</p>
      <div style="display:grid;grid-template-columns:1fr;gap:10px;margin-bottom:28px;">
        <div style="border-left:4px solid #2563EB;padding:12px 16px;background:#eff6ff;border-radius:8px;"><strong>瘦：</strong>肋骨凸、腰好窄。計算機會當要慢慢增。</div>
        <div style="border-left:4px solid #16a34a;padding:12px 16px;background:#f0fdf4;border-radius:8px;"><strong>剛好：</strong>摸到肋骨，上望有腰。多數維持而家體重。</div>
        <div style="border-left:4px solid #ca8a04;padding:12px 16px;background:#fefce8;border-radius:8px;"><strong>圓：</strong>肋骨難摸，腰線唔清。多數先慢慢減。</div>
      </div>

      <h2 style="font-size: 24px; font-weight: 700; margin: 40px 0 16px; padding-bottom: 10px; border-bottom: 2px solid #FF6B35;">點睇糧袋</h2>
      <div style="border-radius:14px;overflow:hidden;border:1px solid #E5E7EB;margin-bottom:20px;">
        <img src="${blogDogMerBag}" alt="狗糧袋同電子秤上的糧勺，用來對照 kcal／100g" style="width:100%;display:block;" loading="lazy" />
        <p style="font-size:13px;color:#666;text-align:center;margin:10px 16px 14px;line-height:1.6;">真正有用嘅係營養表嘅 kcal / 100g（有時寫代謝能 ME），唔係袋面「每公斤餵幾多 g」。</p>
      </div>
      <p style="font-size:15px;line-height:1.8;color:#374151;margin-bottom:16px;">袋表通常當你活躍、體態標準。已絕育、少郁、偏圓嘅香港室內狗，多數要少過袋表。濕糧、風乾、鮮食數字差好遠，換糧就要重新填。零食都要計入今日總量，一般唔好超過全日熱量 10%。</p>

      <h2 style="font-size: 24px; font-weight: 700; margin: 40px 0 16px; padding-bottom: 10px; border-bottom: 2px solid #FF6B35;">數字點嚟</h2>
      <p style="font-size:15px;line-height:1.8;color:#374151;margin-bottom:16px;">先估一隻狗靜坐一日要用幾多熱量，再乘活躍程度。偏圓會先換成較輕嘅理想體重先計；減重會再收緊。呢個係起步，兩週後再摸肋骨、睇腰線，加減糧。</p>
      <p style="font-size:15px;line-height:1.8;color:#374151;margin-bottom:24px;">算法跟獸醫常用公式（同 <a href="https://www.purinainstitute.com/centresquare/mer-calculator-for-dogs" target="_blank" rel="noopener" style="color:#FF6B35;">Purina Institute MER calculator</a> 同一套公開算法），唔係處方。</p>

      <div style="background:#FEF2F2;border-left:4px solid #DC2626;padding:16px 20px;border-radius:10px;margin-bottom:32px;">
        <h3 style="font-size:18px;font-weight:700;margin:0 0 8px;color:#991B1B;">幾時唔好淨靠計算機</h3>
        <p style="font-size:15px;line-height:1.75;margin:0;color:#7F1D1D;">幼犬、懷孕／授乳、病狗、或者已經好圓（肋骨完全摸唔到），要獸醫開計劃。同一隻狗實際需要可以差到一半；精神、大便、體態穩先算啱。</p>
      </div>

      <h2 style="font-size: 24px; font-weight: 700; margin: 36px 0 16px; padding-bottom: 10px; border-bottom: 2px solid #FF6B35;">RER 同 MER 係咩</h2>
      <p style="font-size:15px;line-height:1.8;color:#374151;margin-bottom:16px;"><strong>RER（Resting Energy Requirement）</strong> 係一隻狗靜靜坐住、維持基本代謝一日要用嘅熱量。獸醫最常用、亦適用細狗同巨犬的公式係：</p>
      <p style="font-size:18px;font-weight:700;text-align:center;margin:8px 0 20px;color:#111827;font-family:ui-monospace,Menlo,monospace;">RER = 70 × 體重(kg)<sup>0.75</sup></p>
      <p style="font-size:15px;line-height:1.8;color:#374151;margin-bottom:16px;">診所有時會用簡化版 <code>30 × kg + 70</code>，只適合大約 2–45 kg。2 kg 以下或者 45 kg 以上，用 0.75 次方嗰條準好多。上面計算機一律用 0.75 次方。</p>
      <p style="font-size:15px;line-height:1.8;color:#374151;margin-bottom:20px;"><strong>MER</strong> = RER × 係數。行路、消化、絕育狀態、年紀都會改變呢個係數。同一隻 8 kg 已絕育成犬，RER 約 333 kcal；乘 1.6 就約 <strong>533 kcal/日</strong>。如果佢 BCS 7、目標減重，就改用理想體重的 RER × 1.0，數字會再低。</p>

      <div style="display:grid;grid-template-columns:1fr;gap:12px;margin-bottom:28px;">
        <div style="border:1px solid #E5E7EB;border-radius:14px;padding:16px 18px;background:#fff;">
          <strong>年輕、活躍成犬 × 1.8</strong>
          <p style="font-size:14px;line-height:1.7;margin:6px 0 0;color:#4B5563;">未絕育、日日跑草、工作犬入門。能量需求高。</p>
        </div>
        <div style="border:1px solid #E5E7EB;border-radius:14px;padding:16px 18px;background:#fff;">
          <strong>活動量低／已絕育成犬 × 1.6</strong>
          <p style="font-size:14px;line-height:1.7;margin:6px 0 0;color:#4B5563;">香港最常見：室內為主、已絕育。Purina 將「inactive or neutered」歸呢組。</p>
        </div>
        <div style="border:1px solid #E5E7EB;border-radius:14px;padding:16px 18px;background:#fff;">
          <strong>高齡犬 × 1.4</strong>
          <p style="font-size:14px;line-height:1.7;margin:6px 0 0;color:#4B5563;">代謝同活動量未見外觀變化之前已經下降。小型 8 歲+、中型 7 歲+、大型 6 歲+ 可當高齡。</p>
        </div>
        <div style="border:1px solid #E5E7EB;border-radius:14px;padding:16px 18px;background:#fff;">
          <strong>減重 × 1.0（用理想體重計 RER）</strong>
          <p style="font-size:14px;line-height:1.7;margin:6px 0 0;color:#4B5563;">Purina 指出：BCS 6–7 若只揀「維持」，因為用較低體重計，可能已經慢減；揀「減重」會再收緊熱量。急減容易營養不足。</p>
        </div>
      </div>

      <h2 style="font-size: 24px; font-weight: 700; margin: 40px 0 16px; padding-bottom: 10px; border-bottom: 2px solid #FF6B35;">點樣睇 BCS：用手，唔好淨睇磅</h2>
      <p style="font-size:15px;line-height:1.8;color:#374151;margin-bottom:16px;">Purina / WSAVA 的 9 分體態：<strong>5 分理想</strong>。每偏離 1 分，大約等於體重相差 <strong>10%</strong>。所以 BCS 7 的 10 kg 狗，理想體重大約 10 ÷ 1.2 ≈ <strong>8.3 kg</strong>。袋面跟「而家體重」餵，等於繼續餵一個過重的身體。</p>
      <div style="display:grid;grid-template-columns:1fr;gap:10px;margin-bottom:24px;">
        <div style="border-left:4px solid #16a34a;padding:10px 14px;background:#f0fdf4;border-radius:8px;"><strong>4–5 分：</strong>肋骨易摸但有薄層脂肪；上望有腰；側面肚向上收。</div>
        <div style="border-left:4px solid #ca8a04;padding:10px 14px;background:#fefce8;border-radius:8px;"><strong>6–7 分：</strong>肋骨要用力先摸到；腰線淡；由上望背變闊。</div>
        <div style="border-left:4px solid #dc2626;padding:10px 14px;background:#fef2f2;border-radius:8px;"><strong>8–9 分：</strong>肋骨摸唔到；腰完全無；頸、背、尾根有明顯脂肪墊。要獸醫跟減重，唔好自己砍一半糧。</div>
        <div style="border-left:4px solid #2563EB;padding:10px 14px;background:#eff6ff;border-radius:8px;"><strong>1–3 分：</strong>肋骨、脊骨凸出。先排除蟲、牙、腸胃、甲狀腺等問題，先加糧。</div>
      </div>

      <h2 style="font-size: 24px; font-weight: 700; margin: 40px 0 16px; padding-bottom: 10px; border-bottom: 2px solid #FF6B35;">糧袋數字點轉成「今日餵幾多 g」</h2>
      <p style="font-size:15px;line-height:1.8;color:#374151;margin-bottom:16px;">香港市面乾糧多數標 <strong>kcal / 100g</strong>（代謝能 ME）。計法：</p>
      <p style="font-size:16px;font-weight:700;margin:0 0 16px;font-family:ui-monospace,Menlo,monospace;">每日克數 = MER kcal ÷ (每 100g kcal) × 100</p>
      <p style="font-size:15px;line-height:1.8;color:#374151;margin-bottom:16px;">例：MER 530 kcal，糧 360 kcal/100g → 530 ÷ 360 × 100 ≈ <strong>147 g</strong>。零食、潔齒骨、飯檯碎都要扣。一般零食唔好超過全日熱量 10%。</p>
      <p style="font-size:15px;line-height:1.8;color:#374151;margin-bottom:24px;">濕糧、鮮食、BARF 的熱量密度差好遠。換糧用 7 日漸進，腸胃先跟得上。體重管理的飲食同運動，可以一齊睇 <a href="/pet-weight-management-guide-hk" style="color:#FF6B35;text-decoration:underline;">寵物體重管理攻略</a>。</p>

      <h2 style="font-size: 24px; font-weight: 700; margin: 40px 0 16px; padding-bottom: 10px; border-bottom: 2px solid #FF6B35;">高齡同減重：Purina 特別提醒</h2>
      <p style="font-size:15px;line-height:1.8;color:#374151;margin-bottom:16px;">高齡未見「變老」之前，代謝同活動量已經跌。熱量唔減，關節先肥後痛。細隻 8 歲、中型 7 歲、大隻 6 歲，可以當入高齡組再計一次。</p>
      <p style="font-size:15px;line-height:1.8;color:#374151;margin-bottom:24px;">減重用而家體重定目標體重都可以起步，但<strong>唔好大幅節食</strong>。狗安全速度係每週減 <strong>1–2% 體重</strong>，先留得住肌肉、減少反彈。BCS 8–9、有病、幼犬、懷孕／授乳，計算機只供參考，要獸醫開計劃。</p>

      <h2 style="font-size: 24px; font-weight: 700; margin: 40px 0 16px; padding-bottom: 10px; border-bottom: 2px solid #FF6B35;">兩週校正法</h2>
      <div style="display:grid;grid-template-columns:1fr;gap:12px;margin-bottom:32px;">
        <div style="border-left:4px solid #FF6B35;padding:12px 16px;background:#FFF7ED;border-radius:8px;"><strong>1. 用秤，唔好用杯估。</strong>同一隻 250 ml 杯，膨化糧可以差 20–30 g。</div>
        <div style="border-left:4px solid #FF6B35;padding:12px 16px;background:#FFF7ED;border-radius:8px;"><strong>2. 固定時間量重。</strong>晨早未食、同一磅。記 BCS，唔好淨睇數字。</div>
        <div style="border-left:4px solid #FF6B35;padding:12px 16px;background:#FFF7ED;border-radius:8px;"><strong>3. 兩週調一次。</strong>重咗就減 10% 糧；輕得太快就加返少少。個體可以偏離公式 50%。</div>
        <div style="border-left:4px solid #FF6B35;padding:12px 16px;background:#FFF7ED;border-radius:8px;"><strong>4. 絕育後預先減。</strong>代謝會跌，好多狗喺手術後幾個月先肥。轉「已絕育」組再計。</div>
      </div>

      <div class="blog-cta-app">
        <div class="cta-app-inner">
          <div class="cta-app-text">
            <h3>體重、糧、疫苗紀錄放埋一齊</h3>
            <ul>
              <li>✅ 電子狗牌、疫苗、病歷隨時出示</li>
              <li>✅ 急診診所一鍵導航</li>
              <li>✅ 體重變化自己跟</li>
            </ul>
            <p class="cta-app-desc">MER 係起步。跟兩週體態，先係真正餵得準。</p>
            <a href="/download" class="cta-btn-primary">📲 立即免費下載</a>
          </div>
        </div>
      </div>

      <h2 style="font-size: 24px; font-weight: 700; margin: 40px 0 16px; padding-bottom: 10px; border-bottom: 2px solid #FF6B35;">常見問題</h2>
      <p><strong>Q: 同糧袋上的餵食表邊個準？</strong></p>
      <p>A: 袋表跟「平均體重 + 平均活動」。MER + BCS 較接近你隻狗。兩者都係起步，兩週後用體態校正。</p>
      <p><strong>Q: 幼犬、懷孕、授乳可唔可以用？</strong></p>
      <p>A: Purina 呢個公開版主要服務成犬三組。幼犬通常 RER × 2–3，授乳可以更高。唔好用成犬減重模式硬套。</p>
      <p><strong>Q: 點解我隻狗計出嚟食得好少？</strong></p>
      <p>A: 已絕育、高齡、BCS 偏高又揀減重，數字會明顯低過袋表。確認糧的 kcal/100g 冇睇錯；零食有冇另計。若精神、大便、體態都穩，低過袋表係正常。</p>
      <p><strong>Q: 可以用人嘅卡路里 App 嗎？</strong></p>
      <p>A: 人嘅 TDEE 同狗的 RER 公式不同。用上面計算機，或者問獸醫營養。</p>

      <h2 style="font-size: 24px; font-weight: 700; margin: 40px 0 16px; padding-bottom: 10px; border-bottom: 2px solid #FF6B35;">相關閱讀</h2>
      <ul style="font-size:15px;line-height:1.9;margin:0 0 28px;padding-left:22px;color:#374151;">
        <li><a href="/pet-weight-management-guide-hk" style="color:#FF6B35;">寵物體重管理、肥胖同減重</a></li>
        <li><a href="/senior-dog-cat-irritable-temper-guide-hk" style="color:#FF6B35;">老年毛孩脾氣同痛症</a></li>
        <li><a href="/24hr-vet-clinic-hk-list" style="color:#FF6B35;">香港 24 小時獸醫名單</a></li>
      </ul>

      <p style="font-size:13px;line-height:1.7;color:#6B7280;margin-top:32px;padding-top:16px;border-top:1px solid #E5E7EB;">資料來源：<a href="https://www.purinainstitute.com/centresquare/mer-calculator-for-dogs" target="_blank" rel="noopener" style="color:#FF6B35;">Purina Institute MER Calculator for Dogs</a>、<a href="https://www.purinainstitute.com/explore/maintenance-energy-requirements-mer-calculator-for-dogs" target="_blank" rel="noopener" style="color:#FF6B35;">Purina Institute 說明頁</a>、WSAVA 體態評分、NRC / AAHA 能量公式。計算機係教學估算，唔取代獸醫診斷或處方糧計劃。</p>
    `,
    author: "PetWell HK",
    date: "2026-08-21",
    category: "飲食營養",
    imageUrl: blogDogMerCover,
    seoKeywords: [
      "狗狗 熱量 計算機",
      "MER calculator 狗",
      "RER 狗",
      "BCS 體態評分",
      "狗糧 一日幾多",
      "Purina MER",
      "狗 減重 卡路里",
      "已絕育 狗 食量",
    ],
    faqItems: [
      {
        question: "同糧袋上的餵食表邊個準？",
        answer: "袋表跟平均體重同平均活動。MER 加 BCS 較接近你隻狗。兩者都係起步，兩週後用體態校正。",
      },
      {
        question: "幼犬、懷孕、授乳可唔可以用？",
        answer: "Purina 呢個公開版主要服務成犬三組。幼犬通常 RER × 2–3，授乳可以更高。唔好用成犬減重模式硬套。",
      },
      {
        question: "點解我隻狗計出嚟食得好少？",
        answer: "已絕育、高齡、BCS 偏高又揀減重，數字會低過袋表。確認 kcal/100g 同零食。體態穩就屬正常範圍。",
      },
      {
        question: "可以用人嘅卡路里 App 嗎？",
        answer: "人嘅 TDEE 同狗的 RER 公式不同。用本頁計算機，或者問獸醫營養。",
      },
    ],
    relatedTopics: ["飲食營養", "體重管理", "高齡犬"],
  }
];
