import type { Metadata } from "next";
import { Suspense } from "react";
import JsonLd from "@/components/seo/JsonLd";
import { generatePlaceJsonLd, generatePlaceMetadata } from "@/lib/server/placeMetadata";
import { unwrapSsrEntity, ssrSalon } from "@/lib/server/ssrContent";
import Page from "@/views/SalonDetail";

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
      <Suspense fallback={null}>
        <Page initialSalon={initialSalon} />
      </Suspense>
    </>
  );
}
