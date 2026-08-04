import type { Metadata } from "next";
import type { ReactNode } from "react";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: `香港寵物美容店搜尋 | PetWell HK`,
  description: `搜尋全港寵物美容、沖涼與造型服務。`,
  keywords: undefined,
  path: `/salons`,
  ogType: "website",
  noIndex: false,
});

export default function SeoLayout({ children }: { children: ReactNode }) {
  return children;
}
