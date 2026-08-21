import JsonLd from "@/components/seo/JsonLd";
import Page from "@/views/PetMatchmaker";
import { listingPageJsonLd } from "@/lib/seo";
import PageSuspense from "@/components/PageSuspense";

export default function RoutePage() {
  return (
    <>
      <JsonLd
        id="ld-collection"
        data={listingPageJsonLd({
          title: `寵物配對測驗 | PetWell HK`,
          description: `找出最適合你的寵物類型。`,
          path: `/pet-matchmaker`,
        })}
      />
      <PageSuspense><Page  /></PageSuspense>
    </>
  );
}
