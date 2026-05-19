/**
 * deck-renderer.ts — 幻灯片/Deck 专用渲染引擎
 *
 * 将一组 sections 渲染为可翻页的幻灯片，支持：
 * - 多套内置布局模板
 * - 过渡动画（CSS）
 * - 键盘 ←/→ 导航
 * - 演讲者备注
 * - 适配 animation-engine.ts 的视频录制
 *
 * v0.5.0 新增
 */

import type { SkillSection, SkillYaml } from "./skill-loader.js";
import { DIRECTION_PALETTES, DIRECTION_FONTS } from "./palettes.js";
import { getAnimationCSS } from "./animation-engine.js";

// ─── 类型定义 ───────────────────────────────────────────────────

export interface DeckRenderOptions {
  brand: string;
  tagline: string;
  description: string;
  direction: string;
  skill: SkillYaml;
  dark?: boolean;
  /** 幻灯片总数（自动计算） */
  totalSlides?: number;
  /** 是否嵌入导航控件 */
  navigable?: boolean;
  /** 过渡类型 */
  transition?: "slide" | "fade" | "flip" | "none";
  /** 品牌色板覆盖（来自 --brand 或 --style） */
  paletteOverride?: {
    primary: string;
    accent: string;
    surface: string;
    text: string;
  };
  /** 字体栈覆盖（来自 --brand 或 --style） */
  fontOverride?: string;
}

export interface SlideConfig {
  layout: string;
  title: string;
  content: string[];
  notes?: string;
  accent?: string;
  data?: Record<string, unknown>;
}

// ─── 布局模板 ──────────────────────────────────────────────────

type SlideLayoutFn = (slide: SlideConfig, opts: DeckRenderOptions, palette: Palette, fonts: Fonts, index: number, total: number) => string;

interface Palette {
  primary: string;
  accent: string;
  surface: string;
  text: string;
  muted: string;
}

interface Fonts {
  display: string;
  body: string;
}

/**
 * 布局注册表 —— 每套 skill 可以选择布局，也可以走默认映射
 * key = slide layout id
 */
