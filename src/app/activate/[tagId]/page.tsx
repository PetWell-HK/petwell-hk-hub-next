import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import ActivateTag from "@/views/ActivateTag";

type Props = { params: Promise<{ tagId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tagId } = await params;
  return buildMetadata({
    title: "啟動寵物名牌 | PetWell HK",
    description: "啟動 PetWell 防走失狗牌。",
    path: `/activate/${tagId}`,
    noIndex: true,
  });
}

export default function RoutePage() {
  return <ActivateTag />;
}
