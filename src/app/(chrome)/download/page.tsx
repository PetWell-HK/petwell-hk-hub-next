import { Suspense } from "react";
import JsonLd from "@/components/seo/JsonLd";
import Page from "@/views/Download";
import { listingPageJsonLd } from "@/lib/seo";

export default function RoutePage() {
  return (
    <>
      <JsonLd
        id="ld-collection"
        data={listingPageJsonLd({
          title: `下載 PetWell App | 香港寵物健康管理`,
          description: `免費下載 PetWell。香港獸醫診所評價、寵物友善餐廳、健康紀錄與價格提醒，iOS 與 Android 均適用。`,
          path: `/download`,
        })}
      />
      <Suspense fallback={null}><Page  /></Suspense>
    </>
  );
}
