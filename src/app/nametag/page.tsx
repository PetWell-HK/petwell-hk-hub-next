import ClientPage from "@/components/ClientPage";
import JsonLd from "@/components/seo/JsonLd";
import Page from "@/views/Nametag";
import { listingPageJsonLd } from "@/lib/seo";

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
      <ClientPage Page={Page} />
    </>
  );
}
