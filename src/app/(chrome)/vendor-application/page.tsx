import JsonLd from "@/components/seo/JsonLd";
import Page from "@/views/VendorApplication";
import { listingPageJsonLd } from "@/lib/seo";
import PageSuspense from "@/components/PageSuspense";

export default function RoutePage() {
  return (
    <>
      <JsonLd
        id="ld-collection"
        data={listingPageJsonLd({
          title: `商戶申請 | PetWell HK`,
          description: `申請成為 PetWell 合作商戶。`,
          path: `/vendor-application`,
        })}
      />
      <PageSuspense><Page  /></PageSuspense>
    </>
  );
}
