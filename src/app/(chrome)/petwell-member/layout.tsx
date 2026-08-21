import type { Metadata } from "next";
import type { ReactNode } from "react";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: `PetWell 會員 | PetWell HK`,
  description: `了解 PetWell 會員計劃。`,
  keywords: undefined,
  path: `/petwell-member`,
  ogType: "website",
  noIndex: false,
});

export default function SeoLayout({ children }: { children: ReactNode }) {
  return children;
}
