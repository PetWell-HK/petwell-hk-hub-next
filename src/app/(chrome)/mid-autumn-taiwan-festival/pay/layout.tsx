import type { Metadata } from "next";
import type { ReactNode } from "react";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "付款確認｜毛孩沉浸式台灣中秋祭",
  description: "請儘快付款並上傳收據，以確認工作坊名額。",
  path: "/mid-autumn-taiwan-festival/pay",
  ogType: "website",
  noIndex: true,
});

export default function SeoLayout({ children }: { children: ReactNode }) {
  return children;
}
