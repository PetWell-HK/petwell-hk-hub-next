"use client";

import { useEffect } from "react";

const RELOAD_KEY = "pw-rsc-nav-reload";

function shouldRecover(message: string): boolean {
  return (
    message.includes("#412") ||
    message.includes("Connection closed") ||
    message.includes("Failed to fetch RSC") ||
    /Loading chunk .* failed/i.test(message)
  );
}

function recoverOnce() {
  const href = window.location.href;
  const raw = sessionStorage.getItem(RELOAD_KEY);
  if (raw) {
    try {
      const last = JSON.parse(raw) as { href?: string; at?: number };
      if (last.href === href && Date.now() - (last.at ?? 0) < 8000) return;
    } catch {
      // Ignore a corrupt marker and recover.
    }
  }
  sessionStorage.setItem(RELOAD_KEY, JSON.stringify({ href, at: Date.now() }));
  window.location.replace(href);
}

/** Hard-reload once when a client RSC navigation dies; refresh already works. */
export default function NavigationRecovery() {
  useEffect(() => {
    const onError = (event: ErrorEvent) => {
      const message = String(event.error?.message || event.message || "");
      if (shouldRecover(message)) recoverOnce();
    };
    const onRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      const message = String(
        reason instanceof Error ? reason.message : reason || "",
      );
      if (shouldRecover(message)) recoverOnce();
    };
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);

  return null;
}
