import type { Metadata } from "next";
import JsonLd from "@/components/seo/JsonLd";
import { generatePlaceJsonLd, generatePlaceMetadata } from "@/lib/server/placeMetadata";
import { unwrapSsrEntity, ssrRestaurant } from "@/lib/server/ssrContent";
import Page from "@/views/RestaurantDetail";
import PageSuspense from "@/components/PageSuspense";

type Props = { params: Promise<{ restaurantId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { restaurantId } = await params;
  return generatePlaceMetadata("restaurant", restaurantId);
}

export default async function RestaurantDetailPage({ params }: Props) {
  const { restaurantId } = await params;
  const initialRestaurant = unwrapSsrEntity(await ssrRestaurant(restaurantId));
  const jsonLd = await generatePlaceJsonLd("restaurant", restaurantId);
  return (
    <>
      {jsonLd ? <JsonLd data={jsonLd} /> : null}
      <PageSuspense>
        <Page initialRestaurant={initialRestaurant} />
      </PageSuspense>
    </>
  );
}
