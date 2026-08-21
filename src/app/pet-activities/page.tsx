import ClientPage from "@/components/ClientPage";
import JsonLd from "@/components/seo/JsonLd";
import Page from "@/views/PetActivities";
import { listingPageJsonLd } from "@/lib/seo";
import { ssrEventListing } from "@/lib/server/ssrContent";

export const revalidate = 900;

export default async function RoutePage() {
  const initialEvents = await ssrEventListing();
  return (
    <>
      <JsonLd
        id="ld-collection"
        data={listingPageJsonLd({
          title: `香港寵物活動 | PetWell HK`,
          description: `搜尋香港寵物市集、活動與體驗。`,
          path: `/pet-activities`,
        })}
      />
      <ClientPage Page={Page} initialEvents={initialEvents} />
    </>
  );
}
