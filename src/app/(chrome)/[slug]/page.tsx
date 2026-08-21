import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import JsonLd from "@/components/seo/JsonLd";
import Page from "@/views/BlogPost";
import { generateBlogMetadata, generateBlogJsonLd, blogPostExists, getBlogSlugs } from "@/lib/server/contentMetadata";

type Props = { params: Promise<{ slug: string }> };

export const revalidate = 3600;

export function generateStaticParams() {
  return getBlogSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return generateBlogMetadata(slug);
}

export default async function RoutePage({ params }: Props) {
  const { slug } = await params;
  if (!blogPostExists(slug)) notFound();
  const jsonLd = generateBlogJsonLd(slug);
  return (
    <>
      {jsonLd ? <JsonLd data={jsonLd} /> : null}
      <Suspense fallback={null}><Page  /></Suspense>
    </>
  );
}
