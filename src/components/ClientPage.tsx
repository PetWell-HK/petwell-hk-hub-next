"use client";

import { Suspense, type ComponentType } from "react";

/** Client page boundary with local Suspense for useSearchParams — does not wrap the root layout. */
export default function ClientPage<P extends object>({
  Page,
  ...props
}: { Page: ComponentType<P> } & P) {
  return (
    <Suspense fallback={null}>
      <Page {...(props as P)} />
    </Suspense>
  );
}
