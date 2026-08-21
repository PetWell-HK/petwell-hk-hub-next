import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import JsonLd from "@/components/seo/JsonLd";
import Page from "@/views/NGODetail";
import { generateNgoMetadata, generateNgoJsonLd, ngoExists, getNgoIds } from "@/lib/server/contentMetadata";

type Props = { params: Promise<{ ngoId: string }> };

export const revalidate = 86400;

export function generateStaticParams() {
  return getNgoIds().map((ngoId) => ({ ngoId }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ngoId } = await params;
  return generateNgoMetadata(ngoId);
}

export default async function RoutePage({ params }: Props) {
  const { ngoId } = await params;
  if (!ngoExists(ngoId)) notFound();
  const jsonLd = generateNgoJsonLd(ngoId);
  return (
    <>
      {jsonLd ? <JsonLd data={jsonLd} /> : null}
      <Suspense fallback={null}><Page  /></Suspense>
    </>
  );
}
