import type { Metadata } from "next";
import type { ReactNode } from "react";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: `WhatsApp PetWell`,
  description: `聯絡`,
  keywords: undefined,
  path: `/whatsapp-petwell-chin`,
  ogType: "website",
  noIndex: true,
});

export default function SeoLayout({ children }: { children: ReactNode }) {
  return children;
}
