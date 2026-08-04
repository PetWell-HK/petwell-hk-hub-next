import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import CheckTag from "@/views/CheckTag";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return buildMetadata({
    title: "查詢寵物名牌 | PetWell HK",
    description: "查詢 PetWell 防走失狗牌。",
    path: `/check/${id}`,
    noIndex: true,
  });
}

export default function RoutePage() {
  return <CheckTag />;
}
