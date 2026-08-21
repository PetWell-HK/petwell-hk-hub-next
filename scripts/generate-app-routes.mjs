import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const appDir = path.join(root, "src", "app");

const routes = [
  {
    route: "",
    page: "Index",
    seo: {
      title: "PetWell HK | 寵物友善餐廳、獸醫診所、寵物論壇 | 香港寵物健康App",
      description:
        "PetWell 香港首個一站式寵物健康App。全港寵物友善餐廳（18區搜尋）、獸醫診所評價、寵物美容與寄養、寵物活動及論壇。免費下載。",
      keywords:
        "PetWell,寵物香港,寵物健康App,寵物友善餐廳,香港寵物友善餐廳,食環署寵物友善餐廳,獸醫診所評價,寵物美容,寵物寄養,寵物論壇,寵物活動,香港獸醫,24小時獸醫,寵物健康紀錄",
      path: "/",
    },
    listingKind: "home",
  },
  {
    route: "landing",
    page: "Landing",
    seo: {
      title: "PetWell HK | 香港寵物健康管理平台",
      description: "PetWell HK 一站式寵物健康、餐廳、診所與社區平台。",
      path: "/landing",
    },
  },
  {
    route: "about",
    page: "About",
    seo: {
      title: "關於我們 | PetWell HK",
      description: "認識 PetWell HK——香港寵物健康與生活資訊平台。",
      path: "/about",
    },
  },
  {
    route: "other-services",
    page: "OtherServices",
    seo: {
      title: "商業合作與其他服務 | PetWell HK",
      description: "PetWell HK 商業合作、廣告與 B2B 服務。",
      path: "/other-services",
    },
  },
  {
    route: "terms",
    page: "Terms",
    seo: {
      title: "服務條款 | PetWell HK",
      description: "PetWell HK 服務條款。",
      path: "/terms",
      noIndex: true,
    },
  },
  {
    route: "privacy",
    page: "Terms",
    seo: {
      title: "私隱政策 | PetWell HK",
      description: "PetWell HK 私隱政策。",
      path: "/privacy",
      noIndex: true,
    },
  },
  {
    route: "clinics",
    page: "Clinics",
    listingKind: "clinics",
    seo: {
      title: "香港獸醫診所評價與搜尋 | PetWell HK",
      description: "搜尋全港獸醫診所、24小時急症、評價與地區資訊。",
      keywords: "香港獸醫,獸醫診所,24小時獸醫,寵物診所評價",
      path: "/clinics",
    },
  },
  { route: "clinics/[clinicId]", page: "ClinicDetail", dynamic: true, seoKind: "place", placeKind: "clinic", param: "clinicId" },
  {
    route: "home-visits",
    page: "HomeVisits",
    listingKind: "homeVisits",
    seo: {
      title: "香港寵物上門服務｜上門診症、疫苗、急症｜PetWell HK",
      description:
        "搜尋香港寵物上門服務：上門診症、疫苗接種、健康檢查同急症支援。按地區、寵物種類同服務範圍篩選，WhatsApp／電話一鍵聯絡。",
      keywords:
        "寵物上門服務,香港上門獸醫,寵物上門診症,上門疫苗,寵物急症上門,home visit vet hong kong",
      path: "/home-visits",
    },
  },
  { route: "home-visits/[providerId]", page: "HomeVisitDetail", dynamic: true, seoKind: "place", placeKind: "homeVisit", param: "providerId" },
  {
    route: "restaurants",
    page: "Restaurants",
    listingKind: "restaurants",
    seo: {
      title: "香港寵物友善餐廳（18區搜尋）| PetWell HK",
      description: "全港寵物友善餐廳指南，按地區搜尋可帶狗／寵物入座餐廳。",
      keywords: "香港寵物友善餐廳,帶狗去食飯,食環署寵物友善餐廳",
      path: "/restaurants",
    },
  },
  {
    route: "restaurant",
    page: "Restaurants",
    listingKind: "restaurants",
    seo: {
      title: "香港寵物友善餐廳 | PetWell HK",
      description: "全港寵物友善餐廳指南。",
      path: "/restaurant",
    },
  },
  {
    route: "pet-friendly-restaurants-hk",
    page: "Restaurants",
    listingKind: "restaurants",
    seo: {
      title: "Pet-Friendly Restaurants Hong Kong | PetWell HK",
      description: "Find pet-friendly restaurants across Hong Kong.",
      path: "/pet-friendly-restaurants-hk",
    },
  },
  { route: "pet-friendly-restaurants/[areaSlug]", page: "RestaurantsByArea", dynamic: true, seoKind: "area", param: "areaSlug" },
  { route: "restaurants/[restaurantId]", page: "RestaurantDetail", dynamic: true, seoKind: "place", placeKind: "restaurant", param: "restaurantId" },
  {
    route: "salons",
    page: "Salons",
    listingKind: "salons",
    seo: {
      title: "香港寵物美容店搜尋 | PetWell HK",
      description: "搜尋全港寵物美容、沖涼與造型服務。",
      path: "/salons",
    },
  },
  { route: "salons/[salonId]", page: "SalonDetail", dynamic: true, seoKind: "place", placeKind: "salon", param: "salonId" },
  {
    route: "lodging",
    page: "Lodging",
    listingKind: "lodging",
    seo: {
      title: "香港寵物寄養與住宿 | PetWell HK",
      description: "搜尋寵物寄養、酒店與寵物友好住宿。",
      path: "/lodging",
    },
  },
  { route: "lodging/[lodgingId]", page: "LodgingDetail", dynamic: true, seoKind: "place", placeKind: "lodging", param: "lodgingId" },
  {
    route: "malls",
    page: "Malls",
    listingKind: "malls",
    seo: {
      title: "香港寵物友善商場 | PetWell HK",
      description: "搜尋可帶寵物進入的香港商場與室內空間。",
      path: "/malls",
    },
  },
  { route: "malls/[mallId]", page: "MallDetail", dynamic: true, seoKind: "place", placeKind: "mall", param: "mallId" },
  {
    route: "ngos",
    page: "NGOs",
    seo: {
      title: "香港動物NGO／救援組織 | PetWell HK",
      description: "認識香港動物福利與救援組織。",
      path: "/ngos",
    },
  },
  { route: "ngos/[ngoId]", page: "NGODetail", dynamic: true, seoKind: "ngo", param: "ngoId" },
  {
    route: "forum",
    page: "Forum",
    seo: {
      title: "香港寵物論壇 | PetWell HK",
      description: "PetWell 寵物論壇：養寵心得、提問與社群討論。",
      path: "/forum",
    },
    listingKind: "forum",
  },
  { route: "forum/[postId]", page: "ForumPost", dynamic: true, seoKind: "forum", param: "postId" },
  {
    route: "owner-zone",
    page: "OwnerZone",
    seo: {
      title: "飼主專區 | PetWell HK",
      description: "飼主實用資訊、指南與工具。",
      path: "/owner-zone",
    },
  },
  {
    route: "download",
    page: "Download",
    seo: {
      title: "下載 PetWell App | 香港寵物健康管理",
      description: "免費下載 PetWell。香港獸醫診所評價、寵物友善餐廳、健康紀錄與價格提醒，iOS 與 Android 均適用。",
      path: "/download",
    },
  },
  {
    route: "delete-account",
    page: "DeleteAccount",
    seo: {
      title: "刪除帳戶 | PetWell HK",
      description: "刪除 PetWell 帳戶。",
      path: "/delete-account",
      noIndex: true,
    },
  },
  {
    route: "admin-forms-secret",
    page: "AdminForms",
    seo: { title: "Admin Forms | PetWell HK", description: "Admin", path: "/admin-forms-secret", noIndex: true },
  },
  {
    route: "mailgoogleform",
    page: "MailGoogleForm",
    seo: { title: "Google Form | PetWell HK", description: "Redirect", path: "/mailgoogleform", noIndex: true },
  },
  {
    route: "whatsapp-petwell-eng",
    page: "WhatsAppPetwellEng",
    seo: { title: "WhatsApp PetWell", description: "Contact", path: "/whatsapp-petwell-eng", noIndex: true },
  },
  {
    route: "whatsapp-petwell-chin",
    page: "WhatsAppPetwellChin",
    seo: { title: "WhatsApp PetWell", description: "聯絡", path: "/whatsapp-petwell-chin", noIndex: true },
  },
  {
    route: "pet-matchmaker",
    page: "PetMatchmaker",
    seo: {
      title: "寵物配對測驗 | PetWell HK",
      description: "找出最適合你的寵物類型。",
      path: "/pet-matchmaker",
    },
  },
  {
    route: "christmas-dog-mbti-2025",
    page: "ChristmasDogMbti",
    seo: {
      title: "聖誕狗狗 MBTI 測驗 2025 | PetWell HK",
      description: "測測你家狗狗的 MBTI 性格！",
      path: "/christmas-dog-mbti-2025",
    },
  },
  {
    route: "christmas-events-2025",
    page: "ChristmasEvents",
    seo: {
      title: "2025 聖誕寵物活動 | PetWell HK",
      description: "香港聖誕寵物活動一覽。",
      path: "/christmas-events-2025",
    },
  },
  {
    route: "pet-activities",
    page: "PetActivities",
    seo: {
      title: "香港寵物活動 | PetWell HK",
      description: "搜尋香港寵物市集、活動與體驗。",
      path: "/pet-activities",
    },
    listingKind: "events",
  },
  { route: "event/[id]", page: "EventDetail", dynamic: true, seoKind: "event", param: "id" },
  { route: "christmas-event/[eventId]", page: "ChristmasEventDetail", dynamic: true, seoKind: "christmas", param: "eventId" },
  {
    route: "petwell-member",
    page: "PetwellMember",
    seo: {
      title: "PetWell 會員 | PetWell HK",
      description: "了解 PetWell 會員計劃。",
      path: "/petwell-member",
    },
  },
  {
    route: "nametag",
    page: "Nametag",
    seo: {
      title: "防走失狗牌 / NFC 寵物名牌 | PetWell HK",
      description: "PetWell 防走失狗牌，NFC 即時聯繫飼主。",
      keywords: "防走失狗牌,NFC狗牌,寵物名牌香港",
      path: "/nametag",
    },
  },
  {
    route: "namtag",
    page: "Nametag",
    seo: { title: "防走失狗牌 | PetWell HK", description: "PetWell 防走失狗牌。", path: "/namtag" },
  },
  {
    route: "fang-zou-shi-gou-pai",
    page: "Nametag",
    seo: { title: "防走失狗牌 | PetWell HK", description: "PetWell 防走失狗牌。", path: "/fang-zou-shi-gou-pai" },
  },
  {
    route: "anti-lost-dog-tag-hk",
    page: "Nametag",
    seo: {
      title: "Anti-Lost Dog Tag Hong Kong | PetWell HK",
      description: "PetWell NFC anti-lost dog tags in Hong Kong.",
      path: "/anti-lost-dog-tag-hk",
    },
  },
  {
    route: "vendor-application",
    page: "VendorApplication",
    seo: {
      title: "商戶申請 | PetWell HK",
      description: "申請成為 PetWell 合作商戶。",
      path: "/vendor-application",
    },
  },
  {
    route: "vendor-application/thank-you",
    page: "VendorApplicationThankYou",
    seo: {
      title: "申請已提交 | PetWell HK",
      description: "感謝你的商戶申請。",
      path: "/vendor-application/thank-you",
      noIndex: true,
    },
  },
  {
    route: "signup-login",
    page: "SignUpLogin",
    seo: {
      title: "登入 / 註冊 | PetWell HK",
      description: "登入或註冊 PetWell 帳戶。",
      path: "/signup-login",
      noIndex: true,
    },
  },
  {
    route: "register",
    page: "Register",
    seo: { title: "註冊 | PetWell HK", description: "註冊 PetWell 帳戶。", path: "/register", noIndex: true },
  },
  {
    route: "forgot-password",
    page: "ForgotPassword",
    seo: {
      title: "忘記密碼 | PetWell HK",
      description: "重設 PetWell 帳戶密碼。",
      path: "/forgot-password",
      noIndex: true,
    },
  },
  {
    route: "verification-code",
    page: "VerificationCode",
    seo: {
      title: "驗證碼 | PetWell HK",
      description: "輸入驗證碼。",
      path: "/verification-code",
      noIndex: true,
    },
  },
  { route: "auth/[[...slug]]", page: "AuthCallback", dynamic: true, noIndex: true, seo: { title: "Auth | PetWell HK", description: "Authentication", path: "/auth", noIndex: true } },
  {
    route: "test-booking",
    page: "TestBooking",
    seo: { title: "測試預訂 | PetWell HK", description: "測試預訂流程。", path: "/test-booking", noIndex: true },
  },
  {
    route: "review",
    page: "Review",
    seo: {
      title: "寵物食品價格比較 | PetWell HK",
      description: "比較香港寵物食品價格與產品評價。",
      path: "/review",
    },
  },
  { route: "review/brand/[brand]", page: "ReviewBrand", dynamic: true, seoKind: "reviewBrand", param: "brand" },
  { route: "review/[id]", page: "ReviewProduct", dynamic: true, seoKind: "reviewProduct", param: "id" },
  {
    route: "wishlist",
    page: "Wishlist",
    seo: { title: "願望清單 | PetWell HK", description: "你的寵物產品願望清單。", path: "/wishlist", noIndex: true },
  },
  {
    route: "compare",
    page: "Compare",
    seo: { title: "產品比較 | PetWell HK", description: "比較寵物食品產品。", path: "/compare", noIndex: true },
  },
  {
    route: "account",
    page: "AccountProfile",
    seo: { title: "個人檔案 | PetWell HK", description: "查看及編輯你的 PetWell 個人檔案。", path: "/account", noIndex: true },
  },
  {
    route: "account/reviews",
    page: "MyReviews",
    seo: { title: "我的評價 | PetWell HK", description: "管理你的評價。", path: "/account/reviews", noIndex: true },
  },
  { route: "users/[userId]", page: "UserProfile", dynamic: true, seoKind: "user", param: "userId" },
  {
    route: "blog/hong-kong-dog-trainer-licence-guide",
    page: "BlogDogTrainerLicence",
    seo: {
      title: "香港狗訓練員牌照指南 | PetWell HK",
      description: "香港狗訓練員牌照與相關法規完整指南。",
      path: "/blog/hong-kong-dog-trainer-licence-guide",
      ogType: "article",
    },
  },
  {
    route: "rainy-day-pet-friendly-indoor-hong-kong",
    page: "RainyDayMalls",
    seo: {
      title: "雨天寵物友善室內好去處香港 | PetWell HK",
      description: "香港雨天可帶寵物的室內商場與好去處指南。",
      path: "/rainy-day-pet-friendly-indoor-hong-kong",
      ogType: "article",
    },
  },
  {
    route: "nutrition",
    page: "NutritionScore",
    seo: {
      title: "寵物營養評分 | PetWell HK",
      description: "寵物食品營養評分與成分分析。",
      path: "/nutrition",
    },
  },
  { route: "nutrition/[id]", page: "NutritionProduct", dynamic: true, seoKind: "nutrition", param: "id" },
  { route: "blog/[slug]", page: "BlogPost", dynamic: true, seoKind: "blogRedirect", param: "slug" },
  {
    route: "afcd-pet-food-safety-pdf",
    page: "AfcdPdfRedirect",
    seo: {
      title: "AFCD Pet Food Safety PDF | PetWell HK",
      description: "Redirect",
      path: "/afcd-pet-food-safety-pdf",
      noIndex: true,
    },
  },
  { route: "check/[id]", page: "CheckTag", dynamic: true, noIndex: true, seo: { title: "Check Tag | PetWell HK", description: "Pet tag check", path: "/check", noIndex: true } },
  { route: "pet/[tagId]", page: "PetTag", dynamic: true, noIndex: true, seo: { title: "Pet Tag | PetWell HK", description: "Pet tag", path: "/pet", noIndex: true } },
  { route: "activate/[tagId]", page: "ActivateTag", dynamic: true, noIndex: true, seo: { title: "Activate Tag | PetWell HK", description: "Activate pet tag", path: "/activate", noIndex: true } },
  { route: "[slug]", page: "BlogPost", dynamic: true, seoKind: "blog", param: "slug" },
];

