import JsonLd from "@/components/seo/JsonLd";
import Page from "@/views/Review";
import { listingPageJsonLd } from "@/lib/seo";
import PageSuspense from "@/components/PageSuspense";

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
      <PageSuspense><Page  /></PageSuspense>
    </>
  );
}
