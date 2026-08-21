import { Suspense } from "react";
import JsonLd from "@/components/seo/JsonLd";
import { getRequestLocale } from "@/lib/server/locale";
import { listingPageJsonLd } from "@/lib/seo";
import { ssrRestaurantListing } from "@/lib/server/ssrContent";
import Page from "@/views/Restaurants";

export default async function PetFriendlyRestaurantsHkPage() {
  const locale = await getRequestLocale();
  const initialListing = await ssrRestaurantListing();
  return (
    <>
      <JsonLd
        id="ld-collection"
        data={listingPageJsonLd({
          title: `Pet-Friendly Restaurants Hong Kong | PetWell HK`,
          description: `Find pet-friendly restaurants across Hong Kong.`,
          path: `/pet-friendly-restaurants-hk`,
          locale,
        })}
      />
      <Suspense fallback={null}>
        <Page initialListing={initialListing} />
      </Suspense>
    </>
  );
}
