import { existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { CheckpointManager } from "../checkpoint/manager.js";
import { composeGeneratePrompt } from "../engine/composer.js";

const DIRECTION_PALETTES: Record<string, { primary: string; accent: string; surface: string; text: string }> = {
  "editorial-monocle": { primary: "#1A1A2E", accent: "#C44536", surface: "#FAF8F5", text: "#2D2D2D" },
  "warm-minimal":      { primary: "#D97757", accent: "#8C6E5D", surface: "#FDF8F5", text: "#3D3D3D" },
  "tech-utility":      { primary: "#1E1E2E", accent: "#00E698", surface: "#FAFBFC", text: "#24292E" },
  "dark-luxury":       { primary: "#0D0D0D", accent: "#C9A84C", surface: "#1A1A1A", text: "#E8E8E8" },
  "playful-color":     { primary: "#FF6B6B", accent: "#4ECDC4", surface: "#FFF8F0", text: "#2C3E50" },
};

const DIRECTION_FONTS: Record<string, string> = {
  "editorial-monocle": "'Georgia', 'Times New Roman', serif",
  "warm-minimal":      "'Georgia', 'Times New Roman', serif",
  "tech-utility":      "'Inter', system-ui, -apple-system, sans-serif",
  "dark-luxury":       "'Inter', 'Helvetica Neue', sans-serif",
  "playful-color":     "'DM Sans', system-ui, sans-serif",
};

export async function generateCommand(args: string[]) {
  const direct = args.includes("--direct");
  const nonFlagArgs = args.filter((a) => !a.startsWith("--"));
  const task = nonFlagArgs.join(" ");
  if (!task) {
    console.error(JSON.stringify({ error: "请提供任务描述", code: "MISSING_TASK" }));
    process.exit(1);
  }

  const directionFlag = args.find((a) => a.startsWith("--direction="));
  const direction = directionFlag ? directionFlag.split("=")[1] as string : undefined;
  const dir = direction || "tech-utility";
  const validDirs = ["editorial-monocle","warm-minimal","tech-utility","dark-luxury","playful-color"];
  if (dir && !validDirs.includes(dir)) {
    console.error(JSON.stringify({ error: "无效方向: " + dir + "，可选: " + validDirs.join(", "), code: "INVALID_DIRECTION" }));
    process.exit(1);
  }

  if (direct) {
    const palette = DIRECTION_PALETTES[dir] || DIRECTION_PALETTES["tech-utility"];
    const fontStack = DIRECTION_FONTS[dir] || DIRECTION_FONTS["tech-utility"];
    const html = generateDirectHtml(task, dir, palette, fontStack);
    const filePath = join(process.cwd(), "index.html");
    writeFileSync(filePath, html, "utf-8");
    console.log(JSON.stringify({ status: "ok", file: filePath, direction: dir }, null, 2));
    return;
  }

  // --run mode: auto-call Agent CLI
  const runMode = args.includes("--run");
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
      const filePath = join(process.cwd(), "index.html");
      writeFileSync(filePath, html, "utf-8");
      console.log(JSON.stringify({ status: "ok", agent: agent.name, file: filePath, size: html.length }, null, 2));
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
    task,
    direction: dir,
    decisions_used: decisions.length,
    system_prompt: prompt.systemPrompt,
    user_prompt: prompt.userPrompt,
    token_estimate: prompt.tokenEstimate,
    instructions: "复制以上 prompt 给你的 Agent（Claude/OpenCode）",
  }, null, 2));
}

function generateDirectHtml(task: string, direction: string, palette: typeof DIRECTION_PALETTES[string], fontStack: string): string {
  const title = task.length > 60 ? task.slice(0, 60) + "..." : task;
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(title)}</title>
<style>
  :root {
    --color-primary: ${palette.primary};
    --color-accent: ${palette.accent};
    --color-surface: ${palette.surface};
    --color-text: ${palette.text};
    --font-display: ${fontStack};
    --font-body: system-ui, -apple-system, sans-serif;
    --space-unit: 8px;
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: var(--font-body);
    color: var(--color-text);
    background: var(--color-surface);
    line-height: 1.6;
    padding: calc(var(--space-unit) * 6);
    max-width: 800px;
    margin: 0 auto;
  }
  h1, h2, h3 { font-family: var(--font-display); font-weight: 700; line-height: 1.3; }
  h1 { font-size: 2.5rem; margin-bottom: calc(var(--space-unit) * 4); color: var(--color-primary); }
  h2 { font-size: 1.75rem; margin-top: calc(var(--space-unit) * 6); margin-bottom: calc(var(--space-unit) * 2); }
  p { margin-bottom: calc(var(--space-unit) * 2); }
  code {
    background: color-mix(in srgb, var(--color-primary) 10%, transparent);
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 0.9em;
  }
  pre {
    background: color-mix(in srgb, var(--color-text) 8%, transparent);
    padding: calc(var(--space-unit) * 2);
    border-radius: 8px;
    overflow-x: auto;
    margin-bottom: calc(var(--space-unit) * 3);
  }
  .tag {
    display: inline-block;
    background: var(--color-accent);
    color: white;
    padding: 2px 10px;
    border-radius: 12px;
    font-size: 0.8rem;
    margin-right: 4px;
  }
  hr { border: none; border-top: 1px solid color-mix(in srgb, var(--color-text) 15%, transparent); margin: calc(var(--space-unit) * 6) 0; }
</style>
</head>
<body>
  <h1>${escapeHtml(task)}</h1>
  <p><span class="tag">${direction}</span> <span class="tag">BWVI</span></p>
  <hr>
  <h2>Usage</h2>
  <pre><code>bwvi init [project-name]      Initialize a new design project
bwvi analyze &lt;task&gt;           Analyze a design task
bwvi generate &lt;task&gt;          Generate design output
bwvi critique &lt;file&gt;          Critique an HTML output file
bwvi --help                    Show this help</code></pre>
  <h2>Examples</h2>
  <pre><code>bwvi init my-landing
bwvi analyze "coffee brand landing page"
bwvi generate "coffee brand landing page" --direction=warm-minimal
bwvi critique output.html</code></pre>
  <h2>Design Decisions</h2>
  <p>BWVI uses a structured decision protocol: <strong>direction</strong> → <strong>palette</strong> → <strong>typography</strong> → <strong>layout</strong> → <strong>detail</strong>. Each decision is persisted, auditable, and can be rolled back.</p>
  <hr>
  <p style="text-align:center;font-size:0.875rem;opacity:0.6;">Generated by BWVI · ${new Date().toISOString().slice(0, 10)}</p>
</body>
</html>`;
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export { generateDirectHtml };

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
