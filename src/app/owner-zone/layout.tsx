import type { Metadata } from "next";
import type { ReactNode } from "react";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: `主人專區 | PetWell HK`,
  description: `香港寵物媒體：健康護理、生活出行、實用指南。`,
  keywords: undefined,
  path: `/owner-zone`,
  ogType: "website",
  noIndex: false,
});

export default function SeoLayout({ children }: { children: ReactNode }) {
  return children;
}
