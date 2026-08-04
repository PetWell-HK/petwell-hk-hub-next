import type { Metadata } from "next";
import type { ReactNode } from "react";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: `防走失狗牌 | PetWell HK`,
  description: `PetWell 防走失狗牌。`,
  keywords: undefined,
  path: `/防走失狗牌`,
  ogType: "website",
  noIndex: false,
});

export default function SeoLayout({ children }: { children: ReactNode }) {
  return children;
}
