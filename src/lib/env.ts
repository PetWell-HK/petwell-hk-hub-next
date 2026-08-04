/**
 * Cross-runtime env access for Vite → Next migration.
 * Prefer NEXT_PUBLIC_* in Next.js; fall back to VITE_* for parity.
 */
export function getPublicEnv(name: string): string | undefined {
  const nextName = name.startsWith("VITE_")
    ? `NEXT_PUBLIC_${name.slice("VITE_".length)}`
    : name.startsWith("NEXT_PUBLIC_")
      ? name
      : `NEXT_PUBLIC_${name}`;

  const viteName = name.startsWith("VITE_")
    ? name
    : name.startsWith("NEXT_PUBLIC_")
      ? `VITE_${name.slice("NEXT_PUBLIC_".length)}`
      : `VITE_${name}`;

  if (typeof process !== "undefined" && process.env) {
    const fromNext = process.env[nextName] ?? process.env[viteName] ?? process.env[name];
    if (fromNext) return fromNext;
  }

  try {
    // Vite-style access (kept for shared code paths during migration)
    const meta = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env;
    if (meta) {
      return meta[viteName] ?? meta[nextName] ?? meta[name];
    }
  } catch {
    // ignore
  }

  return undefined;
}
