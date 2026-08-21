import type { Metadata } from "next";
import type { ReactNode } from "react";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: `登入 / 註冊 | PetWell HK`,
  description: `登入或註冊 PetWell 帳戶。`,
  keywords: undefined,
  path: `/signup-login`,
  ogType: "website",
  noIndex: true,
});

export default function SeoLayout({ children }: { children: ReactNode }) {
  return children;
}
