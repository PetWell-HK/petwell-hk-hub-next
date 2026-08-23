import { absoluteUrl, SITE_URL } from "@/lib/seo";

export const FORUM_LISTING_TITLE =
  "香港寵物討論區 | 寵物論壇 | 狗狗貓貓毛孩社群 開post吹水 | PetWell 寵物台";

export const FORUM_LISTING_DESCRIPTION =
  "香港寵物討論區——像 LIHKG、discuss 咁樣嘅寵物版。開post、吹水、問獸醫、領養、走失協尋、健康美容飲食訓練。狗狗台、貓貓台、小動物討論，香港最活躍寵物論壇，完全免費。";

export const FORUM_LISTING_KEYWORDS =
  "討論區,寵物討論區,香港寵物討論區,寵物論壇,香港討論區寵物,香港寵物討論,寵物台,狗狗討論區,貓貓討論區,狗狗論壇,貓貓論壇,狗狗台,貓貓台,香港寵物社群,寵物吹水,寵物開post,pet forum hong kong,寵物forum,養狗心得,養貓分享,寵物健康討論,獸醫推薦,寵物美容,領養寵物香港,走失協尋,毛孩主人,毛孩討論區,hong kong pet community,香港狗主,香港貓主,寵物交流,寵物求助,寵物飲食,狗狗訓練,寵物行為問題,寵物園地,寵物問題討論,hong kong pet forum,hk pet forum,pet discussion board hong kong,寵物資訊香港,寵物社區香港,discuss 寵物,hk 寵物討論區";

const FORUM_CATEGORIES_LD = [
  { name: "狗狗討論", category: "DOG" },
  { name: "貓貓討論", category: "CAT" },
  { name: "小動物", category: "SMALL_ANIMAL" },
  { name: "生活分享", category: "LIFE_SHARING" },
  { name: "寵物活動", category: "EVENTS" },
  { name: "寵物領養", category: "ADOPTION" },
  { name: "寵物健康", category: "HEALTH" },
  { name: "寵物美容", category: "GROOMING" },
  { name: "寵物飲食", category: "DIET" },
  { name: "寵物訓練", category: "TRAINING" },
  { name: "行為問題", category: "BEHAVIOR" },
  { name: "用品評價", category: "PRODUCT_REVIEW" },
  { name: "寵物交易", category: "TRADING" },
  { name: "寵物旅遊", category: "TRAVEL" },
  { name: "寵物住宿", category: "LODGING" },
  { name: "走失協尋", category: "LOST_FOUND" },
  { name: "緊急求助", category: "EMERGENCY" },
] as const;

const FORUM_FAQS = [
  {
    question: "香港邊度有寵物討論區？",
    answer:
      "PetWell HK係香港最活躍嘅寵物論壇同討論區，專為香港毛孩主人而設。你可以喺度討論狗狗、貓貓、小動物嘅健康、飲食、美容、訓練等各種話題，仲可以分享養寵心得、搵領養資訊同獸醫推薦，完全免費。",
  },
  {
    question: "香港寵物討論區／論壇有咩討論分類？",
    answer:
      "PetWell寵物討論區（論壇）涵蓋17個討論分類：狗狗、貓貓、小動物、生活分享、活動、領養、健康、美容、飲食、訓練、行為問題、用品評價、交易、旅遊、住宿、走失協尋及緊急求助。係香港覆蓋範圍最廣嘅寵物討論區。",
  },
  {
    question: "點樣喺香港寵物討論區發帖？",
    answer:
      "喺PetWell寵物論壇，你只需免費註冊帳號即可發帖。支援文字、圖片及分類標籤，亦可選擇匿名發文。點擊「發佈帖文」按鈕，選擇分類後即可開始分享。",
  },
  {
    question: "點樣搵香港寵物領養資訊？",
    answer:
      "喺PetWell寵物論壇嘅「領養」分類，你可以搵到香港各地嘅寵物領養資訊，包括狗狗、貓貓同其他小動物。亦有走失協尋分類幫助尋回走失寵物。",
  },
  {
    question: "可以匿名喺寵物討論區／論壇發文嗎？",
    answer:
      "可以！PetWell寵物討論區（論壇）支援匿名發帖功能，讓你可以自由分享個人經歷或提問，毋需擔心個人資料外洩。適合分享敏感話題或想保護私隱的主人。",
  },
  {
    question: "香港寵物主人最常討論咩話題？",
    answer:
      "香港寵物主人最常討論嘅話題包括：獸醫推薦、寵物健康問題（皮膚、腸胃、骨科等）、飲食建議、美容心得、寵物友善餐廳、訓練技巧、行為問題、走失尋寵及領養資訊。",
  },
  {
    question: "PetWell寵物討論區同LIHKG、Threads、discuss.com.hk有咩唔同？",
    answer:
      "PetWell係香港首個專門為寵物主人而設的討論區兼論壇，所有討論分類都圍繞寵物話題，唔係綜合討論區。同連登、discuss、Threads唔同，我哋係寵物專屬：開post吹水、獸醫診所、寵物友善餐廳、領養走失協尋一應俱全，係名副其實嘅「寵物台」討論區。",
  },
  {
    question: "Where can I find a Hong Kong pet forum in English?",
    answer:
      "PetWell HK is Hong Kong's most active pet forum and discussion board, supporting both Traditional Chinese and English. You can find discussions on dogs, cats, small animals, pet health, grooming, adoption, lost pets, and more. Join our community at petwellhk.com/forum.",
  },
] as const;

