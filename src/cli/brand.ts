import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { learnFromUrl, saveReference } from "../engine/learner.js";
import { getBrand, searchBrands, listBrands, detectBrandFromUrl } from "../engine/brand-loader.js";

export async function brandCommand(args: string[]) {
  const sub = args[0];

  if (sub === "list" || sub === "cache") {
    const brands = listBrands();
    console.log(JSON.stringify({ brands, count: brands.length, note: "使用 bwvi brand get <name> 查看详情，bwvi brand search <query> 搜索" }, null, 2));
    return;
  }

  if (sub === "get") {
    const name = args[1];
    if (!name) { console.error(JSON.stringify({ error: "用法: bwvi brand get <品牌名>" })); process.exit(1); }
    const brand = getBrand(name);
    if (!brand) { console.error(JSON.stringify({ error: `未找到品牌: ${name}`, available: listBrands().map(b => b.name) })); process.exit(1); }
    console.log(JSON.stringify(brand, null, 2));
    return;
  }

  if (sub === "search") {
    const query = args.slice(1).join(" ");
    if (!query) { console.error(JSON.stringify({ error: "用法: bwvi brand search <关键词>" })); process.exit(1); }
    const results = searchBrands(query);
    console.log(JSON.stringify({ query, results, count: results.length }, null, 2));
    return;
  }

  if (sub === "fetch" || sub === "learn") {
    const target = args[1];
    if (!target) { console.error(JSON.stringify({ error: "请提供品牌名或 URL" })); process.exit(1); }

    // If it looks like a URL
    if (target.startsWith("http://") || target.startsWith("https://")) {
      process.stderr.write(`Learning from URL: ${target}...\n`);
      const ref = await learnFromUrl(target);
      const projectDir = findProjectDir();
      if (projectDir) await saveReference(projectDir, ref);
      console.log(JSON.stringify({ source: target, status: "ok", colors: Object.keys(ref.tokens.colors).length, school: ref.detectedSchool }, null, 2));
      return;
    }

    // Try built-in brand first
    const brand = getBrand(target);
    if (brand) {
      const projectDir = findProjectDir();
      if (projectDir) {
        const brandDir = join(projectDir, ".bwvi", "brands");
        if (!existsSync(brandDir)) await mkdir(brandDir, { recursive: true });
        writeFileSync(join(brandDir, `${brand.name}.json`), JSON.stringify(brand, null, 2), "utf-8");
      }
      console.log(JSON.stringify({ brand: brand.name, status: "ok", source: "built-in", colors: brand.colors }, null, 2));
      return;
    }

    // Fallback: try web
    const url = "https://" + target + ".com";
    process.stderr.write(`Brand not in library, trying ${url}...\n`);
    const ref = await learnFromUrl(url);
    const projectDir = findProjectDir();
    if (projectDir) await saveReference(projectDir, ref);
    console.log(JSON.stringify({ brand: target, status: "ok", source: url, colors: Object.keys(ref.tokens.colors).length, school: ref.detectedSchool }, null, 2));
    return;
  }

  console.error(JSON.stringify({ error: "用法: bwvi brand <list|get|search|fetch|learn> [参数]" }));
  process.exit(1);
}

function findProjectDir() { var d = process.cwd(); for (var i = 0; i < 5; i++) { if (existsSync(join(d, ".bwvi"))) return d; var p = join(d, ".."); if (p === d) break; d = p; } return null; }
