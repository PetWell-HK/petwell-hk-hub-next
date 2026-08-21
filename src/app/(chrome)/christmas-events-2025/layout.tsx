import type { Metadata } from "next";
import type { ReactNode } from "react";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: `2025 聖誕寵物活動 | PetWell HK`,
  description: `香港聖誕寵物活動一覽。`,
  keywords: undefined,
  path: `/christmas-events-2025`,
  ogType: "website",
  noIndex: false,
});

export default function SeoLayout({ children }: { children: ReactNode }) {
  return children;
}
