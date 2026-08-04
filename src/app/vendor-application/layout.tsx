import type { Metadata } from "next";
import type { ReactNode } from "react";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: `商戶申請 | PetWell HK`,
  description: `申請成為 PetWell 合作商戶。`,
  keywords: undefined,
  path: `/vendor-application`,
  ogType: "website",
  noIndex: false,
});

export default function SeoLayout({ children }: { children: ReactNode }) {
  return children;
}