const SLIDE_LAYOUTS: Record<string, SlideLayoutFn> = {
  /** 封面：渐变背景 + 大字标题 + 元数据 */
  cover: (s, o, p, f, i, t) => `
    <section class="bw-deck-slide bw-deck-cover" data-slide="${i}">
      <div class="bw-deck-cover-bg"></div>
      <div class="bw-deck-cover-content">
        <h1 class="bw-deck-title bw-deck-title-cover" style="font-family:var(--font-display);color:#fff">${esc(s.title)}</h1>
        <p class="bw-deck-subtitle" style="color:rgba(255,255,255,0.8)">${esc(s.content[0] || "")}</p>
        <div class="bw-deck-meta">
          <span class="bw-deck-date">${new Date().toLocaleDateString()}</span>
          <span class="bw-deck-counter">№${i + 1}/${t}</span>
        </div>
      </div>
    </section>`,

  /** 内容页：标题 + 正文列表 */
  content: (s, o, p, f, i, t) => `
    <section class="bw-deck-slide" data-slide="${i}">
      <div class="bw-deck-brand-bar">
        <span class="bw-deck-brand-bar-logo">${esc(o.brand)}</span>
        <span class="bw-deck-counter">${i + 1} / ${t}</span>
      </div>
      <div class="bw-deck-slide-header">
        <div class="bw-deck-hairline" style="background:var(--color-accent)"></div>
        <h2 class="bw-deck-title" style="font-family:var(--font-display);color:var(--color-text)">${esc(s.title)}</h2>
      </div>
      <div class="bw-deck-body">
        ${s.content.map((c) => `<p class="bw-deck-paragraph" style="color:var(--color-text);opacity:0.6">${esc(c)}</p>`).join("\n        ")}
      </div>
      <div class="bw-deck-slide-footer">
        <span>${esc(o.brand)}</span>
        <span class="bw-deck-counter">№${i + 1}/${t}</span>
      </div>
    </section>`,

  /** 分割布局：左标题 + 右内容 */
  split: (s, o, p, f, i, t) => `
    <section class="bw-deck-slide bw-deck-split" data-slide="${i}">
      <div class="bw-deck-brand-bar">
        <span class="bw-deck-brand-bar-logo">${esc(o.brand)}</span>
        <span class="bw-deck-counter">${i + 1} / ${t}</span>
      </div>
      <div class="bw-deck-split-left" style="background:var(--color-surface)">
        <div class="bw-deck-hairline" style="background:var(--color-accent)"></div>
        <h2 class="bw-deck-title" style="font-family:var(--font-display);color:var(--color-accent)">${esc(s.title)}</h2>
      </div>
      <div class="bw-deck-split-right" style="background:${p.surface}">
        ${s.content.map((c) => `<p class="bw-deck-paragraph" style="color:var(--color-text);opacity:0.6">${esc(c)}</p>`).join("\n        ")}
      </div>
      <div class="bw-deck-slide-footer">
        <span>${esc(o.brand)}</span>
        <span class="bw-deck-counter">№${i + 1}/${t}</span>
      </div>
    </section>`,

  /** KPI 数据页：4 组大数字 */
  kpi: (s, o, p, f, i, t) => {
    const items = s.data?.items as Array<{ num: string; label: string }> | undefined;
    return `
    <section class="bw-deck-slide" data-slide="${i}">
      <div class="bw-deck-brand-bar">
        <span class="bw-deck-brand-bar-logo">${esc(o.brand)}</span>
        <span class="bw-deck-counter">${i + 1} / ${t}</span>
      </div>
      <div class="bw-deck-slide-header">
        <div class="bw-deck-hairline" style="background:var(--color-accent)"></div>
        <h2 class="bw-deck-title" style="font-family:var(--font-display);color:var(--color-text)">${esc(s.title)}</h2>
      </div>
      <div class="bw-deck-kpi-grid">
        ${(items || []).map((item) => `
        <div class="bw-deck-kpi-item">
          <div class="bw-deck-kpi-num" style="color:var(--color-accent);font-family:var(--font-display)">${esc(item.num)}</div>
          <div class="bw-deck-kpi-label" style="color:var(--color-text);opacity:0.6">${esc(item.label)}</div>
        </div>`).join("\n        ")}
      </div>
      <div class="bw-deck-slide-footer">
        <span>${esc(o.brand)}</span>
        <span class="bw-deck-counter">№${i + 1}/${t}</span>
      </div>
    </section>`;
  },

  /** 引用页：大字引用 + 作者 */
  quote: (s, o, p, f, i, t) => `
    <section class="bw-deck-slide" data-slide="${i}">
      <div class="bw-deck-brand-bar">
        <span class="bw-deck-brand-bar-logo">${esc(o.brand)}</span>
        <span class="bw-deck-counter">${i + 1} / ${t}</span>
      </div>
      <div class="bw-deck-quote-container">
        <div class="bw-deck-quote-mark" style="color:var(--color-accent)">"</div>
        <blockquote class="bw-deck-quote" style="font-family:var(--font-display);color:var(--color-text)">${esc(s.title)}</blockquote>
        ${s.content[0] ? `<cite class="bw-deck-quote-author" style="color:var(--color-text);opacity:0.6">— ${esc(s.content[0])}</cite>` : ""}
      </div>
      <div class="bw-deck-slide-footer">
        <span>${esc(o.brand)}</span>
        <span class="bw-deck-counter">№${i + 1}/${t}</span>
      </div>
    </section>`,

  /** 时间线 */
  timeline: (s, o, p, f, i, t) => `
    <section class="bw-deck-slide" data-slide="${i}">
      <div class="bw-deck-brand-bar">
        <span class="bw-deck-brand-bar-logo">${esc(o.brand)}</span>
        <span class="bw-deck-counter">${i + 1} / ${t}</span>
      </div>
      <div class="bw-deck-slide-header">
        <div class="bw-deck-hairline" style="background:var(--color-accent)"></div>
        <h2 class="bw-deck-title" style="font-family:var(--font-display);color:var(--color-text)">${esc(s.title)}</h2>
      </div>
      <div class="bw-deck-timeline">
        <div class="bw-deck-timeline-line" style="background:var(--color-accent)"></div>
        ${(s.data?.items as Array<{ title: string; desc: string }> | undefined)?.map((item, idx) => `
        <div class="bw-deck-timeline-item">
          <div class="bw-deck-timeline-dot" style="background:var(--color-accent)"></div>
          <div class="bw-deck-timeline-content">
            <h3 style="font-family:var(--font-display);color:var(--color-text)">${esc(item.title)}</h3>
            <p style="color:var(--color-text);opacity:0.6">${esc(item.desc)}</p>
          </div>
        </div>`).join("\n        ") || ""}
      </div>
      <div class="bw-deck-slide-footer">
        <span>${esc(o.brand)}</span>
        <span class="bw-deck-counter">№${i + 1}/${t}</span>
      </div>
    </section>`,
};

