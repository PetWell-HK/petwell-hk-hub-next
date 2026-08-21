import type { Metadata } from "next";
import type { ReactNode } from "react";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: `寵物營養評分 | PetWell HK`,
  description: `寵物食品營養評分與成分分析。`,
  keywords: undefined,
  path: `/nutrition`,
  ogType: "website",
  noIndex: false,
});

export default function SeoLayout({ children }: { children: ReactNode }) {
  return children;
}
