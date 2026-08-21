"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, type SetStateAction } from "react";

type SetURLSearchParams = (
  nextInit?: SetStateAction<URLSearchParams | Record<string, string> | string | string[][]>,
  navigateOpts?: { replace?: boolean },
) => void;

/** React Router-compatible [params, setParams] on top of next/navigation. */
export function useAppSearchParams(): [URLSearchParams, SetURLSearchParams] {
  const router = useRouter();
  const pathname = usePathname() || "/";
  const nextParams = useSearchParams();

  const searchParams = useMemo(
    () => new URLSearchParams(nextParams?.toString() || ""),
    [nextParams],
  );

  const setSearchParams = useCallback<SetURLSearchParams>(
    (nextInit, navigateOpts) => {
      const current = new URLSearchParams(nextParams?.toString() || "");
      let next: URLSearchParams;

      if (typeof nextInit === "function") {
        next = new URLSearchParams(nextInit(current));
      } else if (nextInit instanceof URLSearchParams) {
        next = new URLSearchParams(nextInit);
      } else if (typeof nextInit === "string") {
        next = new URLSearchParams(nextInit);
      } else if (Array.isArray(nextInit)) {
        next = new URLSearchParams(nextInit);
      } else if (nextInit && typeof nextInit === "object") {
        next = new URLSearchParams(nextInit as Record<string, string>);
      } else {
        next = new URLSearchParams();
      }

      const qs = next.toString();
      const href = qs ? `${pathname}?${qs}` : pathname;
      if (navigateOpts?.replace) router.replace(href);
      else router.push(href);
    },
    [nextParams, pathname, router],
  );

  return [searchParams, setSearchParams];
}
