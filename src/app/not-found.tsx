import type { Metadata } from "next";
import NotFound from "@/views/NotFound";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "找不到頁面 | PetWell HK",
  description:
    "呢個頁面唔存在。返回 PetWell 香港寵物資訊平台首頁，繼續搵餐廳、獸醫、美容同論壇。",
  path: "/404",
  noIndex: true,
});

export default function NotFoundPage() {
  return <NotFound />;
}
