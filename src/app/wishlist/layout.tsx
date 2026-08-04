import type { Metadata } from "next";
import type { ReactNode } from "react";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: `願望清單 | PetWell HK`,
  description: `你的寵物產品願望清單。`,
  keywords: undefined,
  path: `/wishlist`,
  ogType: "website",
  noIndex: true,
});

export default function SeoLayout({ children }: { children: ReactNode }) {
  return children;
}
