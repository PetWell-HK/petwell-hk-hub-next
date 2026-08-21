import type { Metadata } from "next";
import type { ReactNode } from "react";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: `防走失狗牌 / NFC 寵物名牌 | PetWell HK`,
  description: `PetWell 防走失狗牌，NFC 即時聯繫飼主。`,
  keywords: "防走失狗牌,NFC狗牌,寵物名牌香港",
  path: `/nametag`,
  ogType: "website",
  noIndex: false,
});

export default function SeoLayout({ children }: { children: ReactNode }) {
  return children;
}
