import JsonLd from "@/components/seo/JsonLd";
import Page from "@/views/PetwellMember";
import { listingPageJsonLd } from "@/lib/seo";
import PageSuspense from "@/components/PageSuspense";

export default function RoutePage() {
  return (
    <>
      <JsonLd
        id="ld-collection"
        data={listingPageJsonLd({
          title: `PetWell 會員計劃 | 下載 App 享會員優惠 | PetWell HK`,
          description: `成為 PetWell 會員：下載 App、註冊帳戶，購物時填寫電郵即可享會員折扣。香港寵物健康平台官方會員頁。`,
          path: `/petwell-member`,
        })}
      />
      <PageSuspense><Page  /></PageSuspense>
    </>
  );
}
