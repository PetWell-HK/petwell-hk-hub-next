import type { Metadata } from "next";
import JsonLd from "@/components/seo/JsonLd";
import { generatePlaceJsonLd, generatePlaceMetadata } from "@/lib/server/placeMetadata";
import { unwrapSsrEntity, ssrLodging } from "@/lib/server/ssrContent";
import Page from "@/views/LodgingDetail";
import PageSuspense from "@/components/PageSuspense";

type Props = { params: Promise<{ lodgingId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lodgingId } = await params;
  return generatePlaceMetadata("lodging", lodgingId);
}

export default async function LodgingDetailPage({ params }: Props) {
  const { lodgingId } = await params;
  const initialLodging = unwrapSsrEntity(await ssrLodging(lodgingId));
  const jsonLd = await generatePlaceJsonLd("lodging", lodgingId);
  return (
    <>
      {jsonLd ? <JsonLd data={jsonLd} /> : null}
      <PageSuspense>
        <Page initialLodging={initialLodging} />
      </PageSuspense>
    </>
  );
}
