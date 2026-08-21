import type { Metadata } from "next";
import type { ReactNode } from "react";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: `雨天寵物友善室內好去處香港 | PetWell HK`,
  description: `香港雨天可帶寵物的室內商場與好去處指南。`,
  keywords: undefined,
  path: `/rainy-day-pet-friendly-indoor-hong-kong`,
  ogType: "article",
  noIndex: false,
});

export default function SeoLayout({ children }: { children: ReactNode }) {
  return children;
}
