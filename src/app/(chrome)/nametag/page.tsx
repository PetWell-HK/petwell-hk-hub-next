import JsonLd from "@/components/seo/JsonLd";
import Page from "@/views/Nametag";
import { listingPageJsonLd } from "@/lib/seo";
import PageSuspense from "@/components/PageSuspense";

export default function RoutePage() {
  return (
    <>
      <JsonLd
        id="ld-collection"
        data={listingPageJsonLd({
          title: `防走失狗牌 / NFC 寵物名牌 | PetWell HK`,
          description: `PetWell 防走失狗牌，NFC 即時聯繫飼主。`,
          path: `/nametag`,
        })}
      />
      <PageSuspense><Page  /></PageSuspense>
    </>
  );
}
