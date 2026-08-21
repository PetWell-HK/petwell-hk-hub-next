import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ClientPage from "@/components/ClientPage";
import JsonLd from "@/components/seo/JsonLd";
import Page from "@/views/RestaurantsByArea";
import { generateAreaMetadata, generateAreaJsonLd, areaSlugExists, getAreaSlugs } from "@/lib/server/contentMetadata";
import { ssrRestaurantListingForArea } from "@/lib/server/ssrContent";

type Props = { params: Promise<{ areaSlug: string }> };

export const revalidate = 3600;

export function generateStaticParams() {
  return getAreaSlugs().map((areaSlug) => ({ areaSlug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { areaSlug } = await params;
  return generateAreaMetadata(areaSlug);
}

export default async function RoutePage({ params }: Props) {
  const { areaSlug } = await params;
  if (!areaSlugExists(areaSlug)) notFound();
  const initialListing = await ssrRestaurantListingForArea(areaSlug);
  const jsonLd = generateAreaJsonLd(areaSlug);
  return (
    <>
      {jsonLd ? <JsonLd data={jsonLd} /> : null}
      <ClientPage Page={Page} initialListing={initialListing} />
    </>
  );
}
