import ClientPage from "@/components/ClientPage";
import JsonLd from "@/components/seo/JsonLd";
import Page from "@/views/Salons";
import { listingPageJsonLd } from "@/lib/seo";
import { ssrSalonListing } from "@/lib/server/ssrContent";

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
      <ClientPage Page={Page} initialListing={initialListing} />
    </>
  );
}
