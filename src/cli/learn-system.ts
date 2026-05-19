import { existsSync } from "node:fs";
import { join } from "node:path";
import { measureCapabilities, diagnoseWeakest, generateLearningReport, recordImprovement } from "../engine/capability-graph.js";
import { ingestFromUrl, ingestFromFeedback, ingestFromCritiquePatterns, listKnowledgeChunks, getKnowledgeStats } from "../engine/knowledge-pipeline.js";
import { ingestFromPrinciples } from "../engine/principles-ingest.js";
import { getLearnedDirectionsSummary } from "../engine/learned-knowledge-bridge.js";
import { errExit, result, info, warn, success, title, data, step } from "./ux.js";
import type { CapabilityId } from "../types/learning.js";

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

export async function learnSystemCommand(args: string[]) {
  const cleanArgs = args.filter(a => a !== "--json");
  const sub = cleanArgs[0];

  if (!sub || sub === "status") {
    const report = generateLearningReport();
    const ch = report.capabilities.map(c => ({
      id: c.id,
      level: `${c.currentLevel}/${c.maxLevel}`,
      name: c.name,
      diagnosis: c.diagnosis,
      bottleneck: c.bottleneck,
      improvements: c.improvementHistory.length,
    }));
    const sorted = [...ch].sort((a, b) => {
      const aL = parseInt(a.level);
      const bL = parseInt(b.level);
      return aL - bL;
    });

    title(`BWVI 学习系统状态 — 综合评分 ${report.overallLevel}/10`);
    info(`${report.capabilities.length} 个能力节点 | ${report.knowledgeChunks} 个知识块 | ${report.totalImprovements} 次改进记录`);
    info(`最弱: ${report.weakest.id} (${report.weakest.level}/10) — ${report.weakest.bottleneck}`);
    info(`最强: ${report.strongest.id} (${report.strongest.level}/10)`);
    const ld = getLearnedDirectionsSummary();
    if (ld.length > 0) info(`已学习方向: ${ld.length} 个`);
    step("各能力详情 (按等级升序):");
    for (const c of sorted) {
      const icon = parseInt(c.level) <= 3 ? "🔴" : parseInt(c.level) <= 5 ? "🟡" : "🟢";
      info(`${icon} ${c.id.padEnd(28)} ${c.level.padEnd(6)} ${c.name}`);
      data("瓶颈", c.bottleneck);
    }

    result({
      overall_level: report.overallLevel,
      total_capabilities: report.capabilities.length,
      weakest: { id: report.weakest.id, level: report.weakest.level, bottleneck: report.weakest.bottleneck },
      strongest: { id: report.strongest.id, level: report.strongest.level },
      capabilities: sorted,
      total_improvements: report.totalImprovements,
      knowledge_chunks: report.knowledgeChunks,
      learned_directions: getLearnedDirectionsSummary(),
    });
    return;
  }

  if (sub === "diagnose") {
    const report = generateLearningReport();
    const weakest = report.capabilities.reduce((w, c) => c.currentLevel < w.currentLevel ? c : w);
    const secondWeakest = report.capabilities
      .filter(c => c.id !== weakest.id)
      .reduce((w, c) => c.currentLevel < w.currentLevel ? c : w);

    title("BWVI 能力瓶颈诊断");
    warn(`[优先级 1] ${weakest.name} (${weakest.currentLevel}/${weakest.maxLevel})`);
    data("诊断", weakest.diagnosis);
    data("瓶颈", weakest.bottleneck);
    warn(`[优先级 2] ${secondWeakest.name} (${secondWeakest.currentLevel}/${secondWeakest.maxLevel})`);
    data("瓶颈", secondWeakest.bottleneck);
    step("完整排序:");
    const sorted = [...report.capabilities].sort((a, b) => a.currentLevel - b.currentLevel);
    for (const c of sorted) {
      info(`  ${c.currentLevel}/${c.maxLevel}  ${c.id.padEnd(28)} ${c.bottleneck}`);
    }

    result({
      priority_1: {
        id: weakest.id,
        name: weakest.name,
        level: `${weakest.currentLevel}/${weakest.maxLevel}`,
        diagnosis: weakest.diagnosis,
        bottleneck: weakest.bottleneck,
      },
      priority_2: {
        id: secondWeakest.id,
        name: secondWeakest.name,
        level: `${secondWeakest.currentLevel}/${secondWeakest.maxLevel}`,
        bottleneck: secondWeakest.bottleneck,
      },
      full_report: report.capabilities.map(c => ({
        id: c.id,
        level: c.currentLevel,
        bottleneck: c.bottleneck,
      })).sort((a, b) => a.level - b.level),
    });
    return;
  }

  if (sub === "ingest") {
    const source = cleanArgs[1];

    if (!source) {
      errExit("请提供知识源: URL 或 feedback/critique", "MISSING_SOURCE");
    }

    if (source === "feedback") {
      const pd = findProjectDir();
      if (!pd) { errExit("未找到项目", "NO_PROJECT"); return; }
      const fbDir = join(pd, ".bwvi", "feedback");
      step("正在从反馈数据学习...");
      const result_data = await ingestFromFeedback(fbDir);
      success(`从反馈提取了 ${result_data.chunksCreated} 个知识块`);
      result(result_data as unknown as Record<string, unknown>);
      return;
    }

    if (source === "critique") {
      const pd = findProjectDir();
      if (!pd) { errExit("未找到项目", "NO_PROJECT"); return; }
      const reportsDir = join(pd, ".bwvi", "reports");
      step("正在从评审报告学习...");
      const result_data = await ingestFromCritiquePatterns(reportsDir);
      success(`从评审报告提取了 ${result_data.chunksCreated} 个知识块`);
      result(result_data as unknown as Record<string, unknown>);
      return;
    }

    if (source.startsWith("http://") || source.startsWith("https://")) {
      step(`正在从 ${source} 学习...`);
      const result_data = await ingestFromUrl(source);
      success(`学习完成: ${result_data.summary.substring(0, 40)}`);
      data("知识块", `${result_data.chunksCreated} 个`);
      result(result_data as unknown as Record<string, unknown>);
      return;
    }

    if (source === "principles") {
      step("正在从源码抽取设计原理知识...");
      const result_data = await ingestFromPrinciples();
      success(`知识文件生成完成: ${result_data.summary}`);
      result(result_data as unknown as Record<string, unknown>);
      return;
    }

    errExit(`不支持的知识源: ${source}. 支持: URL, "feedback", "critique", "principles"`, "INVALID_SOURCE");
    return;
  }

  if (sub === "improve") {
    const capabilityId = cleanArgs[1] as CapabilityId | undefined;
    if (!capabilityId) {
      const report = generateLearningReport();
      const weakest = report.capabilities.reduce((w, c) => c.currentLevel < w.currentLevel ? c : w);
      result({
        message: `请指定要升级的能力. 推荐: ${weakest.id} (${weakest.name})`,
        available: report.capabilities.map(c => ({ id: c.id, level: c.currentLevel, name: c.name })),
        recommended: weakest.id,
      });
      return;
    }

    const caps = measureCapabilities();
    const target = caps.find(c => c.id === capabilityId);
    if (!target) {
      errExit(`未知能力: ${capabilityId}`, "INVALID_CAPABILITY");
      return;
    }

    const capDefs: Record<string, { name: string; method: string; description: string }> = {
      "knowledge-quality": { name: "知识质量", method: "knowledge-ingest", description: "从外部来源学习新知识并注入知识库" },
      "direction-recommendation": { name: "方向推荐", method: "algorithm-upgrade", description: "升级到 Semantic Embedding 语义匹配" },
      "palette-generation": { name: "色板生成", method: "algorithm-upgrade", description: "实现 HSL 色板生成器" },
      "typography-pairing": { name: "字体配对", method: "algorithm-upgrade", description: "引入 Typographic Scale" },
      "layout-generation": { name: "布局生成", method: "data-expansion", description: "增加新行业蓝图" },
      "critique-objective": { name: "客观评审", method: "algorithm-upgrade", description: "引入对比度/层级/间距分析" },
      "critique-self-review": { name: "自评系统", method: "algorithm-upgrade", description: "引入加权评分" },
      "brand-coverage": { name: "品牌覆盖", method: "data-expansion", description: "扩充品牌数据" },
      "style-coverage": { name: "风格覆盖", method: "data-expansion", description: "新增风格变体" },
      "animation": { name: "动画引擎", method: "algorithm-upgrade", description: "增加 scroll-trigger" },
      "learning-from-url": { name: "URL 学习", method: "algorithm-upgrade", description: "支持 Playwright 渲染" },
      "feedback-learning": { name: "反馈学习", method: "feedback-accumulation", description: "积累反馈数据" },
    };

    const def = capDefs[capabilityId];
    if (!def) {
      errExit(`未知能力定义: ${capabilityId}`, "NO_DEF");
      return;
    }

    const newLevel = Math.min(target.maxLevel, target.currentLevel + 1);
    const entry = {
      id: `improve-${Date.now()}`,
      timestamp: new Date().toISOString(),
      previousLevel: target.currentLevel,
      newLevel,
      method: def.method as "knowledge-ingest" | "algorithm-upgrade" | "data-expansion" | "feedback-accumulation",
      description: def.description,
      source: "cli-learn-system",
      verified: false,
    };

    await recordImprovement(capabilityId, entry);

    success(`${def.name}: ${target.currentLevel}/${target.maxLevel} → ${newLevel}/${target.maxLevel}`);
    data("方法", def.method);
    data("描述", def.description);

    result({
      improved: capabilityId,
      name: def.name,
      from: target.currentLevel,
      to: newLevel,
      max: target.maxLevel,
      method: def.method,
      description: def.description,
      message: `${def.name}: ${target.currentLevel}/${target.maxLevel} → ${newLevel}/${target.maxLevel}`,
    });
    return;
  }

  if (sub === "history") {
    const report = generateLearningReport();
    const history = report.capabilities
      .flatMap(c => c.improvementHistory.map(h => ({ ...h, capability: c.id, capability_name: c.name })))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    title("BWVI 改进历史");
    info(`总改进次数: ${report.totalImprovements}`);
    if (history.length === 0) {
      warn("暂无改进记录。使用 bwvi learn-system improve <id> 开始改进。");
    }
    for (const h of history.slice(0, 20)) {
      step(`${h.capability_name} (${h.capability}): ${h.previousLevel} → ${h.newLevel}`);
      data("方法", h.method);
      data("时间", new Date(h.timestamp).toLocaleString());
    }
    step("各能力改进统计:");
    for (const c of report.capabilities) {
      info(`  ${c.id.padEnd(28)} ${c.currentLevel}/${c.maxLevel}  (${c.improvementHistory.length} 次改进)`);
    }

    result({
      total_improvements: report.totalImprovements,
      history: history.slice(0, 30),
      per_capability: report.capabilities.map(c => ({
        id: c.id,
        name: c.name,
        level: c.currentLevel,
        improvements: c.improvementHistory.length,
      })),
    });
    return;
  }

  if (sub === "knowledge") {
    const stats = await getKnowledgeStats();
    const chunks = await listKnowledgeChunks();
    const learnedDirections = getLearnedDirectionsSummary();

    title("BWVI 知识库");
    info(`知识块数: ${stats?.totalChunks || chunks.length}`);
    data("总 Token", `${stats?.totalTokens || "?"}`);
    data("已学习方向", `${learnedDirections.length} 个`);
    step("知识块详情:");
    for (const c of chunks.sort((a, b) => b.tokenCount - a.tokenCount)) {
      const label = c.title || c.id;
      data(label, `${c.tokenCount} tokens`);
    }
    if (learnedDirections.length > 0) {
      step("已学习方向:");
      for (const ld of learnedDirections) {
        info(`  ${ld.direction} (置信度: ${ld.confidence}, 来源: ${ld.source})`);
      }
    }

    result({
      stats,
      chunks: chunks.sort((a, b) => b.tokenCount - a.tokenCount),
      learned_directions: learnedDirections,
    });
    return;
  }

  if (sub === "help" || sub === "--help") {
    console.log(`
bwvi learn-system status         查看所有能力状态
bwvi learn-system diagnose       诊断最大瓶颈
bwvi learn-system improve <id>   升级指定能力（如 direction-recommendation）
bwvi learn-system ingest <url>   从 URL 学习新知识
bwvi learn-system ingest feedback 从反馈数据学习
bwvi learn-system ingest critique 从评审报告学习
bwvi learn-system history        查看升级历史
bwvi learn-system knowledge      查看已学知识块
`);
    return;
  }

  errExit(`未知子命令: ${sub}. 使用 bwvi learn-system help 查看帮助`, "UNKNOWN_SUBCOMMAND");
}
