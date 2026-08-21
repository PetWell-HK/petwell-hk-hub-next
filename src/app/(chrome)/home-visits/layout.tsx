import type { Metadata } from "next";
import type { ReactNode } from "react";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: `香港寵物上門服務｜上門診症、疫苗、急症｜PetWell HK`,
  description: `搜尋香港寵物上門服務：上門診症、疫苗接種、健康檢查同急症支援。按地區、寵物種類同服務範圍篩選，WhatsApp／電話一鍵聯絡。`,
  keywords: "寵物上門服務,香港上門獸醫,寵物上門診症,上門疫苗,寵物急症上門,home visit vet hong kong",
  path: `/home-visits`,
  ogType: "website",
  noIndex: false,
});

export default function SeoLayout({ children }: { children: ReactNode }) {
  return children;
}
