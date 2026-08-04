import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import PetTag from "@/views/PetTag";

type Props = { params: Promise<{ tagId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tagId } = await params;
  return buildMetadata({
    title: "寵物資料 | PetWell HK",
    description: "查看寵物公開資料。",
    path: `/pet/${tagId}`,
    noIndex: true,
  });
}

export default function RoutePage() {
  return <PetTag />;
}
