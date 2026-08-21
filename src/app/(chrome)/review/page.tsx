import { Suspense } from "react";
import JsonLd from "@/components/seo/JsonLd";
import Page from "@/views/Review";
import { listingPageJsonLd } from "@/lib/seo";

export default function RoutePage() {
  return (
    <>
      <JsonLd
        id="ld-collection"
        data={listingPageJsonLd({
          title: `寵物食品價格比較 | PetWell HK`,
          description: `比較香港寵物食品價格與產品評價。`,
          path: `/review`,
        })}
      />
      <Suspense fallback={null}><Page  /></Suspense>
    </>
  );
}
