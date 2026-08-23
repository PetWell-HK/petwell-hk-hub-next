import type { Metadata } from "next";
import JsonLd from "@/components/seo/JsonLd";
import Page from "@/views/Forum";
import { generateForumMetadata, generateForumJsonLd } from "@/lib/server/contentMetadata";
import { unwrapSsrEntity, ssrForumPost, ssrForumListing } from "@/lib/server/ssrContent";

type Props = { params: Promise<{ postId: string }> };

export const revalidate = 600;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { postId } = await params;
  return await generateForumMetadata(postId);
}

export default async function RoutePage({ params }: Props) {
  const { postId } = await params;
  const [initialPost, initialPosts, jsonLd] = await Promise.all([
    ssrForumPost(postId).then(unwrapSsrEntity),
    ssrForumListing(),
    generateForumJsonLd(postId),
  ]);

  return (
    <div className="h-full min-h-0">
      {jsonLd ? <JsonLd data={jsonLd} /> : null}
      <Page
        initialPosts={initialPosts}
        initialPost={initialPost}
        initialPostId={postId}
      />
    </div>
  );
}
