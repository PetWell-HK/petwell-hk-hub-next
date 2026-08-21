import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const RSC_VARY =
  "RSC, Next-Router-Prefetch, Next-Router-Segment-Prefetch, Next-Router-State-Tree, Next-Url";

function isRscRequest(request: NextRequest): boolean {
  if (request.nextUrl.searchParams.has("_rsc")) return true;
  const rsc = request.headers.get("rsc") ?? request.headers.get("RSC");
  return rsc === "1";
}

export function proxy(request: NextRequest) {
  const url = request.nextUrl.clone();
  if (url.pathname !== "/" && url.pathname.endsWith("/")) {
    url.pathname = url.pathname.slice(0, -1);
    return NextResponse.redirect(url, 308);
  }

  const response = NextResponse.next();
  response.headers.append("Vary", RSC_VARY);

  // Prefetch / client navigation Flight payloads must not share the HTML ISR
  // cache. A CDN 304 on pathname-only `/page` makes Next consume HTML (or a
  // partial prefetch) as a full RSC body → "This page couldn't load".
  if (isRscRequest(request)) {
    response.headers.set(
      "Cache-Control",
      "private, no-cache, no-store, max-age=0, must-revalidate",
    );
    response.headers.set("CDN-Cache-Control", "private, no-store");
    response.headers.set("Vercel-CDN-Cache-Control", "private, no-store");
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map|woff2?)$).*)",
  ],
};
