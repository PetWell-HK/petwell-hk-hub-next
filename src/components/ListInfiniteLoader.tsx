import { useCallback, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";

const NEAR_BOTTOM_MARGIN_PX = 200;

function isNearBottom(el: HTMLElement): boolean {
  return el.getBoundingClientRect().top <= window.innerHeight + NEAR_BOTTOM_MARGIN_PX;
}

interface ListInfiniteLoaderProps {
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
  loadMoreLabel: string;
  loadingLabel: string;
}

export function ListInfiniteLoader({
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  loadMoreLabel,
  loadingLabel,
}: ListInfiniteLoaderProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const canAutoLoadRef = useRef(true);
  const fetchNextPageRef = useRef(fetchNextPage);
  const isFetchingRef = useRef(isFetchingNextPage);
  const hasNextPageRef = useRef(hasNextPage);

  fetchNextPageRef.current = fetchNextPage;
  isFetchingRef.current = isFetchingNextPage;
  hasNextPageRef.current = hasNextPage;

  const loadNextPage = useCallback(() => {
    if (isFetchingRef.current || !hasNextPageRef.current) {
      return;
    }
    canAutoLoadRef.current = false;
    fetchNextPageRef.current();
  }, []);

  const tryAutoLoad = useCallback(() => {
    if (!canAutoLoadRef.current || isFetchingRef.current || !hasNextPageRef.current) {
      return;
    }

    const sentinel = sentinelRef.current;
    if (!sentinel || !isNearBottom(sentinel)) {
      canAutoLoadRef.current = true;
      return;
    }

    loadNextPage();
  }, [loadNextPage]);

  useEffect(() => {
    canAutoLoadRef.current = true;
  }, [hasNextPage]);

  useEffect(() => {
    if (!hasNextPage) {
      return;
    }

    const el = sentinelRef.current;
    if (!el) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) {
          canAutoLoadRef.current = true;
          return;
        }
        tryAutoLoad();
      },
      { rootMargin: `${NEAR_BOTTOM_MARGIN_PX}px` },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, tryAutoLoad]);

  if (!hasNextPage && !isFetchingNextPage) {
    return null;
  }

  return (
    <div className="mt-8 flex flex-col items-center gap-2">
      <div
        ref={sentinelRef}
        className="flex min-h-12 w-full items-center justify-center py-4"
      >
        {hasNextPage && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="min-w-36 rounded-lg"
            disabled={isFetchingNextPage}
            onClick={loadNextPage}
          >
            {isFetchingNextPage ? loadingLabel : loadMoreLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
