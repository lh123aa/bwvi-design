import { existsSync, mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { join } from "node:path";

interface ImageSpec {
  section: string;
  keyword: string;
  width: number;
  height: number;
}

interface ImageResult {
  url: string;
  dataUri: string;
  cached: boolean;
}

const CACHE_DIR = ".bwvi/references";

function cacheDir(projectDir?: string): string {
  return projectDir ? join(projectDir, CACHE_DIR) : ".bwvi/references";
}

function ensureCacheDir(projectDir?: string): string {
  const d = cacheDir(projectDir);
  if (!existsSync(d)) mkdirSync(d, { recursive: true });
  return d;
}

function cacheKey(keyword: string): string {
  return keyword.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40) + ".txt";
}

function readCache(keyword: string, dir: string): string | null {
  try {
    const p = join(dir, cacheKey(keyword));
    return existsSync(p) ? readFileSync(p, "utf-8") : null;
  } catch { return null; }
}

function writeCache(keyword: string, url: string, dir: string): void {
  try { writeFileSync(join(dir, cacheKey(keyword)), url, "utf-8"); } catch {}
}

export async function resolveImages(
  specs: ImageSpec[],
  projectDir?: string
): Promise<ImageResult[]> {
  const results: ImageResult[] = [];

  for (const spec of specs) {
    const dir = ensureCacheDir(projectDir);
    const cached = readCache(spec.keyword, dir);

    if (cached) {
      results.push({ url: cached, dataUri: cached, cached: true });
      continue;
    }

    try {
      const url = await fetchUnsplash(spec.keyword);
      if (url) {
        writeCache(spec.keyword, url, dir);
        results.push({ url, dataUri: url, cached: false });
        continue;
      }
    } catch {}

    const fallback = getPlaceholder(spec);
    results.push({ url: fallback, dataUri: fallback, cached: false });
  }

  return results;
}

async function fetchUnsplash(keyword: string): Promise<string | null> {
  const url = `https://source.unsplash.com/800x600/?${encodeURIComponent(keyword)}`;
  try {
    const resp = await fetch(url, { method: "HEAD" });
    if (resp.ok) return url;
    return null;
  } catch {
    return null;
  }
}

function getPlaceholder(spec: ImageSpec): string {
  const colors = ["#f0f0f0", "#e8e8e8", "#ddd", "#d0d0d0"];
  const c = colors[spec.keyword.length % colors.length];
  return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${spec.width}" height="${spec.height}"><rect fill="${c}" width="${spec.width}" height="${spec.height}"/><text x="50%" y="50%" fill="#999" font-size="14" text-anchor="middle" dominant-baseline="middle">${spec.keyword}</text></svg>`)}`;
}

export function analyzeHtmlForImages(html: string): ImageSpec[] {
  const specs: ImageSpec[] = [];
  const sectionRegex = /section|hero|feature|card|banner|showcase|gallery/gi;
  const sections = html.match(sectionRegex) || [];
  const seen = new Set<string>();

  for (const s of sections) {
    const key = s.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      specs.push({ section: key, keyword: key, width: 800, height: 600 });
    }
  }

  if (specs.length === 0) {
    specs.push({ section: "hero", keyword: "hero", width: 1200, height: 800 });
  }

  return specs;
}
