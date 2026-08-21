import ClientPage from "@/components/ClientPage";
import JsonLd from "@/components/seo/JsonLd";
import Page from "@/views/ChristmasDogMbti";
import { listingPageJsonLd } from "@/lib/seo";

export default function RoutePage() {
  return (
    <>
      <JsonLd
        id="ld-collection"
        data={listingPageJsonLd({
          title: `聖誕狗狗 MBTI 測驗 2025 | PetWell HK`,
          description: `測測你家狗狗的 MBTI 性格！`,
          path: `/christmas-dog-mbti-2025`,
        })}
      />
      <ClientPage Page={Page} />
    </>
  );
}
