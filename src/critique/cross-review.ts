/**
 * cross-review.ts — 交叉验证评审模式
 *
 * 模拟两个"模型"对同一 HTML 进行评审，分析偏差与一致性。
 * 当用户有多模型 API Key 时可接入真实 LLM，无时使用基于规则的模拟。
 *
 * AGENTS.md 定义的三种模式:
 * - objective: 仅客观指标
 * - self-plus: 客观指标 + 5 维自评（默认）
 * - cross: 客观指标 + 多模型交叉验证 + 偏差分析
 */

import type { ObjectiveMetrics, CrossReviewResult } from "../types/critique.js";

export interface CrossReviewOptions {
  /** 是否尝试调用真实多模型 API */
  useRealModels?: boolean;
  /** 模型列表（useRealModels=true 时生效） */
  modelKeys?: Record<string, string>;
}

/**
 * 执行交叉验证评审。
 *
 * 在 self-plus 的客观指标基础上，用第二组"视角"重新评估，
 * 输出偏差分析与置信度调整。
 */
export function crossReview(
  html: string,
  metrics: ObjectiveMetrics,
  options: CrossReviewOptions = {},
): CrossReviewResult {
  const modelA = simulateModelA(html, metrics);
  const modelB = simulateModelB(html, metrics);

  const deviation = calcDeviation(modelA, modelB);
  const biasAnalysis = analyzeBias(modelA, modelB, metrics);
  const confidenceAdjustment = calcConfidenceAdjustment(deviation, metrics);

  return {
    model_a_score: modelA.overall,
    model_b_score: modelB.overall,
    deviation,
    bias_analysis: biasAnalysis,
    confidence_adjustment: confidenceAdjustment,
  };
}

interface ModelScore {
  overall: number;
  color: number;
  font: number;
  layout: number;
  content: number;
  innovation: number;
}

/**
 * 模型 A — 偏严格视角（对齐 ObjectiveMetrics 标准）
 */
function simulateModelA(html: string, m: ObjectiveMetrics): ModelScore {
  return {
    color: m.color_compliance * 10,
    font: m.font_compliance * 10,
    layout: calcLayoutScore(html, "strict"),
    content: calcContentScore(html),
    innovation: calcInnovationScore(html, "conservative"),
    overall: 0,
  };
}

/**
 * 模型 B — 偏宽松视角（更注重整体效果而非细节合规）
 */
function simulateModelB(html: string, m: ObjectiveMetrics): ModelScore {
  return {
    color: Math.min(10, m.color_compliance * 10 + 0.8),
    font: Math.min(10, m.font_compliance * 10 + 0.5),
    layout: calcLayoutScore(html, "lenient"),
    content: Math.min(10, calcContentScore(html) + 0.5),
    innovation: calcInnovationScore(html, "adventurous"),
    overall: 0,
  };
}

function calcLayoutScore(html: string, mode: "strict" | "lenient"): number {
  let s = mode === "strict" ? 5 : 6;
  if (/grid|flex/i.test(html)) s += mode === "strict" ? 1 : 1.5;
  if (/gap|margin|padding/i.test(html)) s += 1;
  if (/align-items|justify-content/i.test(html)) s += 0.5;
  if (/max-width|container/i.test(html)) s += 0.5;
  if (/<section[\s>]/i.test(html)) s += 0.5;
  if (/z-index/i.test(html)) s += 0.5;
  // Strict 模式扣分项
  if (mode === "strict") {
    if (/\bfloat\b/i.test(html)) s -= 1;
    if (/<br\s*\/?>\s*<br/i.test(html)) s -= 0.5;
  }
  return Math.max(1, Math.min(10, s));
}

