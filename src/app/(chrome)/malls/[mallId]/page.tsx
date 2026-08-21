import type { Metadata } from "next";
import { Suspense } from "react";
import JsonLd from "@/components/seo/JsonLd";
import { generatePlaceJsonLd, generatePlaceMetadata } from "@/lib/server/placeMetadata";
import { unwrapSsrEntity, ssrMall } from "@/lib/server/ssrContent";
import Page from "@/views/MallDetail";

type Props = { params: Promise<{ mallId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { mallId } = await params;
  return generatePlaceMetadata("mall", mallId);
}

export default async function MallDetailPage({ params }: Props) {
  const { mallId } = await params;
  const initialMall = unwrapSsrEntity(await ssrMall(mallId));
  const jsonLd = await generatePlaceJsonLd("mall", mallId);
  return (
    <>
      {jsonLd ? <JsonLd data={jsonLd} /> : null}
      <Suspense fallback={null}>
        <Page initialMall={initialMall} />
      </Suspense>
    </>
  );
}
