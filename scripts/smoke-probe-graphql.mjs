const ENDPOINT =
  "https://zzqlfjlslncu7kjjqkdedp7uwu.appsync-api.ap-southeast-1.amazonaws.com/graphql";
const API_KEY = "da2-pq3dyfbcuncunjstmawmtz3req";

const query = `
  query DynamoRestaurantSearch($location: LocationInput!, $limit: Int, $sortMethod: String, $verified: Boolean) {
    dynamoRestaurantSearch(location: $location, limit: $limit, sortMethod: $sortMethod, verified: $verified) {
      items { id name { zh } }
    }
  }
`;

const res = await fetch(ENDPOINT, {
  method: "POST",
  headers: { "Content-Type": "application/json", "x-api-key": API_KEY },
  body: JSON.stringify({
    query,
    variables: {
      location: { lat: 22.3193, lon: 114.1694 },
      limit: 5,
      sortMethod: "DISTANCE",
      verified: true,
    },
  }),
});
const json = await res.json();
console.log("status", res.status);
console.log(JSON.stringify(json, null, 2).slice(0, 1500));

const sm = await fetch("http://localhost:3000/sitemap.xml").then((r) => r.text());
console.log("sitemap url count", (sm.match(/<url>/g) || []).length);
console.log("has restaurants/", sm.includes("/restaurants/"));
console.log(
  "blog urls sample",
  [...sm.matchAll(/<loc>([^<]*blog[^<]*)<\/loc>/g)].slice(0, 5).map((m) => m[1]),
);
