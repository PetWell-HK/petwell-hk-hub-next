import JsonLd from "@/components/seo/JsonLd";
import Page from "@/views/About";
import { listingPageJsonLd } from "@/lib/seo";
import PageSuspense from "@/components/PageSuspense";

export default function RoutePage() {
  return (
    <>
      <JsonLd
        id="ld-collection"
        data={listingPageJsonLd({
          title: `關於我們 | PetWell HK`,
          description: `認識 PetWell HK——香港寵物健康與生活資訊平台。`,
          path: `/about`,
        })}
      />
      <PageSuspense><Page  /></PageSuspense>
    </>
  );
}
