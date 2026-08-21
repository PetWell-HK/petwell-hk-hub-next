import ClientPage from "@/components/ClientPage";
import JsonLd from "@/components/seo/JsonLd";
import Page from "@/views/Clinics";
import { listingPageJsonLd } from "@/lib/seo";
import { ssrClinicListing } from "@/lib/server/ssrContent";

export const revalidate = 900;

export default async function RoutePage() {
  const initialListing = await ssrClinicListing();
  return (
    <>
      <JsonLd
        id="ld-collection"
        data={listingPageJsonLd({
          title: `香港獸醫診所評價與搜尋 | PetWell HK`,
          description: `搜尋全港獸醫診所、24小時急症、評價與地區資訊。`,
          path: `/clinics`,
        })}
      />
      <ClientPage Page={Page} initialListing={initialListing} />
    </>
  );
}
