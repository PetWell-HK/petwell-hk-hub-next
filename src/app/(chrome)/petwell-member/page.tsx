import { Suspense } from "react";
import JsonLd from "@/components/seo/JsonLd";
import Page from "@/views/PetwellMember";
import { listingPageJsonLd } from "@/lib/seo";

export default function RoutePage() {
  return (
    <>
      <JsonLd
        id="ld-collection"
        data={listingPageJsonLd({
          title: `PetWell 會員 | PetWell HK`,
          description: `了解 PetWell 會員計劃。`,
          path: `/petwell-member`,
        })}
      />
      <Suspense fallback={null}><Page  /></Suspense>
    </>
  );
}
