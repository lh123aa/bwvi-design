import type { SelfReview, ObjectiveMetrics, CritiqueReport } from "../types/critique.js";

export function generateSelfReview(html: string, metrics: ObjectiveMetrics): SelfReview {
  const hasContent = html.length > 500 && /<body/i.test(html);
  const hasArtifact = /<artifact/i.test(html);

  const philosophy = calcPhilosophy(html, metrics);
  const hierarchy = calcHierarchy(html);
  const detail = calcDetail(html, metrics);
  const function_ = calcFunction(html, hasContent, hasArtifact);
  const innovation = calcInnovation(html);

  return { philosophy, hierarchy, detail, function: function_, innovation };
}

export function buildReport(
  html: string,
  metrics: ObjectiveMetrics,
  self?: SelfReview
): CritiqueReport {
  const selfReview = self || generateSelfReview(html, metrics);
  const scores = [selfReview.philosophy, selfReview.hierarchy, selfReview.detail, selfReview.function, selfReview.innovation];
  const score = +(scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1);
  const warnings: string[] = [];

  if (metrics.accent_overuse < 0.8) warnings.push("accent 色使用超过建议次数 (每屏 ≤2)");
  if (metrics.token_efficiency < 0.6) warnings.push("HTML 体积偏大，存在非必要内容");
  if (metrics.asset_authenticity < 0.8) warnings.push("使用了非真实资产(placeholder)");
  if (metrics.color_compliance < 0.7 && metrics.color_compliance > 0) warnings.push("色板与品牌色偏差较大");

  return {
    mode_used: "self-plus",
    objective: metrics,
    self: selfReview,
    score,
    passed: score >= 5.0,
    warnings,
  };
}

function calcPhilosophy(_html: string, metrics: ObjectiveMetrics): number {
  let score = 7;
  if (metrics.color_compliance >= 0.85) score += 1;
  if (metrics.accent_overuse >= 0.9) score += 1;
  if (metrics.font_compliance >= 0.8) score += 1;
  return Math.min(10, Math.max(1, score));
}

function calcHierarchy(html: string): number {
  const hasH1 = /<h1[\s>]/i.test(html);
  const hasH2 = /<h2[\s>]/i.test(html);
  const hasNav = /<nav[\s>]/i.test(html);
  const hasHeader = /<header[\s>]/i.test(html);
  const hasFooter = /<footer[\s>]/i.test(html);
  const elements = [hasH1, hasH2, hasNav, hasHeader, hasFooter].filter(Boolean).length;
  if (elements >= 4) return 8;
  if (elements >= 2) return 6;
  return 4;
}

function calcDetail(_html: string, metrics: ObjectiveMetrics): number {
  let score = 6;
  if (metrics.font_compliance >= 0.8) score += 1;
  if (metrics.color_compliance >= 0.85) score += 1;
  if (metrics.token_efficiency >= 0.8) score += 1;
  return Math.min(10, Math.max(1, score));
}

function calcFunction(html: string, hasContent: boolean, hasArtifact: boolean): number {
  let score = 6;
  if (hasContent) score += 1;
  if (hasArtifact) score += 1;
  if (/<meta[\s>]/i.test(html)) score += 1;
  if (/charset/i.test(html)) score += 1;
  return Math.min(10, Math.max(1, score));
}

function calcInnovation(_html: string): number {
  return 6;
}
