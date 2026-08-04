const heroKol = "/assets/other-services/photo/img_5118.png";
const heroIg = "/assets/other-services/photo/img_5120.png";
const heroEvent = "/assets/other-services/photo/img_5172.png";
const heroMedia = "/assets/other-services/photo/435d8262-052f-48d5-ac76-f3bdd2f45cda_4_5005_c.jpeg";
const audienceEnterprise = "/assets/other-services/audience-enterprise-japanese-festival.png";
const audienceMerchant = "/assets/other-services/audience-merchant-pet-tag.png";
import type { LucideIcon } from "lucide-react";
import {
  Award,
  BarChart3,
  Handshake,
  Instagram,
  Percent,
  Play,
  TrendingUp,
  Users,
  UtensilsCrossed,
} from "lucide-react";

export type ServiceChannelId =
  | "websiteAds"
  | "appAds"
  | "igAds"
  | "edm"
  | "kol"
  | "eventPlanning"
  | "listEvent"
  | "listRestaurant"
  | "updatePrices"
  | "openAccount";

export type AudienceId = "enterprise" | "smallBusiness";

export type ResultMetricKey =
  | "appUsers"
  | "igFollowers"
  | "dailyViews"
  | "peakViews"
  | "igEngagement"
  | "reelsViews"
  | "kolPartners"
  | "restaurants"
  | "appStoreTop";

export type StatGroupId = "reach" | "engagement" | "scale";

export const AUDIENCE_SEGMENTS: { id: AudienceId; services: ServiceChannelId[] }[] = [
  {
    id: "enterprise",
    services: ["websiteAds", "appAds", "igAds", "kol", "eventPlanning"],
  },
  {
    id: "smallBusiness",
    services: ["listEvent", "listRestaurant", "updatePrices", "openAccount"],
  },
];

export type HeroShowcaseServiceId = "kol" | "igAds" | "eventPlanning" | "appAds";

export type HeroShowcaseItem = {
  id: HeroShowcaseServiceId;
  image: string;
  /** Higher = more movement on mouse parallax */
  parallaxFactor: number;
  /** CSS object-position to keep subjects in frame */
  objectPosition: string;
};

export type AudienceCardImage = {
  src: string;
  /** Mobile object-position â€” crops from bottom first */
  objectPosition: string;
  /** Desktop object-position; falls back to objectPosition when omitted */
  objectPositionDesktop?: string;
};

export const AUDIENCE_CARD_IMAGES: Record<AudienceId, AudienceCardImage> = {
  enterprise: { src: audienceEnterprise, objectPosition: "center top" },
  smallBusiness: { src: audienceMerchant, objectPosition: "center center" },
};

/** Curated hero visuals mapped to core B2B services (hover reveals USP). */
export const HERO_SHOWCASE_ITEMS: HeroShowcaseItem[] = [
  { id: "eventPlanning", image: heroEvent, parallaxFactor: 1.05, objectPosition: "50% 42%" },
  { id: "kol", image: heroKol, parallaxFactor: 1.15, objectPosition: "50% 72%" },
  { id: "igAds", image: heroIg, parallaxFactor: 0.9, objectPosition: "50% 68%" },
  { id: "appAds", image: heroMedia, parallaxFactor: 0.75, objectPosition: "50% 38%" },
];

