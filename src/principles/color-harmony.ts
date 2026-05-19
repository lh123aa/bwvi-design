import type { HSLColor, PaletteSpec, HarmonyMode } from "./types.js";
import type { DirectionPalette as LegacyPalette } from "../engine/palettes.js";

export function hexToHSL(hex: string): HSLColor {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) * 60; break;
      case g: h = ((b - r) / d + 2) * 60; break;
      case b: h = ((r - g) / d + 4) * 60; break;
    }
  }
  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
}

export function hslToHex(hsl: HSLColor): string {
  const s = hsl.s / 100, l = hsl.l / 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + hsl.h / 30) % 12;
    const val = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * val);
  };
  return `#${f(0).toString(16).padStart(2, "0")}${f(8).toString(16).padStart(2, "0")}${f(4).toString(16).padStart(2, "0")}`;
}

export function hslToString(hsl: HSLColor): string {
  return `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
}

function relativeLuminance(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const [rl, gl, bl] = [r, g, b].map(c =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  );
  return 0.2126 * rl + 0.7152 * gl + 0.0722 * bl;
}

export function contrastRatio(hex1: string, hex2: string): number {
  const l1 = relativeLuminance(hex1);
  const l2 = relativeLuminance(hex2);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

export function meetsWCAGAA(hex1: string, hex2: string): boolean {
  return contrastRatio(hex1, hex2) >= 4.5;
}

export function meetsWCAGAAA(hex1: string, hex2: string): boolean {
  return contrastRatio(hex1, hex2) >= 7;
}

export function calcHarmonyOffset(base: number, mode: HarmonyMode, index: number): number {
  switch (mode) {
    case "monochromatic": return 0;
    case "analogous": return (index === 0 ? -30 : 30);
    case "complementary": return 180;
    case "split-complementary": return index === 0 ? 150 : 210;
    case "triadic": return index === 0 ? 120 : 240;
    case "tetradic": return index === 0 ? 90 : (index === 1 ? 180 : 270);
    default: return 0;
  }
}

export function generateHarmonyPalette(baseHue: number, mode: HarmonyMode): number[] {
  const hues: number[] = [baseHue];
  const offsets: number[] = [];
  switch (mode) {
    case "monochromatic": break;
    case "analogous": offsets.push(30, -30); break;
    case "complementary": offsets.push(180); break;
    case "split-complementary": offsets.push(150, 210); break;
    case "triadic": offsets.push(120, 240); break;
    case "tetradic": offsets.push(90, 180, 270); break;
  }
  for (const offset of offsets) {
    let h = (baseHue + offset) % 360;
    if (h < 0) h += 360;
    if (!hues.includes(h)) hues.push(h);
  }
  return hues;
}

export function generatePaletteFromHues(
  hues: number[],
  baseSaturation: number,
  baseLuminance: number
): { primary: string; accent: string; surface: string; text: string } {
  const primary = hslToHex({ h: hues[0], s: baseSaturation, l: baseLuminance });
  const accent = hslToHex({ h: hues[hues.length > 1 ? 1 : 0], s: Math.min(100, baseSaturation + 20), l: Math.min(90, baseLuminance + 15) });
  const surface = hslToHex({ h: hues[0], s: Math.max(0, baseSaturation - 40), l: Math.min(98, baseLuminance + 60) });
  const textHue = hues[0];
  const text = hslToHex({ h: textHue, s: Math.max(0, baseSaturation - 30), l: Math.max(8, baseLuminance - 35) });
  return { primary, accent, surface, text };
}

export function getHarmonyLabel(mode: HarmonyMode): string {
  const labels: Record<HarmonyMode, string> = {
    monochromatic: "单色 — 同一色相，通过饱和度和明度变化创造层次感",
    analogous: "类似色 — 色相环上相邻 30°，和谐统一，适合品牌一致性",
    complementary: "互补色 — 色相环上相距 180°，高对比，适合强调和突出",
    "split-complementary": "分裂互补 — 主色 + 互补色两侧，对比柔和，容错率高",
    triadic: "三角色 — 色相环上均分 120°，丰富而不杂乱",
    tetradic: "四角色 — 两组互补色，色彩丰富，需要控制使用比例",
  };
  return labels[mode];
}

export function detectHarmonyMode(hues: number[]): HarmonyMode {
  if (hues.length === 1) return "monochromatic";
  if (hues.length === 3) {
    const sorted = [...hues].sort((a, b) => a - b);
    const gaps = [sorted[1] - sorted[0], sorted[2] - sorted[1]];
    if (gaps.every(g => Math.abs(g - 120) < 10 || Math.abs(g + 120 - 360) < 10)) return "triadic";
    if (gaps.every(g => Math.abs(g - 150) < 10 || Math.abs(g - 210) < 10)) return "split-complementary";
  }
  if (hues.length === 2 || hues.length === 4) {
    if (hues.some(h => {
      const offset = Math.abs(h - hues[0]);
      return Math.abs(offset - 180) < 15;
    })) {
      return hues.length === 4 ? "tetradic" : "complementary";
    }
  }
  const maxGap = Math.max(...hues.map((h, i) => {
    if (i === 0) return 0;
    return Math.abs(h - hues[0]);
  }));
  if (maxGap <= 45) return "analogous";
  return "complementary";
}

export function getHueRangeForDirection(direction: string): { min: number; max: number } {
  const ranges: Record<string, { min: number; max: number }> = {
    "editorial-monocle": { min: 210, max: 270 },
    "warm-minimal": { min: 10, max: 35 },
    "tech-utility": { min: 220, max: 260 },
    "dark-luxury": { min: 30, max: 50 },
    "playful-color": { min: 0, max: 360 },
    "corporate-trust": { min: 210, max: 240 },
    "luxury-premium": { min: 30, max: 45 },
    "nature-organic": { min: 120, max: 160 },
    "tech-gradient": { min: 260, max: 300 },
    "minimal-white": { min: 0, max: 360 },
  };
  return ranges[direction] || { min: 220, max: 260 };
}

export function getSaturationForDirection(direction: string): number {
  const sats: Record<string, number> = {
    "editorial-monocle": 35, "warm-minimal": 55, "tech-utility": 25,
    "dark-luxury": 15, "playful-color": 75, "corporate-trust": 50,
    "luxury-premium": 20, "nature-organic": 40, "tech-gradient": 60,
    "minimal-white": 10,
  };
  return sats[direction] || 35;
}

export function getLuminanceForDirection(direction: string): number {
  const lums: Record<string, number> = {
    "editorial-monocle": 25, "warm-minimal": 50, "tech-utility": 30,
    "dark-luxury": 8, "playful-color": 55, "corporate-trust": 45,
    "luxury-premium": 15, "nature-organic": 35, "tech-gradient": 40,
    "minimal-white": 85,
  };
  return lums[direction] || 35;
}

export function legacyPaletteToSpec(palette: LegacyPalette): PaletteSpec {
  const primary = hexToHSL(palette.primary);
  const accent = hexToHSL(palette.accent);
  const hues = [primary.h, accent.h];
  const mode = detectHarmonyMode(hues);
  return {
    primary, accent,
    surface: hexToHSL(palette.surface),
    text: hexToHSL(palette.text),
    harmonyMode: mode,
    hueRange: { min: Math.min(...hues), max: Math.max(...hues) },
    saturationRange: { min: Math.min(primary.s, accent.s), max: Math.max(primary.s, accent.s) },
    luminanceRange: { min: Math.min(primary.l, accent.l), max: Math.max(primary.l, accent.l) },
  };
}

export function validatePalette(primary: string, accent: string, surface: string, text: string): { passed: boolean; issues: string[] } {
  const issues: string[] = [];
  const textOnSurface = contrastRatio(text, surface);
  const primaryOnSurface = contrastRatio(primary, surface);
  const accentOnSurface = contrastRatio(accent, surface);

  if (textOnSurface < 4.5) issues.push(`文字-背景对比度不足: ${textOnSurface.toFixed(1)} (< 4.5)`);
  if (primaryOnSurface < 3 && primaryOnSurface > 0) issues.push(`主色-背景对比度较低: ${primaryOnSurface.toFixed(1)}`);
  if (accentOnSurface < 1.5 && accentOnSurface > 0) issues.push(`Accent-背景对比度极低: ${accentOnSurface.toFixed(1)}`);

  const pHsl = hexToHSL(primary);
  const aHsl = hexToHSL(accent);
  const hueDiff = Math.abs(pHsl.h - aHsl.h);
  const effectiveDiff = Math.min(hueDiff, 360 - hueDiff);
  if (effectiveDiff < 15 && effectiveDiff > 0) issues.push(`主色和 accent 色相太接近 (差 ${effectiveDiff}°)，建议改用对比色`);

  return { passed: issues.length === 0, issues };
}
