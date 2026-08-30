import type { Metadata } from "next";
import type { ReactNode } from "react";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: `私隱政策 | PetWell HK`,
  description: `了解 PetWell HK 如何收集、使用同保護你的個人資料，包括帳戶、寵物資料同瀏覽紀錄。`,
  keywords: undefined,
  path: `/privacy`,
  ogType: "website",
  noIndex: false,
});

export default function SeoLayout({ children }: { children: ReactNode }) {
  return children;
}
