import fs from "node:fs";
import path from "node:path";

const roots = [
  "e:\\Tim\\Work\\PetWell\\petwell",
  "e:\\Tim\\Work\\PetWell\\petwell-admin-hub",
  "e:\\Tim\\Work\\PetWell\\petwell-hk-hub",
  "e:\\Tim\\Work\\PetWell\\petwell-hk-hub-next",
  "e:\\Tim\\Work\\PetWell\\petwell-partner-hub",
  "c:\\Users\\Tim\\Work\\PetWell\\petwell-data-agent",
  "c:\\Users\\Tim\\Work\\PetWell\\petwell-volunteer-hub"
];

// Regex for common UTF-8 misinterpreted as windows-1252 / ISO-8859-1
const mojibakeRegex = /(?:[åæçèéäãï][\u0080-\u00FF\u2018-\u2026\u2013\u2014\u02C6\u2030\u0160\u2039\u0152\u017D\u02DC\u2122\u0161\u203A\u0153\u017E\u0178\u20AC\u201A\u201E\u2022]{2,}|ðŸ[\u0080-\u00FF\u2018-\u2026\u2013\u2014\u02C6\u2030\u0160\u2039\u0152\u017D\u02DC\u2122\u0161\u203A\u0153\u017E\u0178\u20AC\u201A\u201E\u2022]{2}|â[€”–•˜™œš›žŸ]{1,3}|â”€|\uFFFD)/g;

function scanDir(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (["node_modules", ".git", ".next", "dist", "build", ".amplify"].includes(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      scanDir(fullPath, fileList);
    } else if (/\.(js|jsx|ts|tsx|mjs|cjs|json|html|css|md|txt)$/i.test(entry.name)) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

for (const root of roots) {
  const files = scanDir(root);
  const matched = [];
  for (const file of files) {
    if (file.endsWith("scan-mojibake.mjs")) continue;
    try {
      const content = fs.readFileSync(file, "utf8");
      const matches = content.match(mojibakeRegex);
      if (matches && matches.length > 0) {
        matched.push({ file, count: matches.length, samples: matches.slice(0, 5) });
      }
    } catch (e) {}
  }
  console.log(`\n=== Root: ${root} (${matched.length} files with mojibake) ===`);
  for (const m of matched) {
    console.log(`  - ${path.relative(root, m.file)} (${m.count} matches): ${m.samples.join(", ")}`);
  }
}
