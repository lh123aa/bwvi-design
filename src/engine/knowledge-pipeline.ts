import { writeFile, readFile, mkdir, readdir } from "node:fs/promises";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import type { KnowledgeChunk, KnowledgeSource, IngestResult } from "../types/learning.js";
import { learnFromUrl, type DesignReference } from "./learner.js";
import { reloadKnowledge } from "../knowledge/loader.js";
import { saveLearnedDirection } from "./learned-knowledge-bridge.js";

const CHUNKS_FILE = "learned-chunks.json";
const SOURCES_FILE = "learned-sources.json";

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

function getDataDir(): string | null {
  const pd = findProjectDir();
  if (!pd) return null;
  const dd = join(pd, ".bwvi", "learned");
  return dd;
}

async function ensureDataDir(): Promise<string> {
  const dd = getDataDir();
  if (!dd) throw new Error("No .bwvi project found. Run bwvi init first.");
  if (!existsSync(dd)) await mkdir(dd, { recursive: true });
  return dd;
}

async function loadChunks(dd: string): Promise<Record<string, KnowledgeChunk>> {
  const p = join(dd, CHUNKS_FILE);
  try {
    return JSON.parse(await readFile(p, "utf-8"));
  } catch {
    return {};
  }
}

async function saveChunks(dd: string, chunks: Record<string, KnowledgeChunk>): Promise<void> {
  await writeFile(join(dd, CHUNKS_FILE), JSON.stringify(chunks, null, 2), "utf-8");
}

async function loadSources(dd: string): Promise<KnowledgeSource[]> {
  const p = join(dd, SOURCES_FILE);
  try {
    return JSON.parse(await readFile(p, "utf-8"));
  } catch {
    return [];
  }
}

async function saveSources(dd: string, sources: KnowledgeSource[]): Promise<void> {
  await writeFile(join(dd, SOURCES_FILE), JSON.stringify(sources, null, 2), "utf-8");
}

