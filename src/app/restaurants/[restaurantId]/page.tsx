import type { Metadata } from "next";
import ClientPage from "@/components/ClientPage";
import JsonLd from "@/components/seo/JsonLd";
import Page from "@/views/RestaurantDetail";
import { generatePlaceJsonLd, generatePlaceMetadata } from "@/lib/server/placeMetadata";
import { unwrapSsrEntity, ssrRestaurant } from "@/lib/server/ssrContent";

type Props = { params: Promise<{ restaurantId: string }> };

export const revalidate = 1800;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { restaurantId } = await params;
  return generatePlaceMetadata("restaurant", restaurantId);
}

export default async function RoutePage({ params }: Props) {
  const { restaurantId } = await params;
  const initialRestaurant = unwrapSsrEntity(await ssrRestaurant(restaurantId));
  const jsonLd = await generatePlaceJsonLd("restaurant", restaurantId);
  return (
    <>
      {jsonLd ? <JsonLd data={jsonLd} /> : null}
      <ClientPage Page={Page} initialRestaurant={initialRestaurant} />
    </>
  );
}
