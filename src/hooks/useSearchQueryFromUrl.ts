"use client";

import { useEffect, useState } from "react";
import { useWindowSearchString } from "@/hooks/useWindowSearchParams";

export function useSearchQueryFromUrl(paramName = "q"): [string, (value: string) => void] {
  const search = useWindowSearchString();
  const [searchQuery, setSearchQuery] = useState(() => {
    const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
    return params.get(paramName) ?? "";
  });

  useEffect(() => {
    const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
    setSearchQuery(params.get(paramName) ?? "");
  }, [search, paramName]);

  return [searchQuery, setSearchQuery];
}
