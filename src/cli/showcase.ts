import { existsSync } from "node:fs";
import { join } from "node:path";
import { CheckpointManager } from "../checkpoint/manager.js";
import { generateDirectHtml } from "./generate.js";
import { writeFileSync } from "node:fs";

const SHOWCASES = [
  {
    id: "landing-editorial",
    label: "产品落地页 · 编辑式克制",
    desc: "深蓝底色、暖红 accent、衬线 display、编辑式排版",
    direction: "editorial-monocle",
    palette: { primary: "#1A1A2E", accent: "#C44536", surface: "#FAF8F5", text: "#2D2D2D" },
    color: ["#1A1A2E", "#C44536", "#FAF8F5"],
  },
  {
    id: "landing-warm",
    label: "产品落地页 · 温暖极简",
    desc: "暖橙底色、棕褐 accent、米白基底、自然材质感",
    direction: "warm-minimal",
    palette: { primary: "#D97757", accent: "#8C6E5D", surface: "#FDF8F5", text: "#3D3D3D" },
    color: ["#D97757", "#8C6E5D", "#FDF8F5"],
  },
  {
    id: "landing-dark",
    label: "产品落地页 · 深色科技",
    desc: "暗色基底、绿 accent、科技感、数据驱动",
    direction: "dark-luxury",
    palette: { primary: "#0D0D0D", accent: "#00E698", surface: "#1A1A1A", text: "#E8E8E8" },
    color: ["#0D0D0D", "#00E698", "#1A1A1A"],
  },
  {
    id: "dashboard-clean",
    label: "Dashboard · 简洁数据",
    desc: "左导航栏、KPI 卡片、数据表格、中性色调",
    direction: "tech-utility",
    palette: { primary: "#1E1E2E", accent: "#00E698", surface: "#FAFBFC", text: "#24292E" },
    color: ["#1E1E2E", "#00E698", "#FAFBFC"],
  },
  {
    id: "app-ios",
    label: "App 原型 · iOS 风格",
    desc: "iPhone 设备框、tab bar、列表视图、暖色 accent",
    direction: "warm-minimal",
    palette: { primary: "#D97757", accent: "#8C6E5D", surface: "#FFFFFF", text: "#1D1D1F" },
    color: ["#D97757", "#8C6E5D", "#FFFFFF"],
  },
  {
    id: "poster-magazine",
    label: "品牌海报 · 杂志风",
    desc: "大标题、衬线 display、克制 accent、高对比",
    direction: "editorial-monocle",
    palette: { primary: "#1A1A2E", accent: "#C44536", surface: "#FAF8F5", text: "#2D2D2D" },
    color: ["#1A1A2E", "#C44536", "#FAF8F5"],
  },
  {
    id: "deck-pitch",
    label: "演示 Deck · 路演风",
    desc: "1920×1080 幻灯片、大字标题、数据页、全屏背景",
    direction: "dark-luxury",
    palette: { primary: "#0D0D0D", accent: "#C9A84C", surface: "#1A1A1A", text: "#E8E8E8" },
    color: ["#0D0D0D", "#C9A84C", "#1A1A1A"],
  },
  {
    id: "playful-creative",
    label: "创意页面 · 多彩趣味",
    desc: "丰富色彩、有机形状、轻松感、适合创意行业",
    direction: "playful-color",
    palette: { primary: "#FF6B6B", accent: "#4ECDC4", surface: "#FFF8F0", text: "#2C3E50" },
    color: ["#FF6B6B", "#4ECDC4", "#FFF8F0"],
  },
];

export async function showcaseCommand(args: string[]) {
  const pickIdx = args.findIndex((a) => a === "--pick" || a === "-p");
  const pickId = pickIdx >= 0 ? args[pickIdx + 1] : null;

  if (pickId) {
    const sc = SHOWCASES.find((s) => s.id === pickId);
    if (!sc) {
      console.error(JSON.stringify({ error: `未找到 showcase: ${pickId}`, available: SHOWCASES.map((s) => s.id) }));
      process.exit(1);
    }
    // Generate HTML preview
    const html = generateDirectHtml(sc.label, sc.direction, sc.palette, "'Georgia', serif");
    const htmlPath = join(process.cwd(), `showcase-${sc.id}.html`);
    writeFileSync(htmlPath, html, "utf-8");

    // Save as direction decision if in a project
    const projectDir = findProjectDir();
    if (projectDir) {
      const cp = new CheckpointManager(projectDir);
      await cp.save({
        id: `dec_direction_${Date.now()}`,
        type: "direction",
        inputs: { task: sc.label },
        output: { school: sc.direction, showcase_id: sc.id },
        tokens: { "--color-primary": sc.palette.primary, "--color-accent": sc.palette.accent },
        rationale: `用户从 showcase 选择了: ${sc.label}`,
        confidence: 0.7,
        made_by: "user",
        confirmed_by: "user",
        created_at: new Date().toISOString(),
      });
    }

    console.log(JSON.stringify({
      status: "ok",
      selected: sc.id,
      label: sc.label,
      direction: sc.direction,
      palette: sc.palette,
      html: htmlPath,
      decision_saved: !!projectDir,
    }, null, 2));
    return;
  }

  // List all showcases
  console.log(JSON.stringify({
    showcases: SHOWCASES.map((s) => ({
      id: s.id,
      label: s.label,
      desc: s.desc,
      colors: s.color,
    })),
    usage: "bwvi showcase --pick <id>",
  }, null, 2));
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
