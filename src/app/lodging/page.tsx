import ClientPage from "@/components/ClientPage";
import JsonLd from "@/components/seo/JsonLd";
import Page from "@/views/Lodging";
import { listingPageJsonLd } from "@/lib/seo";
import { ssrLodgingListing } from "@/lib/server/ssrContent";

export const revalidate = 900;

export default async function RoutePage() {
  const initialListing = await ssrLodgingListing();
  return (
    <>
      <JsonLd
        id="ld-collection"
        data={listingPageJsonLd({
          title: `香港寵物寄養與住宿 | PetWell HK`,
          description: `搜尋寵物寄養、酒店與寵物友好住宿。`,
          path: `/lodging`,
        })}
      />
      <ClientPage Page={Page} initialListing={initialListing} />
    </>
  );
}
