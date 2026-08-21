import type { Metadata } from "next";
import JsonLd from "@/components/seo/JsonLd";
import { generatePlaceJsonLd, generatePlaceMetadata } from "@/lib/server/placeMetadata";
import { unwrapSsrEntity, ssrSalon } from "@/lib/server/ssrContent";
import Page from "@/views/SalonDetail";
import PageSuspense from "@/components/PageSuspense";

type Props = { params: Promise<{ salonId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { salonId } = await params;
  return generatePlaceMetadata("salon", salonId);
}

export default async function SalonDetailPage({ params }: Props) {
  const { salonId } = await params;
  const initialSalon = unwrapSsrEntity(await ssrSalon(salonId));
  const jsonLd = await generatePlaceJsonLd("salon", salonId);
  return (
    <>
      {jsonLd ? <JsonLd data={jsonLd} /> : null}
      <PageSuspense>
        <Page initialSalon={initialSalon} />
      </PageSuspense>
    </>
  );
}
