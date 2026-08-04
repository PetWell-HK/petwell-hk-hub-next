#!/usr/bin/env node
/**
 * Smoke tests for petwell-hk-hub-next production server.
 * Usage: node scripts/smoke-next.mjs [baseUrl]
 */
const BASE = process.argv[2] || "http://localhost:3000";

const results = [];

function record(name, ok, detail = "") {
  results.push({ name, ok, detail });
  const mark = ok ? "PASS" : "FAIL";
  console.log(`${mark}  ${name}${detail ? ` — ${detail}` : ""}`);
}

async function fetchText(path, opts = {}) {
  const url = `${BASE}${path}`;
  const res = await fetch(url, {
    redirect: opts.redirect || "manual",
    headers: { "user-agent": opts.ua || "PetWellSmoke/1.0" },
  });
  const text = opts.skipBody ? "" : await res.text();
  return { res, text, url };
}

function hasMeta(html, attr, value) {
  const re = new RegExp(
    `<meta[^>]+(?:name|property)=["']${attr}["'][^>]+content=["']([^"']*)["']|<meta[^>]+content=["']([^"']*)["'][^>]+(?:name|property)=["']${attr}["']`,
    "i",
  );
  const m = html.match(re);
  if (!m) return { found: false, content: null };
  const content = m[1] || m[2] || null;
  if (value == null) return { found: true, content };
  return { found: content?.includes(value) ?? false, content };
}

function hasCanonical(html, expectedPath) {
  const m = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i)
    || html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/i);
  if (!m) return { found: false, href: null, ok: false };
  const href = m[1];
  const ok = expectedPath ? href.endsWith(expectedPath) || href.includes(expectedPath) : true;
  return { found: true, href, ok };
}

async function expectStatus(path, status, name = path) {
  try {
    const { res } = await fetchText(path, { skipBody: true });
    record(name, res.status === status, `status=${res.status}`);
    return res;
  } catch (e) {
    record(name, false, String(e.message || e));
    return null;
  }
}

async function expectRedirect(path, toIncludes, name = path) {
  try {
    const { res } = await fetchText(path);
    const loc = res.headers.get("location") || "";
    const ok = [301, 302, 307, 308].includes(res.status) && loc.includes(toIncludes);
    record(name, ok, `status=${res.status} location=${loc}`);
  } catch (e) {
    record(name, false, String(e.message || e));
  }
}

async function expectHtml(path, checks, name = path) {
  try {
    const { res, text } = await fetchText(path);
    if (res.status !== 200) {
      record(name, false, `status=${res.status}`);
      return;
    }
    const failures = [];
    for (const check of checks) {
      if (check.type === "title") {
        const m = text.match(/<title[^>]*>([^<]*)<\/title>/i);
        if (!m || (check.includes && !m[1].includes(check.includes))) {
          failures.push(`title=${m?.[1] || "missing"}`);
        }
      }
      if (check.type === "canonical") {
        const c = hasCanonical(text, check.path);
        if (!c.ok) failures.push(`canonical=${c.href || "missing"}`);
      }
      if (check.type === "meta") {
        const m = hasMeta(text, check.attr, check.includes);
        if (!m.found || (check.includes && !m.content?.includes(check.includes))) {
          failures.push(`${check.attr}=${m.content || "missing"}`);
        }
      }
      if (check.type === "contains") {
        if (!text.includes(check.value)) failures.push(`missing:${check.value.slice(0, 40)}`);
      }
      if (check.type === "notContains") {
        if (text.includes(check.value)) failures.push(`unexpected:${check.value.slice(0, 40)}`);
      }
      if (check.type === "jsonld") {
        if (!text.includes('application/ld+json')) failures.push("no-jsonld");
      }
    }
    record(name, failures.length === 0, failures.join("; ") || "ok");
  } catch (e) {
    record(name, false, String(e.message || e));
  }
}

