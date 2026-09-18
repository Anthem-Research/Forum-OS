import { readdir, readFile } from "node:fs/promises";
import { extname, join } from "node:path";

const exportDirectory = join(process.cwd(), "out");
const searchableExtensions = new Set([".html", ".js", ".json", ".txt", ".xml"]);
const forbiddenMarkers = [
  "Deep Sea repository",
  "Player submarine",
  "The shark overshoots",
  "Follow behaviour",
  "forum_preview_actor",
  "Choose preview identity",
];

async function filesBelow(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? filesBelow(path) : [path];
  }));
  return nested.flat();
}

const files = (await filesBelow(exportDirectory)).filter((path) =>
  searchableExtensions.has(extname(path)),
);
const failures = [];

for (const path of files) {
  const contents = await readFile(path, "utf8");
  for (const marker of forbiddenMarkers) {
    if (contents.includes(marker)) failures.push(`${marker} in ${path}`);
  }
}

if (failures.length > 0) {
  throw new Error(`Private or preview-only material entered the public export:\n${failures.join("\n")}`);
}

console.log(`Verified ${files.length} public export files; no private seed markers found.`);
