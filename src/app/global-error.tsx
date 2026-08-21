"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    const { pathname, search } = window.location;
    const normalized =
      pathname !== "/" && pathname.endsWith("/")
        ? pathname.slice(0, -1)
        : pathname;
    window.location.replace(`${normalized}${search}`);
  }, [error]);

  return (
    <html lang="zh-HK">
      <body />
    </html>
  );
}
