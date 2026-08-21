import type { Metadata } from "next";
import type { ReactNode } from "react";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: `關於我們 | PetWell HK`,
  description: `認識 PetWell HK——香港寵物健康與生活資訊平台。`,
  keywords: undefined,
  path: `/about`,
  ogType: "website",
  noIndex: false,
});

export default function SeoLayout({ children }: { children: ReactNode }) {
  return children;
}