function esc(str) {
  return String(str).replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$/g, "\\$");
}

function renderClientPage(pageName) {
  return `"use client";

import ClientPage from "@/components/ClientPage";
import Page from "@/views/${pageName}";

export default function RoutePage() {
  return <ClientPage Page={Page} />;
}
`;
}

function listingSsrConfig(listingKind) {
  switch (listingKind) {
    case "restaurants":
      return { fn: "ssrRestaurantListing", prop: "initialListing" };
    case "clinics":
      return { fn: "ssrClinicListing", prop: "initialListing" };
    case "salons":
      return { fn: "ssrSalonListing", prop: "initialListing" };
    case "lodging":
      return { fn: "ssrLodgingListing", prop: "initialListing" };
    case "malls":
      return { fn: "ssrMalls", prop: "initialMalls" };
    case "homeVisits":
      return { fn: "ssrHomeVisits", prop: "initialProviders" };
    case "forum":
      return { fn: "ssrForumListing", prop: "initialPosts" };
    case "events":
      return { fn: "ssrEventListing", prop: "initialEvents" };
    case "home":
      return { fn: "ssrHomeRails", prop: "initialHome" };
    default:
      return null;
  }
}

function placeSsrConfig(placeKind) {
  switch (placeKind) {
    case "restaurant":
      return { fn: "ssrRestaurant", prop: "initialRestaurant" };
    case "clinic":
      return { fn: "ssrClinic", prop: "initialClinic" };
    case "salon":
      return { fn: "ssrSalon", prop: "initialSalon" };
    case "lodging":
      return { fn: "ssrLodging", prop: "initialLodging" };
    case "mall":
      return { fn: "ssrMall", prop: "initialMall" };
    case "homeVisit":
      return { fn: "ssrHomeVisit", prop: "initialProvider" };
    default:
      return null;
  }
}

