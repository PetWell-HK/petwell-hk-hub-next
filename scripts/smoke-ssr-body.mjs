const BASE = process.argv[2] || "http://localhost:3000";

function pick(html, re) {
  return (html.match(re) || [])[1] || "";
}

async function probe(path, extra = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "user-agent": "Mozilla/5.0 (compatible; Googlebot/2.1)" },
  });
  const html = await res.text();
  const h1 = pick(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i).replace(/<[^>]+>/g, "").trim();
  const result = {
    path,
    status: res.status,
    title: pick(html, /<title[^>]*>([^<]*)/i),
    h1,
    ...Object.fromEntries(
      Object.entries(extra).map(([k, fn]) => [k, fn(html, h1)]),
    ),
  };
  console.log(JSON.stringify(result, null, 2));
}

await probe("/restaurants/61b35dd2-221a-41cf-b8bc-e9cd115bc100", {
  hasName: (html) => html.includes("Two-and-a-Half"),
});
await probe("/restaurants/00000000-0000-0000-0000-000000000000");
await probe("/forum", {
  postLinks: (html) => (html.match(/href="\/forum\/[A-Za-z0-9\-_]+"/g) || []).length,
});
await probe("/forum/00000000-0000-0000-0000-000000000000");
await probe("/pet-activities", {
  eventLinks: (html) => (html.match(/href="\/event\/[A-Za-z0-9\-_]+"/g) || []).length,
});
await probe("/", {
  restaurantLinks: (html) => (html.match(/href="\/restaurants\/[A-Za-z0-9\-_]+"/g) || []).length,
  clinicLinks: (html) => (html.match(/href="\/clinics\/[A-Za-z0-9\-_]+"/g) || []).length,
  forumLinks: (html) => (html.match(/href="\/forum\/[A-Za-z0-9\-_]+"/g) || []).length,
  eventLinks: (html) => (html.match(/href="\/event\/[A-Za-z0-9\-_]+"/g) || []).length,
});
await probe("/restaurants", {
  cards: (html) => (html.match(/href="\/restaurants\/[A-Za-z0-9\-_]+"/g) || []).length,
});
await probe("/pet-friendly-restaurants/central-and-western", {
  cards: (html) => (html.match(/href="\/restaurants\/[A-Za-z0-9\-_]+"/g) || []).length,
});
await probe("/event/b4df8eb2-e4d7-4371-896a-f3cb4d98807d");
await probe("/ngos");
