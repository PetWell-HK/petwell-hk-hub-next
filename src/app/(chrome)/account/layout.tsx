import type { Metadata } from "next";
import type { ReactNode } from "react";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: `個人檔案 | PetWell HK`,
  description: `查看及編輯你的 PetWell 個人檔案。`,
  keywords: undefined,
  path: `/account`,
  ogType: "website",
  noIndex: true,
});

export default function SeoLayout({ children }: { children: ReactNode }) {
  return children;
}
