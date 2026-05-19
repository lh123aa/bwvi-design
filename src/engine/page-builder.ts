import { findBlueprint, fillBlueprint, type BlueprintSection } from "../templates/content-presets.js";
import { findBestSkill, getSkillsByCategory, type SkillYaml } from "./skill-loader.js";
import { renderDeck } from "./deck-renderer.js";

import { getStyle, recommendStyle } from "./style-systems.js";
import { analyzeHtmlForImages, resolveImages } from "./imager.js";
import { getBaseStyles, Navbar, Hero, StatsGrid, FeatureGrid, TestimonialGrid, CTASection, Footer, StatsCounter, Timeline, PriceCard, Form } from "../templates/components.js";
import { wrapWithDevice, type DeviceType } from "../frames/index.js";
import { getStateMachineScript } from "../frames/state-machine.js";
import { getBrand } from "./brand-loader.js";
import { DIRECTION_PALETTES, DIRECTION_FONTS } from "./palettes.js";

/**
 * 从 fontStack 中提取 Google Fonts 字体名称并生成 <link> 标签
 * 例如: "'Playfair Display', Georgia, serif" → Playfair Display
 */
export function generateFontsLink(fontStack: string): string {
  if (!fontStack) return "";
  const skip = new Set([
    "serif", "sans-serif", "monospace", "system-ui", "-apple-system",
    "blinkmacsystemfont", "segoe ui", "roboto", "helvetica neue",
    "arial", "noto sans", "apple color emoji", "segoe ui emoji",
    "segoe ui symbol", "georgia", "times new roman", "courier",
    "verdana", "geneva", "tahoma", "lucida grande", "impact",
    "trebuchet ms", "palatino", "garamond", "bookman", "comic sans ms",
  ]);

  const names = fontStack
    .split(",")
    .map(s => s.trim().replace(/['"]/g, ""))
    .filter(s => !skip.has(s.toLowerCase()) && /^[A-Za-z\s]+$/.test(s));

  if (names.length === 0) return "";

  const families = names.map(n =>
    `family=${n.replace(/\s+/g, "+")}:wght@400;500;600;700`
  ).join("&");

  return `<link href="https://fonts.googleapis.com/css2?${families}&display=swap" rel="stylesheet">\n`;
}

export type PosterSize = "a3" | "a2" | "a1";

/** 印刷海报尺寸映射（像素 @300dpi） */
export const POSTER_DIMENSIONS: Record<PosterSize, { width: number; height: number; label: string }> = {
  a3: { width: 3508, height: 4961, label: "A3" },
  a2: { width: 4961, height: 7016, label: "A2" },
  a1: { width: 7016, height: 9933, label: "A1" },
};

export interface PageBuildOptions {
  task: string;
  direction?: string;
  brand?: string;
  device?: DeviceType;
  orientation?: "portrait" | "landscape";
  dark?: boolean;
  interactive?: boolean;
  styleId?: string;
  aiImages?: boolean;
  /** 海报模式：生成印刷级超高清海报 HTML */
  poster?: boolean;
  /** 海报尺寸（默认 A3） */
  posterSize?: PosterSize;
  /** v0.5.0: 品类提示 (landing/deck/social/office) */
  category?: string;
}

export interface PageBuildResult {
  html: string;
  blueprintId: string;
  direction: string;
  brandUsed: string | null;
  matchConfidence: number;
}

export function buildPage(opts: PageBuildOptions): PageBuildResult {
  // v0.5.0: 品类提示优先，匹配对应分类下的 skill
  const category = opts.category || (opts.poster ? "poster" : undefined);
  let skill: SkillYaml | null = null;
  let confidence = 0;

  if (category) {
    // 有品类提示 → 从该品类中匹配
    const result = findBestSkill(opts.task, category);
    skill = result.skill;
    confidence = result.confidence;
  } else {
    // 从 YAML 技能文件中匹配
    const result = findBestSkill(opts.task);
    skill = result.skill;
    confidence = result.confidence;

    // 无 YAML 文件 → 回退旧版蓝图
    if (!skill) {
      const oldResult = findBlueprint(opts.task);
      return buildPageLegacy(opts, oldResult.blueprint, oldResult.confidence);
    }
  }

  const direction = opts.direction || skill.direction;
  let palette = DIRECTION_PALETTES[direction] || DIRECTION_PALETTES["tech-utility"];
  let fontStack = DIRECTION_FONTS[direction] || DIRECTION_FONTS["tech-utility"];
  const isDark = opts.dark || skill.dark || false;

  // 应用指定风格
  const style = opts.styleId ? getStyle(opts.styleId) : null;
  if (style) {
    palette = style.palette;
    fontStack = style.typography.display;
  }

  // AI 图片
  if (opts.aiImages) {
    try { const specs = analyzeHtmlForImages(""); resolveImages(specs).catch(() => {}); } catch {}
  }

  let brandName = opts.brand || extractBrand(opts.task);
  let tagline = extractTaglineDefault(opts.task, skill.id);
  let description = extractDescription(opts.task);

  if (brandName && !opts.brand) {
    const brand = getBrand(brandName.toLowerCase());
    if (brand) brandName = brand.name;
  }

  // 品牌色板覆盖方向色板（仅当未指定 style 时，因 style 优先级更高）
  if (brandName && !style) {
    const brand = getBrand(brandName.toLowerCase());
    if (brand) {
      palette = {
        primary: brand.colors.primary,
        accent: brand.colors.accent,
        surface: brand.colors.surface,
        text: brand.colors.text,
      };
      fontStack = brand.typography.display;
    }
  }

  // ─── Deck 渲染 ────────────────────────────────────────
  if (skill.category === "deck" || category === "deck") {
    const deckHtml = renderDeck(skill.sections, {
      brand: brandName,
      tagline,
      description,
      direction,
      skill,
      dark: isDark,
      transition: (skill as any).transition || "slide",
      paletteOverride: palette,
      fontOverride: fontStack,
    });
    const result: PageBuildResult = {
      html: deckHtml,
      blueprintId: skill.id,
      direction,
      brandUsed: brandName,
      matchConfidence: confidence,
    };
    if (opts.device) {
      result.html = wrapWithDevice(result.html, opts.device, opts.orientation, `${brandName} — ${tagline}`);
    }
    return result;
  }

  // ─── Poster 渲染 ──────────────────────────────────────
  const isPoster = opts.poster || skill.category === "poster";
  if (isPoster) {
    const posterHtml = renderPoster(brandName, tagline, description, palette, fontStack, opts.posterSize || "a3", isDark);
    return { html: posterHtml, blueprintId: "poster", direction, brandUsed: brandName, matchConfidence: 1 };
  }

  // ─── Social 卡片渲染 ──────────────────────────────────
  if (skill.category === "social" || category === "social") {
    return renderSocial(brandName, tagline, description, palette, fontStack, isDark, skill);
  }

  // ─── 标准 Landing/Dashboard/App 渲染 ─────────────────
  return renderStandard(brandName, tagline, description, palette, fontStack, isDark, skill, opts.interactive || false, opts.device, opts.orientation, direction);
}

/**
 * v0.6.0: Social 卡片渲染（多布局 + OG Meta + 渐变 + 动画）
 * 支持布局: centered (default), minimal, brand
 */
function renderSocial(
  brand: string, tagline: string, description: string,
  palette: { primary: string; accent: string; surface: string; text: string },
  fontStack: string, dark: boolean, skill: SkillYaml,
): PageBuildResult {
  const displayFont = fontStack;
  const fontLink = generateFontsLink(fontStack);
  const isDark = dark;
  const bgColor = isDark ? "#111" : isSolidColor(palette.surface) ? palette.surface : "#fff";
  const txtColor = isDark ? "#e0e0e0" : palette.text;
  const accentColor = isSolidColor(palette.accent) ? palette.accent : "#6C63FF";
  const primaryColor = isSolidColor(palette.primary) ? palette.primary : txtColor;
  const brandUpper = escapeHtml(brand).toUpperCase();
  const taglineEsc = escapeHtml(tagline);
  const descEsc = escapeHtml(description);

  const ogTitle = `${escapeHtml(brand)} — ${taglineEsc}`;

  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${ogTitle}</title>
<meta property="og:title" content="${ogTitle}">
<meta property="og:type" content="website">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${ogTitle}">
${description ? `<meta name="description" content="${descEsc}">` : ""}
${fontLink}
<style>
:root{--color-primary:${palette.primary};--color-accent:${accentColor};--color-surface:${bgColor};--color-text:${txtColor};--font-display:${displayFont};--color-primary-dim:${primaryColor}20}
*{margin:0;padding:0;box-sizing:border-box}
body{display:flex;align-items:center;justify-content:center;min-height:100vh;
  background:var(--color-surface);color:var(--color-text);
  font-family:system-ui,-apple-system,sans-serif;
  -webkit-font-smoothing:antialiased;position:relative;overflow:hidden}
/* 装饰背景网点 */
body::before{content:'';position:absolute;inset:0;
  background-image:radial-gradient(circle,var(--color-primary-dim) 1px,transparent 1px);
  background-size:24px 24px;opacity:0.4;pointer-events:none}
/* 卡片容器 */
.social-card{max-width:720px;text-align:center;padding:3.5rem 3rem;
  position:relative;z-index:1;
  animation:socialFadeUp 0.6s ease-out}
@keyframes socialFadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
/* 品牌水印 */
.social-watermark{position:absolute;top:1.5rem;right:2rem;font-size:0.65rem;
  letter-spacing:0.12em;color:var(--color-primary-dim);text-transform:uppercase;font-weight:600}
/* 标题 */
.social-title{font-family:var(--font-display);font-size:clamp(2rem,5vw,4rem);font-weight:800;
  line-height:1.1;letter-spacing:-0.02em;color:var(--color-accent);margin-bottom:0.5rem}
.social-tagline{font-size:clamp(1rem,2vw,1.8rem);line-height:1.4;color:var(--color-text);opacity:0.6;margin-bottom:1rem}
.social-desc{font-size:clamp(0.8rem,1.2vw,1.2rem);line-height:1.6;color:var(--color-text);opacity:0.5;margin-bottom:2rem}
/* CTA */
.social-cta{display:inline-block;padding:0.8em 2.5em;background:var(--color-accent);
  color:#fff;border-radius:2em;font-weight:600;font-size:1rem;text-decoration:none;
  transition:transform 0.2s ease,box-shadow 0.2s ease;cursor:default}
.social-cta:hover{transform:translateY(-2px);box-shadow:0 4px 16px ${accentColor}40}
/* 底部装饰线 */
.social-footer{margin-top:2.5rem;padding-top:1.5rem;border-top:1px solid var(--color-primary-dim);
  font-size:0.7rem;opacity:0.35;letter-spacing:0.05em}
</style>
</head>
<body>
<div class="social-card">
  <div class="social-watermark">${brandUpper}</div>
  <div class="social-title">${escapeHtml(brand)}</div>
  <div class="social-tagline">${taglineEsc}</div>
  ${description ? `<div class="social-desc">${descEsc}</div>` : ""}
  <a class="social-cta" href="#">${taglineEsc}</a>
  <div class="social-footer">${brandUpper} — ${taglineEsc}</div>
</div>
</body>
</html>`;

  return { html, blueprintId: skill.id, direction: skill.direction, brandUsed: brand, matchConfidence: 1 };
}

/**
 * 保留旧版 buildPage 逻辑（向后兼容）
 */
function buildPageLegacy(opts: PageBuildOptions, blueprint: any, confidence: number): PageBuildResult {
  const direction = opts.direction || blueprint.direction;
  let palette = DIRECTION_PALETTES[direction] || DIRECTION_PALETTES["tech-utility"];
  let fontStack = DIRECTION_FONTS[direction] || DIRECTION_FONTS["tech-utility"];
  const isDark = opts.dark || blueprint.dark || false;

  const style = opts.styleId ? getStyle(opts.styleId) : null;
  if (style) { palette = style.palette; fontStack = style.typography.display; }

  let brandName = opts.brand || extractBrand(opts.task);
  let tagline = extractTagline(opts.task, blueprint);
  let description = extractDescription(opts.task);

  if (brandName && !opts.brand) {
    const brand = getBrand(brandName.toLowerCase());
    if (brand) brandName = brand.name;
  }

  const isPoster = opts.poster || blueprint.pageType === "poster";
  if (isPoster) {
    const posterHtml = renderPoster(brandName, tagline, description, palette, fontStack, opts.posterSize || "a3", isDark);
    return { html: posterHtml, blueprintId: "poster", direction, brandUsed: brandName, matchConfidence: 1 };
  }

  return renderStandard(brandName, tagline, description, palette, fontStack, isDark, null, opts.interactive || false, opts.device, opts.orientation, direction);
}

/**
 * 标准页面渲染（Landing/Dashboard/App）
 * 注意: 必须从外部传入 direction，因为可能被 opts.direction 覆盖
 */
function renderStandard(
  brandName: string, tagline: string, description: string,
  palette: { primary: string; accent: string; surface: string; text: string },
  fontStack: string, isDark: boolean,
  skillOrNull: SkillYaml | null,
  interactive: boolean,
  device?: DeviceType, orientation?: string,
  overrideDirection?: string,
): PageBuildResult {
  const sections = skillOrNull?.sections || [];
  const base = { palette: { ...palette, muted: palette.text + "88" }, fontDisplay: fontStack, animation: true, dark: isDark };
  const styles = getBaseStyles(base);

  const htmlSections = sections.map((s) => renderSection(s as any, base)).join("\n");

  const headScript = interactive ? getStateMachineScript() : "";
  const fontLink = generateFontsLink(fontStack);
  const themeAttr = isDark ? ' data-theme="dark"' : '';

  let html = `<!DOCTYPE html><html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(brandName)} — ${escapeHtml(tagline)}</title>
${fontLink}${headScript}
<style>
:root{--color-primary:${palette.primary};--color-accent:${palette.accent};--color-surface:${palette.surface};--color-text:${palette.text};--font-display:${fontStack};--font-body:system-ui,-apple-system,sans-serif}
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:var(--font-body);color:var(--color-text);background:${isDark ? '#111' : palette.surface};-webkit-font-smoothing:antialiased}
${styles}
${isDark ? `[data-theme="dark"] body{background:#111;color:#e0e0e0}` : ''}
</style></head><body>
<div${themeAttr} style="font-family:system-ui,-apple-system,sans-serif;color:${palette.text};background:${isDark ? '#111' : palette.surface}">
${htmlSections}
</div>
</body></html>`;

  if (device) {
    html = wrapWithDevice(html, device, orientation as any, `${brandName} — ${tagline}`);
  }

  const finalDirection = overrideDirection || skillOrNull?.direction || "tech-utility";
  return { html, blueprintId: skillOrNull?.id || "generic", direction: finalDirection, brandUsed: brandName, matchConfidence: 1 };
}

// ════════════════════════════════════════════════════════════════
// 印刷海报渲染器
// ════════════════════════════════════════════════════════════════

/** 判断颜色是否为实色 hex（非 rgba 半透明） */
function isSolidColor(c: string): boolean {
  return /^#[0-9a-fA-F]{3,8}$/.test(c);
}

function renderPoster(
  brand: string, tagline: string, description: string,
  palette: { primary: string; accent: string; surface: string; text: string },
  fontStack: string, size: PosterSize, dark: boolean,
): string {
  const dim = POSTER_DIMENSIONS[size];
  const displayFont = fontStack;
  const fontLink = generateFontsLink(fontStack);

  const titleColor = isSolidColor(palette.primary) ? palette.primary : palette.text;
  const bgColor = isSolidColor(palette.surface) ? palette.surface : (dark ? "#1a1a1a" : "#ffffff");
  const barColor = isSolidColor(palette.accent) ? palette.accent : "#6C63FF";
  const ctaTextColor = dark ? "#1a1a1a" : "#ffffff";
  const brandColor = isSolidColor(palette.primary) ? palette.primary + "40" : palette.text + "30";
  const isDark = dark;
  const barColorDim = barColor + "15";
  const brandUpper = escapeHtml(brand).toUpperCase();

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(brand)} — Poster</title>
${fontLink}
<style>
  :root{--color-primary:${palette.primary};--color-accent:${barColor};--color-surface:${bgColor};--color-text:${palette.text};--font-display:${displayFont};--color-bar:${barColor};--color-bar-dim:${barColorDim}}
  ${isDark ? `:root{--color-surface:#1a1a1a;--color-text:#e0e0e0}` : ''}
  @page { margin: 0; size: ${dim.width}px ${dim.height}px;
    marks: crop cross; bleed: 6pt; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body {
    width: ${dim.width}px; height: ${dim.height}px;
    overflow: hidden; -webkit-font-smoothing: antialiased;
  }
  .poster-canvas {
    width: ${dim.width}px; height: ${dim.height}px;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    background: ${bgColor}; color: var(--color-text);
    font-family: system-ui, -apple-system, sans-serif;
    padding: 5%; text-align: center;
    position: relative; overflow: hidden;
  }
  /* 几何装饰背景 */
  .poster-pattern{position:absolute;inset:0;pointer-events:none;overflow:hidden}
  .poster-pattern::before{content:'';position:absolute;top:-10%;right:-5%;
    width:45%;height:80%;border:1px solid var(--color-bar-dim);
    border-radius:50%;transform:rotate(15deg)}
  .poster-pattern::after{content:'';position:absolute;bottom:-8%;left:-8%;
    width:35%;height:60%;border:1px solid var(--color-bar-dim);
    border-radius:50%;transform:rotate(-10deg)}
  /* 网点纹理 */
  .poster-dots{position:absolute;inset:0;pointer-events:none;
    background-image:radial-gradient(circle,var(--color-bar-dim) 1.5px,transparent 1.5px);
    background-size:40px 40px;opacity:0.3}
  /* 顶部色条 */
  .poster-accent-bar {
    position: absolute; top: 0; left: 0; right: 0;
    height: 2.5%; background: var(--color-bar); z-index:2;
  }
  .poster-accent-bar::after{content:'';position:absolute;top:0;right:12%;
    width:15%;height:100%;background:var(--color-bar);opacity:0.5}
  /* 角落标记 */
  .poster-corner-tl{position:absolute;top:3%;left:3%;width:3rem;height:3rem;
    border-top:2px solid var(--color-bar);border-left:2px solid var(--color-bar);
    opacity:0.5}
  .poster-corner-br{position:absolute;bottom:3%;right:3%;width:3rem;height:3rem;
    border-bottom:2px solid var(--color-bar);border-right:2px solid var(--color-bar);
    opacity:0.5}
  /* 排版装饰 */
  .poster-ornament{font-size:clamp(0.6rem,1.5vw,1.8rem);color:var(--color-bar);opacity:0.3;
    letter-spacing:0.5em;margin-bottom:0.6rem}
  .poster-title {
    font-family: var(--font-display);
    font-size: clamp(3rem, 10vw, 12rem);
    font-weight: 800; line-height: 1.1;
    letter-spacing: -0.03em;
    color: ${titleColor};
    margin-bottom: 0.2em;
    max-width: 85%; position:relative; z-index:1;
    text-shadow: ${isDark ? '0 2px 8px rgba(0,0,0,0.4)' : 'none'};
  }
  .poster-subtitle {
    font-size: clamp(1.2rem, 3.5vw, 4rem);
    font-weight: 400; line-height: 1.4;
    color: var(--color-text); opacity: 0.6;
    margin-bottom: 0.8em; max-width: 70%;
    position:relative; z-index:1;
  }
  .poster-desc {
    font-size: clamp(0.8rem, 2vw, 2.2rem);
    font-weight: 300; line-height: 1.6;
    color: var(--color-text); opacity: 0.5;
    margin-bottom: 1.2em; max-width: 60%;
    position:relative; z-index:1;
  }
  .poster-cta {
    display: inline-block;
    padding: 0.6em 2em;
    font-size: clamp(0.7rem, 1.8vw, 2rem);
    font-weight: 600;
    background: var(--color-bar);
    color: ${ctaTextColor};
    border: none; border-radius: 0.3em;
    text-decoration: none; cursor: default;
    position:relative; z-index:1;
  }
  .poster-brand {
    position: absolute; bottom: 4%; left:0; right:0; text-align:center;
    font-size: clamp(0.45rem, 1vw, 1.2rem);
    color: ${brandColor};
    letter-spacing: 0.18em;
    text-transform: uppercase;
  }
  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  }
</style>
</head>
<body>
<div class="poster-canvas">
  <div class="poster-pattern"></div>
  <div class="poster-dots"></div>
  <div class="poster-accent-bar"></div>
  <div class="poster-corner-tl"></div>
  <div class="poster-corner-br"></div>
  <div class="poster-ornament">◆ ◇ ◆</div>
  <div class="poster-title">${escapeHtml(brand)}</div>
  <div class="poster-subtitle">${escapeHtml(tagline)}</div>
  ${description ? `<div class="poster-desc">${escapeHtml(description)}</div>` : ""}
  <div class="poster-cta">${escapeHtml(tagline)}</div>
  <div class="poster-brand">${brandUpper}</div>
</div>
</body>
</html>`;
}

function renderSection(section: BlueprintSection, base: Record<string, unknown>): string {
  const cfg = { ...base, ...section.data };
  switch (section.type) {
    case "navbar": return Navbar(cfg as any);
    case "hero": return Hero(cfg as any);
    case "features": return FeatureGrid(cfg as any);
    case "stats": return StatsGrid(cfg as any);
    case "testimonials": return TestimonialGrid(cfg as any);
    case "cta": return CTASection(cfg as any);
    case "footer": return Footer(cfg as any);
    case "pricing": return PriceCard(cfg as any);
    case "timeline": return Timeline(cfg as any);
    case "form": return Form(cfg as any);
    case "stats_counter": return StatsCounter(cfg as any);
    default: return "";
  }
}

function extractBrand(task: string): string {
  // 1. Try to find an existing brand name in the task
  const clean = task.replace(/--?\w+(=\w+)?/g, "").trim();
  const lowerTask = clean.toLowerCase();
  const brandNames = ["linear","stripe","vercel","github","apple","google","notion","figma","shopify","spotify",
    "airbnb","tesla","nike","ibm","nvidia","claude","cursor","supabase","docker","slack","coinbase","starbucks",
    "coca-cola","amazon","netflix","twitter","linkedin","adobe","canva","duolingo","peloton","headspace"];
  for (const name of brandNames) {
    if (lowerTask.includes(name)) return name;
  }

  // 2. Extract first meaningful word as brand name
  const words = clean.split(/\s+/).filter(w => w.length > 1 && !/^(landing|page|app|website|site|homepage)$/i.test(w));
  if (words.length <= 2) return words[0] || "Brand";
  const startIdx = Math.max(0, Math.floor(words.length / 2) - 1);
  return words.slice(startIdx, startIdx + 2).join(" ") || "Brand";
}

function extractTaglineDefault(task: string, skillId: string): string {
  const words = task.split(/\s+/).filter(w => w.length > 2 && !w.startsWith("--"));
  if (words.length >= 3) {
    const candidate = words.slice(1, 3).join(" ");
    if (candidate.length < 40) return candidate.charAt(0).toUpperCase() + candidate.slice(1);
  }
  const taglines: Record<string, string> = {
    "landing-saas": "Build Faster",
    "landing-cafe": "Perfect Brew",
    "landing-cosmetics": "Feels as Good as It Looks",
    "landing-fitness": "Transform Your Body",
    "landing-education": "Learn Anything",
    "landing-fashion": "Define Your Style",
    "landing-fintech": "Grow Your Wealth",
    "landing-ecommerce": "Your Style, Delivered",
    "landing-restaurant": "Taste the Difference",
    "landing-realestate": "Find Your Home",
    "landing-photography": "Capture the Moment",
    "landing-music": "Feel the Beat",
  };
  return taglines[skillId] || "Go Beyond";
}

function extractTagline(task: string, blueprint: { id: string; direction: string; sections: { type: string }[] }): string {
  // Try to extract a meaningful phrase from the task description
  const words = task.split(/\s+/).filter(w => w.length > 2 && !w.startsWith("--"));
  if (words.length >= 3) {
    const candidate = words.slice(1, 3).join(" ");
    if (candidate.length < 40) return candidate.charAt(0).toUpperCase() + candidate.slice(1);
  }

  // Fallback: blueprint-specific defaults
  const taglines: Record<string, string> = {
    "landing-saas": "Build Faster",
    "landing-cafe": "Perfect Brew",
    "landing-cosmetics": "Feels as Good as It Looks",
    "landing-fitness": "Transform Your Body",
    "landing-education": "Learn Anything",
    "landing-fashion": "Define Your Style",
    "landing-fintech": "Grow Your Wealth",
    "landing-ecommerce": "Your Style, Delivered",
    "landing-restaurant": "Taste the Difference",
    "landing-realestate": "Find Your Home",
    "landing-photography": "Capture the Moment",
    "landing-music": "Feel the Beat",
  };
  return taglines[blueprint.id] || "Go Beyond";
}

function extractDescription(task: string): string {
  const words = task.split(/\s+/).filter(w => !w.startsWith("--"));
  if (words.length > 3) return words.slice(2).join(" ") || "Premium quality designed for modern needs.";
  return "Premium quality designed for modern needs.";
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Re-export for generate.ts
export { DIRECTION_PALETTES, DIRECTION_FONTS };
