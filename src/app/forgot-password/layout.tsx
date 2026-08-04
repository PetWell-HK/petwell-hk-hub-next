import type { Metadata } from "next";
import type { ReactNode } from "react";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: `忘記密碼 | PetWell HK`,
  description: `重設 PetWell 帳戶密碼。`,
  keywords: undefined,
  path: `/forgot-password`,
  ogType: "website",
  noIndex: true,
});

export default function SeoLayout({ children }: { children: ReactNode }) {
  return children;
}
