/**
 * skill-loader.ts — YAML 技能加载器
 *
 * 从 src/skills/ 目录加载 .yaml 技能文件，
 * 兼容旧版 content-presets.ts 蓝图系统。
 *
 * v0.5.0 新增: 文件系统技能 → 社区可贡献、热加载、品类可扩展
 */

import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { parse } from "yaml";

/** esbuild 双格式兼容: CJS 输出中 import.meta 不可用，回退 require */
let _require: ReturnType<typeof createRequire>;
try {
  _require = createRequire(import.meta.url);
} catch {
  // @ts-ignore - 仅 CJS bundle 中可用
  _require = require;
}

// ─── 类型定义 ───────────────────────────────────────────────────

export interface SkillSection {
  type: string;
  variant?: string;
  data: Record<string, unknown>;
}

export interface SkillYaml {
  id: string;
  name: string;
  /** 可选 emoji 图标 */
  emoji?: string;
  category: "landing" | "deck" | "social" | "office" | "app" | "poster" | "dashboard";
  industry: string[];
  keywords: string[];
  direction: string;
  dark?: boolean;
  sections: SkillSection[];
  /** Deck 专用: 切换方式和宽高比 */
  transition?: "slide" | "fade" | "flip" | "none";
  aspectRatio?: "16:9" | "4:3" | "3:2";
  /** palette/config 覆盖 */
  palettes?: Array<{
    name: string;
    accent: string;
    paper: string;
    ink: string;
  }>;
  fonts?: string[];
  constraints?: Record<string, unknown>;
}

// ─── 缓存 ────────────────────────────────────────────────────────

let _cachedSkills: SkillYaml[] | null = null;

/** 技能目录路径（相对于项目根） */
const SKILLS_DIR = /* @__PURE__ */ (() => {
  let here: string;
  try {
    here = fileURLToPath(new URL(".", import.meta.url));
  } catch {
    // @ts-ignore - CJS bundle fallback
    here = __dirname;
  }
  // src/engine/ → src/skills/
  const candidate = join(here, "..", "skills");
  if (existsSync(candidate)) return candidate;
  // 也尝试从项目根找 src/skills/
  const root = join(here, "..", "..", "skills");
  if (existsSync(root)) return root;
  return candidate;
})();

// ─── 内部工具函数 ───────────────────────────────────────────────

/** 递归扫描技能目录，返回所有 .yaml 文件路径 */
function findSkillFiles(dir: string): string[] {
  if (!existsSync(dir)) return [];
  const results: string[] = [];
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      results.push(...findSkillFiles(join(dir, entry.name)));
    } else if (entry.isFile() && /\.ya?ml$/i.test(entry.name)) {
      results.push(join(dir, entry.name));
    }
  }
  return results;
}

/** 从文件中加载单个技能 */
function loadSkillFromFile(filePath: string): SkillYaml | null {
  try {
    const raw = readFileSync(filePath, "utf-8");
    const parsed = parse(raw) as Record<string, unknown>;
    if (!parsed || typeof parsed !== "object") {
      console.warn(`[skill-loader] 跳过 ${filePath}: 无效 YAML`);
      return null;
    }
    const skill = parsed as unknown as SkillYaml;
    if (!skill.id || !skill.name) {
      console.warn(`[skill-loader] 跳过 ${filePath}: 缺少 id 或 name`);
      return null;
    }
    if (!skill.category) skill.category = "landing";
    if (!Array.isArray(skill.sections)) skill.sections = [];
    if (!Array.isArray(skill.industry)) skill.industry = [];
    if (!Array.isArray(skill.keywords)) skill.keywords = [];
    return skill;
  } catch (err) {
    console.warn(`[skill-loader] 加载失败 ${filePath}: ${err}`);
    return null;
  }
}

// ─── 公开 API ──────────────────────────────────────────────────

/** 清除缓存（用于测试或热加载） */
export function clearCache(): void {
  _cachedSkills = null;
}

/** 加载所有技能（使用缓存） */
export function loadAllSkills(): SkillYaml[] {
  if (_cachedSkills) return _cachedSkills;

  const files = findSkillFiles(SKILLS_DIR);
  const skills: SkillYaml[] = [];

  for (const file of files) {
    const skill = loadSkillFromFile(file);
    if (skill) skills.push(skill);
  }

  // 如果 YAML 文件为空，尝试回退到旧版 content-presets
  if (skills.length === 0) {
    try {
      // 同步 require 向后兼容
      const { BLUEPRINTS } = _require("../templates/content-presets.js") as any;
      if (Array.isArray(BLUEPRINTS)) {
        for (const bp of BLUEPRINTS) {
          skills.push({
            id: bp.id,
            name: bp.name,
            category: bp.pageType || "landing",
            industry: bp.industry || [],
            keywords: bp.keywords || [],
            direction: bp.direction || "tech-utility",
            dark: bp.dark,
            sections: (bp.sections || []).map((s: any) => ({
              type: s.type,
              variant: s.variant,
              data: s.data || {},
            })),
          } as SkillYaml);
        }
      }
    } catch {
      // 旧版不存在，静默处理
    }
  }

  _cachedSkills = skills;
  return skills;
}

