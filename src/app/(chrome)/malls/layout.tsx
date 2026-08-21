import type { Metadata } from "next";
import type { ReactNode } from "react";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: `香港寵物友善商場 | PetWell HK`,
  description: `搜尋可帶寵物進入的香港商場與室內空間。`,
  keywords: undefined,
  path: `/malls`,
  ogType: "website",
  noIndex: false,
});

export default function SeoLayout({ children }: { children: ReactNode }) {
  return children;
}
