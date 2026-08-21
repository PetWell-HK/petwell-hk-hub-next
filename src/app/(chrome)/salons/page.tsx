import JsonLd from "@/components/seo/JsonLd";
import Page from "@/views/Salons";
import { listingPageJsonLd } from "@/lib/seo";
import { ssrSalonListing } from "@/lib/server/ssrContent";
import PageSuspense from "@/components/PageSuspense";

export const revalidate = 900;

export default async function RoutePage() {
  const initialListing = await ssrSalonListing();
  return (
    <>
      <JsonLd
        id="ld-collection"
        data={listingPageJsonLd({
          title: `香港寵物美容店搜尋 | PetWell HK`,
          description: `搜尋全港寵物美容、沖涼與造型服務。`,
          path: `/salons`,
        })}
      />
      <PageSuspense><Page initialListing={initialListing}  /></PageSuspense>
    </>
  );
}
