import { Skeleton } from "@/components/ui/skeleton";

/** Reserved page shell while a route streams or a client boundary hydrates. */
export default function PageFallback() {
  return (
    <div
      className="min-h-[calc(100dvh-var(--header-height))] bg-background px-4 py-8"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="container mx-auto max-w-6xl space-y-6">
        <Skeleton className="h-9 w-2/3 max-w-sm" />
        <Skeleton className="h-4 w-full max-w-xl" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-44" />
          <Skeleton className="h-44" />
          <Skeleton className="h-44" />
        </div>
      </div>
      <span className="sr-only">Loading</span>
    </div>
  );
}
