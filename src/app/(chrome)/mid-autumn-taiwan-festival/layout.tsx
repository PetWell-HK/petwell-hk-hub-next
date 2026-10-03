import type { Metadata } from "next";
import type { ReactNode } from "react";
import { absoluteUrl, buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "毛孩沉浸式台灣中秋祭｜活動已結束 | PetWell × AquaBeat",
  description:
    "2026年9月25日至27日觀塘海濱中秋活動已經完結。報名已經截止，不再接收新申請。多謝支持，期待下個活動。",
  keywords: [
    "寵物中秋好去處",
    "毛孩沉浸式台灣中秋祭",
    "觀塘海濱寵物",
    "AquaBeat",
    "寵物工作坊",
  ],
  path: "/mid-autumn-taiwan-festival",
  ogType: "website",
  ogImage: absoluteUrl("/assets/blog-mid-autumn-pet-hk/festival-rsvp-banner.jpg"),
  noIndex: false,
});

export default function SeoLayout({ children }: { children: ReactNode }) {
  return children;
}
