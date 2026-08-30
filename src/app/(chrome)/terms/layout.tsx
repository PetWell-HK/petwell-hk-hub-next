import type { Metadata } from "next";
import type { ReactNode } from "react";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: `服務條款 | PetWell HK`,
  description: `服務條款。最後更新：2026年4月25日。使用 PetWell 香港寵物資訊平台前請細閱服務條款。`,
  keywords: undefined,
  path: `/terms`,
  ogType: "website",
  noIndex: false,
});

export default function SeoLayout({ children }: { children: ReactNode }) {
  return children;
}
