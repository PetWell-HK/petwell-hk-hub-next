import type { Metadata } from "next";
import type { ReactNode } from "react";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: `Anti-Lost Dog Tag Hong Kong | PetWell HK`,
  description: `PetWell NFC anti-lost dog tags in Hong Kong.`,
  keywords: undefined,
  path: `/anti-lost-dog-tag-hk`,
  ogType: "website",
  noIndex: false,
});

export default function SeoLayout({ children }: { children: ReactNode }) {
  return children;
}
