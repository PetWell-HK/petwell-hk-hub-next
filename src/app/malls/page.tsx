import ClientPage from "@/components/ClientPage";
import JsonLd from "@/components/seo/JsonLd";
import Page from "@/views/Malls";
import { listingPageJsonLd } from "@/lib/seo";
import { ssrMalls } from "@/lib/server/ssrContent";

export const revalidate = 900;

export default async function RoutePage() {
  const initialMalls = await ssrMalls();
  return (
    <>
      <JsonLd
        id="ld-collection"
        data={listingPageJsonLd({
          title: `香港寵物友善商場 | PetWell HK`,
          description: `搜尋可帶寵物進入的香港商場與室內空間。`,
          path: `/malls`,
        })}
      />
      <ClientPage Page={Page} initialMalls={initialMalls} />
    </>
  );
}
