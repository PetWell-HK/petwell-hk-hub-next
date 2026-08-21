import type { Metadata } from "next";
import ClientPage from "@/components/ClientPage";
import JsonLd from "@/components/seo/JsonLd";
import Page from "@/views/LodgingDetail";
import { generatePlaceJsonLd, generatePlaceMetadata } from "@/lib/server/placeMetadata";
import { unwrapSsrEntity, ssrLodging } from "@/lib/server/ssrContent";

type Props = { params: Promise<{ lodgingId: string }> };

export const revalidate = 1800;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lodgingId } = await params;
  return generatePlaceMetadata("lodging", lodgingId);
}

export default async function RoutePage({ params }: Props) {
  const { lodgingId } = await params;
  const initialLodging = unwrapSsrEntity(await ssrLodging(lodgingId));
  const jsonLd = await generatePlaceJsonLd("lodging", lodgingId);
  return (
    <>
      {jsonLd ? <JsonLd data={jsonLd} /> : null}
      <ClientPage Page={Page} initialLodging={initialLodging} />
    </>
  );
}
