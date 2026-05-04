import { learnFromUrl, saveReference } from "../engine/learner.js";
import { existsSync } from "node:fs";
import { join } from "node:path";

export async function assetCommand(args: string[]) {
  const sub = args[0]; // "logo" or "color"
  const brand = args.slice(1).join(" ");

  if (!sub || !brand) {
    console.error(JSON.stringify({ error: "用法: bwvi asset <logo|color> <品牌名>", code: "USAGE" }));
    process.exit(1);
  }

  // Try common URL patterns for brand
  const urls = [
    `https://${brand.toLowerCase().replace(/\s+/g, "")}.com`,
    `https://www.${brand.toLowerCase().replace(/\s+/g, "")}.com`,
  ];

  let result = null;
  let usedUrl = "";

  for (const url of urls) {
    try {
      process.stderr.write(`搜索 ${url}...\n`);
      result = await learnFromUrl(url);
      usedUrl = url;
      if (Object.keys(result.tokens.colors).length > 0) break;
    } catch {}
  }

  if (!result) {
    console.log(JSON.stringify({
      status: "not_found",
      brand,
      message: `无法获取 ${brand} 的品牌信息，请确认网址或手动提供色值`,
    }, null, 2));
    return;
  }

  const projectDir = findProjectDir();
  if (projectDir) {
    await saveReference(projectDir, result);
  }

  const output: any = {
    status: "ok",
    brand,
    source: usedUrl,
    title: result.title,
    detected_school: result.detectedSchool,
    colors: {},
  };

  // Extract most relevant colors
  const entries = Object.entries(result.tokens.colors).slice(0, 8);
  const hexColors: string[] = [];
  for (const [name, val] of entries) {
    if (/^#[\da-f]{6}$/i.test(val)) {
      hexColors.push(val);
      output.colors[name] = val;
    }
  }

  if (sub === "color") {
    // Just output colors as an array for easy use
    console.log(JSON.stringify({
      status: "ok",
      brand,
      colors: hexColors.slice(0, 5),
      source: usedUrl,
      confidence: result.confidence,
      saved_to: projectDir ? `.bwvi/references/` : null,
    }, null, 2));
    return;
  }

  // "logo" mode — also include fonts
  const fonts = result.tokens.typography;
  output.typography = {
    display: fonts.display || "未检测到",
    body: fonts.body || "未检测到",
    google_fonts: fonts.googleFonts,
  };
  output.confidence = result.confidence;
  output.tags = result.tags;
  if (projectDir) output.saved_to = `.bwvi/references/`;

  console.log(JSON.stringify(output, null, 2));
}

function findProjectDir(): string | null {
  let dir = process.cwd();
  for (let i = 0; i < 5; i++) {
    if (existsSync(join(dir, ".bwvi"))) return dir;
    const p = join(dir, "..");
    if (p === dir) break;
    dir = p;
  }
  return null;
}
