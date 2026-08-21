"use client";

import { useSyncExternalStore } from "react";

const URL_CHANGE_EVENT = "pw-urlchange";

let historyPatched = false;

function notifyUrlChange() {
  window.dispatchEvent(new Event(URL_CHANGE_EVENT));
}

function ensureHistoryPatch() {
  if (historyPatched || typeof window === "undefined") return;
  historyPatched = true;

  const { pushState, replaceState } = window.history;
  window.history.pushState = function patchedPushState(...args) {
    const result = pushState.apply(this, args);
    notifyUrlChange();
    return result;
  };
  window.history.replaceState = function patchedReplaceState(...args) {
    const result = replaceState.apply(this, args);
    notifyUrlChange();
    return result;
  };
  window.addEventListener("popstate", notifyUrlChange);
}

function subscribeToUrl(onStoreChange: () => void) {
  ensureHistoryPatch();
  window.addEventListener(URL_CHANGE_EVENT, onStoreChange);
  return () => window.removeEventListener(URL_CHANGE_EVENT, onStoreChange);
}

function getClientSearch() {
  return window.location.search;
}

function getServerSearch() {
  return "";
}

/** Query string without calling next/navigation useSearchParams (that hook suspends). */
export function useWindowSearchString(): string {
  return useSyncExternalStore(subscribeToUrl, getClientSearch, getServerSearch);
}

export function useWindowSearchParams(): URLSearchParams {
  const search = useWindowSearchString();
  return new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
}
