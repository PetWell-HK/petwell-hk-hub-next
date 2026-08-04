import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const assetsRoot = path.join(root, "src", "assets");
const publicRoot = path.join(root, "public");
const ORIGIN = process.env.L5E_ORIGIN || "https://petwellhk.com";

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(full)));
    else if (entry.name.endsWith(".asset.json")) files.push(full);
  }
  return files;
}

const jsonFiles = await walk(assetsRoot);
let ok = 0;
let fail = 0;

for (const jsonPath of jsonFiles) {
  const meta = JSON.parse(await fs.readFile(jsonPath, "utf8"));
  const urlPath = meta.url;
  if (!urlPath?.startsWith("/__l5e/")) {
    console.log("skip (no l5e url)", path.relative(root, jsonPath));
    continue;
  }
  const outFile = path.join(publicRoot, ...urlPath.split("/").filter(Boolean));
  await fs.mkdir(path.dirname(outFile), { recursive: true });

  try {
    const res = await fetch(`${ORIGIN}${urlPath}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    await fs.writeFile(outFile, buf);
    ok += 1;
    console.log("ok", urlPath, `(${buf.length} bytes)`);
  } catch (e) {
    fail += 1;
    console.error("fail", urlPath, e.message || e);
  }
}

console.log(`\nVendored ${ok} assets, ${fail} failed`);
process.exit(fail ? 1 : 0);
