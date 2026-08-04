const BASE = process.argv[2] || "http://localhost:3000";

const sm = await fetch(`${BASE}/sitemap.xml`).then((r) => r.text());
const ids = [...sm.matchAll(/https:\/\/petwellhk\.com\/restaurants\/([A-Za-z0-9\-_]+)/g)].map((x) => x[1]);
console.log("restaurant ids in sitemap:", ids.length, ids.slice(0, 3));

if (ids[0]) {
  const html = await fetch(`${BASE}/restaurants/${ids[0]}`).then((r) => r.text());
  const title = (html.match(/<title[^>]*>([^<]*)/) || [])[1];
  const can =
    (html.match(/rel="canonical"[^>]*href="([^"]+)/) ||
      html.match(/href="([^"]+)"[^>]*rel="canonical"/) ||
      [])[1];
  console.log("detail status title:", title);
  console.log("detail canonical:", can);
  console.log(
    "server metadata looks entity-specific:",
    Boolean(title && !title.includes("18區") && can?.includes(ids[0])),
  );
}

const asset = JSON.parse(
  await import("node:fs").then((fs) =>
    fs.promises.readFile(new URL("../src/assets/blog-24hr-vet-clinic.png.asset.json", import.meta.url), "utf8"),
  ),
);
console.log("sample lovable asset url:", asset.url);
const assetStatus = await fetch(`${BASE}${asset.url}`).then((r) => r.status).catch((e) => `err ${e.message}`);
console.log("lovable asset fetch status:", assetStatus);

const unknown = await fetch(`${BASE}/this-route-should-404-xyz`);
console.log("unknown single-segment status:", unknown.status);
const unknownHtml = await unknown.text();
const unknownTitle = (unknownHtml.match(/<title[^>]*>([^<]*)/) || [])[1];
console.log("unknown title:", unknownTitle);

const double = (sm.match(/\/blog\/blog\//g) || []).length;
console.log("sitemap /blog/blog/ count:", double);

const home = await fetch(`${BASE}/`).then((r) => r.text());
const homeCan =
  (home.match(/rel="canonical"[^>]*href="([^"]+)/) ||
    home.match(/href="([^"]+)"[^>]*rel="canonical"/) ||
    [])[1];
console.log("home canonical:", homeCan);
