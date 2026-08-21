"use client";

import { useEffect } from "react";

const RELOAD_KEY = "pw-rsc-nav-reload";
const ERROR_COPY = "This page couldn't load";

function recoverOnce(href = window.location.href) {
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

function canonicalHref(): string {
  const { pathname, search, hash } = window.location;
  const normalized =
    pathname !== "/" && pathname.endsWith("/")
      ? pathname.slice(0, -1)
      : pathname;
  return `${normalized}${search}${hash}`;
}

function pageShowsNextCrash(): boolean {
  const text = document.body?.innerText ?? "";
  return text.includes(ERROR_COPY);
}

function shouldRecover(message: string): boolean {
  return (
    message.includes("#412") ||
    message.includes("Connection closed") ||
    message.includes("Failed to fetch RSC") ||
    message.includes(ERROR_COPY) ||
    /Loading chunk .* failed/i.test(message)
  );
}

/**
 * Next 16 can leave a dead-end error screen on Back when it restores a
 * partial listing Flight payload. A document load of the same URL works.
 */
export default function NavigationRecovery() {
  useEffect(() => {
    const onPopState = () => {
      recoverOnce(canonicalHref());
    };
    const onError = (event: ErrorEvent) => {
      const message = String(event.error?.message || event.message || "");
      if (shouldRecover(message)) recoverOnce(canonicalHref());
    };
    const onRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      const message = String(
        reason instanceof Error ? reason.message : reason || "",
      );
      if (shouldRecover(message)) recoverOnce(canonicalHref());
    };
    const observer = new MutationObserver(() => {
      if (pageShowsNextCrash()) recoverOnce(canonicalHref());
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });
    window.addEventListener("popstate", onPopState);
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      observer.disconnect();
      window.removeEventListener("popstate", onPopState);
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);

  return null;
}
