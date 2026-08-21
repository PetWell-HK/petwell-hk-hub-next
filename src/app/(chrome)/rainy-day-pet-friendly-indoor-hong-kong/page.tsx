import JsonLd from "@/components/seo/JsonLd";
import Page from "@/views/RainyDayMalls";
import { listingPageJsonLd } from "@/lib/seo";
import PageSuspense from "@/components/PageSuspense";

export default function RoutePage() {
  return (
    <>
      <JsonLd
        id="ld-collection"
        data={listingPageJsonLd({
          title: `雨天寵物友善室內好去處香港 | PetWell HK`,
          description: `香港雨天可帶寵物的室內商場與好去處指南。`,
          path: `/rainy-day-pet-friendly-indoor-hong-kong`,
        })}
      />
      <PageSuspense><Page  /></PageSuspense>
    </>
  );
}
