import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { CheckpointManager } from "../checkpoint/manager.js";
import { getBaseStyles, Navbar, Hero, StatsGrid, FeatureGrid, TestimonialGrid, CTASection, Footer } from "../templates/components.js";
import { wrapWithDevice } from "../frames/index.js";

interface ShowcaseDef {
  id: string;
  label: string;
  desc: string;
  direction: string;
  palette: { primary: string; accent: string; surface: string; text: string };
  color: string[];
  dark?: boolean;
  device?: string;
}

const SHOWCASES: ShowcaseDef[] = [
  {
    id: "landing-editorial", label: "产品落地页 · 编辑式克制",
    desc: "深蓝底色、暖红 accent、衬线 display、编辑式排版",
    direction: "editorial-monocle",
    palette: { primary: "#1A1A2E", accent: "#C44536", surface: "#FAF8F5", text: "#2D2D2D" },
    color: ["#1A1A2E", "#C44536", "#FAF8F5"],
  },
  {
    id: "landing-warm", label: "产品落地页 · 温暖极简",
    desc: "暖橙底色、棕褐 accent、米白基底、自然材质感",
    direction: "warm-minimal",
    palette: { primary: "#D97757", accent: "#8C6E5D", surface: "#FDF8F5", text: "#3D3D3D" },
    color: ["#D97757", "#8C6E5D", "#FDF8F5"],
  },
  {
    id: "landing-dark", label: "产品落地页 · 深色科技",
    desc: "暗色基底、绿 accent、科技感、数据驱动",
    direction: "dark-luxury",
    palette: { primary: "#0D0D0D", accent: "#00E698", surface: "#1A1A1A", text: "#E8E8E8" },
    color: ["#0D0D0D", "#00E698", "#1A1A1A"],
    dark: true,
  },
  {
    id: "dashboard-clean", label: "Dashboard · 简洁数据",
    desc: "左导航栏、KPI 卡片、数据表格、中性色调",
    direction: "tech-utility",
    palette: { primary: "#1E1E2E", accent: "#00E698", surface: "#FAFBFC", text: "#24292E" },
    color: ["#1E1E2E", "#00E698", "#FAFBFC"],
    device: "browser",
  },
  {
    id: "app-ios", label: "App 原型 · iOS 风格",
    desc: "iPhone 设备框、tab bar、列表视图、暖色 accent",
    direction: "warm-minimal",
    palette: { primary: "#D97757", accent: "#8C6E5D", surface: "#FFFFFF", text: "#1D1D1F" },
    color: ["#D97757", "#8C6E5D", "#FFFFFF"],
    device: "iphone",
  },
  {
    id: "poster-magazine", label: "品牌海报 · 杂志风",
    desc: "大标题、衬线 display、克制 accent、高对比",
    direction: "editorial-monocle",
    palette: { primary: "#1A1A2E", accent: "#C44536", surface: "#FAF8F5", text: "#2D2D2D" },
    color: ["#1A1A2E", "#C44536", "#FAF8F5"],
  },
  {
    id: "deck-pitch", label: "演示 Deck · 路演风",
    desc: "1920×1080 幻灯片、大字标题、数据页、全屏背景",
    direction: "dark-luxury",
    palette: { primary: "#0D0D0D", accent: "#C9A84C", surface: "#1A1A1A", text: "#E8E8E8" },
    color: ["#0D0D0D", "#C9A84C", "#1A1A1A"],
    dark: true,
  },
  {
    id: "playful-creative", label: "创意页面 · 多彩趣味",
    desc: "丰富色彩、有机形状、轻松感、适合创意行业",
    direction: "playful-color",
    palette: { primary: "#FF6B6B", accent: "#4ECDC4", surface: "#FFF8F0", text: "#2C3E50" },
    color: ["#FF6B6B", "#4ECDC4", "#FFF8F0"],
  },
  {
    id: "corporate-trust", label: "企业官网 · 专业信赖",
    desc: "蓝/灰配色、方正排版、专业感",
    direction: "corporate-trust",
    palette: { primary: "#2563EB", accent: "#059669", surface: "#F8FAFC", text: "#1E293B" },
    color: ["#2563EB", "#059669", "#F8FAFC"],
  },
  {
    id: "luxury-premium", label: "奢侈品牌 · 高端质感",
    desc: "金/黑配色、衬线 display、大量留白",
    direction: "luxury-premium",
    palette: { primary: "#1C1917", accent: "#D6A354", surface: "#FAF9F7", text: "#292524" },
    color: ["#1C1917", "#D6A354", "#FAF9F7"],
  },
];

