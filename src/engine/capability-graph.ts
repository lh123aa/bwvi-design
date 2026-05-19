import { readFileSync, readdirSync, existsSync, mkdirSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { CapabilityId, CapabilityNode, ImprovementEntry, LearningReport } from "../types/learning.js";
import { listChunks } from "../knowledge/loader.js";
import { listBrands } from "./brand-loader.js";
import { listStyles } from "./style-systems.js";
import { DIRECTION_NAMES } from "./palettes.js";
import { BLUEPRINTS } from "../templates/content-presets.js";

const CAPABILITY_DEFS: Record<CapabilityId, {
  name: string;
  description: string;
  maxLevel: number;
  measure: () => { level: number; diagnosis: string; bottleneck: string };
  improve: (current: CapabilityNode) => Promise<ImprovementEntry | null>;
}> = {
  "knowledge-quality": {
    name: "知识质量",
    description: "知识库的完整性与深度",
    maxLevel: 10,
    measure: () => {
      const chunkIds = listChunks();
      const kd = findKnowledgeDir();
      let meaningfulContentCount = 0;
      if (kd) {
        try {
          const files = readdirSync(kd).filter(f => f.endsWith(".md"));
          for (const f of files) {
            const content = readFileSync(join(kd, f), "utf-8");
            const body = content.replace(/^---[\s\S]*?---\n?/, "").trim();
            const meaningful = body.length > 200 && /[规则原则指南比例对比度步骤方法设计技巧建议搭配组合]/.test(body);
            if (meaningful) meaningfulContentCount++;
          }
        } catch {}
      }

      if (meaningfulContentCount === 0 && chunkIds.length <= 5) {
        return { level: 1, diagnosis: "知识文件为空壳, 仅含内置摘要", bottleneck: "知识文件无实质内容" };
      }
      if (chunkIds.length >= 12 && meaningfulContentCount >= 5) {
        const files = kd ? readdirSync(kd).filter(f => f.endsWith(".md")).length : 0;
        if (files >= 15 && meaningfulContentCount >= 10) return { level: 8, diagnosis: "知识库完整且有实质内容", bottleneck: "知识可进一步深化" };
        if (files >= 10) return { level: 6, diagnosis: "知识库基本完整, 部分文件仍需填充", bottleneck: `${(files || 0)} 个文件中有 ${meaningfulContentCount} 个有实质内容` };
        return { level: 5, diagnosis: "有实质内容但文件数不足", bottleneck: "需要更多知识文件" };
      }
      if (meaningfulContentCount > 0) {
        return { level: 4, diagnosis: `${meaningfulContentCount}/${chunkIds.length} 个知识块有实质内容`, bottleneck: "每个知识块需扩展 3-5 倍" };
      }
      return { level: 2, diagnosis: `${chunkIds.length} 个文件但无实质内容 (仅方向列表)`, bottleneck: "知识文件无实质设计规则" };
    },
    improve: async (current) => {
      return {
        id: `improve-${Date.now()}`,
        timestamp: new Date().toISOString(),
        previousLevel: current.currentLevel,
        newLevel: Math.min(current.maxLevel, current.currentLevel + 1),
        method: "knowledge-ingest",
        description: "从外部来源学习新知识，注入知识库",
        source: "capability-graph",
        verified: false,
      };
    },
  },
  "direction-recommendation": {
    name: "方向推荐",
    description: "根据任务描述推荐设计方向",
    maxLevel: 10,
    measure: () => {
      const count = DIRECTION_NAMES.length;
      if (count <= 5) return { level: 2, diagnosis: "仅有 5 个基础方向, 覆盖面窄", bottleneck: "方向数量不足" };
      if (count >= 10) {
        return {
          level: 4,
          diagnosis: "10 个预设方向, 使用关键词匹配, 缺乏语义理解",
          bottleneck: "关键词匹配 → Semantic Embedding",
        };
      }
      return { level: 3, diagnosis: "方向数不足", bottleneck: "需扩展到 10+ 方向" };
    },
    improve: async () => {
      return {
        id: `improve-${Date.now()}`,
        timestamp: new Date().toISOString(),
        previousLevel: 4,
        newLevel: 6,
        method: "algorithm-upgrade",
        description: "从关键词匹配升级到 Semantic Embedding 语义匹配",
        source: "capability-graph",
        verified: false,
      };
    },
  },
  "palette-generation": {
    name: "色板生成",
    description: "根据方向和品牌生成色板",
    maxLevel: 10,
    measure: () => {
      return {
        level: 6,
        diagnosis: "HSL 色板引擎: 6 种和谐模式(单色/类似/互补/分裂互补/三角/四角), 动态色板生成, WCAG 对比度验证",
        bottleneck: "色板生成 → AI 辅助色板推荐",
      };
    },
    improve: async () => {
      return {
        id: `improve-${Date.now()}`,
        timestamp: new Date().toISOString(),
        previousLevel: 6,
        newLevel: 7,
        method: "algorithm-upgrade",
        description: "引入 AI 色板推荐, 根据品牌调性自动选择和谐模式",
        source: "capability-graph",
        verified: false,
      };
    },
  },
  "typography-pairing": {
    name: "字体配对",
    description: "选择显示字体和正文字体组合",
    maxLevel: 10,
    measure: () => {
      return {
        level: 6,
        diagnosis: "字体分类系统(5 类) + 8 种排版比例尺(minor-second ~ golden-ratio) + 12 条配对规则",
        bottleneck: "字体配对 → 语义级字体推荐",
      };
    },
    improve: async () => {
      return {
        id: `improve-${Date.now()}`,
        timestamp: new Date().toISOString(),
        previousLevel: 6,
        newLevel: 7,
        method: "algorithm-upgrade",
        description: "引入 Google Fonts API 实时搜索, 语义匹配字体风格",
        source: "capability-graph",
        verified: false,
      };
    },
  },
  "layout-generation": {
    name: "布局生成",
    description: "基于蓝图生成页面布局",
    maxLevel: 10,
    measure: () => {
      const bpCount = countBlueprints();
      const baseMsg = bpCount >= 30 ? `30+ 预设蓝图` : `${bpCount} 个蓝图`;
      return { level: 6, diagnosis: `${baseMsg} + 动态布局引擎(8px 网格/间距节奏/视觉重量/3 种密度)`, bottleneck: "动态布局 → 响应式自适应布局" };
    },
    improve: async () => {
      return {
        id: `improve-${Date.now()}`,
        timestamp: new Date().toISOString(),
        previousLevel: 6,
        newLevel: 7,
        method: "algorithm-upgrade",
        description: "实现响应式断点自适应, 自动调整列数和间距",
        source: "capability-graph",
        verified: false,
      };
    },
  },
  "critique-objective": {
    name: "客观评审",
    description: "10 维客观指标评审 HTML",
    maxLevel: 10,
    measure: () => {
      return {
        level: 4,
        diagnosis: "基于正则匹配检查标签存在性, 非真正设计评审",
        bottleneck: "标签检查 → 视觉层级分析 + 对比度计算 + 色板协调性",
      };
    },
    improve: async () => {
      return {
        id: `improve-${Date.now()}`,
        timestamp: new Date().toISOString(),
        previousLevel: 4,
        newLevel: 6,
        method: "algorithm-upgrade",
        description: "引入对比度计算、视觉层级分析、间距节奏检查",
        source: "capability-graph",
        verified: false,
      };
    },
  },
  "critique-self-review": {
    name: "自评系统",
    description: "5 维主观评分",
    maxLevel: 10,
    measure: () => {
      return {
        level: 5,
        diagnosis: "规则驱动的 5 维评分, 逻辑正确但维度浅",
        bottleneck: "需要更细粒度的评分规则",
      };
    },
    improve: async () => {
      return {
        id: `improve-${Date.now()}`,
        timestamp: new Date().toISOString(),
        previousLevel: 5,
        newLevel: 6,
        method: "algorithm-upgrade",
        description: "引入加权评分和任务类型自适应权重",
        source: "capability-graph",
        verified: false,
      };
    },
  },
  "brand-coverage": {
    name: "品牌覆盖",
    description: "内置品牌系统数据量",
    maxLevel: 10,
    measure: () => {
      const brands = listBrands().length;
      if (brands >= 100) return { level: 7, diagnosis: `${brands} 个品牌, 覆盖 12 分类`, bottleneck: "品牌搜索体验可优化" };
      if (brands >= 50) return { level: 5, diagnosis: `${brands} 个品牌`, bottleneck: "需扩展到 100+" };
      return { level: 3, diagnosis: `仅 ${brands} 个品牌`, bottleneck: "品牌严重不足" };
    },
    improve: async () => {
      return {
        id: `improve-${Date.now()}`,
        timestamp: new Date().toISOString(),
        previousLevel: 7,
        newLevel: 8,
        method: "data-expansion",
        description: "新增品牌数据, 扩充到 150+",
        source: "capability-graph",
        verified: false,
      };
    },
  },
  "style-coverage": {
    name: "风格覆盖",
    description: "内置视觉风格数据量",
    maxLevel: 10,
    measure: () => {
      const styles = listStyles().length;
      if (styles >= 50) return { level: 7, diagnosis: `${styles} 种风格, 7 分类`, bottleneck: "风格可增加变体" };
      if (styles >= 20) return { level: 5, diagnosis: `${styles} 种风格`, bottleneck: "需扩展到 50+" };
      return { level: 3, diagnosis: `仅 ${styles} 种风格`, bottleneck: "风格严重不足" };
    },
    improve: async () => {
      return {
        id: `improve-${Date.now()}`,
        timestamp: new Date().toISOString(),
        previousLevel: 7,
        newLevel: 8,
        method: "data-expansion",
        description: "新增视觉风格变体",
        source: "capability-graph",
        verified: false,
      };
    },
  },
  "animation": {
    name: "动画引擎",
    description: "CSS 动画注入与视频录制",
    maxLevel: 10,
    measure: () => {
      return {
        level: 6,
        diagnosis: "12 种动画 + 7 种 easing + MP4/GIF 导出",
        bottleneck: "可增加 scroll-trigger 和交互动画",
      };
    },
    improve: async () => {
      return {
        id: `improve-${Date.now()}`,
        timestamp: new Date().toISOString(),
        previousLevel: 6,
        newLevel: 7,
        method: "algorithm-upgrade",
        description: "增加 scroll-trigger 动画和交互触发动画",
        source: "capability-graph",
        verified: false,
      };
    },
  },
  "learning-from-url": {
    name: "URL 学习",
    description: "从网页提取设计 Token",
    maxLevel: 10,
    measure: () => {
      return {
        level: 5,
        diagnosis: "正则提取色值/字体/布局, 不支持 SPA",
        bottleneck: "正则 → Playwright 渲染 + 语义分析",
      };
    },
    improve: async () => {
      return {
        id: `improve-${Date.now()}`,
        timestamp: new Date().toISOString(),
        previousLevel: 5,
        newLevel: 6,
        method: "algorithm-upgrade",
        description: "支持 Playwright 渲染后提取, 兼容 SPA",
        source: "capability-graph",
        verified: false,
      };
    },
  },
  "feedback-learning": {
    name: "反馈学习",
    description: "从用户反馈迭代改进",
    maxLevel: 10,
    measure: () => {
      const pd = findProjectDir();
      if (!pd) return { level: 1, diagnosis: "无项目数据", bottleneck: "需要先创建项目" };
      const fbDir = join(pd, ".bwvi", "feedback");
      if (!existsSync(fbDir)) return { level: 1, diagnosis: "无反馈数据, 尚未形成学习循环", bottleneck: "需要收集反馈" };

      const files = readdirSync(fbDir).filter(f => f.endsWith(".json"));
      const improvements = getHistoryForCapability("feedback-learning");
      const improvementCount = improvements.length;
      let level = 1;
      if (files.length >= 3) level = 2;
      if (files.length >= 6) level = 3;
      if (files.length >= 10) level = 4;
      if (files.length >= 20) level = 5;
      level = Math.min(10, level + improvementCount);
      if (level <= 2) return { level, diagnosis: `${files.length} 条反馈, ${improvementCount} 次改进, 数据不足`, bottleneck: "需要更多反馈数据" };
      if (files.length >= 20) return { level, diagnosis: `${files.length} 条反馈, ${improvementCount} 次改进, 闭环已形成`, bottleneck: "需连接反馈到决策模型" };
      return { level, diagnosis: `${files.length} 条反馈, ${improvementCount} 次改进, 数据积累中`, bottleneck: "需要更多反馈数据" };
    },
    improve: async () => {
      return {
        id: `improve-${Date.now()}`,
        timestamp: new Date().toISOString(),
        previousLevel: 3,
        newLevel: 5,
        method: "feedback-accumulation",
        description: "积累更多反馈数据, 分析用户偏好模式",
        source: "capability-graph",
        verified: false,
      };
    },
  },
};

export function measureCapabilities(): CapabilityNode[] {
  const nodes: CapabilityNode[] = [];

  for (const [id, def] of Object.entries(CAPABILITY_DEFS)) {
    const { level, diagnosis, bottleneck } = def.measure();
    const histPath = getHistoryPath(id as CapabilityId);
    let history: ImprovementEntry[] = [];
    try {
      if (existsSync(histPath)) {
        history = JSON.parse(readFileSync(histPath, "utf-8"));
      }
    } catch {}

    nodes.push({
      id: id as CapabilityId,
      name: def.name,
      description: def.description,
      currentLevel: level,
      maxLevel: def.maxLevel,
      diagnosis,
      bottleneck,
      improvementHistory: history,
    });
  }

  return nodes;
}

export function diagnoseWeakest(capabilities: CapabilityNode[]): CapabilityNode {
  return capabilities.reduce((weakest, c) =>
    c.currentLevel < weakest.currentLevel ? c : weakest
  );
}

export function generateLearningReport(capabilities?: CapabilityNode[]): LearningReport {
  const caps = capabilities || measureCapabilities();

  const weakest = caps.reduce((w, c) => c.currentLevel < w.currentLevel ? c : w);
  const strongest = caps.reduce((s, c) => c.currentLevel > s.currentLevel ? c : s);

  const overallLevel = +(caps.reduce((sum, c) => sum + c.currentLevel, 0) / caps.length).toFixed(1);

  const allHistory = caps.flatMap(c => c.improvementHistory);
  const recent = allHistory.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 5);

  const kd = findKnowledgeDir();
  let knowledgeChunks = listChunks().length;
  if (kd) {
    try {
      knowledgeChunks = readdirSync(kd).filter(f => f.endsWith(".md")).length;
    } catch {}
  }

  return {
    capabilities: caps,
    overallLevel,
    weakest: { id: weakest.id, level: weakest.currentLevel, bottleneck: weakest.bottleneck },
    strongest: { id: strongest.id, level: strongest.currentLevel },
    recentImprovements: recent,
    totalImprovements: allHistory.length,
    knowledgeChunks,
  };
}

