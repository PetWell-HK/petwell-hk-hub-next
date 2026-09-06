import type { Metadata } from "next";
import type { ReactNode } from "react";
import { absoluteUrl, buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "毛孩沉浸式台灣中秋祭｜免費入場預留手帶 | PetWell × AquaBeat",
  description:
    "2026年9月25日至27日，觀塘海濱 AquaBeat。免費入場，預先登記即送全家福電子相片及嫦娥服免費租借，工作坊另設早鳥優惠。",
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
