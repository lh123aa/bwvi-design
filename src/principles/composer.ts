import type { CompositionOption, HarmonyMode, FontCategory, InformationDensity } from "./types.js";
import { DIRECTIONS } from "../engine/analyzer.js";
import { DIRECTION_PALETTES, type DirectionPalette } from "../engine/palettes.js";
import { hexToHSL, hslToHex, generateHarmonyPalette, generatePaletteFromHues, getSaturationForDirection, getLuminanceForDirection, detectHarmonyMode, validatePalette, getHarmonyLabel } from "./color-harmony.js";
import { generateFontPairing, getRecommendedPairings, getFontNameForDirection } from "./typography.js";
import { getDensityForDirection, generateLayoutSpec } from "./layout.js";
import { getStyleProfile, calcStyleDistance } from "./conflict.js";

export interface MixRecipe {
  directionForPalette: string;
  directionForTypography: string;
  directionForLayout: string;
  harmonyMode?: HarmonyMode;
  density?: InformationDensity;
  displayCat?: FontCategory;
  bodyCat?: FontCategory;
}

export interface MixResult {
  option: CompositionOption;
  recipe: MixRecipe;
  principleScore: number;
}

function scoreOption(palette: DirectionPalette, direction: string, recipe: MixRecipe): number {
  const pal = hexToHSL(palette.primary);
  const hues = [pal.h];
  if (palette.accent) hues.push(hexToHSL(palette.accent).h);
  const detectedMode = detectHarmonyMode(hues);
  const modeScore = recipe.harmonyMode ? (detectedMode === recipe.harmonyMode ? 1 : 0.5) : 1;

  const validation = validatePalette(palette.primary, palette.accent, palette.surface, palette.text);
  const contrastScore = validation.passed ? 1 : 0.3;

  const sourceProfile = getStyleProfile(direction);
  const palProfile = getStyleProfile(recipe.directionForPalette);
  const paletteDist = calcStyleDistance(sourceProfile, palProfile);

  return +(modeScore * 0.3 + contrastScore * 0.4 + paletteDist * 0.3).toFixed(2);
}

export function generateMixOptions(
  task: string,
  count: number = 3
): MixResult[] {
  const lower = task.toLowerCase();
  const scoredDirections = DIRECTIONS.map(d => ({
    ...d,
    score: d.keywords.filter(kw => lower.includes(kw)).length,
  })).sort((a, b) => b.score - a.score);

  const primaryDir = scoredDirections[0]?.name || "tech-utility";
  const secondaryDirs = scoredDirections.slice(1, 4).map(d => d.name);
  if (secondaryDirs.length < 2) {
    const allDirs = DIRECTIONS.map(d => d.name).filter(d => d !== primaryDir);
    secondaryDirs.push(...allDirs.filter(d => !secondaryDirs.includes(d)).slice(0, 2));
  }

  const results: MixResult[] = [];

  if (secondaryDirs.length >= 1) {
    results.push(buildMix(primaryDir, secondaryDirs[0], secondaryDirs[1] || secondaryDirs[0], "analogous", undefined, undefined, undefined, 1));
  }

  if (secondaryDirs.length >= 2) {
    results.push(buildMix(primaryDir, secondaryDirs[0], secondaryDirs[0], "complementary", undefined, undefined, undefined, 2));
  }

  results.push(buildMix(primaryDir, secondaryDirs[0], primaryDir, "triadic", undefined, undefined, undefined, 3));

  return results.slice(0, count);
}

