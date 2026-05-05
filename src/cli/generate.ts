import { writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { info, success, warn, errExit, result } from "./ux.js";
import { getDemoDir } from "./demo.js";
import { CheckpointManager } from "../checkpoint/manager.js";
import { composeGeneratePrompt } from "../engine/composer.js";
import { wrapWithDevice, type DeviceType } from "../frames/index.js";
import { getBrand, type BrandSystem } from "../engine/brand-loader.js";
import { render } from "../engine/renderer.js";
import { buildPage } from "../engine/page-builder.js";

const DIRECTION_PALETTES: Record<string, { primary: string; accent: string; surface: string; text: string }> = {
  "editorial-monocle": { primary: "#1A1A2E", accent: "#C44536", surface: "#FAF8F5", text: "#2D2D2D" },
  "warm-minimal":      { primary: "#D97757", accent: "#8C6E5D", surface: "#FDF8F5", text: "#3D3D3D" },
  "tech-utility":      { primary: "#1E1E2E", accent: "#00E698", surface: "#FAFBFC", text: "#24292E" },
  "dark-luxury":       { primary: "#0D0D0D", accent: "#C9A84C", surface: "#1A1A1A", text: "#E8E8E8" },
  "playful-color":     { primary: "#FF6B6B", accent: "#4ECDC4", surface: "#FFF8F0", text: "#2C3E50" },
  "corporate-trust":   { primary: "#2563EB", accent: "#059669", surface: "#F8FAFC", text: "#1E293B" },
  "luxury-premium":    { primary: "#1C1917", accent: "#D6A354", surface: "#FAF9F7", text: "#292524" },
  "nature-organic":    { primary: "#2D6A4F", accent: "#95B46A", surface: "#F6F7F4", text: "#1B2F22" },
  "tech-gradient":     { primary: "#6C3BD6", accent: "#00D4AA", surface: "#FAFBFF", text: "#1A1A2E" },
  "minimal-white":     { primary: "#18181B", accent: "#F43F5E", surface: "#FAFAFA", text: "#09090B" },
};

const DIRECTION_FONTS: Record<string, string> = {
  "editorial-monocle": "'Georgia', 'Times New Roman', serif",
  "warm-minimal":      "'Georgia', 'Times New Roman', serif",
  "tech-utility":      "'Inter', system-ui, -apple-system, sans-serif",
  "dark-luxury":       "'Inter', 'Helvetica Neue', sans-serif",
  "playful-color":     "'DM Sans', system-ui, sans-serif",
  "corporate-trust":   "'Inter', 'SF Pro', system-ui, sans-serif",
  "luxury-premium":    "'Playfair Display', 'Georgia', serif",
  "nature-organic":    "'DM Sans', system-ui, sans-serif",
  "tech-gradient":     "'Space Grotesk', system-ui, sans-serif",
  "minimal-white":     "'Inter', -apple-system, sans-serif",
};

const VALID_DIRECTIONS = Object.keys(DIRECTION_PALETTES);

export async function generateCommand(args: string[]) {
  const direct = args.includes("--direct");
  const runMode = args.includes("--run");
  const deviceFlag = args.find(a => a.startsWith("--device="));
  const device = deviceFlag ? deviceFlag.split("=")[1] as DeviceType : undefined;
  const variantFlag = args.find(a => a.startsWith("--variant="));
  const variant = variantFlag ? variantFlag.split("=")[1] : undefined;
  const dark = args.includes("--dark");
  const orientationFlag = args.find(a => a.startsWith("--orientation="));
  const orientation = orientationFlag ? orientationFlag.split("=")[1] as "portrait" | "landscape" : "portrait";
  const interactive = args.includes("--interactive");
  const realImages = args.includes("--real-images");
  const brandFlag = args.find(a => a.startsWith("--brand="));
  const brandName = brandFlag ? brandFlag.split("=")[1] : undefined;
  const brand = brandName ? getBrand(brandName) : undefined;
  const engineFlag = args.find(a => a.startsWith("--engine="));
  const engine = (engineFlag ? engineFlag.split("=")[1] : "direct") as "direct" | "od" | "huashu" | "agent";
  const styleFlag = args.find(a => a.startsWith("--style="));
  const styleId = styleFlag ? styleFlag.split("=")[1] : undefined;

  const nonFlagArgs = args.filter((a) => !a.startsWith("--"));
  const task = nonFlagArgs.join(" ");
  if (args.includes("--help") || args.includes("-h")) {
    console.log(`bwvi generate <task> [options]

Generate design output from a task description.

Options:
  --direct              Generate HTML directly (default mode)
  --run                 Run via agent CLI (Claude/OpenCode)
  --device=<type>       Device frame: iphone, pixel, ipad, macbook, browser
  --orientation=<dir>   Device orientation: portrait, landscape
  --variant=<v>         Component variant: fullscreen, centered, split, editorial
  --style=<id>          Visual style: minimal-white, neo-brutalism, cyberpunk...
  --brand=<name>        Brand system: linear, stripe, apple...
  --dark                Enable dark mode
  --interactive         Embed interactive state machine
  --engine=<backend>    Render backend: direct, od, huashu, agent
  --json                JSON output mode

Examples:
  bwvi generate "咖啡品牌 landing page" --direct
  bwvi generate "App prototype" --device=iphone --interactive
  bwvi generate "SaaS landing" --brand=linear --style=glassmorphism`);
    return;
  }
  if (!task) errExit("请提供任务描述（如: 咖啡品牌 landing page）", "MISSING_TASK");

  const directionFlag = args.find((a) => a.startsWith("--direction="));
  const direction = directionFlag ? directionFlag.split("=")[1] as string : "tech-utility";
  if (!VALID_DIRECTIONS.includes(direction)) errExit("无效方向: " + direction + "，可选: " + VALID_DIRECTIONS.join(", "), "INVALID_DIRECTION");

  if (direct) {
    const palette = brand ? { primary: brand.colors.primary, accent: brand.colors.accent, surface: brand.colors.surface, text: brand.colors.text } : DIRECTION_PALETTES[direction];
    const fontStack = brand ? brand.typography.display : DIRECTION_FONTS[direction];

    if (engine === "od" || engine === "huashu") {
      const result = await render({
        backend: engine, device, orientation, dark, variant, brandName: brand?.name,
        brandColors: palette, fontStack, interactive,
      });
      const fileName = device ? `preview-${engine}-${device}.html` : `preview-${engine}.html`;
      const filePath = join(demoDir(), fileName);
      if (result.html) writeFileSync(filePath, result.html, "utf-8");
      console.log(JSON.stringify({
        status: result.html ? "ok" : "error",
        engine, file: result.html ? filePath : null,
        backendInfo: result.backendInfo,
        direction, device: device || "none",
        brand: brand?.name || null,
        warnings: result.warnings,
      }, null, 2));
      return;
    }

    const pageResult = buildPage({ task, direction: directionFlag ? direction : undefined, brand: brandName, device, orientation, dark, interactive, styleId });
    const fileName = device ? `preview-${device}.html` : "index.html";
    const filePath = join(demoDir(), fileName);
    writeFileSync(filePath, pageResult.html, "utf-8");
    info("蓝图匹配: " + pageResult.blueprintId + " (" + (pageResult.matchConfidence * 100).toFixed(0) + "%)");
    info("方向: " + pageResult.direction + (pageResult.brandUsed ? " · 品牌: " + pageResult.brandUsed : ""));
    result({ status: "ok", file: filePath, direction: pageResult.direction, device: device || "none", brand: pageResult.brandUsed, blueprint: pageResult.blueprintId, match_confidence: Math.round(pageResult.matchConfidence * 100) / 100, engine: "direct" });
    success("已生成: " + filePath);
  }

  if (runMode) {
    try {
      const { findBestAgent, runAgent } = await import("../engine/agent.js");
      const agent = findBestAgent();
      if (!agent) {
        console.error(JSON.stringify({ error: "未检测到 Agent CLI，请安装 Claude Code / OpenCode / Codex", code: "NO_AGENT" }));
        process.exit(1);
      }
      process.stderr.write(`Using agent: ${agent.name} (${agent.binary})\n`);
      const prompt = composeGeneratePrompt(task, [], direction);
      process.stderr.write("Running agent...\n");
      const output = runAgent(agent, prompt.systemPrompt, prompt.userPrompt);
      const htmlMatch = output.match(/<artifact[^>]*>([\s\S]*?)<\/artifact>/);
      const html = htmlMatch ? htmlMatch[1] : output;
      const finalHtml = device ? wrapWithDevice(html, device, orientation, task) : html;
      const filePath = join(demoDir(), "index.html");
      writeFileSync(filePath, finalHtml, "utf-8");
      console.log(JSON.stringify({ status: "ok", agent: agent.name, file: filePath, size: finalHtml.length, device: device || "none" }, null, 2));
    } catch (e: any) {
      console.error(JSON.stringify({ error: `Agent 执行失败: ${e.message}` }));
      process.exit(1);
    }
    return;
  }

  const projectDir = findProjectDir();
  if (!projectDir) {
    console.error(JSON.stringify({ error: "未找到 .bwvi 项目目录，请先运行 bwvi init", code: "NO_PROJECT" }));
    process.exit(1);
  }

  const checkpoint = new CheckpointManager(projectDir);
  const decisions = await checkpoint.allDecisions();
  const prompt = composeGeneratePrompt(task, decisions, direction);

  console.log(JSON.stringify({
    task, direction, device: device || "none", interactive, engine,
    decisions_used: decisions.length,
    system_prompt: prompt.systemPrompt,
    user_prompt: prompt.userPrompt,
    token_estimate: prompt.tokenEstimate,
    instructions: "复制以上 prompt 给你的 Agent（Claude/OpenCode）",
  }, null, 2));
}

interface DirectOptions {
  device?: DeviceType;
  variant?: string;
  dark?: boolean;
  orientation?: "portrait" | "landscape";
  interactive?: boolean;
  realImages?: boolean;
  brand?: string;
}

/** @deprecated Use buildPage() instead. Kept for backward compat (MCP, benchmark). */
export function generateDirectHtml(
  task: string,
  direction: string,
  palette: typeof DIRECTION_PALETTES[string],
  fontStack: string,
  opts?: DirectOptions
): string {
  const result = buildPage({ task, direction, brand: opts?.brand, device: opts?.device, orientation: opts?.orientation, dark: opts?.dark, interactive: opts?.interactive, styleId: undefined });
  return result.html;
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function demoDir(): string { return getDemoDir(); }

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