export function chunkIdFromUrl(url: string): string {
  return "learned-" + url.replace(/https?:\/\//, "").replace(/[^a-z0-9]/gi, "-").toLowerCase().slice(0, 50);
}

function refToChunks(ref: DesignReference): KnowledgeChunk[] {
  const chunks: KnowledgeChunk[] = [];

  const source: KnowledgeSource = {
    type: "url",
    uri: ref.source.url,
    ingestedAt: ref.source.capturedAt,
    contentSummary: ref.title,
    quality: 0.7,
  };

  const colorKeys = Object.keys(ref.tokens.colors);
  if (colorKeys.length > 0) {
    chunks.push({
      id: chunkIdFromUrl(ref.source.url) + "-palette",
      title: `${ref.title} — 色板`,
      body: colorKeys.map(k => `${k}: ${ref.tokens.colors[k]}`).join("\n"),
      tags: ["palette", ref.detectedSchool, ...ref.tags],
      sources: [source],
      tokenCount: colorKeys.length * 3,
      lastUpdated: ref.source.capturedAt,
    });
  }

  if (ref.tokens.typography.display || ref.tokens.typography.body) {
    const fontLines: string[] = [];
    if (ref.tokens.typography.display) fontLines.push(`display: ${ref.tokens.typography.display}`);
    if (ref.tokens.typography.body) fontLines.push(`body: ${ref.tokens.typography.body}`);
    if (ref.tokens.typography.googleFonts.length > 0) fontLines.push(`google-fonts: ${ref.tokens.typography.googleFonts.join(", ")}`);

    chunks.push({
      id: chunkIdFromUrl(ref.source.url) + "-typography",
      title: `${ref.title} — 字体`,
      body: fontLines.join("\n"),
      tags: ["typography", ref.detectedSchool, ...ref.tags],
      sources: [source],
      tokenCount: fontLines.length * 4,
      lastUpdated: ref.source.capturedAt,
    });
  }

  if (ref.tokens.layout.gridPatterns.length > 0 || ref.tokens.spacing.gapPatterns.length > 0) {
    const layoutLines: string[] = [];
    if (ref.tokens.layout.gridPatterns.length > 0) layoutLines.push(`grid: ${ref.tokens.layout.gridPatterns.join("; ")}`);
    if (ref.tokens.spacing.gapPatterns.length > 0) layoutLines.push(`gap: ${ref.tokens.spacing.gapPatterns.join("; ")}`);

    chunks.push({
      id: chunkIdFromUrl(ref.source.url) + "-layout",
      title: `${ref.title} — 布局`,
      body: layoutLines.join("\n"),
      tags: ["layout", ref.detectedSchool, ...ref.tags],
      sources: [source],
      tokenCount: layoutLines.length * 5,
      lastUpdated: ref.source.capturedAt,
    });
  }

  if (ref.tokens.radius.length > 0 || ref.tokens.motion.transitionPatterns.length > 0) {
    const detailLines: string[] = [];
    if (ref.tokens.radius.length > 0) detailLines.push(`radius: ${ref.tokens.radius.join(", ")}`);
    if (ref.tokens.motion.transitionPatterns.length > 0) detailLines.push(`transition: ${ref.tokens.motion.transitionPatterns.join("; ")}`);

    chunks.push({
      id: chunkIdFromUrl(ref.source.url) + "-details",
      title: `${ref.title} — 细节`,
      body: detailLines.join("\n"),
      tags: ["details", "motion", "radius", ref.detectedSchool, ...ref.tags],
      sources: [source],
      tokenCount: detailLines.length * 4,
      lastUpdated: ref.source.capturedAt,
    });
  }

  return chunks;
}

export async function ingestFromUrl(url: string): Promise<IngestResult> {
  const dd = await ensureDataDir();
  const ref = await learnFromUrl(url);
  const chunks = refToChunks(ref);
  const existing = await loadChunks(dd);

  let created = 0;
  let updated = 0;
  let tokenCount = 0;

  for (const chunk of chunks) {
    tokenCount += chunk.tokenCount;
    if (existing[chunk.id]) {
      existing[chunk.id] = { ...existing[chunk.id], ...chunk, lastUpdated: new Date().toISOString() };
      updated++;
    } else {
      existing[chunk.id] = chunk;
      created++;
    }
  }

  await saveChunks(dd, existing);

  const sources = await loadSources(dd);
  sources.push({
    type: "url",
    uri: url,
    ingestedAt: new Date().toISOString(),
    contentSummary: ref.title,
    quality: ref.confidence,
  });
  await saveSources(dd, sources);

  await injectIntoKnowledgeDir(ref);

  const colorValues = Object.values(ref.tokens.colors);
  const primary = colorValues.find(c => /#[\da-fA-F]{6}/.test(c)) || "#1E1E2E";
  const accent = colorValues.length > 1 ? colorValues[1] : "#00E698";
  const surface = colorValues.length > 2 ? colorValues[2] : "#FAFBFC";
  const textColor = colorValues.length > 3 ? colorValues[3] : "#24292E";

  saveLearnedDirection({
    direction: ref.detectedSchool,
    confidence: ref.confidence,
    source: url,
    palette: { primary, accent, surface, text: textColor },
    displayFont: ref.tokens.typography.display || "'Inter', sans-serif",
    bodyFont: ref.tokens.typography.body || "system-ui, sans-serif",
    learnedAt: new Date().toISOString(),
  });

  return {
    source: url,
    chunksCreated: created,
    chunksUpdated: updated,
    tokensExtracted: tokenCount,
    summary: `${ref.detectedSchool} 方向, ${ref.confidence * 100}% 置信度, ${created} 新建 ${updated} 更新知识块`,
  };
}

async function injectIntoKnowledgeDir(ref: DesignReference): Promise<void> {
  const kd = findKnowledgeDir();
  if (!kd) return;

  const schoolName = ref.detectedSchool;
  const existingFiles = readdirSync(kd).filter(f => f.endsWith(".md") && f.toLowerCase().includes(schoolName.toLowerCase()));

  const paletteLines = Object.entries(ref.tokens.colors).slice(0, 6).map(([k, v]) => `  - ${k}: ${v}`).join("\n");
  const fontLines: string[] = [];
  if (ref.tokens.typography.display) fontLines.push(`  display: ${ref.tokens.typography.display}`);
  if (ref.tokens.typography.body) fontLines.push(`  body: ${ref.tokens.typography.body}`);
  const fontsStr = fontLines.join("\n");
  const gridStr = ref.tokens.layout.gridPatterns.slice(0, 3).join("; ");

  let content = `---
description: 从 ${ref.source.url} 学习的设计知识
tags: [${ref.tags.join(", ")}]
confidence: ${ref.confidence}
source: ${ref.source.url}
---

## 色板
${paletteLines || "  无提取"}

## 字体
${fontsStr || "  无提取"}

## 布局模式
  - grid: ${gridStr || "无提取"}
  - gap: ${ref.tokens.spacing.gapPatterns.slice(0, 3).join("; ") || "无提取"}

## 风格推断
  - 学派: ${ref.detectedSchool}
  - 置信度: ${ref.confidence * 100}%
`;

  let fileName: string;
  if (existingFiles.length > 0) {
    fileName = existingFiles[0];
    const existingPath = join(kd, fileName);
    try {
      const existingContent = readFileSync(existingPath, "utf-8");
      if (existingContent.includes(sourceMarker(ref.source.url))) {
        return;
      }
      content = existingContent + "\n---\n" + content;
    } catch {}
  } else {
    const idx = String(Date.now()).slice(-4);
    fileName = `${idx}-learned-${schoolName}.md`;
  }

  await writeFile(join(kd, fileName), content, "utf-8");
  reloadKnowledge();
}

function sourceMarker(url: string): string {
  return `<!-- source: ${url} -->`;
}

function findKnowledgeDir(): string | null {
  const dirs = [join(process.cwd(), "knowledge")];
  for (const d of dirs) {
    if (existsSync(d)) return d;
  }
  return null;
}

export async function ingestFromFeedback(feedbackDir: string): Promise<IngestResult> {
  const bwviDir = join(feedbackDir, "..");
  const dd = join(bwviDir, "learned");
  if (!existsSync(dd)) await mkdir(dd, { recursive: true });
  const chunks = await loadChunks(dd);
  const feedbackFiles: string[] = [];

  try {
    const files = await readdir(feedbackDir);
    for (const f of files) {
      if (f.endsWith(".json")) feedbackFiles.push(join(feedbackDir, f));
    }
  } catch {}

  if (feedbackFiles.length === 0) {
    return { source: "feedback", chunksCreated: 0, chunksUpdated: 0, tokensExtracted: 0, summary: "无反馈数据" };
  }

  const scores: number[] = [];
  const lowScoreComments: string[] = [];

  for (const fp of feedbackFiles) {
    try {
      const data = JSON.parse(await readFile(fp, "utf-8"));
      if (typeof data.score === "number") scores.push(data.score);
      if (data.score && data.score < 5 && data.comment) {
        lowScoreComments.push(data.comment);
      }
    } catch {}
  }

  const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

  const feedbackChunk: KnowledgeChunk = {
    id: "feedback-patterns",
    title: "用户反馈模式分析",
    body: [
      `总反馈数: ${scores.length}`,
      `平均评分: ${avgScore.toFixed(1)}/10`,
      lowScoreComments.length > 0 ? `低分反馈: ${lowScoreComments.join("; ")}` : "",
    ].filter(Boolean).join("\n"),
    tags: ["feedback", "learning"],
    sources: [{
      type: "feedback",
      uri: feedbackDir,
      ingestedAt: new Date().toISOString(),
      contentSummary: `${scores.length} 条反馈, 平均 ${avgScore.toFixed(1)}/10`,
      quality: scores.length > 5 ? 0.8 : 0.4,
    }],
    tokenCount: lowScoreComments.length * 5 + 10,
    lastUpdated: new Date().toISOString(),
  };

  chunks["feedback-patterns"] = feedbackChunk;
  await saveChunks(dd, chunks);

  return {
    source: `feedback (${feedbackFiles.length} files)`,
    chunksCreated: 1,
    chunksUpdated: 0,
    tokensExtracted: feedbackChunk.tokenCount,
    summary: `已处理 ${scores.length} 条反馈, 平均评分 ${avgScore.toFixed(1)}/10`,
  };
}

export async function ingestFromCritiquePatterns(reportsDir: string): Promise<IngestResult> {
  const bwviDir = join(reportsDir, "..");
  const dd = join(bwviDir, "learned");
  if (!existsSync(dd)) await mkdir(dd, { recursive: true });
  const chunks = await loadChunks(dd);
  const reportFiles: string[] = [];

  try {
    const files = await readdir(reportsDir);
    for (const f of files) {
      if (f.endsWith(".json")) reportFiles.push(join(reportsDir, f));
    }
  } catch {}

  if (reportFiles.length === 0) {
    return { source: "critique", chunksCreated: 0, chunksUpdated: 0, tokensExtracted: 0, summary: "无评审报告" };
  }

  const patternCounts: Record<string, number> = {};
  let totalReports = 0;

  for (const fp of reportFiles) {
    try {
      const data = JSON.parse(await readFile(fp, "utf-8"));
      totalReports++;
      if (data.issues) {
        for (const issue of data.issues) {
          const key = issue.type || issue.message;
          patternCounts[key] = (patternCounts[key] || 0) + 1;
        }
      }
      if (data.warnings) {
        for (const w of data.warnings) {
          patternCounts[w] = (patternCounts[w] || 0) + 1;
        }
      }
    } catch {}
  }

  const sorted = Object.entries(patternCounts).sort((a, b) => b[1] - a[1]);
  const topPatterns = sorted.slice(0, 10);

  const critiqueChunk: KnowledgeChunk = {
    id: "critique-patterns",
    title: "评审失败模式分析",
    body: topPatterns.map(([p, c]) => `  ${p}: ${c} 次`).join("\n") || "  无模式数据",
    tags: ["critique", "patterns", "learning"],
    sources: [{
      type: "critique-pattern",
      uri: reportsDir,
      ingestedAt: new Date().toISOString(),
      contentSummary: `${totalReports} 份报告, ${sorted.length} 种模式`,
      quality: totalReports > 10 ? 0.8 : 0.4,
    }],
    tokenCount: sorted.length * 4,
    lastUpdated: new Date().toISOString(),
  };

  chunks["critique-patterns"] = critiqueChunk;
  await saveChunks(dd, chunks);

  return {
    source: `critique (${totalReports} reports)`,
    chunksCreated: 1,
    chunksUpdated: 0,
    tokensExtracted: critiqueChunk.tokenCount,
    summary: `已分析 ${totalReports} 份报告, 发现 ${sorted.length} 种模式, Top: ${topPatterns[0]?.[0] || "无"}`,
  };
}

export async function listKnowledgeChunks(): Promise<{ id: string; title: string; tags: string[]; tokenCount: number }[]> {
  const dd = getDataDir();
  if (!dd) return [];
  const chunks = await loadChunks(dd);
  return Object.values(chunks).map(c => ({
    id: c.id,
    title: c.title,
    tags: c.tags,
    tokenCount: c.tokenCount,
  }));
}

export async function getKnowledgeStats(): Promise<{
  totalChunks: number;
  totalTokens: number;
  totalSources: number;
  sourcesByType: Record<string, number>;
}> {
  const dd = getDataDir();
  if (!dd) return { totalChunks: 0, totalTokens: 0, totalSources: 0, sourcesByType: {} };

  const chunks = await loadChunks(dd);
  const sources = await loadSources(dd);

  const sourcesByType: Record<string, number> = {};
  for (const s of sources) {
    sourcesByType[s.type] = (sourcesByType[s.type] || 0) + 1;
  }

  return {
    totalChunks: Object.keys(chunks).length,
    totalTokens: Object.values(chunks).reduce((sum, c) => sum + c.tokenCount, 0),
    totalSources: sources.length,
    sourcesByType,
  };
}
