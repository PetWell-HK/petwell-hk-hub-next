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
      title: "PetWell HK | å¯µç‰©å‹å–„é¤å»³ã€ç¸é†«è¨ºæ‰€ã€å¯µç‰©è«–å£‡ | é¦™æ¸¯å¯µç‰©å¥åº·App",
      description:
        "PetWell é¦™æ¸¯é¦–å€‹ä¸€ç«™å¼å¯µç‰©å¥åº·Appã€‚å…¨æ¸¯å¯µç‰©å‹å–„é¤å»³ï¼ˆ18å€æœå°‹ï¼‰ã€ç¸é†«è¨ºæ‰€è©•åƒ¹ã€å¯µç‰©ç¾Žå®¹èˆ‡å¯„é¤Šã€å¯µç‰©æ´»å‹•åŠè«–å£‡ã€‚å…è²»ä¸‹è¼‰ã€‚",
      keywords:
        "PetWell,å¯µç‰©é¦™æ¸¯,å¯µç‰©å¥åº·App,å¯µç‰©å‹å–„é¤å»³,é¦™æ¸¯å¯µç‰©å‹å–„é¤å»³,é£Ÿç’°ç½²å¯µç‰©å‹å–„é¤å»³,ç¸é†«è¨ºæ‰€è©•åƒ¹,å¯µç‰©ç¾Žå®¹,å¯µç‰©å¯„é¤Š,å¯µç‰©è«–å£‡,å¯µç‰©æ´»å‹•,é¦™æ¸¯ç¸é†«,24å°æ™‚ç¸é†«,å¯µç‰©å¥åº·ç´€éŒ„",
      path: "/",
    },
  },
  {
    route: "landing",
    page: "Landing",
    seo: {
      title: "PetWell HK | é¦™æ¸¯å¯µç‰©å¥åº·ç®¡ç†å¹³å°",
      description: "PetWell HK ä¸€ç«™å¼å¯µç‰©å¥åº·ã€é¤å»³ã€è¨ºæ‰€èˆ‡ç¤¾å€å¹³å°ã€‚",
      path: "/landing",
    },
  },
  {
    route: "about",
    page: "About",
    seo: {
      title: "é—œæ–¼æˆ‘å€‘ | PetWell HK",
      description: "èªè­˜ PetWell HKâ€”â€”é¦™æ¸¯å¯µç‰©å¥åº·èˆ‡ç”Ÿæ´»è³‡è¨Šå¹³å°ã€‚",
      path: "/about",
    },
  },
  {
    route: "other-services",
    page: "OtherServices",
    seo: {
      title: "å•†æ¥­åˆä½œèˆ‡å…¶ä»–æœå‹™ | PetWell HK",
      description: "PetWell HK å•†æ¥­åˆä½œã€å»£å‘Šèˆ‡ B2B æœå‹™ã€‚",
      path: "/other-services",
    },
  },
  {
    route: "terms",
    page: "Terms",
    seo: {
      title: "æœå‹™æ¢æ¬¾ | PetWell HK",
      description: "PetWell HK æœå‹™æ¢æ¬¾ã€‚",
      path: "/terms",
      noIndex: true,
    },
  },
  {
    route: "privacy",
    page: "Terms",
    seo: {
      title: "ç§éš±æ”¿ç­– | PetWell HK",
      description: "PetWell HK ç§éš±æ”¿ç­–ã€‚",
      path: "/privacy",
      noIndex: true,
    },
  },
  {
    route: "clinics",
    page: "Clinics",
    seo: {
      title: "é¦™æ¸¯ç¸é†«è¨ºæ‰€è©•åƒ¹èˆ‡æœå°‹ | PetWell HK",
      description: "æœå°‹å…¨æ¸¯ç¸é†«è¨ºæ‰€ã€24å°æ™‚æ€¥ç—‡ã€è©•åƒ¹èˆ‡åœ°å€è³‡è¨Šã€‚",
      keywords: "é¦™æ¸¯ç¸é†«,ç¸é†«è¨ºæ‰€,24å°æ™‚ç¸é†«,å¯µç‰©è¨ºæ‰€è©•åƒ¹",
      path: "/clinics",
    },
  },
  { route: "clinics/[clinicId]", page: "ClinicDetail", dynamic: true },
  {
    route: "home-visits",
    page: "HomeVisits",
    seo: {
      title: "香港寵物上門服務｜上門診症、疫苗、急症｜PetWell HK",
      description:
        "搜尋香港寵物上門服務：上門診症、疫苗接種、健康檢查同急症支援。按地區、寵物種類同服務範圍篩選，WhatsApp／電話一鍵聯絡。",
      keywords:
        "寵物上門服務,香港上門獸醫,寵物上門診症,上門疫苗,寵物急症上門,home visit vet hong kong",
      path: "/home-visits",
    },
  },
  { route: "home-visits/[providerId]", page: "HomeVisitDetail", dynamic: true },
  {
    route: "restaurants",
    page: "Restaurants",
    seo: {
      title: "é¦™æ¸¯å¯µç‰©å‹å–„é¤å»³ï¼ˆ18å€æœå°‹ï¼‰| PetWell HK",
      description: "å…¨æ¸¯å¯µç‰©å‹å–„é¤å»³æŒ‡å—ï¼ŒæŒ‰åœ°å€æœå°‹å¯å¸¶ç‹—ï¼å¯µç‰©å…¥åº§é¤å»³ã€‚",
      keywords: "é¦™æ¸¯å¯µç‰©å‹å–„é¤å»³,å¸¶ç‹—åŽ»é£Ÿé£¯,é£Ÿç’°ç½²å¯µç‰©å‹å–„é¤å»³",
      path: "/restaurants",
    },
  },
  {
    route: "restaurant",
    page: "Restaurants",
    seo: {
      title: "é¦™æ¸¯å¯µç‰©å‹å–„é¤å»³ | PetWell HK",
      description: "å…¨æ¸¯å¯µç‰©å‹å–„é¤å»³æŒ‡å—ã€‚",
      path: "/restaurant",
    },
  },
  {
    route: "pet-friendly-restaurants-hk",
    page: "Restaurants",
    seo: {
      title: "Pet-Friendly Restaurants Hong Kong | PetWell HK",
      description: "Find pet-friendly restaurants across Hong Kong.",
      path: "/pet-friendly-restaurants-hk",
    },
  },
  { route: "pet-friendly-restaurants/[areaSlug]", page: "RestaurantsByArea", dynamic: true },
  { route: "restaurants/[restaurantId]", page: "RestaurantDetail", dynamic: true },
  {
    route: "salons",
    page: "Salons",
    seo: {
      title: "é¦™æ¸¯å¯µç‰©ç¾Žå®¹åº—æœå°‹ | PetWell HK",
      description: "æœå°‹å…¨æ¸¯å¯µç‰©ç¾Žå®¹ã€æ²–æ¶¼èˆ‡é€ åž‹æœå‹™ã€‚",
      path: "/salons",
    },
  },
  { route: "salons/[salonId]", page: "SalonDetail", dynamic: true },
  {
    route: "lodging",
    page: "Lodging",
    seo: {
      title: "é¦™æ¸¯å¯µç‰©å¯„é¤Šèˆ‡ä½å®¿ | PetWell HK",
      description: "æœå°‹å¯µç‰©å¯„é¤Šã€é…’åº—èˆ‡å¯µç‰©å‹å¥½ä½å®¿ã€‚",
      path: "/lodging",
    },
  },
  { route: "lodging/[lodgingId]", page: "LodgingDetail", dynamic: true },
  {
    route: "malls",
    page: "Malls",
    seo: {
      title: "é¦™æ¸¯å¯µç‰©å‹å–„å•†å ´ | PetWell HK",
      description: "æœå°‹å¯å¸¶å¯µç‰©é€²å…¥çš„é¦™æ¸¯å•†å ´èˆ‡å®¤å…§ç©ºé–“ã€‚",
      path: "/malls",
    },
  },
  { route: "malls/[mallId]", page: "MallDetail", dynamic: true },
  {
    route: "ngos",
    page: "NGOs",
    seo: {
      title: "é¦™æ¸¯å‹•ç‰©NGOï¼æ•‘æ´çµ„ç¹” | PetWell HK",
      description: "èªè­˜é¦™æ¸¯å‹•ç‰©ç¦åˆ©èˆ‡æ•‘æ´çµ„ç¹”ã€‚",
      path: "/ngos",
    },
  },
  { route: "ngos/[ngoId]", page: "NGODetail", dynamic: true },
  {
    route: "forum",
    page: "Forum",
    seo: {
      title: "é¦™æ¸¯å¯µç‰©è«–å£‡ | PetWell HK",
      description: "PetWell å¯µç‰©è«–å£‡ï¼šé¤Šå¯µå¿ƒå¾—ã€æå•èˆ‡ç¤¾ç¾¤è¨Žè«–ã€‚",
      path: "/forum",
    },
  },
  { route: "forum/[postId]", page: "ForumPost", dynamic: true },
  {
    route: "owner-zone",
    page: "OwnerZone",
    seo: {
      title: "é£¼ä¸»å°ˆå€ | PetWell HK",
      description: "é£¼ä¸»å¯¦ç”¨è³‡è¨Šã€æŒ‡å—èˆ‡å·¥å…·ã€‚",
      path: "/owner-zone",
    },
  },
  {
    route: "download",
    page: "ComingSoon",
    seo: {
      title: "ä¸‹è¼‰ PetWell App | PetWell HK",
      description: "ä¸‹è¼‰ PetWell é¦™æ¸¯å¯µç‰©å¥åº· Appã€‚",
      path: "/download",
    },
  },
  {
    route: "delete-account",
    page: "DeleteAccount",
    seo: {
      title: "åˆªé™¤å¸³æˆ¶ | PetWell HK",
      description: "åˆªé™¤ PetWell å¸³æˆ¶ã€‚",
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
    seo: { title: "WhatsApp PetWell", description: "è¯çµ¡", path: "/whatsapp-petwell-chin", noIndex: true },
  },
  {
    route: "pet-matchmaker",
    page: "PetMatchmaker",
    seo: {
      title: "å¯µç‰©é…å°æ¸¬é©— | PetWell HK",
      description: "æ‰¾å‡ºæœ€é©åˆä½ çš„å¯µç‰©é¡žåž‹ã€‚",
      path: "/pet-matchmaker",
    },
  },
  {
    route: "christmas-dog-mbti-2025",
    page: "ChristmasDogMbti",
    seo: {
      title: "è–èª•ç‹—ç‹— MBTI æ¸¬é©— 2025 | PetWell HK",
      description: "æ¸¬æ¸¬ä½ å®¶ç‹—ç‹—çš„ MBTI æ€§æ ¼ï¼",
      path: "/christmas-dog-mbti-2025",
    },
  },
  {
    route: "christmas-events-2025",
    page: "ChristmasEvents",
    seo: {
      title: "2025 è–èª•å¯µç‰©æ´»å‹• | PetWell HK",
      description: "é¦™æ¸¯è–èª•å¯µç‰©æ´»å‹•ä¸€è¦½ã€‚",
      path: "/christmas-events-2025",
    },
  },
  {
    route: "pet-activities",
    page: "PetActivities",
    seo: {
      title: "é¦™æ¸¯å¯µç‰©æ´»å‹• | PetWell HK",
      description: "æœå°‹é¦™æ¸¯å¯µç‰©å¸‚é›†ã€æ´»å‹•èˆ‡é«”é©—ã€‚",
      path: "/pet-activities",
    },
  },
  { route: "event/[id]", page: "EventDetail", dynamic: true },
  { route: "christmas-event/[eventId]", page: "ChristmasEventDetail", dynamic: true },
  {
    route: "petwell-member",
    page: "PetwellMember",
    seo: {
      title: "PetWell æœƒå“¡ | PetWell HK",
      description: "äº†è§£ PetWell æœƒå“¡è¨ˆåŠƒã€‚",
      path: "/petwell-member",
    },
  },
  {
    route: "nametag",
    page: "Nametag",
    seo: {
      title: "é˜²èµ°å¤±ç‹—ç‰Œ / NFC å¯µç‰©åç‰Œ | PetWell HK",
      description: "PetWell é˜²èµ°å¤±ç‹—ç‰Œï¼ŒNFC å³æ™‚è¯ç¹«é£¼ä¸»ã€‚",
      keywords: "é˜²èµ°å¤±ç‹—ç‰Œ,NFCç‹—ç‰Œ,å¯µç‰©åç‰Œé¦™æ¸¯",
      path: "/nametag",
    },
  },
  {
    route: "namtag",
    page: "Nametag",
    seo: { title: "é˜²èµ°å¤±ç‹—ç‰Œ | PetWell HK", description: "PetWell é˜²èµ°å¤±ç‹—ç‰Œã€‚", path: "/namtag" },
  },
  {
    route: "fang-zou-shi-gou-pai",
    page: "Nametag",
    seo: { title: "é˜²èµ°å¤±ç‹—ç‰Œ | PetWell HK", description: "PetWell é˜²èµ°å¤±ç‹—ç‰Œã€‚", path: "/fang-zou-shi-gou-pai" },
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
    route: "é˜²èµ°å¤±ç‹—ç‰Œ",
    page: "Nametag",
    seo: { title: "é˜²èµ°å¤±ç‹—ç‰Œ | PetWell HK", description: "PetWell é˜²èµ°å¤±ç‹—ç‰Œã€‚", path: "/é˜²èµ°å¤±ç‹—ç‰Œ" },
  },
  {
    route: "vendor-application",
    page: "VendorApplication",
    seo: {
      title: "å•†æˆ¶ç”³è«‹ | PetWell HK",
      description: "ç”³è«‹æˆç‚º PetWell åˆä½œå•†æˆ¶ã€‚",
      path: "/vendor-application",
    },
  },
  {
    route: "vendor-application/thank-you",
    page: "VendorApplicationThankYou",
    seo: {
      title: "ç”³è«‹å·²æäº¤ | PetWell HK",
      description: "æ„Ÿè¬ä½ çš„å•†æˆ¶ç”³è«‹ã€‚",
      path: "/vendor-application/thank-you",
      noIndex: true,
    },
  },
  {
    route: "signup-login",
    page: "SignUpLogin",
    seo: {
      title: "ç™»å…¥ / è¨»å†Š | PetWell HK",
      description: "ç™»å…¥æˆ–è¨»å†Š PetWell å¸³æˆ¶ã€‚",
      path: "/signup-login",
      noIndex: true,
    },
  },
  {
    route: "register",
    page: "Register",
    seo: { title: "è¨»å†Š | PetWell HK", description: "è¨»å†Š PetWell å¸³æˆ¶ã€‚", path: "/register", noIndex: true },
  },
  {
    route: "forgot-password",
    page: "ForgotPassword",
    seo: {
      title: "å¿˜è¨˜å¯†ç¢¼ | PetWell HK",
      description: "é‡è¨­ PetWell å¸³æˆ¶å¯†ç¢¼ã€‚",
      path: "/forgot-password",
      noIndex: true,
    },
  },
  {
    route: "verification-code",
    page: "VerificationCode",
    seo: {
      title: "é©—è­‰ç¢¼ | PetWell HK",
      description: "è¼¸å…¥é©—è­‰ç¢¼ã€‚",
      path: "/verification-code",
      noIndex: true,
    },
  },
  { route: "auth/[[...slug]]", page: "AuthCallback", dynamic: true, noIndex: true },
  {
    route: "test-booking",
    page: "TestBooking",
    seo: { title: "æ¸¬è©¦é è¨‚ | PetWell HK", description: "æ¸¬è©¦é è¨‚æµç¨‹ã€‚", path: "/test-booking", noIndex: true },
  },
  {
    route: "review",
    page: "Review",
    seo: {
      title: "å¯µç‰©é£Ÿå“åƒ¹æ ¼æ¯”è¼ƒ | PetWell HK",
      description: "æ¯”è¼ƒé¦™æ¸¯å¯µç‰©é£Ÿå“åƒ¹æ ¼èˆ‡ç”¢å“è©•åƒ¹ã€‚",
      path: "/review",
    },
  },
  { route: "review/brand/[brand]", page: "ReviewBrand", dynamic: true },
  { route: "review/[id]", page: "ReviewProduct", dynamic: true },
  {
    route: "wishlist",
    page: "Wishlist",
    seo: { title: "é¡˜æœ›æ¸…å–® | PetWell HK", description: "ä½ çš„å¯µç‰©ç”¢å“é¡˜æœ›æ¸…å–®ã€‚", path: "/wishlist", noIndex: true },
  },
  {
    route: "compare",
    page: "Compare",
    seo: { title: "ç”¢å“æ¯”è¼ƒ | PetWell HK", description: "æ¯”è¼ƒå¯µç‰©é£Ÿå“ç”¢å“ã€‚", path: "/compare", noIndex: true },
  },
  {
    route: "account/reviews",
    page: "MyReviews",
    seo: { title: "æˆ‘çš„è©•åƒ¹ | PetWell HK", description: "ç®¡ç†ä½ çš„è©•åƒ¹ã€‚", path: "/account/reviews", noIndex: true },
  },
  { route: "users/[userId]", page: "UserProfile", dynamic: true },
  {
    route: "blog/hong-kong-dog-trainer-licence-guide",
    page: "BlogDogTrainerLicence",
    seo: {
      title: "é¦™æ¸¯ç‹—è¨“ç·´å“¡ç‰Œç…§æŒ‡å— | PetWell HK",
      description: "é¦™æ¸¯ç‹—è¨“ç·´å“¡ç‰Œç…§èˆ‡ç›¸é—œæ³•è¦å®Œæ•´æŒ‡å—ã€‚",
      path: "/blog/hong-kong-dog-trainer-licence-guide",
      ogType: "article",
    },
  },
  {
    route: "rainy-day-pet-friendly-indoor-hong-kong",
    page: "RainyDayMalls",
    seo: {
      title: "é›¨å¤©å¯µç‰©å‹å–„å®¤å…§å¥½åŽ»è™•é¦™æ¸¯ | PetWell HK",
      description: "é¦™æ¸¯é›¨å¤©å¯å¸¶å¯µç‰©çš„å®¤å…§å•†å ´èˆ‡å¥½åŽ»è™•æŒ‡å—ã€‚",
      path: "/rainy-day-pet-friendly-indoor-hong-kong",
      ogType: "article",
    },
  },
  {
    route: "nutrition",
    page: "NutritionScore",
    seo: {
      title: "å¯µç‰©ç‡Ÿé¤Šè©•åˆ† | PetWell HK",
      description: "å¯µç‰©é£Ÿå“ç‡Ÿé¤Šè©•åˆ†èˆ‡æˆåˆ†åˆ†æžã€‚",
      path: "/nutrition",
    },
  },
  { route: "nutrition/[id]", page: "NutritionProduct", dynamic: true },
  { route: "blog/[slug]", page: "BlogPost", dynamic: true },
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
  { route: "check/[id]", page: "CheckTag", dynamic: true },
  { route: "pet/[tagId]", page: "PetTag", dynamic: true },
  { route: "activate/[tagId]", page: "ActivateTag", dynamic: true },
  { route: "[slug]", page: "BlogPost", dynamic: true },
];

