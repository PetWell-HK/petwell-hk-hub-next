import { Suspense } from "react";
import { redirect } from "next/navigation";
import JsonLd from "@/components/seo/JsonLd";
import Page from "@/views/Forum";
import { listingPageJsonLd } from "@/lib/seo";
import { ssrForumListing } from "@/lib/server/ssrContent";

export default async function ForumPage({
  searchParams,
}: {
  searchParams: Promise<{ post?: string }>;
}) {
  const { post } = await searchParams;
  if (post) redirect(`/forum/${post}`);

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
      <Suspense fallback={null}><Page initialPosts={initialPosts}  /></Suspense>
    </>
  );
}
