import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const EMBEDDED: Record<string, string> = {
  "direction-advisor": "5 基础方向",
  "color-theory": "色板规则",
  "typography-pairing": "字体规则",
};

// Try knowledge/ directory relative to CWD, then bundled knowledge/
function findKnowledgeDir(): string | null {
  const dirs = [
    join(process.cwd(), "knowledge"),
  ];
  for (const d of dirs) { if (existsSync(d)) return d; }
  return null;
}

let fileCache: Record<string, string> | null = null;

function loadFromFiles(): Record<string, string> {
  if (fileCache) return fileCache;
  fileCache = {};
  const kd = findKnowledgeDir();
  if (!kd) return fileCache;
  try {
    const files = readdirSync(kd).filter(f => f.endsWith(".md")).sort();
    for (const f of files) {
      const raw = readFileSync(join(kd, f), "utf-8");
      const body = raw.replace(/^---[\s\S]*?---\n?/, "").trim();
      const key = f.replace(/^\d+-/, "").replace(/\.md$/, "");
      fileCache[key] = body;
    }
  } catch {}
  return fileCache;
}

export function loadChunk(id: string): string | null {
  return loadFromFiles()[id] || EMBEDDED[id] || null;
}

export function listChunks(): string[] {
  const keys = new Set([...Object.keys(loadFromFiles()), ...Object.keys(EMBEDDED)]);
  return [...keys].sort();
}

export function loadMultiple(ids: string[]): Record<string, string> {
  const r: Record<string, string> = {};
  for (const id of ids) { const c = loadChunk(id); if (c) r[id] = c; }
  return r;
}

export function getChunkDescription(id: string): string {
  const ds: Record<string, string> = {
    "direction-advisor": "5 基础视觉方向", "color-theory": "色板决策", "typography-pairing": "字体配对",
    "layout-patterns": "8 布局模式", "motion-principles": "动效原则", "content-guidelines": "内容规则",
    "brand-protocol": "品牌资产协议", "component-specs": "组件规格", "spacing-system": "间距系统",
    "responsive-breakpoints": "响应式断点", "icon-guidelines": "图标规范", "image-guidelines": "图片规范",
    "form-design": "表单设计", "navigation-patterns": "导航模式", "data-visualization": "数据可视化",
  };
  return ds[id] || id;
}

export function reloadKnowledge(): number {
  fileCache = null;
  return Object.keys(loadFromFiles()).length;
}
