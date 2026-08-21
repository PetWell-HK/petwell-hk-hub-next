import type { Metadata } from "next";
import ClientPage from "@/components/ClientPage";
import JsonLd from "@/components/seo/JsonLd";
import Page from "@/views/SalonDetail";
import { generatePlaceJsonLd, generatePlaceMetadata } from "@/lib/server/placeMetadata";
import { unwrapSsrEntity, ssrSalon } from "@/lib/server/ssrContent";

type Props = { params: Promise<{ salonId: string }> };

export const revalidate = 1800;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { salonId } = await params;
  return generatePlaceMetadata("salon", salonId);
}

export default async function RoutePage({ params }: Props) {
  const { salonId } = await params;
  const initialSalon = unwrapSsrEntity(await ssrSalon(salonId));
  const jsonLd = await generatePlaceJsonLd("salon", salonId);
  return (
    <>
      {jsonLd ? <JsonLd data={jsonLd} /> : null}
      <ClientPage Page={Page} initialSalon={initialSalon} />
    </>
  );
}
