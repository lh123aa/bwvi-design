/**
 * MCP Server — BWVI 的 Model Context Protocol 接口
 *
 * 启动方式:
 *   bwvi mcp              # stdio 模式（默认，用于 Agent 集成）
 *   bwvi mcp --sse        # SSE 模式（HTTP 远程访问）
 *   bwvi mcp --port=3456  # 自定义 SSE 端口
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { recommendDirections } from "../engine/analyzer.js";
import { analyzeHtml } from "../critique/objective.js";
import { buildReport } from "../critique/self-review.js";
import { critiqueDiff } from "../critique/diff.js";
import { FingerprintTracker } from "../fingerprint/tracker.js";
import { learnFromUrl, saveReference, injectToFingerprint } from "../engine/learner.js";
import { listStyles } from "../engine/style-systems.js";
import { listBrands, searchBrands, getBrand } from "../engine/brand-loader.js";
import { generateDirectHtml } from "../cli/generate.js";
import { getAnimationCSS, getStageScript } from "../engine/animation-engine.js";
import { injectForVideo } from "../engine/video-inject.js";
import { findBlueprint } from "../templates/content-presets.js";
import { existsSync } from "node:fs";
import { join } from "node:path";

const PALETTES: Record<string, Record<string, string>> = {
  "editorial-monocle": { primary: "#1A1A2E", accent: "#C44536", surface: "#FAF8F5", text: "#2D2D2D" },
  "warm-minimal":      { primary: "#D97757", accent: "#8C6E5D", surface: "#FDF8F5", text: "#3D3D3D" },
  "tech-utility":      { primary: "#1E1E2E", accent: "#00E698", surface: "#FAFBFC", text: "#24292E" },
  "dark-luxury":       { primary: "#0D0D0D", accent: "#C9A84C", surface: "#1A1A1A", text: "#E8E8E8" },
  "playful-color":     { primary: "#FF6B6B", accent: "#4ECDC4", surface: "#FFF8F0", text: "#2C3E50" },
};
const FONTS: Record<string, string> = {
  "editorial-monocle": "Georgia, serif",
  "warm-minimal": "Georgia, serif",
  "tech-utility": "Inter, sans-serif",
  "dark-luxury": "Inter, sans-serif",
  "playful-color": "DM Sans, sans-serif",
};
const DIRECTION_NAMES = Object.keys(PALETTES);

export async function startMcpServer(args: string[] = []) {
  const sse = args.includes("--sse");
  const portFlag = args.find(a => a.startsWith("--port="));
  const port = portFlag ? parseInt(portFlag.split("=")[1]) : 3456;

  const server = new Server(
    { name: "bwvi-mcp", version: "0.2.1" },
    { capabilities: { tools: {} } }
  );

  // ---- 工具清单 ----
  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
      { name: "analyze_design", description: "Analyze design task → direction recommendations", inputSchema: { type: "object", properties: { task: { type: "string" }, project_dir: { type: "string" } }, required: ["task"] } },
      { name: "generate_design", description: "Generate HTML design from task + direction", inputSchema: { type: "object", properties: { task: { type: "string" }, direction: { type: "string", enum: DIRECTION_NAMES } }, required: ["task", "direction"] } },
      { name: "critique_design", description: "Critique HTML → 10-dimension quality score", inputSchema: { type: "object", properties: { html: { type: "string" }, brand_colors: { type: "array", items: { type: "string" } } }, required: ["html"] } },
      { name: "critique_diff", description: "Compare two HTML files → metric diff report", inputSchema: { type: "object", properties: { html1: { type: "string" }, html2_path: { type: "string" } }, required: ["html1", "html2_path"] } },
      { name: "learn_design", description: "Extract design tokens from URL", inputSchema: { type: "object", properties: { url: { type: "string" }, inject: { type: "boolean" } }, required: ["url"] } },
      { name: "animate_html", description: "Inject CSS animations into HTML", inputSchema: { type: "object", properties: { html: { type: "string" }, mode: { type: "string", enum: ["scroll", "video"] } }, required: ["html"] } },
      { name: "list_directions", description: "List all 10 design directions", inputSchema: { type: "object", properties: {}, required: [] } },
      { name: "list_styles", description: "List all 56 visual styles", inputSchema: { type: "object", properties: {}, required: [] } },
      { name: "list_brands", description: "Search/list 115 built-in brand systems", inputSchema: { type: "object", properties: { query: { type: "string" } }, required: [] } },
      { name: "brand_get", description: "Get full brand details (colors + typography)", inputSchema: { type: "object", properties: { name: { type: "string" } }, required: ["name"] } },
      { name: "list_blueprints", description: "Find matching blueprint for a task", inputSchema: { type: "object", properties: { task: { type: "string" } }, required: ["task"] } },
    ],
  }));

  // ---- 工具处理 ----
  server.setRequestHandler(CallToolRequestSchema, async (req) => {
    try {
      const n = req.params.name;
      const a = req.params.arguments || {};

      if (n === "analyze_design") {
        const task = String(a.task || "");
        if (!task) return { content: [{ type: "text", text: "Error: missing task" }], isError: true };
        const dirs = recommendDirections(task, 3);
        let fp = null;
        if (a.project_dir && existsSync(join(String(a.project_dir), ".bwvi"))) {
          fp = await new FingerprintTracker(String(a.project_dir)).load();
        }
        return { content: [{ type: "text", text: JSON.stringify({ directions: dirs.map(d => ({ name: d.name, label: d.label })), fingerprint: fp ? { projects: fp.projects_analyzed } : null }) }] };
      }

      if (n === "generate_design") {
        const d = String(a.direction || "tech-utility");
        const pp = (PALETTES as any)[d] || (PALETTES as any)["tech-utility"];
        const f = FONTS[d] || FONTS["tech-utility"];
        return { content: [{ type: "text", text: generateDirectHtml(String(a.task || ""), d, pp, f) }] };
      }

      if (n === "critique_design") {
        const html = String(a.html || "");
        const metrics = analyzeHtml(html, (a.brand_colors as string[] | undefined));
        const report = buildReport(html, metrics);
        return { content: [{ type: "text", text: JSON.stringify({ score: report.score, weighted_score: report.weighted_score, passed: report.passed, issues: report.issues.length }) }] };
      }

      if (n === "critique_diff") {
        const html1 = String(a.html1 || "");
        const html2Path = String(a.html2_path || "");
        if (!html1 || !html2Path) return { content: [{ type: "text", text: "Error: html1 and html2_path required" }], isError: true };
        const result = critiqueDiff(html1, html2Path);
        return { content: [{ type: "text", text: JSON.stringify(result) }] };
      }

      if (n === "learn_design") {
        const ref = await learnFromUrl(String(a.url));
        if (a.inject) {
          let pd = process.cwd();
          for (let i = 0; i < 5; i++) {
            if (existsSync(join(pd, ".bwvi"))) break;
            const p2 = join(pd, "..");
            if (p2 === pd) { pd = ""; break; }
            pd = p2;
          }
          if (pd) { await saveReference(pd, ref); await injectToFingerprint(pd, ref); }
        }
        return { content: [{ type: "text", text: JSON.stringify({ title: ref.title, school: ref.detectedSchool, confidence: ref.confidence }) }] };
      }

      if (n === "animate_html") {
        const html = String(a.html || "");
        const mode = String(a.mode || "scroll");
        if (!html) return { content: [{ type: "text", text: "Error: html required" }], isError: true };
        const result = mode === "video" ? injectForVideo(html) : html.replace("</head>", `<style>${getAnimationCSS()}</style></head>`).replace("</body>", `${getStageScript()}</body>`);
        return { content: [{ type: "text", text: result }] };
      }

      if (n === "list_directions") {
        return { content: [{ type: "text", text: JSON.stringify(DIRECTION_NAMES) }] };
      }

      if (n === "list_styles") {
        return { content: [{ type: "text", text: JSON.stringify(listStyles()) }] };
      }

      if (n === "list_brands") {
        const q = String(a.query || "");
        return { content: [{ type: "text", text: JSON.stringify(q ? searchBrands(q) : listBrands()) }] };
      }

      if (n === "brand_get") {
        const name = String(a.name || "");
        if (!name) return { content: [{ type: "text", text: "Error: brand name required" }], isError: true };
        const brand = getBrand(name.toLowerCase());
        if (!brand) return { content: [{ type: "text", text: JSON.stringify({ error: `Brand '${name}' not found` }) }], isError: true };
        return { content: [{ type: "text", text: JSON.stringify(brand) }] };
      }

      if (n === "list_blueprints") {
        const task = String(a.task || "");
        if (!task) return { content: [{ type: "text", text: JSON.stringify({ count: 50, note: "50+ built-in blueprints. Provide a task to find a match." }) }] };
        const result = findBlueprint(task);
        return { content: [{ type: "text", text: JSON.stringify({ blueprint: result.blueprint.id, confidence: result.confidence, direction: result.blueprint.direction, sections: result.blueprint.sections.length }) }] };
      }

      return { content: [{ type: "text", text: "Unknown tool: " + n }], isError: true };
    } catch (e) {
      return { content: [{ type: "text", text: "MCP error: " + String(e) }], isError: true };
    }
  });

  // ---- Transport ----
  if (sse) {
    const http = await import("node:http");
    const server2 = http.createServer(async (req: any, res: any) => {
      if (req.url === "/health") {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ status: "ok", version: "0.2.0" }));
        return;
      }
      res.writeHead(404);
      res.end("Not found");
    });
    server2.listen(port, () => {
      process.stderr.write(`BWVI MCP Server (SSE) listening on port ${port}\n`);
      process.stderr.write(`  Health: http://localhost:${port}/health\n`);
    });
  } else {
    const transport = new StdioServerTransport();
    await server.connect(transport);
  }
}
