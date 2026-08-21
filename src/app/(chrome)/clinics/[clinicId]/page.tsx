import type { Metadata } from "next";
import { Suspense } from "react";
import JsonLd from "@/components/seo/JsonLd";
import { generatePlaceJsonLd, generatePlaceMetadata } from "@/lib/server/placeMetadata";
import { unwrapSsrEntity, ssrClinic } from "@/lib/server/ssrContent";
import Page from "@/views/ClinicDetail";

type Props = { params: Promise<{ clinicId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { clinicId } = await params;
  return generatePlaceMetadata("clinic", clinicId);
}

export default async function ClinicDetailPage({ params }: Props) {
  const { clinicId } = await params;
  const initialClinic = unwrapSsrEntity(await ssrClinic(clinicId));
  const jsonLd = await generatePlaceJsonLd("clinic", clinicId);
  return (
    <>
      {jsonLd ? <JsonLd data={jsonLd} /> : null}
      <Suspense fallback={null}>
        <Page initialClinic={initialClinic} />
      </Suspense>
    </>
  );
}
