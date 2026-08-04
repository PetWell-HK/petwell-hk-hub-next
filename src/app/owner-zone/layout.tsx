import type { Metadata } from "next";
import type { ReactNode } from "react";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: `飼主專區 | PetWell HK`,
  description: `飼主實用資訊、指南與工具。`,
  keywords: undefined,
  path: `/owner-zone`,
  ogType: "website",
  noIndex: false,
});

export default function SeoLayout({ children }: { children: ReactNode }) {
  return children;
}
