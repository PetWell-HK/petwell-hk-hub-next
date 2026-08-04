import type { Metadata } from "next";
import type { ReactNode } from "react";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: `香港狗訓練員牌照指南 | PetWell HK`,
  description: `香港狗訓練員牌照與相關法規完整指南。`,
  keywords: undefined,
  path: `/blog/hong-kong-dog-trainer-licence-guide`,
  ogType: "article",
  noIndex: false,
});

export default function SeoLayout({ children }: { children: ReactNode }) {
  return children;
}
