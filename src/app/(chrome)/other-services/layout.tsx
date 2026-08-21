import type { Metadata } from "next";
import type { ReactNode } from "react";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: `商業合作與其他服務 | PetWell HK`,
  description: `PetWell HK 商業合作、廣告與 B2B 服務。`,
  keywords: undefined,
  path: `/other-services`,
  ogType: "website",
  noIndex: false,
});

export default function SeoLayout({ children }: { children: ReactNode }) {
  return children;
}
