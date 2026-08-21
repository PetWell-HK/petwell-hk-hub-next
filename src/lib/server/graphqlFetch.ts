const ENDPOINT =
  process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT ||
  "https://zzqlfjlslncu7kjjqkdedp7uwu.appsync-api.ap-southeast-1.amazonaws.com/graphql";

const API_KEY =
  process.env.NEXT_PUBLIC_GRAPHQL_API_KEY || "da2-pq3dyfbcuncunjstmawmtz3req";

export type GraphqlEnvelope<T> = {
  data: T | null;
  errors: unknown[] | null;
  transportOk: boolean;
};

export async function serverGraphqlFetchEnvelope<T>(
  query: string,
  variables?: Record<string, unknown>,
  revalidateSeconds = 3600,
): Promise<GraphqlEnvelope<T>> {
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

    if (!response.ok) return { data: null, errors: null, transportOk: false };
    const json = (await response.json()) as { data?: T | null; errors?: unknown[] };
    if (json.data == null) return { data: null, errors: json.errors ?? null, transportOk: false };
    return {
      data: json.data,
      errors: json.errors ?? null,
      transportOk: true,
    };
  } catch {
    return { data: null, errors: null, transportOk: false };
  }
}

export async function serverGraphqlFetch<T>(
  query: string,
  variables?: Record<string, unknown>,
  revalidateSeconds = 3600,
): Promise<T | null> {
  const envelope = await serverGraphqlFetchEnvelope<T>(query, variables, revalidateSeconds);
  return envelope.data;
}

export type Localized = { zh?: string | null; en?: string | null } | null;

export function pickLocalized(value: Localized, preferZh = true): string {
  if (!value) return "";
  if (preferZh) return value.zh || value.en || "";
  return value.en || value.zh || "";
}
