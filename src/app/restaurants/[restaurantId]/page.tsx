import type { Metadata } from "next";
import { generatePlaceMetadata } from "@/lib/server/placeMetadata";
import RestaurantDetail from "@/views/RestaurantDetail";

type Props = { params: Promise<{ restaurantId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { restaurantId } = await params;
  return generatePlaceMetadata("restaurant", restaurantId);
}

export default function RoutePage() {
  return <RestaurantDetail />;
}
