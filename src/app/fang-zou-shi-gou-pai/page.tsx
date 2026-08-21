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
          title: `防走失狗牌 | PetWell HK`,
          description: `PetWell 防走失狗牌。`,
          path: `/fang-zou-shi-gou-pai`,
        })}
      />
      <ClientPage Page={Page} />
    </>
  );
}
