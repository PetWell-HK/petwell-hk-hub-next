import type { Metadata } from "next";
import type { ReactNode } from "react";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: `AFCD Pet Food Safety PDF | PetWell HK`,
  description: `Redirect`,
  keywords: undefined,
  path: `/afcd-pet-food-safety-pdf`,
  ogType: "website",
  noIndex: true,
});

export default function SeoLayout({ children }: { children: ReactNode }) {
  return children;
}
