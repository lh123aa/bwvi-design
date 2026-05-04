import type { ObjectiveMetrics } from "../types/critique.js";

const HEX_REGEX = /#[0-9a-fA-F]{6}\b/g;
const ACCENT_VARS = /var\(--color-accent\)|var\(--accent\)/g;

export function analyzeHtml(html: string, brandColors?: string[]): ObjectiveMetrics {
  return {
    color_compliance: calcColorCompliance(html, brandColors),
    font_compliance: calcFontCompliance(html),
    asset_authenticity: calcAssetAuthenticity(html),
    accent_overuse: calcAccentOveruse(html),
    token_efficiency: calcTokenEfficiency(html),
    accessibility: calcAccessibility(html),
    semantic_html: calcSemantic(html),
    responsive: calcResponsive(html),
    seo_score: calcSEO(html),
    html_validity: calcValidity(html),
  };
}

function calcColorCompliance(html: string, brandColors?: string[]): number {
  const colors = html.match(HEX_REGEX);
  if (!colors || colors.length === 0) return 1;
  if (!brandColors || brandColors.length === 0) return 0.8;
  const matched = colors.filter((c) => brandColors.includes(c.toLowerCase())).length;
  return matched / colors.length;
}

function calcFontCompliance(html: string): number {
  const hasDisplay = /var\(--font-display\)/i.test(html);
  const hasBody = /var\(--font-body\)/i.test(html);
  if (!hasDisplay && !hasBody) return 0.5;
  return (hasDisplay ? 0.5 : 0) + (hasBody ? 0.5 : 0);
}

function calcAssetAuthenticity(html: string): number {
  const tags = html.match(/<img[^>]+src=["']([^"']+)["']/g);
  if (!tags || tags.length === 0) return 1;
  let real = 0;
  for (const t of tags) {
    const s = t.match(/src=["']([^"']+)["']/)?.[1] || "";
    if (!s.startsWith("data:") && !s.includes("placehold") && !s.includes("picsum")) real++;
  }
  return real / tags.length;
}

function calcAccentOveruse(html: string): number {
  const m = html.match(ACCENT_VARS);
  if (!m) return 1;
  if (m.length <= 2) return 1;
  if (m.length <= 4) return 0.6;
  return 0.3;
}

function calcTokenEfficiency(html: string): number {
  const body = html.match(/<body[^>]*>([\s\S]*)<\/body>/i)?.[1] || html;
  const content = body.replace(/<[^>]+>/g, "").replace(/\s+/g, "").length;
  const bytes = Buffer.byteLength(body, "utf-8");
  if (content === 0) return 0.5;
  const ratio = bytes / content;
  if (ratio <= 3) return 1;
  if (ratio <= 5) return 0.7;
  return 0.4;
}

// — New metrics —

function calcAccessibility(html: string): number {
  let score = 0;
  if (/alt=/i.test(html)) score += 0.25;
  if (/aria-/i.test(html)) score += 0.2;
  if (/role=/i.test(html)) score += 0.15;
  if (/label/i.test(html)) score += 0.15;
  if (/tabindex/i.test(html)) score += 0.15;
  // Check for poor contrast patterns
  const hasLightTextOnLight = /color:\s*#[fF]{3,}[\da-fA-F]*\s*.*background:\s*#[fF]{3,}/.test(html);
  if (!hasLightTextOnLight) score += 0.1;
  return Math.min(1, score);
}

function calcSemantic(html: string): number {
  let score = 0.3; // base
  if (/<header[\s>]/i.test(html)) score += 0.1;
  if (/<nav[\s>]/i.test(html)) score += 0.1;
  if (/<main[\s>]/i.test(html)) score += 0.1;
  if (/<section[\s>]/i.test(html)) score += 0.1;
  if (/<article[\s>]/i.test(html)) score += 0.1;
  if (/<footer[\s>]/i.test(html)) score += 0.1;
  // Check heading order
  const h1 = (html.match(/<h1[\s>]/gi) || []).length;
  if (h1 === 1) score += 0.1;
  if (h1 > 1) score -= 0.05;
  return Math.max(0, Math.min(1, score));
}

function calcResponsive(html: string): number {
  let score = 0;
  if (/viewport/i.test(html)) score += 0.35;
  if (/@media/i.test(html)) score += 0.3;
  if (/clamp\(/i.test(html) || /minmax\(/i.test(html)) score += 0.15;
  if (/(grid-template|flex-wrap)/i.test(html)) score += 0.2;
  return Math.min(1, score);
}

function calcSEO(html: string): number {
  let score = 0;
  if (/<title>/i.test(html)) score += 0.25;
  if (/<meta\s+name=["']description["']/i.test(html)) score += 0.2;
  if (/lang=/i.test(html)) score += 0.15;
  if (/<h1[\s>]/i.test(html)) score += 0.15;
  const hCount = (html.match(/<h[2-6][\s>]/gi) || []).length;
  if (hCount > 0) score += 0.15;
  if (/rel=["'](canonical|alternate)["']/i.test(html)) score += 0.1;
  return Math.min(1, score);
}

function calcValidity(html: string): number {
  let score = 0.5;
  if (/<!DOCTYPE\s+html/i.test(html)) score += 0.2;
  if (/charset\s*=/i.test(html)) score += 0.15;
  const openTags = (html.match(/<\w+/g) || []).length;
  const closeTags = (html.match(/<\/\w+>/g) || []).length;
  if (Math.abs(openTags - closeTags) < 5) score += 0.15;
  return Math.min(1, score);
}
