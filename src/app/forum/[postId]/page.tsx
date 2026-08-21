import type { Metadata } from "next";
import ClientPage from "@/components/ClientPage";
import JsonLd from "@/components/seo/JsonLd";
import Page from "@/views/ForumPost";
import { generateForumMetadata, generateForumJsonLd } from "@/lib/server/contentMetadata";
import { unwrapSsrEntity, ssrForumPost } from "@/lib/server/ssrContent";

type Props = { params: Promise<{ postId: string }> };

export const revalidate = 600;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { postId } = await params;
  return await generateForumMetadata(postId);
}

export default async function RoutePage({ params }: Props) {
  const { postId } = await params;
  const initialPost = unwrapSsrEntity(await ssrForumPost(postId));
  const jsonLd = await generateForumJsonLd(postId);
  return (
    <>
      {jsonLd ? <JsonLd data={jsonLd} /> : null}
      <ClientPage Page={Page} initialPost={initialPost} />
    </>
  );
}
