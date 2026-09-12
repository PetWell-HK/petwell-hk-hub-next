import { getPublicEnv } from "@/lib/env";

const PROD_PETWELL_API_URL = "https://api.petwellhk.com";
const DEFAULT_DEV_PETWELL_API_URL = "http://127.0.0.1:3457";
const HEALTH_TIMEOUT_MS = 1200;

function stripSlash(url: string): string {
  return String(url || "").trim().replace(/\/$/, "");
}

function isLocalApiUrl(url: string): boolean {
  return /localhost|127\.0\.0\.1|10\.0\.2\.2/i.test(url);
}

function isDevRuntime(): boolean {
  return process.env.NODE_ENV !== "production";
}

function getProdPetwellApiUrl(): string {
  const fromEnv = stripSlash(
    getPublicEnv("VITE_PETWELL_API_URL") || process.env.PETWELL_API_URL || "",
  );
  if (fromEnv && !isLocalApiUrl(fromEnv)) return fromEnv;
  return PROD_PETWELL_API_URL;
}

function getDevPetwellApiUrl(): string {
  const fromEnv = stripSlash(
    getPublicEnv("VITE_PETWELL_API_URL_DEV") || process.env.PETWELL_API_URL_DEV || "",
  );
  if (fromEnv) return fromEnv;
  const legacy = stripSlash(
    getPublicEnv("VITE_PETWELL_API_URL") || process.env.PETWELL_API_URL || "",
  );
  if (legacy && isLocalApiUrl(legacy)) return legacy;
  return DEFAULT_DEV_PETWELL_API_URL;
}

async function isPetwellApiReachable(base: string): Promise<boolean> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), HEALTH_TIMEOUT_MS);
  try {
    const res = await fetch(`${base}/api/health`, {
      method: "GET",
      signal: controller.signal,
      cache: "no-store",
    });
    if (!res.ok) return false;
    const json = (await res.json().catch(() => ({}))) as { ok?: boolean; service?: string };
    return json.ok === true || json.service === "petwell-api";
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

let resolvedDevBasePromise: Promise<string> | null = null;

export async function getPetwellApiBase(): Promise<string> {
  const prod = getProdPetwellApiUrl();
  if (!isDevRuntime()) return prod;
  if (!resolvedDevBasePromise) {
    resolvedDevBasePromise = (async () => {
      const dev = getDevPetwellApiUrl();
      if (dev && (await isPetwellApiReachable(dev))) return dev;
      console.warn(`[forum] Local petwell-api not reachable at ${dev}; using ${prod}`);
      return prod;
    })();
  }
  return resolvedDevBasePromise;
}
