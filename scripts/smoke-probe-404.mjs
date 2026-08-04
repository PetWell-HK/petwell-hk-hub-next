const res = await fetch("http://localhost:3000/this-route-should-404-xyz");
const text = await res.text();
console.log("status", res.status);
console.log("title", (text.match(/<title[^>]*>([^<]*)/) || [])[1]);
console.log("body has 404 heading", /<h1[^>]*>\s*404\s*<\/h1>/i.test(text));
console.log("body has 文章不存在", text.includes("文章不存在"));
console.log("body has 找不到頁面 meta path", text.includes("找不到頁面"));
console.log("x-matched-path", res.headers.get("x-matched-path"));
console.log("x-nextjs-action", res.headers.get("x-nextjs-action"));
