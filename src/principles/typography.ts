import type { FontCategory, FontSpec, TypeScale, TypographyPairing } from "./types.js";

export function classifyFont(fontName: string): FontCategory {
  const lower = fontName.toLowerCase();
  if (/mono|code|jetbrains|fira code|source code pro|consolas|courier/i.test(lower)) return "monospace";
  if (/display|fraunces|playfair|bodoni|didot/i.test(lower)) return "display";
  if (/serif|georgia|times|garamond|palatino|merriweather|lora|eb garamond/i.test(lower) && !/sans/i.test(lower)) return "serif";
  if (/handwriting|caveat|dancing script|pacifico/i.test(lower)) return "handwriting";
  return "sans-serif";
}

export function getFontStack(category: FontCategory, fontName?: string): string {
  const defaults: Record<FontCategory, string> = {
    serif: "'Georgia', 'Times New Roman', serif",
    "sans-serif": "'Inter', system-ui, -apple-system, sans-serif",
    display: "'Playfair Display', 'Georgia', serif",
    monospace: "'JetBrains Mono', 'Fira Code', monospace",
    handwriting: "'Caveat', cursive",
  };
  if (fontName) {
    return `'${fontName}', ${defaults[category]}`;
  }
  return defaults[category];
}

export const TYPEOGRAPHIC_SCALES: Record<string, number> = {
  "minor-second": 1.067,
  "major-second": 1.125,
  "minor-third": 1.200,
  "major-third": 1.250,
  "perfect-fourth": 1.333,
  "augmented-fourth": 1.414,
  "perfect-fifth": 1.500,
  "golden-ratio": 1.618,
};

export function getScaleLabel(ratio: number): string {
  const entry = Object.entries(TYPEOGRAPHIC_SCALES).find(([, v]) => Math.abs(v - ratio) < 0.01);
  return entry ? entry[0] : `${ratio.toFixed(3)}`;
}

export function generateTypeScale(baseSize: number, ratio: number): TypeScale {
  const name = getScaleLabel(ratio);
  return {
    name,
    ratio,
    sizes: {
      h1: +(baseSize * ratio ** 5).toFixed(1),
      h2: +(baseSize * ratio ** 4).toFixed(1),
      h3: +(baseSize * ratio ** 3).toFixed(1),
      h4: +(baseSize * ratio ** 2).toFixed(1),
      h5: +(baseSize * ratio ** 1).toFixed(1),
      body: baseSize,
      small: +(baseSize / ratio).toFixed(1),
      caption: +(baseSize / ratio ** 2).toFixed(1),
    },
  };
}

export function getScaleForDensity(density: "sparse" | "moderate" | "dense"): { ratio: number; baseSize: number } {
  switch (density) {
    case "sparse": return { ratio: TYPEOGRAPHIC_SCALES["perfect-fourth"], baseSize: 18 };
    case "moderate": return { ratio: TYPEOGRAPHIC_SCALES["minor-third"], baseSize: 16 };
    case "dense": return { ratio: TYPEOGRAPHIC_SCALES["major-second"], baseSize: 14 };
  }
}

export function getPairingRationale(displayCat: FontCategory, bodyCat: FontCategory): string {
  if (displayCat === bodyCat) {
    if (displayCat === "sans-serif") return "统一无衬线 — 现代简洁，靠字重区分层级";
    if (displayCat === "serif") return "统一衬线 — 经典优雅，适合正式内容";
    return `统一${displayCat} — 风格一致`;
  }
  if (displayCat === "serif" && bodyCat === "sans-serif") return "衬线标题 + 无衬线正文 — 经典组合，标题有气质，正文易读";
  if (displayCat === "sans-serif" && bodyCat === "serif") return "无衬线标题 + 衬线正文 — 现代与传统的碰撞";
  if (displayCat === "display" && bodyCat === "sans-serif") return "装饰性标题 + 无衬线正文 — 个性与实用的平衡";
  if (displayCat === "display" && bodyCat === "serif") return "装饰性标题 + 衬线正文 — 双重视觉表达";
  return `${displayCat} 标题 + ${bodyCat} 正文`;
}

export interface PairingRule {
  displayCat: FontCategory;
  bodyCat: FontCategory;
  compatibility: "excellent" | "good" | "fair" | "poor";
  rationale: string;
}

export const PAIRING_RULES: PairingRule[] = [
  { displayCat: "serif", bodyCat: "sans-serif", compatibility: "excellent", rationale: "经典组合，标题优雅+正文清晰" },
  { displayCat: "sans-serif", bodyCat: "sans-serif", compatibility: "excellent", rationale: "现代统一，靠字重/字号区分" },
  { displayCat: "display", bodyCat: "sans-serif", compatibility: "excellent", rationale: "个性+实用，平衡感好" },
  { displayCat: "serif", bodyCat: "serif", compatibility: "good", rationale: "经典统一，需注意字重对比" },
  { displayCat: "display", bodyCat: "serif", compatibility: "good", rationale: "双重视觉感，适合创意项目" },
  { displayCat: "display", bodyCat: "display", compatibility: "fair", rationale: "均为装饰字体，容易视觉过载" },
  { displayCat: "monospace", bodyCat: "monospace", compatibility: "good", rationale: "技术感强，适合开发者内容" },
  { displayCat: "monospace", bodyCat: "sans-serif", compatibility: "good", rationale: "技术+现代，代码美学" },
  { displayCat: "handwriting", bodyCat: "sans-serif", compatibility: "fair", rationale: "手写标题有个性，正文需简洁" },
  { displayCat: "serif", bodyCat: "monospace", compatibility: "fair", rationale: "古典+技术，反差强烈" },
  { displayCat: "handwriting", bodyCat: "serif", compatibility: "poor", rationale: "均为装饰性强，可读性下降" },
  { displayCat: "monospace", bodyCat: "handwriting", compatibility: "poor", rationale: "风格冲突严重" },
];

