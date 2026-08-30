import type { Metadata } from "next";
import type { ReactNode } from "react";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: `PetWell 會員計劃 | 下載 App 享會員優惠 | PetWell HK`,
  description: `成為 PetWell 會員：下載 App、註冊帳戶，購物時填寫電郵即可享會員折扣。香港寵物健康平台官方會員頁。`,
  keywords: "PetWell會員,PetWell App,寵物會員優惠,香港寵物App",
  path: `/petwell-member`,
  ogType: "website",
  noIndex: false,
});

export default function SeoLayout({ children }: { children: ReactNode }) {
  return children;
}
