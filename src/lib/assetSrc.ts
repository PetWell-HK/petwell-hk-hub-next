/** Normalize Vite-style string assets and Next StaticImageData. */
export function assetSrc(value: unknown): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object" && value !== null && "src" in value) {
    const src = (value as { src?: unknown }).src;
    if (typeof src === "string") return src;
  }
  return String(value);
}
