import type { Metadata } from "next";
import ClientPage from "@/components/ClientPage";
import JsonLd from "@/components/seo/JsonLd";
import Page from "@/views/MallDetail";
import { generatePlaceJsonLd, generatePlaceMetadata } from "@/lib/server/placeMetadata";
import { unwrapSsrEntity, ssrMall } from "@/lib/server/ssrContent";

type Props = { params: Promise<{ mallId: string }> };

export const revalidate = 1800;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { mallId } = await params;
  return generatePlaceMetadata("mall", mallId);
}

export default async function RoutePage({ params }: Props) {
  const { mallId } = await params;
  const initialMall = unwrapSsrEntity(await ssrMall(mallId));
  const jsonLd = await generatePlaceJsonLd("mall", mallId);
  return (
    <>
      {jsonLd ? <JsonLd data={jsonLd} /> : null}
      <ClientPage Page={Page} initialMall={initialMall} />
    </>
  );
}