function esc(str) {
  return String(str).replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$/g, "\\$");
}

function renderClientPage(pageName) {
  return `"use client";

import Page from "@/views/${pageName}";

export default function RoutePage() {
  return <Page />;
}
`;
}

function renderSeoLayout(seo) {
  const keywords = seo.keywords
    ? typeof seo.keywords === "string"
      ? JSON.stringify(seo.keywords)
      : JSON.stringify(seo.keywords)
    : "undefined";
  const noIndex = seo.noIndex ? "true" : "false";
  const ogType = seo.ogType || "website";

  return `import type { Metadata } from "next";
import type { ReactNode } from "react";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: \`${esc(seo.title || "PetWell HK")}\`,
  description: \`${esc(seo.description || "PetWell HK")}\`,
  keywords: ${keywords === "undefined" ? "undefined" : keywords},
  path: \`${esc(seo.path || "/")}\`,
  ogType: "${ogType}",
  noIndex: ${noIndex},
});

export default function SeoLayout({ children }: { children: ReactNode }) {
  return children;
}
`;
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

let count = 0;
for (const route of routes) {
  const dir = route.route ? path.join(appDir, route.route) : appDir;
  ensureDir(dir);
  fs.writeFileSync(path.join(dir, "page.tsx"), renderClientPage(route.page), "utf8");
  if (route.seo) {
    // Avoid overwriting root layout.tsx â€” use seo.ts sibling for root,
    // and layout.tsx for nested routes only when no layout exists yet.
    if (route.route === "") {
      // root metadata lives in root layout
    } else {
      const layoutPath = path.join(dir, "layout.tsx");
      // Don't overwrite if a custom layout already exists with non-generated content
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
