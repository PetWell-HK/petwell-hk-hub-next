import type { Metadata } from "next";
import ClientPage from "@/components/ClientPage";
import JsonLd from "@/components/seo/JsonLd";
import Page from "@/views/ClinicDetail";
import { generatePlaceJsonLd, generatePlaceMetadata } from "@/lib/server/placeMetadata";
import { unwrapSsrEntity, ssrClinic } from "@/lib/server/ssrContent";

type Props = { params: Promise<{ clinicId: string }> };

export const revalidate = 1800;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { clinicId } = await params;
  return generatePlaceMetadata("clinic", clinicId);
}

export default async function RoutePage({ params }: Props) {
  const { clinicId } = await params;
  const initialClinic = unwrapSsrEntity(await ssrClinic(clinicId));
  const jsonLd = await generatePlaceJsonLd("clinic", clinicId);
  return (
    <>
      {jsonLd ? <JsonLd data={jsonLd} /> : null}
      <ClientPage Page={Page} initialClinic={initialClinic} />
    </>
  );
}
