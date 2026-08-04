const res = await fetch("http://localhost:3000/this-route-should-404-xyz", {
  headers: { Accept: "text/html" },
});
const text = await res.text();
console.log("status", res.status);
console.log("headers", Object.fromEntries(res.headers.entries()));
for (const needle of [
  "Oops! Page not found",
  "文章不存在",
  "找不到頁面",
  "Return to Home",
  "PetWell",
  "digest",
  "NEXT_HTTP_ERROR",
]) {
  console.log(needle, text.includes(needle));
}
// Extract visible-ish text from body
const body = text.replace(/<script[\s\S]*?<\/script>/gi, " ");
const textOnly = body.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
console.log("textOnly snippet:", textOnly.slice(0, 400));
