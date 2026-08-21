import ClientPage from "@/components/ClientPage";
import JsonLd from "@/components/seo/JsonLd";
import Page from "@/views/NGOs";
import { listingPageJsonLd } from "@/lib/seo";

export default function RoutePage() {
  return (
    <>
      <JsonLd
        id="ld-collection"
        data={listingPageJsonLd({
          title: `香港動物NGO／救援組織 | PetWell HK`,
          description: `認識香港動物福利與救援組織。`,
          path: `/ngos`,
        })}
      />
      <ClientPage Page={Page} />
    </>
  );
}
