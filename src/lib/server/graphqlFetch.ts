const ENDPOINT =
  process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT ||
  "https://zzqlfjlslncu7kjjqkdedp7uwu.appsync-api.ap-southeast-1.amazonaws.com/graphql";

const API_KEY =
  process.env.NEXT_PUBLIC_GRAPHQL_API_KEY || "da2-pq3dyfbcuncunjstmawmtz3req";

export async function serverGraphqlFetch<T>(
  query: string,
  variables?: Record<string, unknown>,
  revalidateSeconds = 3600,
): Promise<T | null> {
  try {
    const response = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
      },
      body: JSON.stringify({ query, variables }),
      next: { revalidate: revalidateSeconds },
    });

    if (!response.ok) return null;
    const json = (await response.json()) as { data?: T; errors?: unknown[] };
    if (json.errors?.length) return null;
    return json.data ?? null;
  } catch {
    return null;
  }
}

export type Localized = { zh?: string | null; en?: string | null } | null;

export function pickLocalized(value: Localized, preferZh = true): string {
  if (!value) return "";
  if (preferZh) return value.zh || value.en || "";
  return value.en || value.zh || "";
}
