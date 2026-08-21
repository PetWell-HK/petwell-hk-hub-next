import type { Metadata } from "next";
import type { ReactNode } from "react";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: `香港寵物友善餐廳（18區搜尋）| PetWell HK`,
  description: `全港寵物友善餐廳指南，按地區搜尋可帶狗／寵物入座餐廳。`,
  keywords: "香港寵物友善餐廳,帶狗去食飯,食環署寵物友善餐廳",
  path: `/restaurants`,
  ogType: "website",
  noIndex: false,
});

export default function SeoLayout({ children }: { children: ReactNode }) {
  return children;
}
