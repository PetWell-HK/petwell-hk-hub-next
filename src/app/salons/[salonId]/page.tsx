import type { Metadata } from "next";
import { generatePlaceMetadata } from "@/lib/server/placeMetadata";
import SalonDetail from "@/views/SalonDetail";

type Props = { params: Promise<{ salonId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { salonId } = await params;
  return generatePlaceMetadata("salon", salonId);
}

export default function RoutePage() {
  return <SalonDetail />;
}
