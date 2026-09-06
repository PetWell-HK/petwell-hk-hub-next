import type { Metadata } from "next";
import type { ReactNode } from "react";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "報名完成｜毛孩沉浸式台灣中秋祭",
  description: "報名已提交。核對資料後，將以電郵發送入場確認。",
  path: "/mid-autumn-taiwan-festival/confirmed",
  ogType: "website",
  noIndex: true,
});

export default function SeoLayout({ children }: { children: ReactNode }) {
  return children;
}
