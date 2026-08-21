import type { Metadata } from "next";
import type { ReactNode } from "react";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: `下載 PetWell App | 香港寵物健康管理`,
  description: `免費下載 PetWell。香港獸醫診所評價、寵物友善餐廳、健康紀錄與價格提醒，iOS 與 Android 均適用。`,
  keywords: undefined,
  path: `/download`,
  ogType: "website",
  noIndex: false,
});

export default function SeoLayout({ children }: { children: ReactNode }) {
  return children;
}
