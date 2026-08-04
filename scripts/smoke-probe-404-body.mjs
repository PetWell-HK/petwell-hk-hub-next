const res = await fetch("http://localhost:3000/this-route-should-404-xyz");
const text = await res.text();
const main = text.match(/<main[\s\S]{0,2000}/i)?.[0] || text.slice(0, 2000);
console.log("status", res.status);
console.log("--- main/body snippet ---");
console.log(main.replace(/\s+/g, " ").slice(0, 1200));
console.log("--- robots meta ---");
const robots = text.match(/name="robots"[^>]*>/i) || text.match(/content="[^"]*noindex[^"]*"[^>]*name="robots"/i);
console.log(robots?.[0]);