/** 根据 id 查找技能 */
export function findSkillById(id: string): SkillYaml | undefined {
  return loadAllSkills().find((s) => s.id === id);
}

/** 按分类筛选 */
export function getSkillsByCategory(category: string): SkillYaml[] {
  return loadAllSkills().filter((s) => s.category === category);
}

/** 搜索技能（名称/关键词/行业匹配） */
export function searchSkills(query: string): SkillYaml[] {
  const lower = query.toLowerCase();
  return loadAllSkills().filter(
    (s) =>
      s.id.toLowerCase().includes(lower) ||
      s.name.toLowerCase().includes(lower) ||
      s.keywords.some((k) => k.toLowerCase().includes(lower)) ||
      s.industry.some((i) => i.toLowerCase().includes(lower)),
  );
}

/**
 * 基于 TF-IDF 匹配最佳技能
 * 兼容旧版 findBlueprint 接口
 */
export function findBestSkill(
  task: string,
  categoryHint?: string,
): { skill: SkillYaml; confidence: number } {
  const skills = loadAllSkills();
  const lower = task.toLowerCase();
  const taskTokens = tokenize(task);

  // 预计算 IDF（简单版：用所有技能构建语料库）
  const allTokens: string[][] = skills.map((s) => [
    ...s.keywords.map((k) => k.toLowerCase()),
    ...s.industry.map((i) => i.toLowerCase()),
  ]);
  const idfCache = buildIdf(allTokens);

  let best: SkillYaml | null = null;
  let bestScore = -Infinity;

  for (const skill of skills) {
    if (categoryHint && skill.category !== categoryHint) continue;
    let score = 0;
    const bpTokens = [
      ...skill.keywords.map((k) => k.toLowerCase()),
      ...skill.industry.map((i) => i.toLowerCase()),
    ];

    // TF-IDF
    for (const tok of taskTokens) {
      if (bpTokens.includes(tok)) {
        score += idfCache.get(tok) || 1;
      }
    }

    // 精确短语加分
    for (const kw of skill.keywords) {
      if (lower.includes(kw)) score += 2;
    }
    for (const ind of skill.industry) {
      if (lower.includes(ind.toLowerCase())) score += 3;
    }

    // 分类加分
    const categoryBoosts: Record<string, number> = {
      landing: /\b(landing|homepage|首页|落地|page|site)\b/.test(lower) ? 1.5 : 0,
      deck: /\b(deck|slide|presentation|ppt|幻灯片|演示|路演|pitch)\b/.test(lower) ? 4 : 0,
      social: /\b(social|card|share|twitter|xhs|小红书|tweet|post)\b/.test(lower) ? 4 : 0,
      office: /\b(okr|report|invoice|meeting|weekly|onboarding|runbook)\b/.test(lower) ? 4 : 0,
      app: /\b(app|mobile|ios|android|手机|小程序)\b/.test(lower) ? 3 : 0,
      poster: /\b(poster|海报|print|印刷|打印)\b/.test(lower) ? 4 : 0,
      dashboard: /\b(dashboard|admin|后台)\b/.test(lower) ? 3 : 0,
    };
    score += categoryBoosts[skill.category] || 0;

    if (score > bestScore) {
      bestScore = score;
      best = skill;
    }
  }

  if (!best) best = skills.find((s) => s.id === "landing-saas") || skills[0] || createFallbackSkill();
  const confidence = bestScore > 0 ? Math.min(bestScore / 15, 1) : 0.05;
  return { skill: best, confidence };
}

/** 提供所有品类列表 */
export function listCategories(): string[] {
  const cats = new Set(loadAllSkills().map((s) => s.category));
  return Array.from(cats);
}

/** 提供统计信息 */
export function getSkillStats(): { total: number; byCategory: Record<string, number> } {
  const skills = loadAllSkills();
  const byCategory: Record<string, number> = {};
  for (const s of skills) {
    byCategory[s.category] = (byCategory[s.category] || 0) + 1;
  }
  return { total: skills.length, byCategory };
}

// ─── 工具函数 ──────────────────────────────────────────────────

function tokenize(s: string): string[] {
  return s
    .toLowerCase()
    .split(/[\s_\-\/\\,.;:!?()【】\[\]{}"'（）、。，；：！？]+/)
    .filter((t) => t.length > 1);
}

function buildIdf(allDocs: string[][]): Map<string, number> {
  const df = new Map<string, number>();
  for (const doc of allDocs) {
    const seen = new Set(doc);
    for (const term of seen) df.set(term, (df.get(term) || 0) + 1);
  }
  const total = allDocs.length;
  const idfMap = new Map<string, number>();
  for (const [term, count] of df) {
    idfMap.set(term, Math.log(1 + (total - count + 0.5) / (count + 0.5)));
  }
  return idfMap;
}

function createFallbackSkill(): SkillYaml {
  return {
    id: "landing-saas",
    name: "通用 Landing",
    category: "landing",
    industry: ["general", "通用"],
    keywords: ["landing", "page"],
    direction: "tech-utility",
    sections: [],
  };
}
