import { Suspense } from "react";
import type { Metadata } from "next";
import Page from "@/views/UserProfile";
import { generateUserMetadata } from "@/lib/server/contentMetadata";

type Props = { params: Promise<{ userId: string }> };

export const revalidate = 1800;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { userId } = await params;
  return generateUserMetadata(userId);
}

export default function RoutePage() {
  return <Suspense fallback={null}><Page  /></Suspense>;
}
