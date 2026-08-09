import type { Metadata } from "next";
import { generatePlaceMetadata } from "@/lib/server/placeMetadata";
import HomeVisitDetail from "@/views/HomeVisitDetail";

type Props = { params: Promise<{ providerId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { providerId } = await params;
  return generatePlaceMetadata("homeVisit", providerId);
}

export default function RoutePage() {
  return <HomeVisitDetail />;
}
