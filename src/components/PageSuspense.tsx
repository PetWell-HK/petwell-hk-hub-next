import { Suspense, type ReactNode } from "react";
import PageFallback from "@/components/PageFallback";

/** Isolates client hooks that may suspend, without leaving a blank content hole. */
export default function PageSuspense({ children }: { children: ReactNode }) {
  return <Suspense fallback={<PageFallback />}>{children}</Suspense>;
}
