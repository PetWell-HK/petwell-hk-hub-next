import type { Metadata } from "next";
import type { ReactNode } from "react";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: `香港寵物寄養與住宿 | PetWell HK`,
  description: `搜尋寵物寄養、酒店與寵物友好住宿。`,
  keywords: undefined,
  path: `/lodging`,
  ogType: "website",
  noIndex: false,
});

export default function SeoLayout({ children }: { children: ReactNode }) {
  return children;
}
