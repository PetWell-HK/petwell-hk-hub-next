import JsonLd from "@/components/seo/JsonLd";
import { getRequestLocale } from "@/lib/server/locale";
import { listingPageJsonLd } from "@/lib/seo";
import { ssrClinicListing } from "@/lib/server/ssrContent";
import Page from "@/views/Clinics";
import PageSuspense from "@/components/PageSuspense";

export default async function ClinicsPage() {
  const locale = await getRequestLocale();
  const initialListing = await ssrClinicListing();
  return (
    <>
      <JsonLd
        id="ld-collection"
        data={listingPageJsonLd({
          title: `香港獸醫診所評價與搜尋 | PetWell HK`,
          description: `搜尋全港獸醫診所、24小時急症、評價與地區資訊。`,
          path: `/clinics`,
          locale,
        })}
      />
      <PageSuspense>
        <Page initialListing={initialListing} />
      </PageSuspense>
    </>
  );
}
