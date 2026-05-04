import { writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { DESIGN_DIRECTIONS } from "./composer.js";

const HEX_RE = /#[0-9a-fA-F]{6}\b/g;
const RGB_RE = /rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+(?:\s*,\s*[\d.]+)?\s*\)/g;
const CSS_VAR_RE = /(--[\w-]+):\s*([^;]+);/g;
const FONT_FAMILY_RE = /font-family:\s*([^;}]+)/g;
const GOOGLE_FONTS_RE = /fonts\.googleapis\.com\/css2?\?family=([^"']+)/g;
const GRID_RE = /grid-template-columns:\s*([^;}]+)/g;
const GAP_RE = /gap:\s*([^;}]+)/g;
const BORDER_RADIUS_RE = /border-radius:\s*([^;}]+)/g;
const TRANSITION_RE = /transition:\s*([^;}]+)/g;

export interface ExtractedTokens {
  colors: Record<string, string>;
  typography: { display?: string; body?: string; googleFonts: string[] };
  spacing: { base?: number; gapPatterns: string[] };
  layout: { gridPatterns: string[]; breakpoints?: string };
  motion: { transitionPatterns: string[] };
  radius: string[];
}

export interface DesignReference {
  source: { url: string; capturedAt: string };
  title: string;
  tokens: ExtractedTokens;
  detectedSchool: string;
  confidence: number;
  tags: string[];
}

const SCHOOL_PROFILES = [
  {
    name: "editorial-monocle",
    signs: { serifDisplay: 2, restraint: 2, lowColorCount: 1, highContrast: 1, grid: 1 },
  },
  {
    name: "warm-minimal",
    signs: { warmColors: 2, highWhitespace: 2, earthTones: 1, serifBody: 1 },
  },
  {
    name: "tech-utility",
    signs: { sansSerifAll: 2, coolColors: 1, grid: 2, darkMode: 1, monospace: 1 },
  },
  {
    name: "dark-luxury",
    signs: { darkBg: 3, goldAccent: 2, highContrast: 1, serifDisplay: 1 },
  },
  {
    name: "playful-color",
    signs: { highColorCount: 3, roundedCorners: 1, multipleAccents: 2 },
  },
];

export async function learnFromUrl(url: string): Promise<DesignReference> {
  const html = await fetchPage(url);
  const tokens = extractTokens(html, url);
  const { school, confidence } = inferSchool(tokens);
  const title = extractTitle(html) || url;

  return {
    source: { url, capturedAt: new Date().toISOString() },
    title,
    tokens,
    detectedSchool: school,
    confidence,
    tags: inferTags(tokens, school),
  };
}

export async function saveReference(dir: string, ref: DesignReference): Promise<string> {
  const refDir = join(dir, ".bwvi", "references");
  if (!existsSync(refDir)) {
    await mkdir(refDir, { recursive: true });
  }
  const slug = ref.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40) || "reference";
  const filePath = join(refDir, `${slug}.json`);
  await writeFile(filePath, JSON.stringify(ref, null, 2), "utf-8");
  return filePath;
}

export async function injectToFingerprint(dir: string, ref: DesignReference): Promise<void> {
  const fpPath = join(dir, ".bwvi", "fingerprint.yaml");
  if (!existsSync(fpPath)) return;

  const { readFile, writeFile: write } = await import("node:fs/promises");
  try {
    const raw = await readFile(fpPath, "utf-8");
    const fp = JSON.parse(raw);
    if (!fp.learned_references) fp.learned_references = [];
    fp.learned_references.push({
      url: ref.source.url,
      school: ref.detectedSchool,
      confidence: ref.confidence,
      captured_at: ref.source.capturedAt,
    });
    fp.last_updated = new Date().toISOString();
    await write(fpPath, JSON.stringify(fp, null, 2), "utf-8");
  } catch {}
}

async function fetchPage(url: string): Promise<string> {
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    throw new Error("URL must start with http:// or https://");
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "BWVI/0.1 (Design Learning Tool; +https://github.com/bwvi-design)",
        "Accept": "text/html,text/css,*/*",
      },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.text();
  } finally {
    clearTimeout(timeout);
  }
}

