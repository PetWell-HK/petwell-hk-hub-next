/** ISR listing indexes whose Flight restore is unsafe on Back (Next #412). */
const DOCUMENT_NAV_INDEXES = new Set([
  "/",
  "/restaurants",
  "/restaurant",
  "/pet-friendly-restaurants-hk",
  "/clinics",
  "/salons",
  "/lodging",
  "/malls",
  "/home-visits",
  "/forum",
  "/pet-activities",
  "/other-services",
]);

export function hrefPathname(href: string): string {
  const path = href.split("?")[0].split("#")[0];
  if (path !== "/" && path.endsWith("/")) return path.slice(0, -1);
  return path || "/";
}

export function shouldDocumentNavigate(href: string): boolean {
  return DOCUMENT_NAV_INDEXES.has(hrefPathname(href));
}

export function documentNavigate(href: string, replace?: boolean): void {
  if (replace) window.location.replace(href);
  else window.location.assign(href);
}
