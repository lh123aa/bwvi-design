import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { CheckpointManager } from "../checkpoint/manager.js";
import { composeGeneratePrompt } from "../engine/composer.js";
import { getBaseStyles } from "../templates/components.js";
import { wrapWithDevice, type DeviceType } from "../frames/index.js";
import { getStateMachineScript } from "../frames/state-machine.js";
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

  const nonFlagArgs = args.filter((a) => !a.startsWith("--"));
  const task = nonFlagArgs.join(" ");
  if (!task) {
    console.error(JSON.stringify({ error: "请提供任务描述", code: "MISSING_TASK" }));
    process.exit(1);
  }

  const directionFlag = args.find((a) => a.startsWith("--direction="));
  const direction = directionFlag ? directionFlag.split("=")[1] as string : "tech-utility";
  if (!VALID_DIRECTIONS.includes(direction)) {
    console.error(JSON.stringify({ error: "无效方向: " + direction + "，可选: " + VALID_DIRECTIONS.join(", "), code: "INVALID_DIRECTION" }));
    process.exit(1);
  }

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

    const pageResult = buildPage({ task, direction: directionFlag ? direction : undefined, brand: brandName, device, orientation, dark, interactive });
    const fileName = device ? `preview-${device}.html` : "index.html";
    const filePath = join(demoDir(), fileName);
    writeFileSync(filePath, pageResult.html, "utf-8");
      console.log(JSON.stringify({
        status: "ok", file: filePath, direction: pageResult.direction,
        device: device || "none", brand: pageResult.brandUsed,
        blueprint: pageResult.blueprintId,
        match_confidence: Math.round(pageResult.matchConfidence * 100) / 100,
        engine: "direct",
      }, null, 2));
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

export function generateDirectHtml(
  task: string,
  direction: string,
  palette: typeof DIRECTION_PALETTES[string],
  fontStack: string,
  opts?: DirectOptions
): string {
  const title = task.length > 60 ? task.slice(0, 60) + "..." : task;
  const isDark = opts?.dark || direction === "dark-luxury";
  const themeAttr = isDark ? ' data-theme="dark"' : '';
  const animEnabled = true;

  const base = { palette: { ...palette, muted: undefined }, fontDisplay: fontStack, animation: animEnabled, dark: isDark };
  const baseStyles = getBaseStyles(base);

  const body = `<div${themeAttr} style="font-family:system-ui,-apple-system,sans-serif;color:${palette.text};background:${isDark ? '#111' : palette.surface};min-height:100vh">
<div style="max-width:1200px;margin:0 auto;padding:24px">
<h1 style="font-size:2.5rem;font-weight:700;margin-bottom:8px;color:${palette.primary};font-family:${fontStack}">${escapeHtml(title)}</h1>
<p style="color:${palette.text}88;margin-bottom:32px">
<span style="display:inline-block;padding:2px 10px;background:${palette.accent};color:#fff;border-radius:12px;font-size:0.8rem;margin-right:8px">${direction}</span>
${opts?.device ? `<span style="display:inline-block;padding:2px 10px;background:${palette.primary}20;color:${palette.primary};border-radius:12px;font-size:0.8rem">${opts.device}</span>` : ''}
</p>
<hr style="border:none;border-top:1px solid ${palette.text}15;margin-bottom:32px">
<h2 style="font-size:1.5rem;font-weight:600;margin-bottom:16px;font-family:${fontStack}">Usage</h2>
<pre style="background:${palette.text}08;padding:20px;border-radius:8px;overflow-x:auto;margin-bottom:24px;font-size:0.875rem"><code>bwvi init [project]          初始化项目
bwvi analyze &lt;task&gt;          分析设计任务
bwvi generate &lt;task&gt; --direct 直接生成 HTML
bwvi generate &lt;task&gt; --device=iphone --variant=split  生成设备原型
bwvi critique &lt;file&gt;         评审 HTML 文件</code></pre>
<h2 style="font-size:1.5rem;font-weight:600;margin-bottom:16px;font-family:${fontStack}">Design Decisions</h2>
<p style="line-height:1.7;color:${palette.text}bb">Direction: <strong>${direction}</strong><br>Brand: <strong>${opts?.brand || 'none'}</strong><br>Font: <strong>${fontStack}</strong><br>Device: <strong>${opts?.device || 'none'}</strong><br>Dark Mode: <strong>${isDark ? 'yes' : 'no'}</strong></p>
<hr style="border:none;border-top:1px solid ${palette.text}15;margin:32px 0">
<p style="text-align:center;font-size:0.875rem;color:${palette.text}66">Generated by BWVI · ${new Date().toISOString().slice(0, 10)}</p>
</div></div>`;

  const fullHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(title)}</title>
${opts?.interactive ? getStateMachineScript() : ''}
<style>:root{--color-primary:${palette.primary};--color-accent:${palette.accent};--color-surface:${palette.surface};--color-text:${palette.text};--font-display:${fontStack};--font-body:system-ui,-apple-system,sans-serif}
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:var(--font-body);color:var(--color-text);background:var(--color-surface);line-height:1.6}
pre code{font-family:'SF Mono','Cascadia Code',monospace}
${baseStyles}
${isDark ? `[data-theme="dark"] body{background:#111;color:#e0e0e0}` : ''}
</style></head><body>${body}</body></html>`;

  if (opts?.device) {
    return wrapWithDevice(body, opts.device, opts.orientation, title);
  }

  return fullHtml;
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function demoDir(): string {
  const d = join(process.cwd(), "demo");
  if (!existsSync(d)) mkdirSync(d, { recursive: true });
  return d;
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
