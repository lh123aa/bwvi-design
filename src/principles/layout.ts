import type { GridSpec, InformationDensity, SpacingRhythm, LayoutSpec } from "./types.js";

export const GRID_COLUMNS = {
  sparse: 12,
  moderate: 12,
  dense: 8,
};

export const GRID_GUTTER = {
  sparse: 32,
  moderate: 24,
  dense: 16,
};

export const GRID_MARGIN = {
  sparse: 80,
  moderate: 48,
  dense: 24,
};

export const MAX_WIDTH = {
  sparse: 1200,
  moderate: 1100,
  dense: 960,
};

export function generateGrid(density: InformationDensity): GridSpec {
  return {
    columns: GRID_COLUMNS[density],
    gutter: GRID_GUTTER[density],
    margin: GRID_MARGIN[density],
    maxWidth: MAX_WIDTH[density],
  };
}

export const SPACING_BASE_UNIT = 8;

export function generateRhythm(density: InformationDensity): SpacingRhythm {
  const baseUnit = SPACING_BASE_UNIT;
  let scale: number[];

  switch (density) {
    case "sparse":
      scale = [baseUnit * 2, baseUnit * 4, baseUnit * 8, baseUnit * 12, baseUnit * 16, baseUnit * 24];
      break;
    case "moderate":
      scale = [baseUnit, baseUnit * 2, baseUnit * 4, baseUnit * 6, baseUnit * 8, baseUnit * 12];
      break;
    case "dense":
      scale = [baseUnit, baseUnit * 2, baseUnit * 3, baseUnit * 4, baseUnit * 6, baseUnit * 8];
      break;
  }

  const rationaleMap: Record<InformationDensity, string> = {
    sparse: "宽松节奏 — 大量留白，适合品牌展示和高端页面",
    moderate: "适中节奏 — 平衡信息密度和可读性，通用型",
    dense: "紧凑节奏 — 信息密集，适合 Dashboard 和数据展示",
  };

  return { baseUnit, scale, rationale: rationaleMap[density] };
}

export function getDensityForDirection(direction: string): InformationDensity {
  const map: Record<string, InformationDensity> = {
    "editorial-monocle": "dense",
    "warm-minimal": "sparse",
    "tech-utility": "moderate",
    "dark-luxury": "sparse",
    "playful-color": "moderate",
    "corporate-trust": "moderate",
    "luxury-premium": "sparse",
    "nature-organic": "sparse",
    "tech-gradient": "moderate",
    "minimal-white": "sparse",
  };
  return map[direction] || "moderate";
}

export function getContentWidthForDensity(density: InformationDensity): number {
  return MAX_WIDTH[density];
}

export function calcVisualWeight(
  contentLength: number,
  imageCount: number,
  sectionCount: number
): number {
  const textWeight = Math.min(contentLength / 5000, 1) * 0.4;
  const imageWeight = Math.min(imageCount / 10, 1) * 0.3;
  const sectionWeight = Math.min(sectionCount / 8, 1) * 0.3;
  return +(textWeight + imageWeight + sectionWeight).toFixed(2);
}

export function getDensityFromWeight(weight: number): InformationDensity {
  if (weight <= 0.3) return "sparse";
  if (weight <= 0.6) return "moderate";
  return "dense";
}

export function columnSpan(density: InformationDensity, element: "hero" | "content" | "sidebar" | "wide"): number {
  const total = GRID_COLUMNS[density];
  switch (element) {
    case "hero": return total;
    case "content": return Math.ceil(total * 0.75);
    case "sidebar": return Math.floor(total * 0.25);
    case "wide": return total;
    default: return total;
  }
}

export function generateLayoutSpec(direction: string, contentLength: number, imageCount: number, sectionCount: number): LayoutSpec {
  const density = getDensityForDirection(direction);
  const weight = calcVisualWeight(contentLength, imageCount, sectionCount);
  const actualDensity = getDensityFromWeight(weight);
  const grid = generateGrid(actualDensity);
  const rhythm = generateRhythm(actualDensity);

  return {
    grid,
    density: actualDensity,
    rhythm,
    visualWeight: weight,
  };
}

export function getSpacingClass(size: number): string {
  if (size <= 8) return "xs";
  if (size <= 16) return "sm";
  if (size <= 32) return "md";
  if (size <= 64) return "lg";
  return "xl";
}
