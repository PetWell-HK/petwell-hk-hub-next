import type { Metadata } from "next";
import { generatePlaceMetadata } from "@/lib/server/placeMetadata";
import MallDetail from "@/views/MallDetail";

type Props = { params: Promise<{ mallId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { mallId } = await params;
  return generatePlaceMetadata("mall", mallId);
}

export default function RoutePage() {
  return <MallDetail />;
}