// ─── 主渲染函数 ────────────────────────────────────────────────

/**
 * 渲染完整 Deck HTML（单文件，内嵌导航 JS + CSS）
 */
export function renderDeck(
  sections: SkillSection[],
  opts: DeckRenderOptions,
): string {
  const dir = opts.direction || "tech-utility";
  const basePalette = DIRECTION_PALETTES[dir] || DIRECTION_PALETTES["tech-utility"];
  const baseFont = DIRECTION_FONTS[dir] || DIRECTION_FONTS["tech-utility"];

  // 品牌色板与字体覆盖（优先级：paletteOverride > direction palette）
  const over = opts.paletteOverride;
  const fontOverride = opts.fontOverride;

  const palette: Palette = {
    primary: over?.primary || basePalette.primary,
    accent: over?.accent || basePalette.accent,
    surface: over?.surface || basePalette.surface,
    text: over?.text || basePalette.text,
    muted: (over?.text || basePalette.text) + "88",
  };

  const fonts: Fonts = {
    display: fontOverride || opts.skill.fonts?.[0] || baseFont,
    body: opts.skill.fonts?.[1] || "system-ui, -apple-system, sans-serif",
  };

  const isDark = opts.dark || false;
  const bgColor = isDark ? "#111" : palette.surface;
  const textColor = isDark ? "#e0e0e0" : palette.text;
  const accentColor = isDark ? (over?.accent || palette.accent) : palette.accent;
  const transition = opts.transition || "slide";
  const total = opts.totalSlides || sections.length;

  // Google Fonts
  const fontLink = (function() {
    if (!fontOverride) return "";
    const skip = new Set([
      "serif", "sans-serif", "monospace", "system-ui", "-apple-system",
      "blinkmacsystemfont", "segoe ui", "roboto", "helvetica neue",
      "arial", "noto sans", "apple color emoji", "segoe ui emoji",
      "segoe ui symbol", "georgia", "times new roman", "courier",
    ]);
    const names = fontOverride
      .split(",")
      .map(s => s.trim().replace(/['"]/g, ""))
      .filter(s => !skip.has(s.toLowerCase()) && /^[A-Za-z\s]+$/.test(s));
    if (names.length === 0) return "";
    const families = names.map(n =>
      `family=${n.replace(/\s+/g, "+")}:wght@400;500;600;700`
    ).join("&");
    return `<link href="https://fonts.googleapis.com/css2?${families}&display=swap" rel="stylesheet">\n`;
  })();

  // 将 sections 映射为 slides
  const slides: SlideConfig[] = buildSlides(sections, opts);

  // 逐张渲染
  const slidesHtml = slides
    .map((slide, i) => {
      const layoutFn = SLIDE_LAYOUTS[slide.layout];
      if (layoutFn) return layoutFn(slide, opts, palette, fonts, i, total);
      // 默认使用 content 布局
      return SLIDE_LAYOUTS["content"](slide, opts, palette, fonts, i, total);
    })
    .join("\n");

  // 导航控件
  const navHtml = opts.navigable !== false ? `
  <div class="bw-deck-progress"><div class="bw-deck-progress-fill" id="bw-deck-progress-fill"></div></div>
  <div class="bw-deck-nav">
    <button class="bw-deck-nav-btn bw-deck-prev" onclick="bwDeckNav(-1)" aria-label="上一页">←</button>
    <div class="bw-deck-nav-dots">${slides.map((_, i) => `<span class="bw-deck-dot${i === 0 ? " active" : ""}" data-dot="${i}"></span>`).join("")}</div>
    <button class="bw-deck-nav-btn bw-deck-next" onclick="bwDeckNav(1)" aria-label="下一页">→</button>
  </div>` : "";

  const animCSS = getAnimationCSS();

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(opts.brand)} — ${esc(opts.tagline)}</title>
${fontLink}
<style>
:root{--color-primary:${palette.primary};--color-accent:${accentColor};--color-surface:${bgColor};--color-text:${textColor};--font-display:${fonts.display};--font-body:${fonts.body};--color-accent-dim:${accentColor}30;--color-accent-glow:${accentColor}15}
/* ─── Deck 全局样式 ─── */
*, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }
html, body {
  width:100%; height:100%;
  overflow:hidden;
  font-family:var(--font-body);
  color:var(--color-text);
  background:var(--color-surface);
  -webkit-font-smoothing:antialiased;
}
.bw-deck-stage {
  width:100%; height:100%;
  position:relative;
  overflow:hidden;
}
.bw-deck-slide {
  position:absolute; top:0; left:0;
  width:100%; height:100%;
  display:flex; flex-direction:column;
  justify-content:center;
  padding:5% 8%;
  opacity:0; visibility:hidden;
  transition:opacity 0.4s ease, transform 0.4s ease;
  transform:translateX(30px);
  overflow-y:auto;
}
.bw-deck-slide.active {
  opacity:1; visibility:visible;
  transform:translateX(0);
}
.bw-deck-slide.exit {
  opacity:0; transform:translateX(-30px);
}

/* 过渡：fade */
.bw-deck-fade .bw-deck-slide { transition:opacity 0.5s ease; transform:none; }
.bw-deck-fade .bw-deck-slide.active { opacity:1; }
.bw-deck-fade .bw-deck-slide.exit { opacity:0; }

/* 封面 — 渐变装饰背景 */
.bw-deck-cover { padding:0; }
.bw-deck-cover-bg {
  position:absolute; inset:0;
  display:flex; align-items:center; justify-content:center;
}
.bw-deck-cover-bg::before {
  content:''; position:absolute; inset:0;
  background:linear-gradient(135deg, var(--color-accent) 0%, color-mix(in srgb, var(--color-accent) 60%, #000) 100%);
  opacity:0.92;
}
.bw-deck-cover-bg::after {
  content:''; position:absolute; inset:0;
  background-image:radial-gradient(circle at 30% 40%, rgba(255,255,255,0.08) 0%, transparent 50%),
                   radial-gradient(circle at 70% 80%, rgba(255,255,255,0.05) 0%, transparent 40%);
}
.bw-deck-cover-content {
  position:relative; z-index:1;
  text-align:center; padding:5% 8%;
}

/* 排版 */
.bw-deck-title-cover { font-size:clamp(2rem, 5vw, 5rem); font-weight:800; line-height:1.1; letter-spacing:-0.02em; margin-bottom:0.3em; text-shadow:0 2px 12px rgba(0,0,0,0.2); }
.bw-deck-title { font-size:clamp(1.5rem, 3vw, 3rem); font-weight:700; line-height:1.2; letter-spacing:-0.01em; }
.bw-deck-subtitle { font-size:clamp(1rem, 1.5vw, 1.8rem); font-weight:400; line-height:1.5; }
.bw-deck-paragraph { font-size:clamp(0.9rem, 1.2vw, 1.4rem); line-height:1.7; margin-bottom:0.8em; }

.bw-deck-slide-header { margin-bottom:2rem; }
.bw-deck-hairline { width:3rem; height:3px; margin-bottom:1rem; border-radius:2px; }
.bw-deck-slide-footer {
  position:absolute; bottom:3%; right:3%;
  font-size:0.7rem; opacity:0.35; display:flex; gap:1rem;
}

.bw-deck-brand-bar {
  position:absolute; top:0; left:0; right:0;
  display:flex; justify-content:space-between; align-items:center;
  padding:1.2% 3%; font-size:0.65rem; opacity:0.4;
}
.bw-deck-brand-bar-logo { font-weight:600; letter-spacing:0.05em; }
.bw-deck-meta {
  display:flex; justify-content:center; gap:1.5rem;
  font-size:0.85rem; opacity:0.7; margin-top:1rem;
}
.bw-deck-body { max-width:70%; }
.bw-deck-split { flex-direction:row !important; padding:0; }
.bw-deck-split-left, .bw-deck-split-right {
  flex:1; display:flex; flex-direction:column;
  justify-content:center; padding:5%;
}
.bw-deck-split-left .bw-deck-title { font-size:clamp(1.8rem, 3.5vw, 3.5rem); }

.bw-deck-kpi-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:2rem; margin-top:2rem; }
.bw-deck-kpi-item { text-align:center; }
.bw-deck-kpi-num { font-size:clamp(2rem, 4vw, 4.5rem); font-weight:800; line-height:1; margin-bottom:0.3rem; }
.bw-deck-kpi-label { font-size:0.9rem; text-transform:uppercase; letter-spacing:0.05em; }

.bw-deck-quote-container { max-width:80%; margin:0 auto; text-align:center; }
.bw-deck-quote-mark { font-size:6rem; line-height:0.8; font-family:serif; margin-bottom:-0.3rem; }
.bw-deck-quote { font-size:clamp(1.5rem, 2.5vw, 3rem); font-weight:500; line-height:1.3; font-style:italic; }
.bw-deck-quote-author { font-size:1rem; opacity:0.7; display:block; margin-top:1rem; }

.bw-deck-timeline { position:relative; padding-left:2rem; margin-top:2rem; }
.bw-deck-timeline-line { position:absolute; left:0.5rem; top:0; bottom:0; width:2px; }
.bw-deck-timeline-item { display:flex; gap:1rem; margin-bottom:1.5rem; position:relative; }
.bw-deck-timeline-dot { width:12px; height:12px; border-radius:50%; flex-shrink:0; margin-top:0.4rem; margin-left:-1.6rem; }
.bw-deck-timeline-content h3 { font-size:1.2rem; margin-bottom:0.3rem; }
.bw-deck-timeline-content p { font-size:0.9rem; line-height:1.5; }

/* 进度条 */
.bw-deck-progress { position:fixed; top:0; left:0; right:0; height:3px; z-index:200; background:var(--color-accent-dim); }
.bw-deck-progress-fill { height:100%; background:var(--color-accent); transition:width 0.3s ease; }

/* 导航 */
.bw-deck-nav {
  position:fixed; bottom:3%; left:50%; transform:translateX(-50%);
  display:flex; align-items:center; gap:1rem;
  background:rgba(0,0,0,0.6); backdrop-filter:blur(8px);
  padding:0.5rem 1.2rem; border-radius:2rem;
  z-index:100;
}
.bw-deck-nav-btn {
  background:none; border:none;
  color:#fff; font-size:1.2rem; cursor:pointer;
  padding:0.3rem 0.6rem; border-radius:0.3rem;
  transition:background 0.2s;
}
.bw-deck-nav-btn:hover { background:rgba(255,255,255,0.15); }
.bw-deck-nav-dots { display:flex; gap:0.4rem; }
.bw-deck-dot {
  width:8px; height:8px; border-radius:50%;
  background:rgba(255,255,255,0.3);
  cursor:pointer; transition:background 0.2s;
}
.bw-deck-dot.active { background:#fff; }

/* 动画支持 */
${animCSS}
.bw-deck-slide.bw-anim { animation-play-state:running; }

/* 打印 */
@media print {
  .bw-deck-nav, .bw-deck-progress { display:none; }
  .bw-deck-slide {
    position:relative; opacity:1 !important; visibility:visible !important;
    transform:none !important; page-break-after:always;
    height:100vh; padding:2cm;
  }
}
</style>
</head>
<body class="${transition === "fade" ? "bw-deck-fade" : ""}">
<div class="bw-deck-stage" id="bw-deck-stage">
${slidesHtml}
</div>
${navHtml}
<script>
(function() {
  var current = 0;
  var total = ${total};
  var slides = document.querySelectorAll('.bw-deck-slide');
  var dots = document.querySelectorAll('.bw-deck-dot');
  var stage = document.getElementById('bw-deck-stage');
  var progressFill = document.getElementById('bw-deck-progress-fill');

  function showSlide(index) {
    if (index < 0 || index >= total) return;
    slides.forEach(function(s, i) {
      s.classList.remove('active', 'exit');
      if (i === index) s.classList.add('active');
      else if (i < index) s.classList.add('exit');
    });
    dots.forEach(function(d, i) { d.classList.toggle('active', i === index); });
    current = index;
    if (progressFill) { progressFill.style.width = ((index + 1) / total * 100) + '%'; }
    window.location.hash = 'slide-' + (index + 1);
  }

  window.bwDeckNav = function(dir) { showSlide(current + dir); };

  document.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); showSlide(current + 1); }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); showSlide(current - 1); }
  });

  window.addEventListener('hashchange', function() {
    var m = window.location.hash.match(/slide-(\\d+)/);
    if (m) { var idx = parseInt(m[1]) - 1; if (idx >= 0 && idx < total) showSlide(idx); }
  });

  dots.forEach(function(dot, i) {
    dot.addEventListener('click', function() { showSlide(i); });
  });

  var initFromHash = window.location.hash.match(/slide-(\\d+)/);
  if (initFromHash) { showSlide(parseInt(initFromHash[1]) - 1); }
  else { showSlide(0); }

  var startX = 0;
  stage.addEventListener('touchstart', function(e) { startX = e.touches[0].clientX; });
  stage.addEventListener('touchend', function(e) {
    var diff = e.changedTouches[0].clientX - startX;
    if (Math.abs(diff) > 50) { showSlide(current + (diff < 0 ? 1 : -1)); }
  });
})();</script>
${opts.navigable !== false ? `<div style="display:none" id="bw-deck-ready">ready</div>` : ""}
</body>
</html>`;
}

// ─── 工具函数 ──────────────────────────────────────────────────

/**
 * 将 skill sections 转换为 slide 配置列表
 * 智能推断布局类型
 */
function buildSlides(sections: SkillSection[], opts: DeckRenderOptions): SlideConfig[] {
  const slides: SlideConfig[] = [];

  // 封面 slide
  slides.push({
    layout: "cover",
    title: opts.brand,
    content: [opts.tagline],
    notes: `Cover slide for ${opts.brand}`,
  });

  for (const section of sections) {
    switch (section.type) {
      case "hero":
        // hero 已作为 cover，跳过
        break;

      case "stats": {
        const items = section.data?.items as Array<{ num: string; label: string }> | undefined;
        if (items && items.length > 0) {
          slides.push({
            layout: "kpi",
            title: "Key Metrics",
            content: [],
            data: { items },
          });
        }
        break;
      }

      case "features": {
        const items = section.data?.items as
          | Array<{ icon?: string; title: string; desc: string }>
          | undefined;
        if (items) {
          for (const item of items) {
            slides.push({
              layout: "split",
              title: item.title,
              content: [item.desc],
              data: item,
            });
          }
        }
        break;
      }

      case "testimonials": {
        const items = section.data?.items as
          | Array<{ quote: string; author: string; role?: string }>
          | undefined;
        if (items) {
          for (const item of items) {
            slides.push({
              layout: "quote",
              title: item.quote,
              content: [item.author],
            });
          }
        }
        break;
      }

      case "timeline": {
        slides.push({
          layout: "timeline",
          title: "Timeline",
          content: [],
          data: section.data,
        });
        break;
      }

      case "cta": {
        slides.push({
          layout: "content",
          title: (section.data?.title as string) || "Next Steps",
          content: [(section.data?.subtitle as string) || ""],
        });
        break;
      }

      case "pricing": {
        const d = section.data as Record<string, string>;
        slides.push({
          layout: "split",
          title: d.name || "Pricing",
          content: [
            `${d.price || ""} — ${d.cta || ""}`,
          ],
          data: section.data,
        });
        break;
      }

      default:
        // 其他类型当作内容页
        break;
    }
  }

  // 结尾
  slides.push({
    layout: "content",
    title: "Thank You",
    content: [`${opts.brand} — ${opts.tagline}`],
    notes: "Closing slide",
  });

  return slides;
}

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
