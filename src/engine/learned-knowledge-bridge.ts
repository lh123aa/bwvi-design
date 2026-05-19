import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import type { DirectionPalette } from "./palettes.js";
import { DIRECTIONS } from "./analyzer.js";

interface LearnedDirection {
  direction: string;
  confidence: number;
  source: string;
  palette: DirectionPalette;
  displayFont: string;
  bodyFont: string;
  learnedAt: string;
}

const DIRECTIONS_FILE = "learned-directions.json";

function findProjectDir(): string | null {
  let dir = process.cwd();
  for (let i = 0; i < 5; i++) {
    if (existsSync(join(dir, ".bwvi"))) return dir;
    const parent = join(dir, "..");
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

function loadLearnedDirections(): LearnedDirection[] {
  const pd = findProjectDir();
  if (!pd) return [];
  const fp = join(pd, ".bwvi", "learned", DIRECTIONS_FILE);
  try {
    if (existsSync(fp)) {
      return JSON.parse(readFileSync(fp, "utf-8"));
    }
  } catch {}
  return [];
}

export function getLearnedDirection(task: string): LearnedDirection | null {
  const directions = loadLearnedDirections();
  if (directions.length === 0) return null;

  const lower = task.toLowerCase();

  for (const ld of directions) {
    const dirDef = DIRECTIONS.find(d => d.name === ld.direction);
    if (!dirDef) continue;
    const keywords = dirDef.keywords;
    const matchCount = keywords.filter(kw => lower.includes(kw)).length;
    if (matchCount > 0) return ld;
  }

  return null;
}

export function getLearnedPalette(direction: string): DirectionPalette | null {
  const directions = loadLearnedDirections();
  const found = directions.find(d => d.direction === direction);
  return found ? found.palette : null;
}

export function getLearnedFonts(direction: string): { display: string; body: string } | null {
  const directions = loadLearnedDirections();
  const found = directions.find(d => d.direction === direction);
  return found ? { display: found.displayFont, body: found.bodyFont } : null;
}

export function saveLearnedDirection(entry: LearnedDirection): void {
  const pd = findProjectDir();
  if (!pd) return;

  const learnedDir = join(pd, ".bwvi", "learned");
  if (!existsSync(learnedDir)) mkdirSync(learnedDir, { recursive: true });

  const fp = join(learnedDir, DIRECTIONS_FILE);
  let existing: LearnedDirection[] = [];
  try {
    if (existsSync(fp)) {
      existing = JSON.parse(readFileSync(fp, "utf-8"));
    }
  } catch {}

  const idx = existing.findIndex(e => e.direction === entry.direction);
  if (idx >= 0) {
    existing[idx] = entry;
  } else {
    existing.push(entry);
  }

  writeFileSync(fp, JSON.stringify(existing, null, 2), "utf-8");
}

export function getLearnedDirectionsSummary(): { direction: string; source: string; confidence: number }[] {
  return loadLearnedDirections().map(d => ({
    direction: d.direction,
    source: d.source,
    confidence: d.confidence,
  }));
}
