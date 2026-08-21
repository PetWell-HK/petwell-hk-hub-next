import { Suspense } from "react";
import JsonLd from "@/components/seo/JsonLd";
import Page from "@/views/OtherServices";
import { listingPageJsonLd } from "@/lib/seo";

export default function RoutePage() {
  return (
    <>
      <JsonLd
        id="ld-collection"
        data={listingPageJsonLd({
          title: `商業合作與其他服務 | PetWell HK`,
          description: `PetWell HK 商業合作、廣告與 B2B 服務。`,
          path: `/other-services`,
        })}
      />
      <Suspense fallback={null}><Page  /></Suspense>
    </>
  );
}
