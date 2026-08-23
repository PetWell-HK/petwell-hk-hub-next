import { redirect } from "next/navigation";
import JsonLd from "@/components/seo/JsonLd";
import Page from "@/views/Forum";
import { forumListingJsonLd } from "@/lib/forumSeo";
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
    <div className="h-full min-h-0">
      <JsonLd id="ld-forum" data={forumListingJsonLd()} />
      <Page initialPosts={initialPosts} />
    </div>
  );
}
