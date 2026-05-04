import type { ObjectiveMetrics } from "../types/critique.js";

const HEX_REGEX = /#[0-9a-fA-F]{6}\b/g;
const ACCENT_VARS = /var\(--color-accent\)|var\(--accent\)/g;

export function analyzeHtml(html: string, brandColors?: string[]): ObjectiveMetrics {
  if (!html || html.length < 50) {
    return { color_compliance: 0, font_compliance: 0, asset_authenticity: 1, accent_overuse: 1, token_efficiency: 0.3 };
  }
  const colorCompliance = calcColorCompliance(html, brandColors);
  const fontCompliance = calcFontCompliance(html);
  const assetAuthenticity = calcAssetAuthenticity(html);
  const accentOveruse = calcAccentOveruse(html);
  const tokenEfficiency = calcTokenEfficiency(html);

  return {
    color_compliance: colorCompliance,
    font_compliance: fontCompliance,
    asset_authenticity: assetAuthenticity,
    accent_overuse: accentOveruse,
    token_efficiency: tokenEfficiency,
  };
}

function calcColorCompliance(html: string, brandColors?: string[]): number {
  const colors = html.match(HEX_REGEX);
  if (!colors || colors.length === 0) return 1;
  if (!brandColors || brandColors.length === 0) return 0.8;
  const total = colors.length;
  const matched = colors.filter((c) => brandColors.includes(c.toLowerCase())).length;
  return total > 0 ? matched / total : 1;
}

function calcFontCompliance(html: string): number {
  const hasDisplay = /var\(--font-display\)|font-display/i.test(html);
  const hasBody = /var\(--font-body\)|font-body/i.test(html);
  if (!hasDisplay && !hasBody) return 0.5;
  let score = 0;
  if (hasDisplay) score += 0.5;
  if (hasBody) score += 0.5;
  return score;
}

function calcAssetAuthenticity(html: string): number {
  const imgTags = html.match(/<img[^>]+src=["']([^"']+)["']/g);
  if (!imgTags || imgTags.length === 0) return 1;
  let realCount = 0;
  for (const tag of imgTags) {
    const src = tag.match(/src=["']([^"']+)["']/)?.[1] || "";
    if (!src.startsWith("data:") && !src.includes("placehold") && !src.includes("picsum")) {
      realCount++;
    }
  }
  return imgTags.length > 0 ? realCount / imgTags.length : 1;
}

function calcAccentOveruse(html: string): number {
  const matches = html.match(ACCENT_VARS);
  if (!matches) return 1;
  const count = matches.length;
  if (count <= 2) return 1;
  if (count <= 4) return 0.6;
  return 0.3;
}

function calcTokenEfficiency(html: string): number {
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  const bodyContent = bodyMatch ? bodyMatch[1] : html;
  const contentChars = bodyContent.replace(/<[^>]+>/g, "").replace(/\s+/g, "").length;
  const totalBytes = Buffer.byteLength(bodyContent, "utf-8");
  if (contentChars === 0) return 0.5;
  const ratio = totalBytes / contentChars;
  if (ratio <= 3) return 1;
  if (ratio <= 5) return 0.7;
  return 0.4;
}