/** Campaign photos from user uploads (Downloads/photo). */
export const GALLERY_IMAGES: string[] = [
  "/assets/other-services/photo/11-1.png",
  "/assets/other-services/photo/13-2.jpg",
  "/assets/other-services/photo/13-3.jpg",
  "/assets/other-services/photo/14-2.jpg",
  "/assets/other-services/photo/435d8262-052f-48d5-ac76-f3bdd2f45cda_4_5005_c.jpeg",
  "/assets/other-services/photo/4f1f0d03-7dcb-4f81-b182-9282d088cdfb_4_5005_c.jpeg",
  "/assets/other-services/photo/dsc08963.jpg",
  "/assets/other-services/photo/fe13b589-cf6e-474d-8c4d-81da12f611d1_1_105_c.jpeg",
  "/assets/other-services/photo/img_5111.png",
  "/assets/other-services/photo/img_5112.png",
  "/assets/other-services/photo/img_5113.png",
  "/assets/other-services/photo/img_5114.png",
  "/assets/other-services/photo/img_5115.png",
  "/assets/other-services/photo/img_5116.png",
  "/assets/other-services/photo/img_5117.png",
  "/assets/other-services/photo/img_5118.png",
  "/assets/other-services/photo/img_5119.png",
  "/assets/other-services/photo/img_5120.png",
  "/assets/other-services/photo/img_5121.png",
  "/assets/other-services/photo/img_5122.png",
  "/assets/other-services/photo/img_5123.png",
  "/assets/other-services/photo/img_5124.png",
  "/assets/other-services/photo/img_5125.png",
  "/assets/other-services/photo/img_5126.png",
  "/assets/other-services/photo/img_5127.png",
  "/assets/other-services/photo/img_5128.png",
  "/assets/other-services/photo/img_5129.png",
  "/assets/other-services/photo/img_5130.png",
  "/assets/other-services/photo/img_5131.png",
  "/assets/other-services/photo/img_5132.png",
  "/assets/other-services/photo/img_5133.png",
  "/assets/other-services/photo/img_5134.png",
  "/assets/other-services/photo/img_5135.png",
  "/assets/other-services/photo/img_5136.png",
  "/assets/other-services/photo/img_5137.png",
  "/assets/other-services/photo/img_5138.png",
  "/assets/other-services/photo/img_5139.png",
  "/assets/other-services/photo/img_5140.png",
  "/assets/other-services/photo/img_5141.png",
  "/assets/other-services/photo/img_5142.png",
  "/assets/other-services/photo/img_5145.png",
  "/assets/other-services/photo/img_5146.png",
  "/assets/other-services/photo/img_5147.png",
  "/assets/other-services/photo/img_5148.png",
  "/assets/other-services/photo/img_5149.png",
  "/assets/other-services/photo/img_5150.png",
  "/assets/other-services/photo/img_5151.png",
  "/assets/other-services/photo/img_5152-3.png",
  "/assets/other-services/photo/img_5153-2.png",
  "/assets/other-services/photo/img_5154-2.png",
  "/assets/other-services/photo/img_5155-2.png",
  "/assets/other-services/photo/img_5156.png",
  "/assets/other-services/photo/img_5157.png",
  "/assets/other-services/photo/img_5158.png",
  "/assets/other-services/photo/img_5159-2.png",
  "/assets/other-services/photo/img_5160-2.png",
  "/assets/other-services/photo/img_5161.png",
  "/assets/other-services/photo/img_5162.png",
  "/assets/other-services/photo/img_5163.png",
  "/assets/other-services/photo/img_5164.png",
  "/assets/other-services/photo/img_5165.png",
  "/assets/other-services/photo/img_5166.png",
  "/assets/other-services/photo/img_5167.png",
  "/assets/other-services/photo/img_5168.png",
  "/assets/other-services/photo/img_5169.png",
  "/assets/other-services/photo/img_5170.png",
  "/assets/other-services/photo/img_5171.png",
  "/assets/other-services/photo/img_5172.png",
  "/assets/other-services/photo/img_5173.png",
  "/assets/other-services/photo/img_5174.png",
  "/assets/other-services/photo/img_5175.png",
  "/assets/other-services/photo/img_5176.png",
  "/assets/other-services/photo/img_5177.png",
  "/assets/other-services/photo/img_5178.png",
  "/assets/other-services/photo/img_5179.png",
  "/assets/other-services/photo/img_5180.png",
  "/assets/other-services/photo/img_5181.png",
  "/assets/other-services/photo/img_5182.png",
  "/assets/other-services/photo/img_5183.png",
  "/assets/other-services/photo/img_5184.png",
  "/assets/other-services/photo/img_5185.png",
  "/assets/other-services/photo/img_5186.png",
  "/assets/other-services/photo/img_5187.png",
  "/assets/other-services/photo/img_5188.png",
  "/assets/other-services/photo/img_5189.png",
  "/assets/other-services/photo/omakacha-photo-shop.jpg",
  "/assets/other-services/photo/omakacha-photo-shop-2.jpg",
  "/assets/other-services/photo/omakacha-photo-shop-23.jpg",
];

export const STAT_GROUPS: { id: StatGroupId; keys: ResultMetricKey[] }[] = [
  { id: "reach", keys: ["appUsers", "igFollowers", "dailyViews", "peakViews"] },
  { id: "engagement", keys: ["igEngagement", "reelsViews"] },
  { id: "scale", keys: ["kolPartners", "restaurants", "appStoreTop"] },
];

export const METRIC_ICONS: Record<ResultMetricKey, LucideIcon> = {
  appUsers: Users,
  igFollowers: Instagram,
  dailyViews: BarChart3,
  peakViews: TrendingUp,
  igEngagement: Percent,
  reelsViews: Play,
  kolPartners: Handshake,
  restaurants: UtensilsCrossed,
  appStoreTop: Award,
};
