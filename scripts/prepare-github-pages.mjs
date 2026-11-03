import { promises as fs } from "node:fs";
import path from "node:path";

const outputDir = path.resolve("out");
const siteBase = "/aigc-digital-marketing-demo/assets/";
const textExtensions = new Set([".html", ".js", ".css", ".txt"]);

async function visit(directory) {
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      await visit(fullPath);
      continue;
    }
    if (!textExtensions.has(path.extname(entry.name))) continue;

    const source = await fs.readFile(fullPath, "utf8");
    const updated = source
      .replaceAll('"/assets/', `"${siteBase}`)
      .replaceAll("'/assets/", `'${siteBase}`)
      .replaceAll("url(/assets/", `url(${siteBase}`);
    if (updated !== source) await fs.writeFile(fullPath, updated);
  }
}

await visit(outputDir);
await fs.writeFile(path.join(outputDir, ".nojekyll"), "");

