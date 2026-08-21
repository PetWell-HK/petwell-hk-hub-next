import { Suspense } from "react";
import JsonLd from "@/components/seo/JsonLd";
import Page from "@/views/OwnerZone";
import { listingPageJsonLd } from "@/lib/seo";

export default function RoutePage() {
  return (
    <>
      <JsonLd
        id="ld-collection"
        data={listingPageJsonLd({
          title: `飼主專區 | PetWell HK`,
          description: `飼主實用資訊、指南與工具。`,
          path: `/owner-zone`,
        })}
      />
      <Suspense fallback={null}><Page  /></Suspense>
    </>
  );
}
