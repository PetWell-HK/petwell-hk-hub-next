import type { Metadata } from "next";
import JsonLd from "@/components/seo/JsonLd";
import Page from "@/views/NutritionProduct";
import { generateNutritionMetadata, generateNutritionJsonLd, getNutritionProductIds } from "@/lib/server/contentMetadata";
import { unwrapSsrEntity, ssrNutritionProduct } from "@/lib/server/ssrContent";
import PageSuspense from "@/components/PageSuspense";

type Props = { params: Promise<{ id: string }> };

export const revalidate = 86400;

export async function generateStaticParams() {
  return (await getNutritionProductIds()).map((id) => ({ id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return await generateNutritionMetadata(id);
}

export default async function RoutePage({ params }: Props) {
  const { id } = await params;
  const initialProduct = unwrapSsrEntity(await ssrNutritionProduct(id));
  const jsonLd = await generateNutritionJsonLd(id);
  return (
    <>
      {jsonLd ? <JsonLd data={jsonLd} /> : null}
      <PageSuspense><Page initialProduct={initialProduct}  /></PageSuspense>
    </>
  );
}
