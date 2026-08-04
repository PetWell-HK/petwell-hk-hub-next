"use client";

import type { ComponentType } from "react";

/** Marks a legacy page module as a Client Component boundary. */
export default function ClientPage<P extends object>({
  Page,
  ...props
}: { Page: ComponentType<P> } & P) {
  return <Page {...(props as P)} />;
}
