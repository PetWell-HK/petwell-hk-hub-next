import { Skeleton } from "@/components/ui/skeleton";

export default function ForumLoading() {
  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-background">
      <div className="h-14 shrink-0 border-b border-border bg-white" />
      <div className="flex min-h-0 flex-1">
        <div className="w-full space-y-3 border-r border-border bg-white p-4 md:w-[32%] lg:w-1/4">
          {[1, 2, 3, 4, 5].map((item) => (
            <Skeleton key={item} className="h-20 w-full" />
          ))}
        </div>
        <div className="hidden min-h-0 flex-1 bg-white p-6 md:block">
          <Skeleton className="mb-4 h-8 w-2/3" />
          <Skeleton className="mb-3 h-4 w-40" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    </div>
  );
}
