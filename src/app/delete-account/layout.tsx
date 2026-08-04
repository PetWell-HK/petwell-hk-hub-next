import type { Metadata } from "next";
import type { ReactNode } from "react";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: `刪除帳戶 | PetWell HK`,
  description: `刪除 PetWell 帳戶。`,
  keywords: undefined,
  path: `/delete-account`,
  ogType: "website",
  noIndex: true,
});

export default function SeoLayout({ children }: { children: ReactNode }) {
  return children;
}