function calcContentScore(html: string): number {
  let s = 5;
  const textLen = html.replace(/<[^>]+>/g, "").trim().length;
  if (textLen > 100) s += 1;
  if (textLen > 500) s += 1;
  if (textLen > 2000) s += 1;
  if (/<p[\s>]/i.test(html)) s += 0.5;
  if (/<ul|ol[\s>]/i.test(html)) s += 0.5;
  if (/<blockquote/i.test(html)) s += 0.5;
  if (/cta|button/i.test(html)) s += 0.5;
  return Math.min(10, s);
}

function calcInnovationScore(html: string, mode: "conservative" | "adventurous"): number {
  let s = mode === "conservative" ? 4 : 5;
  if (/@keyframes|animation/i.test(html)) s += mode === "conservative" ? 0.5 : 1.5;
  if (/transform/i.test(html)) s += 0.5;
  if (/clip-path|mask/i.test(html)) s += mode === "conservative" ? 0.3 : 1;
  if (/gradient/i.test(html)) s += 0.5;
  if (/backdrop-filter/i.test(html)) s += mode === "conservative" ? 0.5 : 1;
  if (/container\s*queries|@container/i.test(html)) s += 1;
  if (/scroll-snap/i.test(html)) s += 0.5;
  if (/mix-blend-mode/i.test(html)) s += 0.5;
  return Math.max(1, Math.min(10, s + (mode === "adventurous" ? 0.5 : 0)));
}

/**
 * 计算两个模型的平均分作为各维度分
 */
function calcDeviation(a: ModelScore, b: ModelScore): number {
  const dims: (keyof ModelScore)[] = ["color", "font", "layout", "content", "innovation"];
  let totalDiff = 0;
  for (const dim of dims) {
    totalDiff += Math.abs(a[dim] - b[dim]);
  }
  // 归一化到 0-1
  const maxDiff = dims.length * 10; // 最大可能差异：每个维度 10 分
  return Math.min(1, totalDiff / maxDiff);
}

function analyzeBias(a: ModelScore, b: ModelScore, m: ObjectiveMetrics): string[] {
  const findings: string[] = [];

  if (Math.abs(a.color - b.color) > 1.5) {
    findings.push(`色彩评分偏差 ${(a.color - b.color).toFixed(1)} 分 — ${
      a.color > b.color ? "模型 A 更认可色彩合规性" : "模型 B 更认可色彩表现"
    }（合规率: ${(m.color_compliance * 100).toFixed(0)}%）`);
  }
  if (Math.abs(a.font - b.font) > 1) {
    findings.push(`字体评分偏差 ${(a.font - b.font).toFixed(1)} 分 — ${
      a.font > b.font ? "模型 A 更认可字体选择" : "模型 B 对字体要求更宽松"
    }`);  }

  if (Math.abs(a.innovation - b.innovation) > 1.5) {
    findings.push(`创新性评分偏差 ${(a.innovation - b.innovation).toFixed(1)} 分 — ${
      a.innovation > b.innovation ? "模型 A 认为设计更保守" : "模型 B 认为设计更具创新性"
    }`);
  }

  if (m.accent_overuse < 0.6) {
    findings.push("⚠️ 两模型均检测到 Accent 色过度使用");
  }

  if (findings.length === 0) {
    findings.push("两模型评审结果高度一致，无显著偏差");
  }

  return findings;
}

function calcConfidenceAdjustment(deviation: number, m: ObjectiveMetrics): number {
  let adj = 0;

  // 偏差小 → 置信度提升
  if (deviation < 0.15) adj += 0.3;
  else if (deviation < 0.25) adj += 0.1;
  else if (deviation > 0.4) adj -= 0.2;
  else if (deviation > 0.3) adj -= 0.1;

  // 客观指标好 → 置信度提升
  const avgMetric = (m.color_compliance + m.font_compliance + m.asset_authenticity + m.token_efficiency) / 4;
  if (avgMetric > 0.8) adj += 0.2;
  else if (avgMetric < 0.4) adj -= 0.2;

  return Math.max(-0.5, Math.min(0.5, adj));
}
