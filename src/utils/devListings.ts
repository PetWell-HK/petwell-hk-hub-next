/** Dev listings are only visible in local development. */
export function shouldIncludeDevListings(): boolean {
  return process.env.NODE_ENV === "development";
}

export function isDevListing(value: unknown): boolean {
  return (
    value === true ||
    value === 1 ||
    value === "1" ||
    (typeof value === "string" && value.toLowerCase() === "true")
  );
}
