import type { Metadata } from "next";
import ClientPage from "@/components/ClientPage";
import JsonLd from "@/components/seo/JsonLd";
import Page from "@/views/ReviewBrand";
import { generateReviewBrandMetadata, generateReviewBrandJsonLd } from "@/lib/server/contentMetadata";

type Props = { params: Promise<{ brand: string }> };

export const revalidate = 1800;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { brand } = await params;
  return await generateReviewBrandMetadata(brand);
}

export default async function RoutePage({ params }: Props) {
  const { brand } = await params;
  const jsonLd = generateReviewBrandJsonLd(brand);
  return (
    <>
      {jsonLd ? <JsonLd data={jsonLd} /> : null}
      <ClientPage Page={Page} />
    </>
  );
}
