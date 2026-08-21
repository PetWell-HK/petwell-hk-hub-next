import ClientPage from "@/components/ClientPage";
import JsonLd from "@/components/seo/JsonLd";
import Page from "@/views/Forum";
import { listingPageJsonLd } from "@/lib/seo";
import { ssrForumListing } from "@/lib/server/ssrContent";

export const revalidate = 900;

export default async function RoutePage() {
  const initialPosts = await ssrForumListing();
  return (
    <>
      <JsonLd
        id="ld-collection"
        data={listingPageJsonLd({
          title: `香港寵物論壇 | PetWell HK`,
          description: `PetWell 寵物論壇：養寵心得、提問與社群討論。`,
          path: `/forum`,
        })}
      />
      <ClientPage Page={Page} initialPosts={initialPosts} />
    </>
  );
}