function renderListingPage(pageName, seo, listingKind) {
  const title = esc(seo.title || "PetWell HK");
  const description = esc(seo.description || "PetWell HK");
  const seoPath = esc(seo.path || "/");
  if (seo.noIndex) {
    return renderClientPage(pageName);
  }
  const listingSsr = listingSsrConfig(listingKind);
  if (!listingSsr) {
    return `import ClientPage from "@/components/ClientPage";
import JsonLd from "@/components/seo/JsonLd";
import Page from "@/views/${pageName}";
import { listingPageJsonLd } from "@/lib/seo";

export default function RoutePage() {
  return (
    <>
      <JsonLd
        id="ld-collection"
        data={listingPageJsonLd({
          title: \`${title}\`,
          description: \`${description}\`,
          path: \`${seoPath}\`,
        })}
      />
      <ClientPage Page={Page} />
    </>
  );
}
`;
  }
  return `import ClientPage from "@/components/ClientPage";
import JsonLd from "@/components/seo/JsonLd";
import Page from "@/views/${pageName}";
import { listingPageJsonLd } from "@/lib/seo";
import { ${listingSsr.fn} } from "@/lib/server/ssrContent";

export const revalidate = 900;

export default async function RoutePage() {
  const ${listingSsr.prop} = await ${listingSsr.fn}();
  return (
    <>
      <JsonLd
        id="ld-collection"
        data={listingPageJsonLd({
          title: \`${title}\`,
          description: \`${description}\`,
          path: \`${seoPath}\`,
        })}
      />
      <ClientPage Page={Page} ${listingSsr.prop}={${listingSsr.prop}} />
    </>
  );
}
`;
}

