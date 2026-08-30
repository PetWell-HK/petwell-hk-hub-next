import JsonLd from "@/components/seo/JsonLd";
import Page from "@/views/PetMatchmaker";
import { listingPageJsonLd } from "@/lib/seo";
import PageSuspense from "@/components/PageSuspense";

export default function RoutePage() {
  return (
    <>
      <JsonLd
        id="ld-collection"
        data={listingPageJsonLd({
          title: `終極寵物配對：毛孩、羽毛定鱗片？ | PetWell HK`,
          description: `養啱寵物唔係淨係睇樣咁簡單，要睇下佢哋嘅生活模式啱唔啱你。由好精力旺盛嘅雀仔，到靜靜地跳嚟跳去嘅兔仔，即刻嚟睇下邊種寵物最啱你！`,
          path: `/pet-matchmaker`,
        })}
      />
      <PageSuspense><Page  /></PageSuspense>
    </>
  );
}
