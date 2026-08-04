import type { Metadata } from "next";
import { generatePlaceMetadata } from "@/lib/server/placeMetadata";
import ClinicDetail from "@/views/ClinicDetail";

type Props = { params: Promise<{ clinicId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { clinicId } = await params;
  return generatePlaceMetadata("clinic", clinicId);
}

export default function RoutePage() {
  return <ClinicDetail />;
}
