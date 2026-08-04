import type { Metadata } from "next";
import type { ReactNode } from "react";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: `香港寵物友善餐廳 | PetWell HK`,
  description: `全港寵物友善餐廳指南。`,
  keywords: undefined,
  path: `/restaurant`,
  ogType: "website",
  noIndex: false,
});

export default function SeoLayout({ children }: { children: ReactNode }) {
  return children;
}
