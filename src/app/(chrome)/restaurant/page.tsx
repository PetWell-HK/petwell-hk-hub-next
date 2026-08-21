import JsonLd from "@/components/seo/JsonLd";
import { getRequestLocale } from "@/lib/server/locale";
import { listingPageJsonLd } from "@/lib/seo";
import { ssrRestaurantListing } from "@/lib/server/ssrContent";
import Page from "@/views/Restaurants";
import PageSuspense from "@/components/PageSuspense";

export default async function RestaurantAliasPage() {
  const locale = await getRequestLocale();
  const initialListing = await ssrRestaurantListing();
  return (
    <>
      <JsonLd
        id="ld-collection"
        data={listingPageJsonLd({
          title: `香港寵物友善餐廳 | PetWell HK`,
          description: `全港寵物友善餐廳指南。`,
          path: `/restaurant`,
          locale,
        })}
      />
      <PageSuspense>
        <Page initialListing={initialListing} />
      </PageSuspense>
    </>
  );
}
