import type { Metadata } from "next";
import type { ReactNode } from "react";
import { buildMetadata } from "@/lib/seo";
import {
  FORUM_LISTING_DESCRIPTION,
  FORUM_LISTING_KEYWORDS,
  FORUM_LISTING_TITLE,
} from "@/lib/forumSeo";

export const metadata: Metadata = buildMetadata({
  title: FORUM_LISTING_TITLE,
  description: FORUM_LISTING_DESCRIPTION,
  keywords: FORUM_LISTING_KEYWORDS,
  path: `/forum`,
  ogType: "website",
  noIndex: false,
});

export default function SeoLayout({ children }: { children: ReactNode }) {
  return children;
}