function renderSeoLayout(seo) {
  const keywords = seo.keywords
    ? typeof seo.keywords === "string"
      ? JSON.stringify(seo.keywords)
      : JSON.stringify(seo.keywords)
    : "undefined";
  const noIndex = Boolean(seo.noIndex);
  const ogType = seo.ogType || "website";
  const title = esc(seo.title || "PetWell HK");
  const description = esc(seo.description || "PetWell HK");
  const seoPath = esc(seo.path || "/");

  return `import type { Metadata } from "next";
import type { ReactNode } from "react";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: \`${title}\`,
  description: \`${description}\`,
  keywords: ${keywords === "undefined" ? "undefined" : keywords},
  path: \`${seoPath}\`,
  ogType: "${ogType}",
  noIndex: ${noIndex ? "true" : "false"},
});

export default function SeoLayout({ children }: { children: ReactNode }) {
  return children;
}
`;
}

function renderPlacePage(pageName, placeKind, paramName) {
  const placeSsr = placeSsrConfig(placeKind);
  const ssrImport = placeSsr
    ? `\nimport { unwrapSsrEntity, ${placeSsr.fn} } from "@/lib/server/ssrContent";`
    : "";
  const ssrFetch = placeSsr
    ? `\n  const ${placeSsr.prop} = unwrapSsrEntity(await ${placeSsr.fn}(${paramName}));`
    : "";
  const ssrProp = placeSsr ? ` ${placeSsr.prop}={${placeSsr.prop}}` : "";
  return `import type { Metadata } from "next";
import ClientPage from "@/components/ClientPage";
import JsonLd from "@/components/seo/JsonLd";
import Page from "@/views/${pageName}";
import { generatePlaceJsonLd, generatePlaceMetadata } from "@/lib/server/placeMetadata";${ssrImport}

type Props = { params: Promise<{ ${paramName}: string }> };

export const revalidate = 1800;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ${paramName} } = await params;
  return generatePlaceMetadata("${placeKind}", ${paramName});
}

export default async function RoutePage({ params }: Props) {
  const { ${paramName} } = await params;${ssrFetch}
  const jsonLd = await generatePlaceJsonLd("${placeKind}", ${paramName});
  return (
    <>
      {jsonLd ? <JsonLd data={jsonLd} /> : null}
      <ClientPage Page={Page}${ssrProp} />
    </>
  );
}
`;
}

