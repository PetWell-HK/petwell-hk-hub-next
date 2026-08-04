import type { Metadata } from "next";
import type { ReactNode } from "react";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: `PetWell HK | 香港寵物健康管理平台`,
  description: `PetWell HK 一站式寵物健康、餐廳、診所與社區平台。`,
  keywords: undefined,
  path: `/landing`,
  ogType: "website",
  noIndex: false,
});

export default function SeoLayout({ children }: { children: ReactNode }) {
  return children;
}