export async function recordImprovement(id: CapabilityId, entry: ImprovementEntry): Promise<void> {
  const histPath = getHistoryPath(id);
  const histDir = join(histPath, "..");
  if (!existsSync(histDir)) mkdirSync(histDir, { recursive: true });

  let history: ImprovementEntry[] = [];
  try {
    history = JSON.parse(readFileSync(histPath, "utf-8"));
  } catch {}

  history.push(entry);
  await writeFile(histPath, JSON.stringify(history, null, 2), "utf-8");
}

function getHistoryForCapability(id: CapabilityId): ImprovementEntry[] {
  const histPath = getHistoryPath(id);
  try {
    return JSON.parse(readFileSync(histPath, "utf-8"));
  } catch {
    return [];
  }
}

function getHistoryPath(id: CapabilityId): string {
  return join(findHistoryDir(), `${id}.json`);
}

function findHistoryDir(): string {
  const pd = findProjectDir();
  if (pd) return join(pd, ".bwvi", "capabilities");
  return join(process.cwd(), ".bwvi", "capabilities");
}

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

function findKnowledgeDir(): string | null {
  const dirs = [join(process.cwd(), "knowledge")];
  for (const d of dirs) {
    if (existsSync(d)) return d;
  }
  return null;
}

function countBlueprints(): number {
  return BLUEPRINTS.length;
}
