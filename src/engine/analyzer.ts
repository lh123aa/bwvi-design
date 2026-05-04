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

export const DIRECTIONS = [
  {
    name: "editorial-monocle",
    label: "编辑式克制 Editorial Monocle",
    keywords: ["编辑式", "克制", "文字驱动", "单 accent"],
  },
  {
    name: "warm-minimal",
    label: "温暖极简 Warm Minimal",
    keywords: ["温暖", "留白", "自然", "柔和"],
  },
  {
    name: "tech-utility",
    label: "科技实用 Tech Utility",
    keywords: ["科技", "中性色", "数据驱动", "干净"],
  },
  {
    name: "dark-luxury",
    label: "深色奢华 Dark Luxury",
    keywords: ["深色", "高对比", "奢华", "大胆"],
  },
  {
    name: "playful-color",
    label: "多彩趣味 Playful Color",
    keywords: ["多彩", "有机", "轻松", "创意"],
  },
];

export function recommendDirections(task: string, count: number = 3) {
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
