import type {
  PriceReviewDetailResponse,
  PriceReviewListResponse,
  PriceReviewQuery,
} from "@/types/priceReview";
import { PRICE_REVIEW_API_URL } from "@/config/priceReview";
import { getPublicEnv } from "@/lib/env";

/** Browser uses same-origin rewrite (see next.config) — Lambda CORS blocks Next localhost ports. */
const BROWSER_PROXY_BASE = "/api/price-review";

function getApiBase() {
  if (typeof window !== "undefined") {
    return BROWSER_PROXY_BASE;
  }
  const apiUrl = getPublicEnv("VITE_PRICE_REVIEW_API_URL") || PRICE_REVIEW_API_URL;
  return apiUrl.replace(/\/$/, "");
}

export async function listPriceReviewProducts(query: PriceReviewQuery = {}): Promise<PriceReviewListResponse> {
  const params = new URLSearchParams();
  if (query.search) params.set("search", query.search);
  if (query.category && query.category !== "all") params.set("category", query.category);
  if (query.brand && query.brand !== "all") params.set("brand", query.brand);
  if (query.limit) params.set("limit", String(query.limit));
  if (query.cursor) params.set("cursor", query.cursor);
  if (query.ids?.length) params.set("ids", query.ids.join(","));

  return request<PriceReviewListResponse>(`/products?${params.toString()}`);
}

export async function getPriceReviewProduct(productId: string): Promise<PriceReviewDetailResponse> {
  return request<PriceReviewDetailResponse>(`/products/${encodeURIComponent(productId)}`);
}

export async function listPriceReviewBrandProducts(brand: string): Promise<PriceReviewListResponse> {
  return listPriceReviewProducts({ brand, limit: 60 });
}

async function request<T>(path: string): Promise<T> {
  const response = await fetch(`${getApiBase()}${path}`, {
    headers: {
      accept: "application/json",
    },
  });

  if (!response.ok) {
    let message = `Price API request failed (${response.status})`;
    try {
      const body = await response.json();
      if (body?.message) message = body.message;
    } catch {
      // ignore non-JSON error bodies
    }
    throw new Error(message);
  }

  return response.json() as Promise<T>;
}
