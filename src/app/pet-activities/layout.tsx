import type { Metadata } from "next";
import type { ReactNode } from "react";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: `香港寵物活動 | PetWell HK`,
  description: `搜尋香港寵物市集、活動與體驗。`,
  keywords: undefined,
  path: `/pet-activities`,
  ogType: "website",
  noIndex: false,
});

export default function SeoLayout({ children }: { children: ReactNode }) {
  return children;
}
