import type { Metadata } from "next";
import type { ReactNode } from "react";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: `申請已提交 | PetWell HK`,
  description: `感謝你的商戶申請。`,
  keywords: undefined,
  path: `/vendor-application/thank-you`,
  ogType: "website",
  noIndex: true,
});

export default function SeoLayout({ children }: { children: ReactNode }) {
  return children;
}