function namedImport(names) {
  return [...new Set(names.filter(Boolean))].join(", ");
}

function renderAsyncSeoPage({
  pageName,
  param,
  metadataFn,
  jsonLdFn,
  existsFn,
  extraImports = [],
  staticParams,
  asyncStaticParams = false,
  revalidate = 1800,
  awaitMetadata = true,
  awaitJsonLd = true,
  ssrFn,
  clientProp,
  ssrUnwrap = false,
}) {
  const imports = namedImport([metadataFn, jsonLdFn, existsFn, ...extraImports]);
  const existsBlock = existsFn
    ? `
  if (!${existsFn}(${param})) notFound();`
    : "";
  const notFoundImport = existsFn ? `\nimport { notFound } from "next/navigation";` : "";
  const ssrNames = ssrFn
    ? ssrUnwrap
      ? `unwrapSsrEntity, ${ssrFn}`
      : ssrFn
    : "";
  const ssrImport = ssrFn
    ? `\nimport { ${ssrNames} } from "@/lib/server/ssrContent";`
    : "";
  const ssrFetch = ssrFn && clientProp
    ? ssrUnwrap
      ? `\n  const ${clientProp} = unwrapSsrEntity(await ${ssrFn}(${param}));`
      : `\n  const ${clientProp} = await ${ssrFn}(${param});`
    : "";
  const ssrProp = clientProp ? ` ${clientProp}={${clientProp}}` : "";
  const staticParamsBlock = staticParams
    ? `
export ${asyncStaticParams ? "async " : ""}function generateStaticParams() {
  return ${staticParams};
}
`
    : "";
  const metadataCall = awaitMetadata ? `await ${metadataFn}(${param})` : `${metadataFn}(${param})`;
  const jsonLdCall = jsonLdFn
    ? awaitJsonLd
      ? `await ${jsonLdFn}(${param})`
      : `${jsonLdFn}(${param})`
    : "null";

  return `import type { Metadata } from "next";${notFoundImport}
import ClientPage from "@/components/ClientPage";
import JsonLd from "@/components/seo/JsonLd";
import Page from "@/views/${pageName}";
import { ${imports} } from "@/lib/server/contentMetadata";${ssrImport}

type Props = { params: Promise<{ ${param}: string }> };

export const revalidate = ${revalidate};
${staticParamsBlock}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ${param} } = await params;
  return ${metadataCall};
}

export default async function RoutePage({ params }: Props) {
  const { ${param} } = await params;${existsBlock}${ssrFetch}
  const jsonLd = ${jsonLdCall};
  return (
    <>
      {jsonLd ? <JsonLd data={jsonLd} /> : null}
      <ClientPage Page={Page}${ssrProp} />
    </>
  );
}
`;
}

