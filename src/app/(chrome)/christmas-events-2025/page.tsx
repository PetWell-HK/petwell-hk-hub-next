import JsonLd from "@/components/seo/JsonLd";
import Page from "@/views/ChristmasEvents";
import { listingPageJsonLd } from "@/lib/seo";
import PageSuspense from "@/components/PageSuspense";

export default function RoutePage() {
  return (
    <>
      <JsonLd
        id="ld-collection"
        data={listingPageJsonLd({
          title: `2025 聖誕寵物活動 | PetWell HK`,
          description: `香港聖誕寵物活動一覽。`,
          path: `/christmas-events-2025`,
        })}
      />
      <PageSuspense><Page  /></PageSuspense>
    </>
  );
}