function buildMix(
  base: string,
  paletteFrom: string,
  layoutFrom: string,
  harmonyMode: HarmonyMode,
  displayCat?: FontCategory,
  bodyCat?: FontCategory,
  density?: InformationDensity,
  optionIndex?: number
): MixResult {
  const recipe: MixRecipe = {
    directionForPalette: paletteFrom,
    directionForTypography: paletteFrom,
    directionForLayout: layoutFrom,
    harmonyMode,
    displayCat,
    bodyCat,
    density,
  };

  const palFromPalette = DIRECTION_PALETTES[paletteFrom] || DIRECTION_PALETTES["tech-utility"];
  const baseHsl = hexToHSL(palFromPalette.primary);
  const baseSaturation = getSaturationForDirection(paletteFrom);
  const baseLuminance = getLuminanceForDirection(paletteFrom);

  const harmonyHues = generateHarmonyPalette(baseHsl.h, harmonyMode);
  const mixPalette = generatePaletteFromHues(harmonyHues, baseSaturation, baseLuminance);

  const actualMode = detectHarmonyMode(harmonyHues);

  const actualDisplayCat = displayCat || getRecommendedPairings(base)[0]?.displayCat || "sans-serif";
  const actualBodyCat = bodyCat || getRecommendedPairings(base)[0]?.bodyCat || "sans-serif";
  const actualDensity = density || getDensityForDirection(layoutFrom);

  const fontPair = generateFontPairing(actualDisplayCat, actualBodyCat, actualDensity,
    getFontNameForDirection(base, "display"),
    getFontNameForDirection(base, "body"));

  const layoutSpec = generateLayoutSpec(layoutFrom, 0, 0, 0);

  const sourceProfile = getStyleProfile(base);
  const palProfile = getStyleProfile(paletteFrom);
  const paletteDist = calcStyleDistance(sourceProfile, palProfile);

  const fullPalette: DirectionPalette = {
    primary: mixPalette.primary,
    accent: mixPalette.accent,
    surface: mixPalette.surface,
    text: mixPalette.text,
  };
  const principleScore = scoreOption(fullPalette, base, recipe);

  const paletteDirLabel = DIRECTIONS.find(d => d.name === paletteFrom)?.label || paletteFrom;
  const layoutDirLabel = DIRECTIONS.find(d => d.name === layoutFrom)?.label || layoutFrom;
  const harmonyLabel = getHarmonyLabel(actualMode);

  const rationale = `方案 ${optionIndex || "?"} — ${base} 为主，混搭 ${paletteFrom} 的配色和 ${layoutFrom} 的布局。${harmonyLabel}。${fontPair.display.category} 标题 + ${fontPair.body.category} 正文。`;

  const option: CompositionOption = {
    id: `mix-${optionIndex || Date.now()}`,
    name: `${paletteDirLabel}配色 + ${layoutDirLabel}布局`,
    rationale,
    palette: {
      primary: hexToHSL(mixPalette.primary),
      accent: hexToHSL(mixPalette.accent),
      surface: hexToHSL(mixPalette.surface),
      text: hexToHSL(mixPalette.text),
      harmonyMode: actualMode,
      hueRange: { min: Math.min(...harmonyHues), max: Math.max(...harmonyHues) },
      saturationRange: { min: 10, max: 80 },
      luminanceRange: { min: 10, max: 90 },
    },
    typography: fontPair,
    layout: layoutSpec,
    style: sourceProfile,
    confidence: principleScore,
  };

  return { option, recipe, principleScore };
}

export function explainComposition(option: CompositionOption): string[] {
  const lines: string[] = [];

  lines.push(`📐 ${option.name}`);
  lines.push(option.rationale);

  const hsl = option.palette.primary;
  lines.push(`\n🎨 色板: #${hslToHex(hsl)} (色相 ${hsl.h}°, 饱和度 ${hsl.s}%, 亮度 ${hsl.l}%)`);

  const mode = option.palette.harmonyMode;
  lines.push(`   和谐模式: ${mode} — ${getHarmonyLabel(mode)}`);

  lines.push(`\n🔤 字体: ${option.typography.display.name} (标题) + ${option.typography.body.name} (正文)`);
  lines.push(`   比例尺: ${option.typography.scale.name} (比率 ${option.typography.scale.ratio})`);

  const density = option.layout.density;
  const densityLabel = density === "sparse" ? "宽松" : density === "moderate" ? "适中" : "紧凑";
  lines.push(`\n📏 布局: ${densityLabel} (${option.layout.grid.columns} 列网格, ${option.layout.grid.gutter}px 间距)`);

  return lines;
}
