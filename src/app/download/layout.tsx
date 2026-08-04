import type { Metadata } from "next";
import type { ReactNode } from "react";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: `下載 PetWell App | PetWell HK`,
  description: `下載 PetWell 香港寵物健康 App。`,
  keywords: undefined,
  path: `/download`,
  ogType: "website",
  noIndex: false,
});

export default function SeoLayout({ children }: { children: ReactNode }) {
  return children;
}
