import { execSync } from "node:child_process";
import { existsSync } from "node:fs";

interface AgentInfo {
  name: string;
  binary: string;
  detected: boolean;
}

export function detectAgents(): AgentInfo[] {
  const candidates = [
    { name: "Claude Code", binary: "claude" },
    { name: "OpenCode", binary: "opencode" },
    { name: "Codex CLI", binary: "codex" },
    { name: "Cursor Agent", binary: "cursor-agent" },
    { name: "Gemini CLI", binary: "gemini" },
    { name: "Copilot CLI", binary: "copilot" },
  ];

  return candidates.map((c) => {
    try {
      execSync(`${c.binary} --version`, { stdio: "ignore", timeout: 3000 });
      return { ...c, detected: true };
    } catch {
      return { ...c, detected: false };
    }
  });
}

export function findBestAgent(): AgentInfo | null {
  const agents = detectAgents();
  const detected = agents.filter((a) => a.detected);
  if (detected.length === 0) return null;
  // Prefer Claude Code, then OpenCode, then Codex
  const preferred = ["claude", "opencode", "codex", "cursor-agent", "gemini", "copilot"];
  for (const name of preferred) {
    const found = detected.find((a) => a.binary === name);
    if (found) return found;
  }
  return detected[0];
}

export function runAgent(agent: AgentInfo, systemPrompt: string, userPrompt: string): string {
  const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;
  try {
    const output = execSync(`echo "${escapeShell(fullPrompt)}" | ${agent.binary}`, {
      timeout: 120000,
      maxBuffer: 10 * 1024 * 1024,
      encoding: "utf-8",
      shell: true as any,
    });
    return output;
  } catch (e: any) {
    if (e.stdout) return e.stdout.toString();
    throw new Error(`Agent ${agent.name} failed: ${e.message}`);
  }
}

function escapeShell(s: string): string {
  return s.replace(/"/g, '\\"').replace(/\$/g, "\\$").replace(/`/g, "\\`");
}