async function main() {
  console.log(`Smoke testing ${BASE}\n`);

  // Health / core pages
  const coreRoutes = [
    "/",
    "/restaurants",
    "/clinics",
    "/salons",
    "/lodging",
    "/malls",
    "/forum",
    "/review",
    "/nutrition",
    "/nametag",
    "/about",
    "/owner-zone",
    "/pet-activities",
    "/ngos",
    "/other-services",
    "/rainy-day-pet-friendly-indoor-hong-kong",
    "/blog/hong-kong-dog-trainer-licence-guide",
    "/anti-lost-dog-tag-hk",
    "/pet-matchmaker",
    "/download",
  ];

  for (const path of coreRoutes) {
    await expectStatus(path, 200, `GET ${path}`);
  }

  // Auth/private should still respond 200 (UI) but be noindex ideally
  await expectStatus("/signup-login", 200, "GET /signup-login");
  await expectStatus("/wishlist", 200, "GET /wishlist");

  // Redirects
  await expectRedirect("/food-score", "/nutrition", "redirect /food-score");
  await expectRedirect("/merchant", "/other-services", "redirect /merchant");
  await expectRedirect("/chong-wu-you-shan-can-ting", "/restaurants", "redirect chinese restaurants alias");
  await expectRedirect("/blog/pet-friendly-shopping-malls-hk-2025", "/rainy-day-pet-friendly-indoor-hong-kong", "redirect malls blog");

  // SEO: home
  await expectHtml("/", [
    { type: "title", includes: "PetWell" },
    { type: "canonical", path: "petwellhk.com" },
    { type: "meta", attr: "description" },
    { type: "jsonld" },
    { type: "contains", value: "ld-organization" },
  ], "SEO home metadata");

  // SEO: restaurants listing
  await expectHtml("/restaurants", [
    { type: "title", includes: "餐廳" },
    { type: "canonical", path: "/restaurants" },
    { type: "meta", attr: "description" },
  ], "SEO restaurants listing");

  // SEO: robots
  {
    const { res, text } = await fetchText("/robots.txt");
    const ok = res.status === 200 && text.includes("Sitemap:") && text.includes("Disallow:");
    record("GET /robots.txt", ok, `len=${text.length}`);
    // Critical: no Googlebot-specific Allow:/ that overrides * disallows
    const hasGooglebotOverride =
      /User-agent:\s*Googlebot\b/i.test(text) &&
      /User-agent:\s*Googlebot[\s\S]*?Allow:\s*\/\s*(?:\n|$)/i.test(text);
    const starHasDisallow = /User-agent:\s*\*[\s\S]*?Disallow:\s*\/auth/i.test(text);
    record(
      "SEO robots Googlebot inherits sensitive disallows",
      !hasGooglebotOverride && starHasDisallow,
      hasGooglebotOverride
        ? "Googlebot has Allow:/ without Disallow — overrides * rules"
        : starHasDisallow
          ? "ok"
          : "missing * Disallow /auth",
    );
  }

  // SEO: sitemap
  {
    const { res, text } = await fetchText("/sitemap.xml");
    const ok = res.status === 200 && text.includes("<urlset") && text.includes("petwellhk.com");
    record("GET /sitemap.xml", ok, `status=${res.status} urls≈${(text.match(/<url>/g) || []).length}`);
    const badBlog = text.includes("/blog/blog/");
    record("SEO sitemap no /blog/blog/ double prefix", !badBlog, badBlog ? "found /blog/blog/" : "ok");
  }

  // Advertised sitemaps in robots
  for (const path of [
    "/sitemap-index.xml",
    "/restaurant-sitemap.xml",
    "/clinic-sitemap.xml",
    "/salon-sitemap.xml",
    "/lodging-sitemap.xml",
    "/price-sitemap.xml",
  ]) {
    const { res } = await fetchText(path, { skipBody: true });
    // public/ copies may exist — either 200 or we flag missing if robots advertises them
    record(
      `Advertised sitemap ${path}`,
      res.status === 200,
      `status=${res.status}`,
    );
  }

  // Duplicate restaurant listing should redirect
  await expectRedirect("/restaurant", "/restaurants", "redirect /restaurant -> /restaurants");

  // Client-only detail metadata inheritance check (forum post fake id)
  await expectHtml("/forum/does-not-exist-smoke", [
    { type: "canonical", path: "/forum" }, // currently inherits listing — document as bug if unfixed
  ], "SEO forum detail currently inherits /forum canonical (known gap)");

  // 404
  await expectStatus("/this-route-should-404-xyz", 404, "GET unknown 404");

  // Lovable assets must resolve (vendored under public/__l5e)
  {
    const assetPath =
      "/__l5e/assets-v1/45a55142-e3d3-4785-9e7b-837ed8ea75d1/blog-24hr-vet-clinic.png";
    const { res } = await fetchText(assetPath, { skipBody: true });
    record("Lovable asset served", res.status === 200, `status=${res.status}`);
  }

  // Dynamic sitemap should include restaurant detail URLs
  {
    const { text } = await fetchText("/sitemap.xml");
    const hasRestaurantIds = /\/restaurants\/[A-Za-z0-9\-]{10,}/.test(text);
    record(
      "Dynamic sitemap includes restaurant detail URLs",
      hasRestaurantIds,
      hasRestaurantIds ? "ok" : "no /restaurants/{id} entries",
    );
  }

  // Security headers
  {
    const { res } = await fetchText("/", { skipBody: true });
    const nosniff = res.headers.get("x-content-type-options");
    record("Header X-Content-Type-Options", nosniff === "nosniff", `value=${nosniff}`);
  }

  const failed = results.filter((r) => !r.ok);
  const passed = results.filter((r) => r.ok);
  console.log(`\n——— Summary: ${passed.length} passed, ${failed.length} failed, ${results.length} total ———`);
  if (failed.length) {
    console.log("\nFailures:");
    for (const f of failed) console.log(` - ${f.name}: ${f.detail}`);
  }
  process.exit(failed.length ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(2);
});
