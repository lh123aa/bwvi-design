import type { SelfReview, ObjectiveMetrics, CritiqueReport, CritiqueIssue } from "../types/critique.js";

// Context-aware weights: different project types weight different dimensions
const WEIGHTS: Record<string, { philosophy: number; hierarchy: number; detail: number; function: number; innovation: number }> = {
  landing_page: { philosophy: 0.3, hierarchy: 0.25, detail: 0.2, function: 0.15, innovation: 0.1 },
  dashboard:    { philosophy: 0.15, hierarchy: 0.25, detail: 0.2, function: 0.3, innovation: 0.1 },
  deck:         { philosophy: 0.3, hierarchy: 0.2, detail: 0.25, function: 0.1, innovation: 0.15 },
  default:      { philosophy: 0.2, hierarchy: 0.25, detail: 0.2, function: 0.2, innovation: 0.15 },
};

export function getTaskType(html: string): string {
  if (/dashboard|analytics|admin|table|chart/i.test(html)) return "dashboard";
  if (/slide|deck|presentation/i.test(html)) return "deck";
  if (/landing|hero|features|pricing/i.test(html)) return "landing_page";
  return "default";
}

export function generateSelfReview(html: string, metrics: ObjectiveMetrics): SelfReview {
  return {
    philosophy: calcPhilosophy(metrics),
    hierarchy: calcHierarchy(html),
    detail: calcDetail(html, metrics),
    function: calcFunction(html, metrics),
    innovation: calcInnovation(html, metrics),
  };
}

export function buildReport(html: string, metrics: ObjectiveMetrics, self?: SelfReview): CritiqueReport {
  const sr = self || generateSelfReview(html, metrics);
  const taskType = getTaskType(html);
  const w = WEIGHTS[taskType] || WEIGHTS.default;
  const weightedScore = +(sr.philosophy * w.philosophy + sr.hierarchy * w.hierarchy + sr.detail * w.detail + sr.function * w.function + sr.innovation * w.innovation).toFixed(1);
  const avgScore = +([sr.philosophy, sr.hierarchy, sr.detail, sr.function, sr.innovation].reduce((a, b) => a + b, 0) / 5).toFixed(1);

  const issues: CritiqueIssue[] = [];
  const warnings: string[] = [];

  if (metrics.accent_overuse < 0.8) {
    issues.push({ type: "accent_overuse", severity: "warning", message: "Accent 色使用超过建议次数 (≤2/屏)", suggestion: "将非关键元素的 accent 替换为 neutral 色" });
    warnings.push("accent 色使用超过建议次数 (每屏 ≤2)");
  }
  if (metrics.token_efficiency < 0.6) {
    issues.push({ type: "bloat", severity: "info", message: "HTML 体积偏大", suggestion: "压缩内联 CSS，移除注释和空格" });
    warnings.push("HTML 体积偏大，存在非必要内容");
  }
  if (metrics.asset_authenticity < 0.8) {
    issues.push({ type: "placeholder_assets", severity: "warning", message: "使用了非真实资产", suggestion: "替换为真实图片或下载品牌 logo" });
    warnings.push("使用了非真实资产(placeholder)");
  }
  if (metrics.color_compliance < 0.7 && metrics.color_compliance > 0) {
    issues.push({ type: "color_mismatch", severity: "warning", message: "色板与品牌色偏差较大", suggestion: "使用品牌色盘中的色值" });
    warnings.push("色板与品牌色偏差较大");
  }
  if (metrics.accessibility < 0.5) {
    issues.push({ type: "accessibility", severity: "warning", message: "可访问性不足", suggestion: "添加 alt 属性、ARIA 标签和 role 属性" });
    warnings.push("可访问性评分偏低");
  }
  if (metrics.semantic_html < 0.5) {
    issues.push({ type: "semantic_html", severity: "info", message: "语义化 HTML 使用不足", suggestion: "使用 header/main/nav/section/article/footer 等语义标签" });
  }
  if (metrics.responsive < 0.4) {
    issues.push({ type: "responsive", severity: "warning", message: "缺少响应式支持", suggestion: "添加 viewport meta 和 media queries" });
    warnings.push("缺少响应式支持");
  }
  if (!html.includes("lang=")) {
    issues.push({ type: "missing_lang", severity: "info", message: "缺少 lang 属性", suggestion: "在 html 标签中添加 lang='zh-CN' 或 lang='en'" });
  }

  const summary = generateSummary(weightedScore, metrics, issues);

  return {
    mode_used: "self-plus",
    objective: metrics,
    self: sr,
    weighted_score: weightedScore,
    score: avgScore,
    passed: weightedScore >= 5.0,
    warnings,
    issues,
    summary,
  };
}

function generateSummary(score: number, metrics: ObjectiveMetrics, issues: CritiqueIssue[]): string {
  if (score >= 8) return "高质量设计，几乎无需修改。";
  if (score >= 6.5) return "整体设计良好，修复少数问题后可交付。";
  if (score >= 5) return "方向基本正确，需要修复关键问题。";
  const critical = issues.filter(i => i.severity === "error").length;
  return `需要大幅改进 (${critical} 个严重问题)`;
}

function calcPhilosophy(metrics: ObjectiveMetrics): number {
  let s = 7;
  if (metrics.color_compliance >= 0.85) s += 1;
  if (metrics.accent_overuse >= 0.9) s += 1;
  if (metrics.font_compliance >= 0.8) s += 1;
  return Math.min(10, Math.max(1, s));
}

function calcHierarchy(html: string): number {
  let s = 4;
  if (/<h1[\s>]/i.test(html)) s += 1.5;
  if (/<h2[\s>]/i.test(html)) s += 1;
  if (/<nav/i.test(html)) s += 1;
  if (/<header/i.test(html)) s += 1;
  if (/<footer/i.test(html)) s += 0.5;
  if (/<main/i.test(html)) s += 1;
  return Math.min(10, Math.max(1, s));
}

function calcDetail(html: string, m: ObjectiveMetrics): number {
  let s = 6;
  if (m.font_compliance >= 0.8) s += 0.5;
  if (m.color_compliance >= 0.85) s += 0.5;
  if (m.token_efficiency >= 0.8) s += 0.5;
  if (m.accessibility >= 0.6) s += 0.5;
  if (m.semantic_html >= 0.7) s += 0.5;
  if (m.responsive >= 0.6) s += 0.5;
  return Math.min(10, Math.max(1, s));
}

function calcFunction(html: string, m: ObjectiveMetrics): number {
  let s = 6;
  if (html.length > 500) s += 0.5;
  if (/<body/i.test(html)) s += 0.5;
  if (/charset/i.test(html)) s += 0.5;
  if (/<meta/i.test(html)) s += 0.5;
  if (m.seo_score >= 0.6) s += 1;
  if (m.html_validity >= 0.8) s += 0.5;
  return Math.min(10, Math.max(1, s));
}

function calcInnovation(html: string, m: ObjectiveMetrics): number {
  let s = 5;
  if (/@keyframes|animation/i.test(html)) s += 1;
  if (/transform/i.test(html)) s += 0.5;
  if (/clip-path|mask/i.test(html)) s += 0.5;
  if (/gradient/i.test(html)) s += 0.5;
  if (m.responsive >= 0.7) s += 0.5;
  if (/container\s*queries|@container/i.test(html)) s += 1;
  return Math.min(10, Math.max(1, s));
}
