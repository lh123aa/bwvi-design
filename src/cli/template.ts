import { readFileSync, readdirSync, writeFileSync, existsSync, mkdirSync, unlinkSync } from "node:fs";
import { join } from "node:path";

export async function templateCommand(args: string[]) {
  const sub = args[0];
  const pd = findProjectDir();
  const dir = pd ? join(pd, ".bwvi", "templates") : null;
  

  if (sub === "list" || !sub) {
    const items: { name: string; source: string }[] = [];
    // Built-in directions as templates
    for (const d of ["editorial-monocle", "warm-minimal", "tech-utility", "dark-luxury", "playful-color"]) {
      items.push({ name: d, source: "built-in" });
    }
    // User templates
    if (dir && existsSync(dir)) {
      try {
        readdirSync(dir).filter(f => f.endsWith(".json")).forEach(f => {
          items.push({ name: f.replace(/\.json$/, ""), source: "project" });
        });
      } catch {}
    }
    console.log(JSON.stringify({ templates: items, count: items.length }, null, 2));
    return;
  }

  if (sub === "use") {
    const name = args[1];
    if (!name) { console.error(JSON.stringify({ error: "Usage: template use <name>" })); process.exit(1); }
    // Generate from built-in direction
    const palette = getPalette(name);
    if (!palette) { console.error(JSON.stringify({ error: "Unknown template: " + name })); process.exit(1); }
    const { buildPage } = await import("../engine/page-builder.js");
    const html = buildPage({ task: "Template: " + name, direction: name }).html;
    const outPath = join(process.cwd(), name + ".html");
    writeFileSync(outPath, html, "utf-8");
    console.log(JSON.stringify({ status: "ok", template: name, file: outPath }, null, 2));
    return;
  }

  if (sub === "delete") {
    const name = args[1];
    if (!name || !dir) { console.error(JSON.stringify({ error: "Usage: template delete <name>" })); process.exit(1); }
    const fp = join(dir, name + ".json");
    if (!existsSync(fp)) { console.error(JSON.stringify({ error: "Template not found: " + name })); process.exit(1); }
    unlinkSync(fp);
    console.log(JSON.stringify({ status: "ok", deleted: name }, null, 2));
    return;
  }

  console.error(JSON.stringify({ error: "Usage: template <list|use|delete>" }));
  process.exit(1);
}

function getPalette(name: string): { primary: string; accent: string; surface: string; text: string } | null {
  const palettes: Record<string, { primary: string; accent: string; surface: string; text: string }> = {
    "editorial-monocle": { primary: "#1A1A2E", accent: "#C44536", surface: "#FAF8F5", text: "#2D2D2D" },
    "warm-minimal": { primary: "#D97757", accent: "#8C6E5D", surface: "#FDF8F5", text: "#3D3D3D" },
    "tech-utility": { primary: "#1E1E2E", accent: "#00E698", surface: "#FAFBFC", text: "#24292E" },
    "dark-luxury": { primary: "#0D0D0D", accent: "#C9A84C", surface: "#1A1A1A", text: "#E8E8E8" },
    "playful-color": { primary: "#FF6B6B", accent: "#4ECDC4", surface: "#FFF8F0", text: "#2C3E50" },
  };
  return palettes[name] || null;
}

function findProjectDir(): string | null {
  let d = process.cwd();
  for (let i = 0; i < 5; i++) {
    if (existsSync(join(d, ".bwvi"))) return d;
    const p = join(d, "..");
    if (p === d) break;
    d = p;
  }
  return null;
}