export function getPairingCompatibility(displayCat: FontCategory, bodyCat: FontCategory): PairingRule {
  const found = PAIRING_RULES.find(r => r.displayCat === displayCat && r.bodyCat === bodyCat);
  if (found) return found;
  return {
    displayCat, bodyCat,
    compatibility: "fair",
    rationale: `${displayCat} + ${bodyCat} — 非标准组合，建议测试可读性`,
  };
}

export function generateFontPairing(
  displayCat: FontCategory,
  bodyCat: FontCategory,
  density: "sparse" | "moderate" | "dense",
  displayFont?: string,
  bodyFont?: string
): TypographyPairing {
  const scaleParams = getScaleForDensity(density);
  const scale = generateTypeScale(scaleParams.baseSize, scaleParams.ratio);
  const rule = getPairingCompatibility(displayCat, bodyCat);

  const displaySpec: FontSpec = {
    name: displayFont || (displayCat === "sans-serif" ? "Inter" : displayCat === "serif" ? "Georgia" : displayCat === "display" ? "Playfair Display" : displayCat === "monospace" ? "JetBrains Mono" : "Caveat"),
    category: displayCat,
    stack: getFontStack(displayCat, displayFont),
    weightRange: { min: 400, max: 900 },
  };

  const bodySpec: FontSpec = {
    name: bodyFont || (bodyCat === "sans-serif" ? "Inter" : bodyCat === "serif" ? "Georgia" : bodyCat === "monospace" ? "JetBrains Mono" : "Inter"),
    category: bodyCat,
    stack: getFontStack(bodyCat, bodyFont),
    weightRange: { min: 300, max: 600 },
  };

  return {
    display: displaySpec,
    body: bodySpec,
    scale,
    rationale: rule.rationale,
  };
}

export function getRecommendedPairings(direction: string): { displayCat: FontCategory; bodyCat: FontCategory }[] {
  const recommendations: Record<string, { displayCat: FontCategory; bodyCat: FontCategory }[]> = {
    "editorial-monocle": [{ displayCat: "serif", bodyCat: "serif" }, { displayCat: "serif", bodyCat: "sans-serif" }],
    "warm-minimal": [{ displayCat: "serif", bodyCat: "sans-serif" }, { displayCat: "sans-serif", bodyCat: "sans-serif" }],
    "tech-utility": [{ displayCat: "sans-serif", bodyCat: "sans-serif" }, { displayCat: "monospace", bodyCat: "sans-serif" }],
    "dark-luxury": [{ displayCat: "display", bodyCat: "sans-serif" }, { displayCat: "serif", bodyCat: "sans-serif" }],
    "playful-color": [{ displayCat: "display", bodyCat: "sans-serif" }, { displayCat: "sans-serif", bodyCat: "sans-serif" }],
    "corporate-trust": [{ displayCat: "sans-serif", bodyCat: "sans-serif" }, { displayCat: "serif", bodyCat: "sans-serif" }],
    "luxury-premium": [{ displayCat: "display", bodyCat: "serif" }, { displayCat: "serif", bodyCat: "sans-serif" }],
    "nature-organic": [{ displayCat: "serif", bodyCat: "sans-serif" }, { displayCat: "sans-serif", bodyCat: "sans-serif" }],
    "tech-gradient": [{ displayCat: "sans-serif", bodyCat: "sans-serif" }, { displayCat: "monospace", bodyCat: "sans-serif" }],
    "minimal-white": [{ displayCat: "sans-serif", bodyCat: "sans-serif" }, { displayCat: "serif", bodyCat: "sans-serif" }],
  };
  return recommendations[direction] || [{ displayCat: "sans-serif", bodyCat: "sans-serif" }];
}

export function getFontNameForDirection(direction: string, role: "display" | "body"): string {
  const fontMap: Record<string, { display: string; body: string }> = {
    "editorial-monocle": { display: "Georgia", body: "Georgia" },
    "warm-minimal": { display: "Georgia", body: "Inter" },
    "tech-utility": { display: "Inter", body: "Inter" },
    "dark-luxury": { display: "Inter", body: "Inter" },
    "playful-color": { display: "DM Sans", body: "Inter" },
    "corporate-trust": { display: "Inter", body: "Inter" },
    "luxury-premium": { display: "Playfair Display", body: "Inter" },
    "nature-organic": { display: "DM Sans", body: "Inter" },
    "tech-gradient": { display: "Space Grotesk", body: "Inter" },
    "minimal-white": { display: "Inter", body: "Inter" },
  };
  return fontMap[direction]?.[role] || "Inter";
}
