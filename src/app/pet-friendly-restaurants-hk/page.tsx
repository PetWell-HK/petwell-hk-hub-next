import ClientPage from "@/components/ClientPage";
import JsonLd from "@/components/seo/JsonLd";
import Page from "@/views/Restaurants";
import { listingPageJsonLd } from "@/lib/seo";
import { ssrRestaurantListing } from "@/lib/server/ssrContent";

export const revalidate = 900;

export default async function RoutePage() {
  const initialListing = await ssrRestaurantListing();
  return (
    <>
      <JsonLd
        id="ld-collection"
        data={listingPageJsonLd({
          title: `Pet-Friendly Restaurants Hong Kong | PetWell HK`,
          description: `Find pet-friendly restaurants across Hong Kong.`,
          path: `/pet-friendly-restaurants-hk`,
        })}
      />
      <ClientPage Page={Page} initialListing={initialListing} />
    </>
  );
}
