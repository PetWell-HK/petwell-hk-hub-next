export function getForumPostIdFromPath(pathname: string): string | null {
  const match = pathname.match(/^\/forum\/([^/]+)\/?$/);
  if (!match?.[1]) return null;
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
}

export function buildForumHref(opts: {
  postId?: string | null;
  category?: string | null;
  search?: string | URLSearchParams;
}): string {
  const rawSearch =
    typeof opts.search === "string"
      ? opts.search.startsWith("?")
        ? opts.search.slice(1)
        : opts.search
      : opts.search
        ? opts.search.toString()
        : "";
  const params = new URLSearchParams(rawSearch);
  params.delete("post");
  if (opts.category === "all") {
    params.delete("category");
  } else if (opts.category) {
    params.set("category", opts.category);
  }
  const path = opts.postId ? `/forum/${opts.postId}` : "/forum";
  const qs = params.toString();
  return qs ? `${path}?${qs}` : path;
}

export function replaceForumLocation(opts: {
  postId?: string | null;
  category?: string | null;
}): void {
  if (typeof window === "undefined") return;
  const href = buildForumHref({
    postId: opts.postId,
    category: opts.category,
    search: window.location.search,
  });
  if (`${window.location.pathname}${window.location.search}` === href) return;
  window.history.replaceState(window.history.state, "", href);
}
