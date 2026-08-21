import ClientPage from "@/components/ClientPage";
import JsonLd from "@/components/seo/JsonLd";
import Page from "@/views/NutritionScore";
import { listingPageJsonLd } from "@/lib/seo";

export default function RoutePage() {
  return (
    <>
      <JsonLd
        id="ld-collection"
        data={listingPageJsonLd({
          title: `寵物營養評分 | PetWell HK`,
          description: `寵物食品營養評分與成分分析。`,
          path: `/nutrition`,
        })}
      />
      <ClientPage Page={Page} />
    </>
  );
}
