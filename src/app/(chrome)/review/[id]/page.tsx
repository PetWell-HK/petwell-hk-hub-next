import type { Metadata } from "next";
import JsonLd from "@/components/seo/JsonLd";
import Page from "@/views/ReviewProduct";
import { generateReviewProductMetadata, generateReviewProductJsonLd } from "@/lib/server/contentMetadata";
import { unwrapSsrEntity, ssrReviewProduct } from "@/lib/server/ssrContent";
import PageSuspense from "@/components/PageSuspense";

type Props = { params: Promise<{ id: string }> };

export const revalidate = 1800;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return await generateReviewProductMetadata(id);
}

export default async function RoutePage({ params }: Props) {
  const { id } = await params;
  const initialReview = unwrapSsrEntity(await ssrReviewProduct(id));
  const jsonLd = await generateReviewProductJsonLd(id);
  return (
    <>
      {jsonLd ? <JsonLd data={jsonLd} /> : null}
      <PageSuspense><Page initialReview={initialReview}  /></PageSuspense>
    </>
  );
}
