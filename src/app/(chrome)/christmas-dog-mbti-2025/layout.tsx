import type { Metadata } from "next";
import type { ReactNode } from "react";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: `聖誕狗狗 MBTI 測驗 2025 | PetWell HK`,
  description: `測測你家狗狗的 MBTI 性格！`,
  keywords: undefined,
  path: `/christmas-dog-mbti-2025`,
  ogType: "website",
  noIndex: false,
});

export default function SeoLayout({ children }: { children: ReactNode }) {
  return children;
}
