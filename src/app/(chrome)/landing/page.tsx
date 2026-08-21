import { Suspense } from "react";
import JsonLd from "@/components/seo/JsonLd";
import Page from "@/views/Landing";
import { listingPageJsonLd } from "@/lib/seo";

export default function RoutePage() {
  return (
    <>
      <JsonLd
        id="ld-collection"
        data={listingPageJsonLd({
          title: `PetWell HK | 香港寵物健康管理平台`,
          description: `PetWell HK 一站式寵物健康、餐廳、診所與社區平台。`,
          path: `/landing`,
        })}
      />
      <Suspense fallback={null}><Page  /></Suspense>
    </>
  );
}
