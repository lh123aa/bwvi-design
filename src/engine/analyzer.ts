import { DECISION_REGISTRY, type DesignDecision, type DecisionType } from "../types/decision.js";

export function getNextDecisions(completedDecisions: DesignDecision[]): DecisionType[] {
  if (completedDecisions.length === 0) {
    return [DECISION_REGISTRY.root];
  }
  const last = completedDecisions[completedDecisions.length - 1];
  const node = DECISION_REGISTRY.graph[last.type];
  if (!node || node.next.length === 0) return [];
  const alreadyDone = new Set(completedDecisions.map((d) => d.type));
  return node.next.filter((t) => !alreadyDone.has(t));
}

export function isDecisionChainComplete(decisions: DesignDecision[]): boolean {
  const done = new Set(decisions.map((d) => d.type));
  const allTypes = Object.keys(DECISION_REGISTRY.graph) as DecisionType[];
  return allTypes.every((t) => done.has(t));
}

export function estimateTokens(knowledgeChunks: Record<string, string>): number {
  let total = 0;
  for (const body of Object.values(knowledgeChunks)) {
    total += body.split(/\s+/).length;
  }
  return total;
}

export interface Direction {
  name: string;
  label: string;
  keywords: string[];
  school: string;
  palette_hint: string;
}

export const DIRECTIONS: Direction[] = [
  // Original 5
  {
    name: "editorial-monocle", label: "编辑式克制 Editorial Monocle",
    keywords: ["编辑式", "克制", "文字驱动", "单 accent", "杂志", "文章", "博客", "editorial", "content"],
    school: "info-architecture", palette_hint: "深蓝 + 暖红",
  },
  {
    name: "warm-minimal", label: "温暖极简 Warm Minimal",
    keywords: ["温暖", "留白", "自然", "柔和", "有机", "舒适", "手作", "咖啡", "warm", "cozy"],
    school: "minimalist", palette_hint: "暖橙 + 棕褐",
  },
  {
    name: "tech-utility", label: "科技实用 Tech Utility",
    keywords: ["科技", "中性色", "数据驱动", "干净", "SaaS", "developer", "工具", "dashboard", "B2B"],
    school: "info-architecture", palette_hint: "深灰 + 绿 accent",
  },
  {
    name: "dark-luxury", label: "深色奢华 Dark Luxury",
    keywords: ["深色", "高对比", "奢华", "大胆", "premium", "高端", "夜间", "影院"],
    school: "experimental", palette_hint: "黑色 + 金 accent",
  },
  {
    name: "playful-color", label: "多彩趣味 Playful Color",
    keywords: ["多彩", "有机", "轻松", "创意", "fun", "活泼", "年轻", "游戏", "教育"],
    school: "experimental", palette_hint: "多色 + 对比 accent",
  },
  // New 5
  {
    name: "corporate-trust", label: "企业信赖 Corporate Trust",
    keywords: ["企业", "专业", "信赖", "B2B", "金融", "银行", "保险", "咨询", "corporate", "enterprise", "正式"],
    school: "info-architecture", palette_hint: "蓝色 + 绿色 accent",
  },
  {
    name: "luxury-premium", label: "奢华高端 Luxury Premium",
    keywords: ["奢华", "高端", "精品", "时尚", "lifestyle", "premium", "精致", "名品"],
    school: "minimalist", palette_hint: "黑金 + 衬线",
  },
  {
    name: "nature-organic", label: "自然有机 Nature Organic",
    keywords: ["自然", "环保", "绿色", "有机", "健康", "户外", "生态", "sustainable", "earth"],
    school: "eastern", palette_hint: "墨绿 + 大地色",
  },
  {
    name: "tech-gradient", label: "科技渐变 Tech Gradient",
    keywords: ["渐变", "未来感", "SaaS", "AI", "科技", "现代", "创新", "前沿", "gradient", "现代感"],
    school: "motion-poetics", palette_hint: "紫 + 蓝渐变",
  },
  {
    name: "minimal-white", label: "极简白 Minimal White",
    keywords: ["极简", "白色", "留白", "干净", "简约", "禅", "minimal", "white", "安静"],
    school: "minimalist", palette_hint: "黑白 + 单 accent",
  },
];

export function recommendDirections(task: string, count: number = 3): Direction[] {
  const lower = task.toLowerCase();
  const scored = DIRECTIONS.map((d) => ({
    ...d,
    score: d.keywords.filter((kw) => lower.includes(kw)).length * 2,
  })).sort((a, b) => b.score - a.score);

  const selected = scored.slice(0, count);
  if (selected.length < count) {
    const extra = DIRECTIONS.filter((d) => !selected.find((s) => s.name === d.name));
    for (const e of extra) {
      if (selected.length >= count) break;
      selected.push({ ...e, score: 0 });
    }
  }
  return selected;
}

export function inferTaskType(task: string): string {
  const lower = task.toLowerCase();
  if (/\b(landing|homepage|首页|落地|marketing|营销)\b/.test(lower)) return "landing_page";
  if (/\b(dashboard|admin|后台|管理|analytics|数据)\b/.test(lower)) return "dashboard";
  if (/\b(ppt|deck|slide|presentation|幻灯片|演示)\b/.test(lower)) return "deck";
  if (/\b(mobile|app|ios|android|手机|小程序)\b/.test(lower)) return "mobile_app";
  if (/\b(poster|海报|banner|广告|宣传)\b/.test(lower)) return "poster";
  if (/\b(blog|文章|newsletter|期刊)\b/.test(lower)) return "blog";
  if (/\b(shop|ecommerce|电商|商城|store)\b/.test(lower)) return "ecommerce";
  return "general";
}
