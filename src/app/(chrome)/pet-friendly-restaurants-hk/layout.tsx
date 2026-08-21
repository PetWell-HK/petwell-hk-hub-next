import type { Metadata } from "next";
import type { ReactNode } from "react";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: `Pet-Friendly Restaurants Hong Kong | PetWell HK`,
  description: `Find pet-friendly restaurants across Hong Kong.`,
  keywords: undefined,
  path: `/pet-friendly-restaurants-hk`,
  ogType: "website",
  noIndex: false,
});

export default function SeoLayout({ children }: { children: ReactNode }) {
  return children;
}
