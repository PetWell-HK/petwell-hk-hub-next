const BASE = "http://localhost:3000";
const id = "a9e11efb-1ae5-4b69-b8d9-a0cc53c786a1";
const res = await fetch(`${BASE}/restaurants/${id}`);
const html = await res.text();
const title = (html.match(/<title[^>]*>([^<]*)/) || [])[1];
const can =
  (html.match(/rel="canonical"[^>]*href="([^"]+)/) ||
    html.match(/href="([^"]+)"[^>]*rel="canonical"/) ||
    [])[1];
const desc =
  (html.match(/name="description"[^>]*content="([^"]*)"/) ||
    html.match(/content="([^"]*)"[^>]*name="description"/) ||
    [])[1];
console.log({ status: res.status, title, can, desc: desc?.slice(0, 120) });
console.log(
  "entity-specific metadata:",
  Boolean(title?.includes("Cafe") || title?.includes("Bonheur") || (can && can.includes(id))),
);
