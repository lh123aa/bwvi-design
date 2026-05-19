import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { info, success, warn, errExit, result, infoT, successT } from "./ux.js";
import { t } from "./i18n.js";
import { getDemoDir } from "./demo.js";
import { CheckpointManager } from "../checkpoint/manager.js";
import { composeGeneratePrompt } from "../engine/composer.js";
import { wrapWithDevice, type DeviceType } from "../frames/index.js";
import { getBrand, type BrandSystem } from "../engine/brand-loader.js";
import { render } from "../engine/renderer.js";
import { buildPage, DIRECTION_PALETTES, DIRECTION_FONTS } from "../engine/page-builder.js";
import { findProjectDir, loadProjectConfig, getFlagWithDefault } from "../engine/config-loader.js";

const VALID_DIRECTIONS = Object.keys(DIRECTION_PALETTES);

export async function generateCommand(args: string[]) {
  // 加载项目配置（用于默认值）
  const config = loadProjectConfig();

  const direct = args.includes("--direct");
  const runMode = args.includes("--run");
  const deviceRaw = getFlagWithDefault(args, "--device=", config.default_device, "none");
  const device = deviceRaw !== "none" ? deviceRaw as DeviceType : undefined;
  const variantFlag = args.find(a => a.startsWith("--variant="));
  const variant = variantFlag ? variantFlag.split("=")[1] : undefined;
  const dark = args.includes("--dark") || config.dark_mode;
  const orientationFlag = args.find(a => a.startsWith("--orientation="));
  const orientation = orientationFlag ? orientationFlag.split("=")[1] as "portrait" | "landscape" : "portrait";
  const interactive = args.includes("--interactive");
  const realImages = args.includes("--real-images");
  const brandName = getFlagWithDefault(args, "--brand=", config.default_brand, "__none__");
  const brand = brandName !== "__none__" && brandName !== "none" ? getBrand(brandName) : undefined;
  const engineFlag = args.find(a => a.startsWith("--engine="));
  const engine = (engineFlag ? engineFlag.split("=")[1] : "direct") as "direct" | "od" | "huashu" | "agent" | "pencil";
  const styleId = getFlagWithDefault(args, "--style=", config.default_style, "__none__");
  const styleFinal = styleId !== "__none__" && styleId !== "none" ? styleId : undefined;
  const aiImages = args.includes("--ai-images");
  const poster = args.includes("--poster");
  const posterSizeFlag = args.find(a => a.startsWith("--poster-size="));
  const posterSize = (posterSizeFlag ? posterSizeFlag.split("=")[1] : "a3") as "a3" | "a2" | "a1";
  // v0.5.0: 品类快捷标志
  const deck = args.includes("--deck");
  const social = args.includes("--social");
  const office = args.includes("--office");
  const category = deck ? "deck" : social ? "social" : office ? "office" : undefined;

  const nonFlagArgs = args.filter((a) => !a.startsWith("--"));
  const task = nonFlagArgs.join(" ");
  if (args.includes("--help") || args.includes("-h")) {
    console.log(`bwvi generate <task> [options]

Generate design output from a task description.

Options:
  --direct              Generate HTML directly (default mode)
  --run                 Run via agent CLI (Claude/OpenCode)
  --deck                Generate slide deck (presentation)
  --social              Generate social media card
  --office              Generate office document (OKR/report/invoice)
  --device=<type>       Device frame: iphone, pixel, ipad, macbook, browser
  --orientation=<dir>   Device orientation: portrait, landscape
  --variant=<v>         Component variant: fullscreen, centered, split, editorial
  --style=<id>          Visual style: minimal-white, neo-brutalism, cyberpunk...
  --brand=<name>        Brand system: linear, stripe, apple...
  --dark                Enable dark mode
  --interactive         Embed interactive state machine
  --engine=<backend>    Render backend: direct, od, huashu, agent, pencil
  --poster              Generate print-quality poster (PNG 300dpi via export --scale=4)
  --poster-size=<s>     Poster size: a3 (default), a2, a1
  --json                JSON output mode

Examples:
  bwvi generate "咖啡品牌 landing page" --direct
  bwvi generate "产品路线图" --deck                      # Deck 幻灯片
  bwvi generate "新品发布" --social --brand=linear        # 社交媒体卡片
  bwvi generate "Sprint 回顾" --office                    # 办公文档
  bwvi generate "SaaS landing" --brand=linear --style=glassmorphism
  bwvi generate "科技产品发布会" --poster --brand=linear`);
    return;
  }
  if (!task) errExit(t("task_required") + "（如: 咖啡品牌 landing page）", "MISSING_TASK");

  const directionFlag = args.find((a) => a.startsWith("--direction="));
  const direction = directionFlag ? directionFlag.split("=")[1] as string : "tech-utility";
  if (!VALID_DIRECTIONS.includes(direction)) errExit("无效方向: " + direction + "，可选: " + VALID_DIRECTIONS.join(", "), "INVALID_DIRECTION");

  if (direct) {
    const palette = brand ? { primary: brand.colors.primary, accent: brand.colors.accent, surface: brand.colors.surface, text: brand.colors.text } : DIRECTION_PALETTES[direction];
    const fontStack = brand ? brand.typography.display : DIRECTION_FONTS[direction];

    if (engine === "od" || engine === "huashu" || engine === "pencil") {
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

    const pageResult = buildPage({ task, direction: directionFlag ? direction : undefined, brand: brandName, device, orientation, dark, interactive, styleId: styleFinal, aiImages, poster, posterSize, category });
    const fileName = device ? `preview-${device}.html` : "index.html";
    const filePath = join(demoDir(), fileName);
    writeFileSync(filePath, pageResult.html, "utf-8");
    infoT("blueprint_matched", { id: pageResult.blueprintId, conf: (pageResult.matchConfidence * 100).toFixed(0) });
    info(t("direction") + ": " + pageResult.direction + (pageResult.brandUsed ? " · " + t("brand") + ": " + pageResult.brandUsed : ""));
    result({ status: "ok", file: filePath, direction: pageResult.direction, device: device || "none", brand: pageResult.brandUsed, blueprint: pageResult.blueprintId, match_confidence: Math.round(pageResult.matchConfidence * 100) / 100, engine: "direct", category: category || "landing" });
    success("已生成: " + filePath);
    return;
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
    console.error(JSON.stringify({ error: "未找到 .bwvi 项目目录，请先运行 bwvi init <项目名> 创建项目", code: "NO_PROJECT", hint: "bwvi init my-project" }));
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

// generateDirectHtml 已删除，请直接使用 buildPage() (src/engine/page-builder.ts)

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function demoDir(): string { return getDemoDir(); }
