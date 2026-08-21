import { notFound, redirect } from "next/navigation";
import { blogPostExists } from "@/lib/server/contentMetadata";

type Props = { params: Promise<{ slug: string }> };

export default async function RoutePage({ params }: Props) {
  const { slug } = await params;
  if (!blogPostExists(slug)) notFound();
  redirect(`/${slug}`);
}
