import type { Metadata } from "next";
import { Suspense } from "react";
import JsonLd from "@/components/seo/JsonLd";
import { generatePlaceJsonLd, generatePlaceMetadata } from "@/lib/server/placeMetadata";
import { unwrapSsrEntity, ssrHomeVisit } from "@/lib/server/ssrContent";
import Page from "@/views/HomeVisitDetail";

type Props = { params: Promise<{ providerId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { providerId } = await params;
  return generatePlaceMetadata("homeVisit", providerId);
}

export default async function HomeVisitDetailPage({ params }: Props) {
  const { providerId } = await params;
  const initialProvider = unwrapSsrEntity(await ssrHomeVisit(providerId));
  const jsonLd = await generatePlaceJsonLd("homeVisit", providerId);
  return (
    <>
      {jsonLd ? <JsonLd data={jsonLd} /> : null}
      <Suspense fallback={null}>
        <Page initialProvider={initialProvider} />
      </Suspense>
    </>
  );
}
