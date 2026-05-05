import { execSync } from "node:child_process";
import { writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";

export interface HuashuBridgeConfig {
  skillPath?: string;
  agentBinary?: string;
}

export interface HuashuBridgeResult {
  success: boolean;
  html: string;
  warnings: string[];
  files?: string[];
}

export function buildHuashuPrompt(task: string, options?: {
  direction?: string;
  brandName?: string;
  device?: string;
  dark?: boolean;
}): string {
  return `Act as a Huashu-Design expert. Use the BWVI design decisions below:

Task: ${task}
Direction: ${options?.direction || "tech-utility"}
Brand: ${options?.brandName || "none"}
Device: ${options?.device || "none"}
${options?.dark ? "Theme: dark" : ""}

Follow the Huashu-Design workflow:
1. Fact verification
2. Asset protocol (use real images from Unsplash/Wikimedia)
3. Junior designer: show assumptions first
4. Generate a high-fidelity HTML prototype
5. Verify with Playwright if possible

CRITICAL RULES:
- Use real images, never SVG placeholders
- No purple gradients, no emoji icons
- One signature detail at 120%, others at 80%
- Wrap output in <artifact> tags
- Output single self-contained HTML file`;
}

export async function renderViaHuashu(
  task: string,
  options?: {
    direction?: string;
    brandName?: string;
    device?: string;
    dark?: boolean;
    agentBinary?: string;
  }
): Promise<HuashuBridgeResult> {
  const warnings: string[] = [];

  // Detect available agent
  const agents = detectAgents();
  const preferredAgent = options?.agentBinary || "opencode";
  const agent = agents.find(a => a.binary === preferredAgent) || agents[0];

  if (!agent) {
    return {
      success: false,
      html: "",
      warnings: [
        "未检测到 Agent CLI",
        "Huashu-Design 需要 Claude Code / OpenCode / Codex 等 Agent",
        "安装后重试，或使用 --engine=direct",
      ],
    };
  }

  const prompt = buildHuashuPrompt(task, options);

  try {
    process.stderr.write(`Using agent: ${agent.name} (${agent.binary})\n`);
    process.stderr.write("Running Huashu-Design workflow...\n");

    const output = execSync(`echo "${escapeShell(prompt)}" | ${agent.binary}`, {
      timeout: 180000,
      maxBuffer: 20 * 1024 * 1024,
      encoding: "utf-8",
      shell: true as any,
    });

    const artifactMatch = output.match(/<artifact[^>]*>([\s\S]*?)<\/artifact>/);
    const html = artifactMatch ? artifactMatch[1] : output;

    if (!html || html.length < 200) {
      warnings.push("Huashu 输出内容过短，可能未正确生成");
    }

    return { success: true, html, warnings };
  } catch (e: any) {
    const stderr = e.stderr?.toString() || "";
    const stdout = e.stdout?.toString() || "";

    if (stdout) {
      const artifactMatch = stdout.match(/<artifact[^>]*>([\s\S]*?)<\/artifact>/);
      if (artifactMatch) {
        return { success: true, html: artifactMatch[1], warnings: [`Agent 有错误输出: ${stderr.slice(0, 200)}`] };
      }
    }

    return {
      success: false,
      html: "",
      warnings: [`Huashu 调用失败: ${e.message}${stderr ? ' — ' + stderr.slice(0, 200) : ''}`],
    };
  }
}

interface AgentInfo {
  name: string;
  binary: string;
}

function detectAgents(): AgentInfo[] {
  const candidates: AgentInfo[] = [
    { name: "Claude Code", binary: "claude" },
    { name: "OpenCode", binary: "opencode" },
    { name: "Codex CLI", binary: "codex" },
    { name: "Cursor Agent", binary: "cursor-agent" },
    { name: "Gemini CLI", binary: "gemini" },
    { name: "Copilot CLI", binary: "copilot" },
  ];

  return candidates.filter(agent => {
    try {
      execSync(`${agent.binary} --version`, { stdio: "pipe", timeout: 3000 });
      return true;
    } catch {
      return false;
    }
  });
}

function escapeShell(s: string): string {
  return s.replace(/"/g, '\\"').replace(/\n/g, " ").replace(/\$/g, "\\$");
}
