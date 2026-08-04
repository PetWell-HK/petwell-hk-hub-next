import type { Metadata } from "next";
import type { ReactNode } from "react";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: `寵物配對測驗 | PetWell HK`,
  description: `找出最適合你的寵物類型。`,
  keywords: undefined,
  path: `/pet-matchmaker`,
  ogType: "website",
  noIndex: false,
});

export default function SeoLayout({ children }: { children: ReactNode }) {
  return children;
}
