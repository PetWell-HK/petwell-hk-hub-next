import type { Metadata } from "next";
import type { ReactNode } from "react";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: `香港寵物論壇 | PetWell HK`,
  description: `PetWell 寵物論壇：養寵心得、提問與社群討論。`,
  keywords: undefined,
  path: `/forum`,
  ogType: "website",
  noIndex: false,
});

export default function SeoLayout({ children }: { children: ReactNode }) {
  return children;
}
