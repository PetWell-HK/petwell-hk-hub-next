import JsonLd from "@/components/seo/JsonLd";
import { getRequestLocale } from "@/lib/server/locale";
import { listingPageJsonLd } from "@/lib/seo";
import { ssrHomeRails } from "@/lib/server/ssrContent";
import Page from "@/views/Index";
import PageSuspense from "@/components/PageSuspense";

export default async function HomePage() {
  const locale = await getRequestLocale();
  const initialHome = await ssrHomeRails();
  return (
    <>
      <JsonLd
        id="ld-collection"
        data={listingPageJsonLd({
          title: `PetWell HK | 寵物友善餐廳、獸醫診所、寵物論壇 | 香港寵物健康App`,
          description: `PetWell 香港首個一站式寵物健康App。全港寵物友善餐廳（18區搜尋）、獸醫診所評價、寵物美容與寄養、寵物活動及論壇。免費下載。`,
          path: `/`,
          locale,
        })}
      />
      <PageSuspense>
        <Page initialHome={initialHome} />
      </PageSuspense>
    </>
  );
}