function extractTokens(html: string, url: string): ExtractedTokens {
  const baseUrl = new URL(url).origin;

  const colors: Record<string, string> = {};

  // Extract CSS variables
  let match: RegExpExecArray | null;
  CSS_VAR_RE.lastIndex = 0;
  while ((match = CSS_VAR_RE.exec(html)) !== null) {
    const name = match[1].trim();
    const value = match[2].trim();
    if (/^(#|oklch|rgb|hsl)/i.test(value) && !name.includes("shadow") && !name.includes("overlay")) {
      colors[name] = value;
    }
  }

  // Extract hex values from inline styles
  HEX_RE.lastIndex = 0;
  const hexes = new Set<string>();
  while ((match = HEX_RE.exec(html)) !== null) {
    const c = match[0].toLowerCase();
    if (!["#000000", "#ffffff", "#000", "#fff", "#ffffff"].includes(c)) {
      hexes.add(c);
    }
  }
  const sortedHexes = [...hexes].slice(0, 8);
  for (const h of sortedHexes) {
    if (!Object.values(colors).includes(h)) {
      colors[`hex-${sortedHexes.indexOf(h)}`] = h;
    }
  }

  // Font family extraction
  const fontFamilies = new Set<string>();
  FONT_FAMILY_RE.lastIndex = 0;
  while ((match = FONT_FAMILY_RE.exec(html)) !== null) {
    for (const f of match[1].split(",")) {
      const cleaned = f.replace(/["']/g, "").trim();
      if (cleaned && !cleaned.includes("system") && !cleaned.includes("fallback")) {
        fontFamilies.add(cleaned);
      }
    }
  }

  const googleFonts: string[] = [];
  GOOGLE_FONTS_RE.lastIndex = 0;
  while ((match = GOOGLE_FONTS_RE.exec(html)) !== null) {
    googleFonts.push(match[1]);
  }

  const gridPatterns: string[] = [];
  GRID_RE.lastIndex = 0;
  while ((match = GRID_RE.exec(html)) !== null) gridPatterns.push(match[1].trim());

  const gapPatterns: string[] = [];
  GAP_RE.lastIndex = 0;
  while ((match = GAP_RE.exec(html)) !== null) gapPatterns.push(match[1].trim());

  const radiusValues: string[] = [];
  BORDER_RADIUS_RE.lastIndex = 0;
  while ((match = BORDER_RADIUS_RE.exec(html)) !== null) radiusValues.push(match[1].trim());

  const transitionPatterns: string[] = [];
  TRANSITION_RE.lastIndex = 0;
  while ((match = TRANSITION_RE.exec(html)) !== null) transitionPatterns.push(match[1].trim());

  const fontArr = [...fontFamilies];
  const displayFont = fontArr.find((f) =>
    ["georgia", "times", "serif", "display", "fraunces", "newsreader"].some((kw) => f.toLowerCase().includes(kw)));
  const bodyFont = fontArr.find((f) =>
    ["inter", "system", "sans", "roboto", "source", "dm sans"].some((kw) => f.toLowerCase().includes(kw)));

  return {
    colors,
    typography: {
      display: displayFont || fontArr[0],
      body: bodyFont || fontArr[1] || fontArr[0],
      googleFonts,
    },
    spacing: { gapPatterns },
    layout: { gridPatterns },
    motion: { transitionPatterns },
    radius: radiusValues,
  };
}

function extractTitle(html: string): string | null {
  const m = /<title[^>]*>([^<]+)<\/title>/i.exec(html);
  return m ? m[1].trim().slice(0, 80) : null;
}

function inferSchool(tokens: ExtractedTokens): { school: string; confidence: number } {
  const colors = Object.values(tokens.colors);
  const fonts = [tokens.typography.display, tokens.typography.body].filter(Boolean) as string[];
  const colorCount = colors.length;
  const hasDarkBg = colors.some((c) => {
    const h = c.replace("#", "");
    return h.length === 6 && parseInt(h.slice(0, 2), 16) < 30;
  });
  const hasWarmColors = colors.some((c) => {
    const h = c.replace("#", "");
    return h.length === 6 && parseInt(h.slice(0, 2), 16) > 180;
  });
  const hasSerif = fonts.some((f) => /serif|georgia|times/i.test(f));
  const hasSans = fonts.every((f) => /sans|inter|roboto|system/i.test(f));
  const hasMono = fonts.some((f) => /mono|jetbrains|fira code|source code/i.test(f));
  const gridCount = tokens.layout.gridPatterns.length;

  let bestSchool = "tech-utility";
  let bestScore = -Infinity;

  for (const profile of SCHOOL_PROFILES) {
    let score = 0;
    if (profile.signs.sansSerifAll && hasSans) score += profile.signs.sansSerifAll;
    if (profile.signs.serifDisplay && hasSerif && !hasSans) score += profile.signs.serifDisplay;
    if (profile.signs.darkBg && hasDarkBg) score += profile.signs.darkBg;
    if (profile.signs.warmColors && hasWarmColors) score += profile.signs.warmColors;
    if (profile.signs.coolColors && !hasWarmColors) score += profile.signs.coolColors;
    if (profile.signs.grid && gridCount >= 2) score += profile.signs.grid;
    if (profile.signs.monospace && hasMono) score += profile.signs.monospace;
    if (profile.signs.highColorCount && colorCount >= 6) score += profile.signs.highColorCount;
    if (profile.signs.lowColorCount && colorCount <= 3) score += profile.signs.lowColorCount;

    if (score > bestScore) {
      bestScore = score;
      bestSchool = profile.name;
    }
  }

  const maxPossible = Math.max(...SCHOOL_PROFILES.map((p) => Object.values(p.signs).reduce((a, b) => a + b, 0)));
  const confidence = Math.min(1, Math.max(0.3, bestScore / maxPossible));

  return { school: bestSchool, confidence: Math.round(confidence * 100) / 100 };
}

function inferTags(tokens: ExtractedTokens, school: string): string[] {
  const tags: string[] = [school];
  const gridCount = tokens.layout.gridPatterns.length;
  if (gridCount >= 3) tags.push("complex-layout");
  if (Object.keys(tokens.colors).length <= 3) tags.push("minimal-color");
  if (Object.keys(tokens.colors).length >= 8) tags.push("rich-color");
  if (tokens.typography.googleFonts.length > 0) tags.push("google-fonts");
  if (tokens.motion.transitionPatterns.length > 0) tags.push("animated");
  return tags;
}
