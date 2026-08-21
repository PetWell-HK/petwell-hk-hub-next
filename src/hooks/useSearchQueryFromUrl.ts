"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export function useSearchQueryFromUrl(paramName = "q"): [string, (value: string) => void] {
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(
    () => searchParams.get(paramName) ?? "",
  );

  useEffect(() => {
    const urlQuery = searchParams.get(paramName) ?? "";
    setSearchQuery(urlQuery);
  }, [searchParams, paramName]);

  return [searchQuery, setSearchQuery];
}
