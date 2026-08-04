import type { Metadata } from "next";
import type { ReactNode } from "react";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: `寵物食品價格比較 | PetWell HK`,
  description: `比較香港寵物食品價格與產品評價。`,
  keywords: undefined,
  path: `/review`,
  ogType: "website",
  noIndex: false,
});

export default function SeoLayout({ children }: { children: ReactNode }) {
  return children;
}
