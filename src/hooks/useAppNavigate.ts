"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { documentNavigate, shouldDocumentNavigate } from "@/lib/navigation";

export function useAppNavigate() {
  const router = useRouter();

  return useCallback(
    (to: string | number, options?: { replace?: boolean }) => {
      if (typeof to === "number") {
        if (to < 0) router.back();
        else if (to > 0) router.forward();
        return;
      }
      if (shouldDocumentNavigate(to)) {
        documentNavigate(to, options?.replace);
        return;
      }
      if (options?.replace) router.replace(to);
      else router.push(to);
    },
    [router],
  );
}
