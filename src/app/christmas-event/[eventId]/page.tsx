import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ClientPage from "@/components/ClientPage";
import JsonLd from "@/components/seo/JsonLd";
import Page from "@/views/ChristmasEventDetail";
import { generateChristmasEventMetadata, generateChristmasEventJsonLd, christmasEventExists, getChristmasEventIds } from "@/lib/server/contentMetadata";

type Props = { params: Promise<{ eventId: string }> };

export const revalidate = 86400;

export function generateStaticParams() {
  return getChristmasEventIds().map((eventId) => ({ eventId }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { eventId } = await params;
  return generateChristmasEventMetadata(eventId);
}

export default async function RoutePage({ params }: Props) {
  const { eventId } = await params;
  if (!christmasEventExists(eventId)) notFound();
  const jsonLd = generateChristmasEventJsonLd(eventId);
  return (
    <>
      {jsonLd ? <JsonLd data={jsonLd} /> : null}
      <ClientPage Page={Page} />
    </>
  );
}