export function forumListingJsonLd(): object[] {
  const url = absoluteUrl("/forum");
  return [
    {
      "@context": "https://schema.org",
      "@type": "DiscussionForum",
      name: "PetWell 香港寵物討論區 - 寵物論壇",
      alternateName: [
        "香港寵物討論區",
        "寵物討論區",
        "寵物台",
        "寵物論壇",
        "香港寵物forum",
        "香港寵物討論區論壇",
      ],
      description:
        "香港最活躍寵物討論區。狗狗、貓貓、小動物主人分享養寵經驗、健康資訊、領養資訊，互相幫助。涵蓋獸醫推薦、走失協尋、寵物美容、行為訓練等話題。",
      url,
      inLanguage: ["zh-HK", "zh-TW", "en"],
      audience: {
        "@type": "Audience",
        audienceType: "Pet Owners",
        geographicArea: {
          "@type": "AdministrativeArea",
          name: "Hong Kong",
        },
      },
      provider: {
        "@type": "Organization",
        name: "PetWell HK",
        url: SITE_URL,
        logo: `${SITE_URL}/logo.png`,
        sameAs: [
          "https://www.instagram.com/petwell.hk",
          "https://www.facebook.com/petwellhk",
        ],
      },
      about: [
        { "@type": "Thing", name: "狗狗" },
        { "@type": "Thing", name: "貓貓" },
        { "@type": "Thing", name: "寵物健康" },
        { "@type": "Thing", name: "寵物領養" },
        { "@type": "Thing", name: "獸醫推薦" },
        { "@type": "Thing", name: "寵物訓練" },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "香港寵物討論區 | PetWell 寵物論壇",
      description:
        "香港最活躍寵物討論區兼論壇，涵蓋狗狗、貓貓、小動物等17個討論分類，包括健康、美容、飲食、領養、走失協尋、緊急求助。",
      url,
      inLanguage: "zh-HK",
      isPartOf: { "@type": "WebSite", name: "PetWell HK", url: SITE_URL },
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "PetWell 寵物討論區・論壇分類",
      description: "香港寵物討論區／論壇涵蓋的17個寵物話題分類",
      numberOfItems: FORUM_CATEGORIES_LD.length,
      itemListElement: FORUM_CATEGORIES_LD.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        url: `${url}?category=${item.category}`,
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "PetWell HK - 香港寵物討論區・寵物論壇",
      url: SITE_URL,
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${url}?search={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "PetWell HK", item: SITE_URL },
        {
          "@type": "ListItem",
          position: 2,
          name: "寵物討論區 / 寵物論壇",
          item: url,
        },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: FORUM_FAQS.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      })),
    },
  ];
}
