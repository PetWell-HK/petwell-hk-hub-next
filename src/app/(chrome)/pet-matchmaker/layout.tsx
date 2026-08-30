import type { Metadata } from "next";
import type { ReactNode } from "react";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: `終極寵物配對：毛孩、羽毛定鱗片？ | PetWell HK`,
  description: `養啱寵物唔係淨係睇樣咁簡單，要睇下佢哋嘅生活模式啱唔啱你。由好精力旺盛嘅雀仔，到靜靜地跳嚟跳去嘅兔仔，即刻嚟睇下邊種寵物最啱你！`,
  keywords: "寵物配對,狗狗性格測驗,養貓測驗,香港寵物,PetWell",
  path: `/pet-matchmaker`,
  ogType: "website",
  noIndex: false,
});

export default function SeoLayout({ children }: { children: ReactNode }) {
  return children;
}
