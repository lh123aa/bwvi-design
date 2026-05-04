import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { recommendDirections } from "../engine/analyzer.js";
import { analyzeHtml } from "../critique/objective.js";
import { buildReport } from "../critique/self-review.js";
import { FingerprintTracker } from "../fingerprint/tracker.js";
import { learnFromUrl, saveReference, injectToFingerprint } from "../engine/learner.js";
import { generateDirectHtml } from "../cli/generate.js";
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

export async function startMcpServer() {
  const server = new Server({ name: "bwvi-mcp", version: "0.1.0" }, { capabilities: { tools: {} } });
  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
      { name: "analyze_design", description: "Analyze design task", inputSchema: { type: "object", properties: { task: { type: "string" }, project_dir: { type: "string" } }, required: ["task"] } },
      { name: "generate_design", description: "Generate HTML design", inputSchema: { type: "object", properties: { task: { type: "string" }, direction: { type: "string", enum: DIRECTION_NAMES } }, required: ["task", "direction"] } },
      { name: "critique_design", description: "Critique HTML output", inputSchema: { type: "object", properties: { html: { type: "string" }, brand_colors: { type: "array", items: { type: "string" } } }, required: ["html"] } },
      { name: "learn_design", description: "Learn design from URL", inputSchema: { type: "object", properties: { url: { type: "string" }, inject: { type: "boolean" } }, required: ["url"] } },
      { name: "list_directions", description: "List all directions", inputSchema: { type: "object", properties: {}, required: [] } },
    ],
  }));
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
        const dirsOut = dirs.map(function(d) { return { name: d.name, label: d.label }; });
        return { content: [{ type: "text", text: JSON.stringify({ directions: dirsOut, fingerprint: fp ? { projects: fp.projects_analyzed } : null }) }] };
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
        return { content: [{ type: "text", text: JSON.stringify({ score: report.score, passed: report.passed }) }] };
      }
      if (n === "learn_design") {
        const ref = await learnFromUrl(String(a.url));
        if (a.inject) {
          let pd = process.cwd();
          for (let i = 0; i < 5; i++) { if (existsSync(join(pd, ".bwvi"))) break; var p2 = join(pd, ".."); if (p2 === pd) { pd = ""; break; } pd = p2; }
          if (pd) { await saveReference(pd, ref); await injectToFingerprint(pd, ref); }
        }
        return { content: [{ type: "text", text: JSON.stringify({ title: ref.title, school: ref.detectedSchool }) }] };
      }
      if (n === "list_directions") {
        return { content: [{ type: "text", text: JSON.stringify(DIRECTION_NAMES) }] };
      }
      return { content: [{ type: "text", text: "Unknown tool: " + n }], isError: true };
    } catch (e) {
      return { content: [{ type: "text", text: "MCP error: " + String(e) }], isError: true };
    }
  });
  const transport = new StdioServerTransport();
  await server.connect(transport);
}
