import { writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { getStateMachineScript } from "../frames/state-machine.js";
import { wrapWithDevice, type DeviceType } from "../frames/index.js";
import { getBaseStyles } from "../templates/components.js";
import { renderViaOd, healthCheck as odHealth } from "./bridges/od-bridge.js";
import { renderViaHuashu } from "./bridges/huashu-bridge.js";

export type RenderBackend = "direct" | "od" | "huashu" | "agent";
export type FlowMode = "overview" | "flow";

export interface RenderOptions {
  backend: RenderBackend;
  device?: DeviceType;
  orientation?: "portrait" | "landscape";
  dark?: boolean;
  interactive?: boolean;
  variant?: string;
  brandName?: string;
  brandColors?: { primary: string; accent: string; surface: string; text: string };
  fontStack?: string;
  flow?: string[];
  flowMode?: FlowMode;
  outputDir?: string;
}

export interface RenderResult {
  html: string;
  backend: RenderBackend;
  files: string[];
  warnings: string[];
  backendInfo?: string;
  score?: number;
}

const DEFAULT_PALETTE = { primary: "#1E1E2E", accent: "#00E698", surface: "#FAFBFC", text: "#24292E" };
const DEFAULT_FONT = "'Inter', system-ui, -apple-system, sans-serif";

export async function renderDirect(options: RenderOptions): Promise<RenderResult> {
  const warnings: string[] = [];
  const palette = options.brandColors || DEFAULT_PALETTE;
  const fontStack = options.fontStack || DEFAULT_FONT;
  const files: string[] = [];

  if (options.flow && options.flow.length > 0) {
    return renderFlow(options, palette, fontStack);
  }

  const content = generatePreviewHtml(options, palette, fontStack);
  const html = options.device
    ? wrapWithDevice(content, options.device, options.orientation, "BWVI Preview")
    : `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>BWVI Preview</title>${getBaseStyles({ palette: { ...palette, muted: palette.text + "88" }, animation: true, dark: options.dark || false })}</head><body${options.dark ? ' data-theme="dark"' : ''}><div style="max-width:1200px;margin:0 auto;background:${options.dark ? '#111' : palette.surface};color:${palette.text};min-height:100vh">${content}</div></body></html>`;

  files.push("index.html");
  return { html, backend: "direct", files, warnings, backendInfo: "BWVI built-in renderer" };
}

export async function renderViaOdBackend(options: RenderOptions): Promise<RenderResult> {
  const warnings: string[] = [];
  const files: string[] = [];

  const health = await odHealth();
  if (!health.alive) {
    return {
      html: "", backend: "od", files: [], warnings: [
        `Open-Design daemon 未运行 (port ${health.port})`,
        `启动: cd bwvi-design/open-design && pnpm tools-dev run web`,
        `回退: 使用 --engine=direct`,
      ], backendInfo: "OD offline",
    };
  }

  const task = `${options.brandName ? `[Brand: ${options.brandName}] ` : ''}Design a ${options.device || 'web'} prototype. ${options.dark ? 'Dark theme.' : ''}`;
  const result = await renderViaOd(task, {
    direction: options.variant,
    brandName: options.brandName,
    device: options.device,
    dark: options.dark,
  });

  if (!result.success) {
    return { html: "", backend: "od", files: [], warnings: result.warnings, backendInfo: "OD render failed" };
  }

  if (options.device) {
    const framed = wrapWithDevice(result.html, options.device, options.orientation, "OD Preview");
    files.push("od-output.html");
    return { html: framed, backend: "od", files, warnings, backendInfo: "Open-Design engine" };
  }

  files.push("od-output.html");
  return { html: result.html, backend: "od", files, warnings: result.warnings, backendInfo: "Open-Design engine" };
}

export async function renderViaHuashuBackend(options: RenderOptions): Promise<RenderResult> {
  const warnings: string[] = [];
  const files: string[] = [];

  const result = await renderViaHuashu("Design: " + (options.brandName || "generic"), {
    direction: options.variant,
    brandName: options.brandName,
    device: options.device,
    dark: options.dark,
  });

  if (!result.success) {
    return { html: "", backend: "huashu", files: [], warnings: result.warnings, backendInfo: "Huashu render failed" };
  }

  let html = result.html;
  if (options.device) {
    html = wrapWithDevice(html, options.device, options.orientation, "Huashu Preview");
  }

  files.push("huashu-output.html");
  return { html, backend: "huashu", files, warnings: result.warnings, backendInfo: "Huashu-Design engine" };
}

export async function renderViaAgent(options: RenderOptions): Promise<RenderResult> {
  const warnings: string[] = [];
  try {
    const { findBestAgent, runAgent } = await import("./agent.js");
    const agent = findBestAgent();
    if (!agent) {
      return { html: "", backend: "agent", files: [], warnings: ["No agent CLI found"], backendInfo: "no agent" };
    }
    const taskDesc = `Create a single HTML file design. ${options.brandName ? 'Use brand: ' + options.brandName : ''} ${options.device ? 'Target device: ' + options.device : ''}`;
    const output = runAgent(agent, "You are a designer. Output a single HTML file.", taskDesc);
    const htmlMatch = output.match(/<artifact[^>]*>([\s\S]*?)<\/artifact>/);
    const html = htmlMatch ? htmlMatch[1] : output;
    const finalHtml = options.device ? wrapWithDevice(html, options.device, options.orientation, "BWVI Agent") : html;
    return { html: finalHtml, backend: "agent", files: ["index.html"], warnings, backendInfo: `Agent: ${agent.name}` };
  } catch (e: any) {
    return { html: "", backend: "agent", files: [], warnings: [`Agent error: ${e.message}`], backendInfo: "agent error" };
  }
}

export async function render(options: RenderOptions): Promise<RenderResult> {
  switch (options.backend) {
    case "od":
      return renderViaOdBackend(options);
    case "huashu":
      return renderViaHuashuBackend(options);
    case "agent":
      return renderViaAgent(options);
    case "direct":
    default:
      return renderDirect(options);
  }
}

function generatePreviewHtml(opts: RenderOptions, palette: { primary: string; accent: string; surface: string; text: string }, fontStack: string): string {
  return `<div style="padding:40px 24px">
<h1 style="font-size:2.5rem;font-weight:700;color:${palette.primary};font-family:${fontStack}">BWVI Preview</h1>
<p style="color:${palette.text}88;margin:16px 0 32px">Backend: ${opts.backend} ${opts.brandName ? '· Brand: ' + opts.brandName : ''} ${opts.device ? '· Device: ' + opts.device : ''}</p>
<hr style="border:none;border-top:1px solid ${palette.text}15;margin-bottom:32px">
<pre style="background:${palette.text}08;padding:20px;border-radius:8px;font-size:0.875rem"><code>bwvi generate --engine=od     Open-Design backend
bwvi generate --engine=huashu  Huashu-Design backend
bwvi generate --engine=direct  Built-in renderer</code></pre>
<p style="text-align:center;font-size:0.875rem;color:${palette.text}66;margin-top:48px">BWVI · Better Way of Visual Intelligence</p>
</div>`;
}

async function renderFlow(opts: RenderOptions, palette: { primary: string; accent: string; surface: string; text: string }, fontStack: string): Promise<RenderResult> {
  const screens = opts.flow || [];
  const mode = opts.flowMode || "overview";
  const files: string[] = [];
  const warnings: string[] = [];

  if (mode === "overview") {
    const screenHtmls = screens.map((s, i) => `<div id="${s}" style="border:1px solid ${palette.text}15;border-radius:12px;padding:24px;margin-bottom:24px;background:${palette.surface}">
<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;padding-bottom:12px;border-bottom:1px solid ${palette.text}10">
<h2 style="font-size:1.25rem;font-weight:600;color:${palette.primary}">Screen ${i + 1}: ${s}</h2>
<span style="font-size:0.8rem;padding:4px 12px;background:${palette.primary}15;border-radius:12px;color:${palette.primary}">${s}</span>
</div>
<div style="height:200px;background:${palette.text}05;border-radius:8px;display:flex;align-items:center;justify-content:center;color:${palette.text}55;font-size:0.875rem">${s.charAt(0).toUpperCase() + s.slice(1)}</div>
</div>`).join("\n");

    const html = `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Flow: ${screens.join(" → ")}</title>${getBaseStyles({ palette: { ...palette, muted: palette.text + "88" }, animation: true, dark: opts.dark || false })}</head><body${opts.dark ? ' data-theme="dark"' : ''}><div style="max-width:1200px;margin:0 auto;padding:40px 24px;background:${opts.dark ? '#111' : palette.surface}">
<div style="margin-bottom:32px"><h1 style="font-size:2rem;font-weight:700;color:${palette.primary}">Screen Flow</h1><p style="color:${palette.text}77">${screens.join(" → ")}</p></div>
${screenHtmls}
<p style="text-align:center;font-size:0.875rem;color:${palette.text}66;margin-top:32px">BWVI · Flow Overview</p>
</div></body></html>`;
    files.push("flow-overview.html");
    return { html, backend: "direct", files, warnings, backendInfo: "Flow overview" };
  }

  const screenDefs = screens.map((s, i) => `<section id="screen-${s}" class="bwvi-screen" style="display:${i === 0 ? 'block' : 'none'};padding:40px;min-height:100vh">
<div style="max-width:800px;margin:0 auto">
<div style="display:flex;align-items:center;gap:12px;margin-bottom:32px">
<a href="#${screens[i > 0 ? i - 1 : screens.length - 1]}" class="bwvi-nav-btn" style="text-decoration:none;padding:8px 16px;border:1px solid ${palette.text}20;border-radius:8px;color:${palette.text}">← Prev</a>
<span style="font-size:0.875rem;color:${palette.text}66">${i + 1}/${screens.length}</span>
<a href="#${screens[i < screens.length - 1 ? i + 1 : 0]}" class="bwvi-nav-btn" style="text-decoration:none;padding:8px 16px;background:${palette.primary};border-radius:8px;color:#fff">Next →</a>
</div>
<h2 style="font-size:2rem;font-weight:700;color:${palette.primary};margin-bottom:24px">${s.charAt(0).toUpperCase() + s.slice(1)}</h2>
<div style="height:400px;background:${palette.text}05;border-radius:12px;display:flex;align-items:center;justify-content:center;color:${palette.text}55">${s}</div>
</div></section>`).join("\n");

  const html = `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Flow: ${screens.join(" → ")}</title>
${getStateMachineScript()}
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:system-ui,-apple-system,sans-serif;background:${opts.dark ? '#111' : palette.surface};color:${palette.text}}.bwvi-nav-btn{transition:opacity 0.2s}.bwvi-nav-btn:hover{opacity:0.8}</style>
</head><body>${screenDefs}
<script>(function(){function h(){var s=window.location.hash.slice(1);document.querySelectorAll('.bwvi-screen').forEach(function(el){el.style.display='none'});var t=s?document.getElementById('screen-'+s):document.getElementById('screen-${screens[0]}');if(t)t.style.display='block'}window.addEventListener('hashchange',h);h()})();
</script></body></html>`;
  files.push("flow.html");
  return { html, backend: "direct", files, warnings, backendInfo: "Flow interactive" };
}
