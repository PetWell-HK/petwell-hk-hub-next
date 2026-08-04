import type { Metadata } from "next";
import { generatePlaceMetadata } from "@/lib/server/placeMetadata";
import LodgingDetail from "@/views/LodgingDetail";

type Props = { params: Promise<{ lodgingId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lodgingId } = await params;
  return generatePlaceMetadata("lodging", lodgingId);
}

export default function RoutePage() {
  return <LodgingDetail />;
}