function generateShowcaseHtml(sc: ShowcaseDef): string {
  const isDark = sc.dark || false;
  const palette = { ...sc.palette, muted: sc.palette.text + "88" };
  const base = { palette, animation: true, dark: isDark };
  const fd = sc.direction === "editorial-monocle" || sc.direction === "luxury-premium" || sc.direction === "warm-minimal"
    ? "'Georgia', 'Times New Roman', serif" : "'Inter', system-ui, sans-serif";
  const baseStyles = getBaseStyles(base);

  let heroVariant: any = "fullscreen";
  if (sc.id === "landing-warm") heroVariant = "centered";
  if (sc.id === "poster-magazine") heroVariant = "editorial";
  if (sc.id === "dashboard-clean") heroVariant = "centered";
  if (sc.id === "app-ios") heroVariant = "centered";

  const navbar = Navbar({ ...base, logo: "Brand", links: [{label:"Features",href:"#"},{label:"Pricing",href:"#"},{label:"About",href:"#"}], style: isDark ? "transparent" : "default" });
  const hero = Hero({ ...base, title: sc.label, subtitle: "Crafted with BWVI design protocol — structured decisions, pixel-perfect output.", variant: heroVariant, fontDisplay: fd });
  const stats = StatsGrid({ ...base, items: [{num:"99.9%",label:"Uptime"},{num:"10M+",label:"Users"},{num:"150+",label:"Countries"},{num:"4.9★",label:"Rating"}] });
  const features = FeatureGrid({ ...base, items: [
    {icon:"⚡",title:"Lightning Fast",desc:"Built on modern architecture for sub-second response times."},
    {icon:"🔒",title:"Enterprise Security",desc:"End-to-end encryption with SOC 2 compliance built in."},
    {icon:"🎨",title:"Beautiful Design",desc:"Pixel-perfect UI with accessibility-first principles."},
  ], variant: sc.id === "dashboard-clean" ? "compact" : "grid" });
  const testimonials = TestimonialGrid({ ...base, items: [
    {quote:"The best design tool we've ever used. Transformed our workflow.",author:"Sarah Chen",role:"Product Design Lead"},
    {quote:"BWVI's decision framework saved us weeks of back-and-forth.",author:"Marcus Kim",role:"Engineering Director"},
    {quote:"Finally, a tool that respects both designers and developers.",author:"Aiko Tanaka",role:"Creative Director"},
  ]});
  const cta = CTASection({ ...base, title:"Ready to Get Started?", subtitle:"Join thousands of teams using BWVI for better design decisions.", cta:"Try It Free" });
  const footer = Footer({ ...base, description: "BWVI — Better Way of Visual Intelligence. Agent-native design decision protocol.", columns: [{title:"Product",links:[{label:"Features",href:"#"},{label:"Pricing",href:"#"},{label:"Docs",href:"#"}]},{title:"Company",links:[{label:"About",href:"#"},{label:"Blog",href:"#"},{label:"Contact",href:"#"}]}] });

  const body = `<div${isDark ? ' data-theme="dark"' : ''} style="font-family:system-ui,-apple-system,sans-serif;color:${palette.text};background:${isDark ? '#111' : palette.surface}">
${navbar}${hero}${stats}${features}${testimonials}${cta}${footer}
</div>`;

  const fullHtml = `<!DOCTYPE html><html lang="zh-CN">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${sc.label}</title>
<style>*{margin:0;padding:0;box-sizing:border-box}
body{font-family:system-ui,-apple-system,sans-serif;line-height:1.6}
${baseStyles}
${isDark ? `[data-theme="dark"] body{background:#111;color:#e0e0e0}` : ''}
</style></head><body>${body}</body></html>`;

  if (sc.device) {
    return wrapWithDevice(body, sc.device as any, "portrait", sc.label);
  }
  return fullHtml;
}

export async function showcaseCommand(args: string[]) {
  const pickIdx = args.findIndex((a) => a === "--pick" || a === "-p");
  const pickId = pickIdx >= 0 ? args[pickIdx + 1] : null;

  if (pickId) {
    const sc = SHOWCASES.find((s) => s.id === pickId);
    if (!sc) {
      console.error(JSON.stringify({ error: `未找到 showcase: ${pickId}`, available: SHOWCASES.map((s) => s.id) }));
      process.exit(1);
    }

    const html = generateShowcaseHtml(sc);
    const demoDir = join(process.cwd(), "demo");
    if (!existsSync(demoDir)) mkdirSync(demoDir, { recursive: true });
    const htmlPath = join(demoDir, `showcase-${sc.id}.html`);
    writeFileSync(htmlPath, html, "utf-8");

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
      device: sc.device || "none",
      dark: sc.dark || false,
      html: htmlPath,
      decision_saved: !!projectDir,
    }, null, 2));
    return;
  }

  console.log(JSON.stringify({
    showcases: SHOWCASES.map((s) => ({
      id: s.id, label: s.label, desc: s.desc,
      colors: s.color, device: s.device || null, dark: s.dark || false,
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