function renderBlogRedirectPage() {
  return `import { notFound, redirect } from "next/navigation";
import { blogPostExists } from "@/lib/server/contentMetadata";

type Props = { params: Promise<{ slug: string }> };

export default async function RoutePage({ params }: Props) {
  const { slug } = await params;
  if (!blogPostExists(slug)) notFound();
  redirect(\`/\${slug}\`);
}
`;
}

function renderDynamicPage(route) {
  switch (route.seoKind) {
    case "place":
      return renderPlacePage(route.page, route.placeKind, route.param);
    case "blog":
      return renderAsyncSeoPage({
        pageName: route.page,
        param: "slug",
        metadataFn: "generateBlogMetadata",
        jsonLdFn: "generateBlogJsonLd",
        existsFn: "blogPostExists",
        extraImports: ["getBlogSlugs"],
        staticParams: "getBlogSlugs().map((slug) => ({ slug }))",
        revalidate: 3600,
        awaitMetadata: false,
        awaitJsonLd: false,
      });
    case "blogRedirect":
      return renderBlogRedirectPage();
    case "area":
      return renderAsyncSeoPage({
        pageName: route.page,
        param: "areaSlug",
        metadataFn: "generateAreaMetadata",
        jsonLdFn: "generateAreaJsonLd",
        existsFn: "areaSlugExists",
        extraImports: ["getAreaSlugs"],
        staticParams: "getAreaSlugs().map((areaSlug) => ({ areaSlug }))",
        revalidate: 3600,
        awaitMetadata: false,
        awaitJsonLd: false,
        ssrFn: "ssrRestaurantListingForArea",
        clientProp: "initialListing",
      });
    case "ngo":
      return renderAsyncSeoPage({
        pageName: route.page,
        param: "ngoId",
        metadataFn: "generateNgoMetadata",
        jsonLdFn: "generateNgoJsonLd",
        existsFn: "ngoExists",
        extraImports: ["getNgoIds"],
        staticParams: "getNgoIds().map((ngoId) => ({ ngoId }))",
        revalidate: 86400,
        awaitMetadata: false,
        awaitJsonLd: false,
      });
    case "christmas":
      return renderAsyncSeoPage({
        pageName: route.page,
        param: "eventId",
        metadataFn: "generateChristmasEventMetadata",
        jsonLdFn: "generateChristmasEventJsonLd",
        existsFn: "christmasEventExists",
        extraImports: ["getChristmasEventIds"],
        staticParams: "getChristmasEventIds().map((eventId) => ({ eventId }))",
        revalidate: 86400,
        awaitMetadata: false,
        awaitJsonLd: false,
      });
    case "forum":
      return renderAsyncSeoPage({
        pageName: route.page,
        param: "postId",
        metadataFn: "generateForumMetadata",
        jsonLdFn: "generateForumJsonLd",
        revalidate: 600,
        ssrFn: "ssrForumPost",
        clientProp: "initialPost",
        ssrUnwrap: true,
      });
    case "event":
      return renderAsyncSeoPage({
        pageName: route.page,
        param: "id",
        metadataFn: "generateEventMetadata",
        jsonLdFn: "generateEventJsonLd",
        revalidate: 1800,
        ssrFn: "ssrEvent",
        clientProp: "initialEvent",
        ssrUnwrap: true,
      });
    case "reviewProduct":
      return renderAsyncSeoPage({
        pageName: route.page,
        param: "id",
        metadataFn: "generateReviewProductMetadata",
        jsonLdFn: "generateReviewProductJsonLd",
        revalidate: 1800,
        ssrFn: "ssrReviewProduct",
        clientProp: "initialReview",
        ssrUnwrap: true,
      });
    case "reviewBrand":
      return renderAsyncSeoPage({
        pageName: route.page,
        param: "brand",
        metadataFn: "generateReviewBrandMetadata",
        jsonLdFn: "generateReviewBrandJsonLd",
        awaitJsonLd: false,
        revalidate: 1800,
      });
    case "nutrition":
      return renderAsyncSeoPage({
        pageName: route.page,
        param: "id",
        metadataFn: "generateNutritionMetadata",
        jsonLdFn: "generateNutritionJsonLd",
        extraImports: ["getNutritionProductIds"],
        staticParams: "(await getNutritionProductIds()).map((id) => ({ id }))",
        asyncStaticParams: true,
        revalidate: 86400,
        ssrFn: "ssrNutritionProduct",
        clientProp: "initialProduct",
        ssrUnwrap: true,
      });
    case "user":
      return `import type { Metadata } from "next";
import ClientPage from "@/components/ClientPage";
import Page from "@/views/${route.page}";
import { generateUserMetadata } from "@/lib/server/contentMetadata";

type Props = { params: Promise<{ userId: string }> };

export const revalidate = 1800;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { userId } = await params;
  return generateUserMetadata(userId);
}

export default function RoutePage() {
  return <ClientPage Page={Page} />;
}
`;
    default:
      return renderClientPage(route.page);
  }
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

let count = 0;
for (const route of routes) {
  const dir = route.route ? path.join(appDir, route.route) : appDir;
  ensureDir(dir);
  const pageSource = route.seoKind
    ? renderDynamicPage(route)
    : route.seo
      ? renderListingPage(route.page, route.seo, route.listingKind)
      : renderClientPage(route.page);
  fs.writeFileSync(path.join(dir, "page.tsx"), pageSource, "utf8");
  if (route.seo) {
    if (route.route === "") {
      // root metadata lives in root layout
    } else {
      const layoutPath = path.join(dir, "layout.tsx");
      fs.writeFileSync(layoutPath, renderSeoLayout(route.seo), "utf8");
    }
  }
  count += 1;
  console.log("wrote", path.relative(root, path.join(dir, "page.tsx")));
}

fs.writeFileSync(
  path.join(appDir, "not-found.tsx"),
  `"use client";

import NotFound from "@/views/NotFound";

export default function NotFoundPage() {
  return <NotFound />;
}
`,
  "utf8",
);

console.log(`Generated ${count} routes + not-found`);
