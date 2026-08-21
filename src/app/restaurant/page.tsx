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
          title: `香港寵物友善餐廳 | PetWell HK`,
          description: `全港寵物友善餐廳指南。`,
          path: `/restaurant`,
        })}
      />
      <ClientPage Page={Page} initialListing={initialListing} />
    </>
  );
}
