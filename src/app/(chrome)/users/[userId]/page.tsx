import type { Metadata } from "next";
import Page from "@/views/UserProfile";
import { generateUserMetadata } from "@/lib/server/contentMetadata";
import PageSuspense from "@/components/PageSuspense";

type Props = { params: Promise<{ userId: string }> };

export const revalidate = 1800;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { userId } = await params;
  return generateUserMetadata(userId);
}

export default function RoutePage() {
  return <PageSuspense><Page  /></PageSuspense>;
}
