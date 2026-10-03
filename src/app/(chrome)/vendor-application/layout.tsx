import type { Metadata } from "next";
import type { ReactNode } from "react";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: `中秋市集申請已截止 | PetWell HK`,
  description: `2026年9月中秋市集已經完結。檔主及贊助申請已截止，不再接收新申請。多謝支持，期待下個活動。`,
  keywords: undefined,
  path: `/vendor-application`,
  ogType: "website",
  noIndex: false,
});

export default function SeoLayout({ children }: { children: ReactNode }) {
  return children;
}
