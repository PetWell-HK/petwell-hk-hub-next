import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { buildMetadata } from "@/lib/seo";
import { blogPosts } from "@/data/blogData";
import BlogPost from "@/views/BlogPost";

type Props = { params: Promise<{ slug: string }> };

function findPost(slug: string) {
  return (
    blogPosts.find((p) => p.slug === slug) ||
    blogPosts.find((p) => p.slug === `blog/${slug}`) ||
    blogPosts.find((p) => p.slug.replace(/^blog\//, "") === slug)
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = findPost(slug);

  if (!post) {
    notFound();
  }

  const canonicalSlug = post.slug.replace(/^blog\//, "");

  return buildMetadata({
    title: `${post.title} | PetWell HK`,
    description: post.seoDescription || post.excerpt,
    keywords: post.seoKeywords,
    path: `/${canonicalSlug}`,
    ogImage: post.imageUrl,
    ogType: "article",
    articlePublishedTime: post.date,
    articleAuthor: post.author,
    articleSection: post.category,
  });
}

export default async function RoutePage({ params }: Props) {
  const { slug } = await params;
  const post = findPost(slug);

  if (!post) {
    return notFound();
  }

  return <BlogPost />;
}
