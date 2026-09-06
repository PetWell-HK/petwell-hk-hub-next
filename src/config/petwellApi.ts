import { getPublicEnv } from "@/lib/env";

export function getPetwellApiBase(): string {
  const fromEnv = (
    getPublicEnv("VITE_PETWELL_API_URL") ||
    process.env.PETWELL_API_URL ||
    ""
  ).replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  if (process.env.NODE_ENV !== "production") return "http://127.0.0.1:3457";
  throw new Error("NEXT_PUBLIC_PETWELL_API_URL / VITE_PETWELL_API_URL is not set");
}
