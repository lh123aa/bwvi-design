import { loadChunk, listChunks } from "../knowledge/loader.js";
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
const CHUNK_DESCRIPTIONS: Record<string, string> = {
  "direction-advisor": "5 个基础视觉方向及推荐逻辑",
  "color-theory": "色板决策规则：品牌色优先、单 accent、oklch",
  "typography-pairing": "字体配对规则：display≠body、字阶至少 6 级",
};
export async function knowledgeCommand(args: string[]) {
  const sub = args[0];
  if (sub === "list" || !sub) {
    const chunks = listChunks();
    const list = chunks.map((id) => ({
      id,
      description: CHUNK_DESCRIPTIONS[id] || "-",
      size_tokens: (loadChunk(id)?.split(/\s+/).length || 0),
    }));
    console.log(JSON.stringify({ chunks: list, count: list.length }, null, 2));
    return;
  }
  if (sub === "show") {
    const id = args[1];
    if (!id) {
      console.error(JSON.stringify({ error: "请提供知识块 ID", available: listChunks() }));
      process.exit(1);
    }
    const content = loadChunk(id);
    if (!content) {
      console.error(JSON.stringify({ error: `未找到知识块: ${id}`, available: listChunks() }));
      process.exit(1);
    }
    console.log(JSON.stringify({ id, content: content.trim(), tokens: content.split(/\s+/).length }, null, 2));
    return;
  }
  if (sub === "improve") {
    var pd = findProjectDir();
    if (!pd) { console.error(JSON.stringify({ error: "No project found" })); process.exit(1); }
    var rd = join(pd, ".bwvi", "reports");
    const reports: any[] = [];
    if (existsSync(rd)) { try { readdirSync(rd).filter(function(f) { return f.endsWith(".json"); }).forEach(function(f) { try { reports.push(JSON.parse(readFileSync(join(rd, f), "utf-8"))); } catch {} }); } catch {} }
    const pat: Record<string, number> = {};
    reports.forEach(function(r) { if (r.failure_patterns) r.failure_patterns.forEach(function(fp: any) { pat[fp.type] = (pat[fp.type] || 0) + 1; }); });
    var s = Object.entries(pat).sort(function(a,b) { return b[1] - a[1]; }).map(function(p) { return { pattern: p[0], count: p[1] }; });
    console.log(JSON.stringify({ projects_analyzed: reports.length, patterns: s }, null, 2));
    return;
  }

  if (sub === "check_version") {
    console.log(JSON.stringify({
      version: "1.0.0",
      chunks: listChunks().length,
      status: "embedded",
      note: "Phase 1 知识内嵌在代码中，Phase 2 改为独立 Markdown 文件",
    }, null, 2));
    return;
  }
  console.error(JSON.stringify({ error: `未知子命令: ${sub}`, available: ["list", "show", "check_version"] }));
  process.exit(1);
}
function findProjectDir() { var d = process.cwd(); for (var i = 0; i < 5; i++) { if (existsSync(join(d, ".bwvi"))) return d; var p = join(d, ".."); if (p === d) break; d = p; } return null; }
