import type { Metadata } from "next";
import type { ReactNode } from "react";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: `香港動物NGO／救援組織 | PetWell HK`,
  description: `認識香港動物福利與救援組織。`,
  keywords: undefined,
  path: `/ngos`,
  ogType: "website",
  noIndex: false,
});

export default function SeoLayout({ children }: { children: ReactNode }) {
  return children;
}
