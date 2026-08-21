import { Suspense } from "react";
import JsonLd from "@/components/seo/JsonLd";
import Page from "@/views/HomeVisits";
import { listingPageJsonLd } from "@/lib/seo";
import { ssrHomeVisits } from "@/lib/server/ssrContent";

export const revalidate = 900;

export default async function RoutePage() {
  const initialProviders = await ssrHomeVisits();
  return (
    <>
      <JsonLd
        id="ld-collection"
        data={listingPageJsonLd({
          title: `香港寵物上門服務｜上門診症、疫苗、急症｜PetWell HK`,
          description: `搜尋香港寵物上門服務：上門診症、疫苗接種、健康檢查同急症支援。按地區、寵物種類同服務範圍篩選，WhatsApp／電話一鍵聯絡。`,
          path: `/home-visits`,
        })}
      />
      <Suspense fallback={null}><Page initialProviders={initialProviders}  /></Suspense>
    </>
  );
}
