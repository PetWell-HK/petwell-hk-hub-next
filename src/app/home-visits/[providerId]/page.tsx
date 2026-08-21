import type { Metadata } from "next";
import ClientPage from "@/components/ClientPage";
import JsonLd from "@/components/seo/JsonLd";
import Page from "@/views/HomeVisitDetail";
import { generatePlaceJsonLd, generatePlaceMetadata } from "@/lib/server/placeMetadata";
import { unwrapSsrEntity, ssrHomeVisit } from "@/lib/server/ssrContent";

type Props = { params: Promise<{ providerId: string }> };

export const revalidate = 1800;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { providerId } = await params;
  return generatePlaceMetadata("homeVisit", providerId);
}

export default async function RoutePage({ params }: Props) {
  const { providerId } = await params;
  const initialProvider = unwrapSsrEntity(await ssrHomeVisit(providerId));
  const jsonLd = await generatePlaceJsonLd("homeVisit", providerId);
  return (
    <>
      {jsonLd ? <JsonLd data={jsonLd} /> : null}
      <ClientPage Page={Page} initialProvider={initialProvider} />
    </>
  );
}
