import { fetchAuthSession } from "aws-amplify/auth";
import { getPetwellApiBase } from "@/config/petwellApi";

type ForumRequestOptions = {
  method?: string;
  body?: unknown;
  auth?: boolean;
};

export async function forumRequest<T = Record<string, unknown>>(
  path: string,
  { method = "GET", body, auth = false }: ForumRequestOptions = {},
): Promise<T> {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (auth) {
    const session = await fetchAuthSession();
    const token = session.tokens?.idToken?.toString();
    if (!token) throw new Error("Authentication required. Please log in.");
    headers.Authorization = `Bearer ${token}`;
  }
  const res = await fetch(`${await getPetwellApiBase()}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const json = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) {
    throw new Error(json.error || `Forum API ${res.status}`);
  }
  return json;
}

export async function forumGetVotes(opts?: { postIds?: string[]; replyIds?: string[] }) {
  const params = new URLSearchParams();
  if (opts?.postIds?.length) params.set("postIds", opts.postIds.slice(0, 100).join(","));
  if (opts?.replyIds?.length) params.set("replyIds", opts.replyIds.slice(0, 100).join(","));
  const qs = params.toString();
  const data = await forumRequest<{
    votes?: Record<string, 1 | -1>;
    postVotes?: Record<string, 1 | -1>;
    replyVotes?: Record<string, 1 | -1>;
  }>(`/api/forum/me/votes${qs ? `?${qs}` : ""}`, { auth: true });
  return {
    postVotes: data.postVotes || data.votes || {},
    replyVotes: data.replyVotes || {},
  };
}
