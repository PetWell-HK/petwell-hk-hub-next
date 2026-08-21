import { Suspense } from "react";
import JsonLd from "@/components/seo/JsonLd";
import Page from "@/views/BlogDogTrainerLicence";
import { listingPageJsonLd } from "@/lib/seo";

export default function RoutePage() {
  return (
    <>
      <JsonLd
        id="ld-collection"
        data={listingPageJsonLd({
          title: `香港狗訓練員牌照指南 | PetWell HK`,
          description: `香港狗訓練員牌照與相關法規完整指南。`,
          path: `/blog/hong-kong-dog-trainer-licence-guide`,
        })}
      />
      <Suspense fallback={null}><Page  /></Suspense>
    </>
  );
}
