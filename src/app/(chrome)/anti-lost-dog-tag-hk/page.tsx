import JsonLd from "@/components/seo/JsonLd";
import Page from "@/views/Nametag";
import { listingPageJsonLd } from "@/lib/seo";
import PageSuspense from "@/components/PageSuspense";

export default function RoutePage() {
  return (
    <>
      <JsonLd
        id="ld-collection"
        data={listingPageJsonLd({
          title: `Anti-Lost Dog Tag Hong Kong | PetWell HK`,
          description: `PetWell NFC anti-lost dog tags in Hong Kong.`,
          path: `/anti-lost-dog-tag-hk`,
        })}
      />
      <PageSuspense><Page  /></PageSuspense>
    </>
  );
}
