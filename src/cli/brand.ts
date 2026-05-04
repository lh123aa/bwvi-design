import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { learnFromUrl, saveReference } from "../engine/learner.js";

const KNOWN_BRANDS: Record<string, string> = {
  linear: "https://linear.app",
  stripe: "https://stripe.com",
  vercel: "https://vercel.com",
  notion: "https://notion.so",
  apple: "https://apple.com",
  github: "https://github.com",
  figma: "https://figma.com",
};

export async function brandCommand(args: string[]) {
  const sub = args[0];

  if (sub === "cache" || sub === "list") {
    const cached = Object.keys(KNOWN_BRANDS);
    console.log(JSON.stringify({ cached, count: cached.length, note: "Phase 2: 按需从官网抓取，后续版本支持离线缓存" }, null, 2));
    return;
  }

  if (sub === "fetch") {
    const brandName = args[1];
    if (!brandName) { console.error(JSON.stringify({ error: "请提供品牌名" })); process.exit(1); }
    const url = KNOWN_BRANDS[brandName] || "https://" + brandName + ".com";
    process.stderr.write("Fetching " + url + "...\n");
    const ref = await learnFromUrl(url);
    const projectDir = findProjectDir();
    if (projectDir) await saveReference(projectDir, ref);
    console.log(JSON.stringify({ brand: brandName, status: "ok", source: url, colors: Object.keys(ref.tokens.colors).length, school: ref.detectedSchool }, null, 2));
    return;
  }

  console.error(JSON.stringify({ error: "用法: bwvi brand <cache|fetch> [品牌名]" }));
  process.exit(1);
}
function findProjectDir() { var d = process.cwd(); for (var i = 0; i < 5; i++) { if (existsSync(join(d, ".bwvi"))) return d; var p = join(d, ".."); if (p === d) break; d = p; } return null; }