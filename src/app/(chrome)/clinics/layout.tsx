import type { Metadata } from "next";
import type { ReactNode } from "react";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: `香港獸醫診所評價與搜尋 | PetWell HK`,
  description: `搜尋全港獸醫診所、24小時急症、評價與地區資訊。`,
  keywords: "香港獸醫,獸醫診所,24小時獸醫,寵物診所評價",
  path: `/clinics`,
  ogType: "website",
  noIndex: false,
});

export default function SeoLayout({ children }: { children: ReactNode }) {
  return children;
}
