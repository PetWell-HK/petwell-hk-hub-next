import type { Metadata } from "next";
import ClientPage from "@/components/ClientPage";
import JsonLd from "@/components/seo/JsonLd";
import Page from "@/views/EventDetail";
import { generateEventMetadata, generateEventJsonLd } from "@/lib/server/contentMetadata";
import { unwrapSsrEntity, ssrEvent } from "@/lib/server/ssrContent";

type Props = { params: Promise<{ id: string }> };

export const revalidate = 1800;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return await generateEventMetadata(id);
}

export default async function RoutePage({ params }: Props) {
  const { id } = await params;
  const initialEvent = unwrapSsrEntity(await ssrEvent(id));
  const jsonLd = await generateEventJsonLd(id);
  return (
    <>
      {jsonLd ? <JsonLd data={jsonLd} /> : null}
      <ClientPage Page={Page} initialEvent={initialEvent} />
    </>
  );
}
