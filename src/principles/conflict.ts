import type { StyleAttribute, StyleProfile } from "./types.js";

export const STYLE_MATRIX: Record<string, StyleAttribute[]> = {
  minimal: ["clean", "modern", "subtle", "formal"],
  ornate: ["bold", "playful", "classic", "warm"],
  bold: ["ornate", "modern", "geometric", "playful"],
  subtle: ["minimal", "clean", "formal", "light"],
  warm: ["organic", "playful", "classic", "ornate"],
  cool: ["modern", "geometric", "formal", "minimal"],
  formal: ["minimal", "corporate", "clean", "cool"],
  playful: ["bold", "warm", "colorful", "organic"],
  modern: ["clean", "geometric", "cool", "minimal"],
  classic: ["warm", "ornate", "serif", "organic"],
  organic: ["warm", "playful", "natural", "classic"],
  geometric: ["modern", "clean", "cool", "bold"],
  dark: ["bold", "modern", "luxury", "dramatic"],
  light: ["minimal", "clean", "subtle", "airy"],
  clean: ["minimal", "modern", "subtle", "light"],
  corporate: ["formal", "modern", "minimal", "cool"],
  colorful: ["playful", "bold", "warm", "organic"],
  serif: ["classic", "formal", "warm", "ornate"],
  natural: ["organic", "warm", "minimal", "light"],
  luxury: ["ornate", "dark", "classic", "bold"],
  dramatic: ["dark", "bold", "ornate", "modern"],
  airy: ["light", "minimal", "subtle", "clean"],
};

export function getStyleProfile(direction: string): StyleProfile {
  const profiles: Record<string, { attributes: StyleAttribute[]; temperature: number }> = {
    "editorial-monocle": { attributes: ["classic", "formal", "minimal", "subtle"], temperature: 0.3 },
    "warm-minimal": { attributes: ["warm", "minimal", "organic", "subtle"], temperature: 0.4 },
    "tech-utility": { attributes: ["modern", "cool", "minimal", "geometric"], temperature: 0.2 },
    "dark-luxury": { attributes: ["dark", "bold", "modern", "classic"], temperature: 0.6 },
    "playful-color": { attributes: ["playful", "bold", "warm", "organic"], temperature: 0.9 },
    "corporate-trust": { attributes: ["formal", "modern", "cool", "minimal"], temperature: 0.3 },
    "luxury-premium": { attributes: ["classic", "ornate", "dark", "warm"], temperature: 0.5 },
    "nature-organic": { attributes: ["organic", "warm", "minimal", "light"], temperature: 0.4 },
    "tech-gradient": { attributes: ["modern", "geometric", "bold", "cool"], temperature: 0.7 },
    "minimal-white": { attributes: ["minimal", "light", "subtle", "clean"], temperature: 0.1 },
  };
  return profiles[direction] || { attributes: ["modern", "clean", "minimal"], temperature: 0.3 };
}

export function calcStyleDistance(a: StyleProfile, b: StyleProfile): number {
  const allAttrs = [...new Set([...a.attributes, ...b.attributes])];
  let compatiblePairs = 0;
  let totalPairs = 0;

  for (const attrA of a.attributes) {
    for (const attrB of b.attributes) {
      totalPairs++;
      if (attrA === attrB) { compatiblePairs++; continue; }
      const compatible = STYLE_MATRIX[attrA];
      if (compatible && compatible.includes(attrB)) compatiblePairs++;
    }
  }

  const attrSimilarity = totalPairs > 0 ? compatiblePairs / totalPairs : 0;
  const tempDiff = Math.abs(a.temperature - b.temperature) / 1;
  const tempSimilarity = 1 - tempDiff;

  return (attrSimilarity * 0.6 + tempSimilarity * 0.4);
}

export interface ConflictReport {
  compatible: boolean;
  distance: number;
  conflicts: string[];
  suggestions: string[];
}

export function analyzeConflict(
  directionA: string,
  directionB: string,
  elements: { palette?: boolean; typography?: boolean; layout?: boolean }
): ConflictReport {
  const profileA = getStyleProfile(directionA);
  const profileB = getStyleProfile(directionB);
  const distance = calcStyleDistance(profileA, profileB);
  const conflicts: string[] = [];
  const suggestions: string[] = [];

  if (distance < 0.3) {
    conflicts.push(`${directionA} 和 ${directionB} 风格差异过大`);
    suggestions.push(`建议不要混搭 ${directionA} 的 ${elements.palette ? "色板" : ""} ${elements.typography ? "字体" : ""} ${elements.layout ? "布局" : ""} 与 ${directionB}`);
  }

  if (profileA.temperature > 0.7 && profileB.temperature < 0.3) {
    conflicts.push("视觉温度冲突 — 一个过热一个过冷");
    suggestions.push("保留冷色调的布局，使用暖色调的 accent 点缀");
  }

  if (elements.palette) {
    const aIsMinimal = profileA.attributes.includes("minimal");
    const bIsPlayful = profileB.attributes.includes("playful");
    if (aIsMinimal && bIsPlayful) {
      conflicts.push("极简色板 × 多彩色板 — 风格冲突");
      suggestions.push("使用极简底色 + 多彩 accent，控制 accent 使用比例 ≤20%");
    }
  }

  if (elements.typography) {
    const aIsFormal = profileA.attributes.includes("formal");
    const bIsPlayful = profileB.attributes.includes("playful");
    if (aIsFormal && bIsPlayful) {
      conflicts.push("正式字体 × 趣味字体 — 风格冲突");
      suggestions.push("正文用正式字体，标题可以用有趣味性的展示字体");
    }
  }

  if (elements.layout) {
    const aIsDense = directionA === "editorial-monocle";
    const bIsSparse = directionB === "warm-minimal" || directionB === "minimal-white" || directionB === "luxury-premium";
    if (aIsDense && bIsSparse) {
      conflicts.push("密集布局 × 宽松布局 — 节奏不一");
      suggestions.push("统一使用中间密度，或内容区密集 + 页眉页脚宽松");
    }
  }

  return {
    compatible: conflicts.length === 0,
    distance: +distance.toFixed(2),
    conflicts,
    suggestions,
  };
}

export function findBestMix(sourceDirection: string, availableDirections: string[]): { direction: string; distance: number }[] {
  const sourceProfile = getStyleProfile(sourceDirection);
  const scored = availableDirections
    .filter(d => d !== sourceDirection)
    .map(d => ({
      direction: d,
      distance: calcStyleDistance(sourceProfile, getStyleProfile(d)),
    }))
    .sort((a, b) => b.distance - a.distance);

  return scored;
}
