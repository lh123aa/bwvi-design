import { execSync } from "node:child_process";
import { join } from "node:path";

const OD_DAEMON_PORT = 7456;

export interface OdBridgeConfig {
  daemonPort?: number;
  daemonHost?: string;
}

export interface OdBridgeResult {
  success: boolean;
  html: string;
  warnings: string[];
  artifacts?: string[];
}

export async function healthCheck(config?: OdBridgeConfig): Promise<{ alive: boolean; port: number; error?: string }> {
  const port = config?.daemonPort || OD_DAEMON_PORT;
  const host = config?.daemonHost || "127.0.0.1";
  try {
    const resp = await fetch(`http://${host}:${port}/api/health`, { signal: AbortSignal.timeout(2000) });
    if (resp.ok) return { alive: true, port };
    return { alive: false, port, error: `Status ${resp.status}` };
  } catch (e: any) {
    return { alive: false, port, error: e.message };
  }
}

export function buildOdSkillPrompt(task: string, direction?: string, brandName?: string): string {
  const lines: string[] = [
    `Design task: ${task}`,
    direction ? `Direction: ${direction}` : "",
    brandName ? `Brand: ${brandName}` : "",
    "Output as a single self-contained HTML file.",
    "No external dependencies. No placeholder images.",
    "Wrap the output in <artifact> tags.",
  ];
  return lines.filter(Boolean).join("\n");
}

export async function renderViaOd(
  task: string,
  options?: {
    direction?: string;
    brandName?: string;
    device?: string;
    dark?: boolean;
    daemonPort?: number;
  }
): Promise<OdBridgeResult> {
  const port = options?.daemonPort || OD_DAEMON_PORT;
  const host = "127.0.0.1";
  const warnings: string[] = [];

  const health = await healthCheck({ daemonPort: port });
  if (!health.alive) {
    return {
      success: false,
      html: "",
      warnings: [
        `Open-Design daemon 未运行 (port ${port})`,
        `启动: cd ../open-design && pnpm tools-dev run web`,
      ],
    };
  }

  const skillPrompt = buildOdSkillPrompt(task, options?.direction, options?.brandName);

  try {
    const resp = await fetch(`http://${host}:${port}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [{ role: "user", content: skillPrompt }],
        skill: "web-prototype",
        design_system: options?.brandName || "default",
        options: {
          device_frame: options?.device || undefined,
          dark_mode: options?.dark || false,
        },
      }),
      signal: AbortSignal.timeout(120000),
    });

    if (!resp.ok) {
      return { success: false, html: "", warnings: [`OD API error: ${resp.status} ${resp.statusText}`] };
    }

    const text = await resp.text();
    const artifactMatch = text.match(/<artifact[^>]*>([\s\S]*?)<\/artifact>/);
    const html = artifactMatch ? artifactMatch[1] : text;

    if (!html || html.length < 100) {
      warnings.push("OD 返回内容过短，可能未正确生成");
    }

    return { success: true, html, warnings };
  } catch (e: any) {
    return { success: false, html: "", warnings: [`OD 调用失败: ${e.message}`] };
  }
}

export async function startOdDaemon(): Promise<boolean> {
  const health = await healthCheck();
  if (health.alive) {
    process.stderr.write(`OD daemon 已在运行 (port ${OD_DAEMON_PORT})\n`);
    return true;
  }

  process.stderr.write("正在启动 Open-Design daemon...\n");
  try {
    execSync("pnpm tools-dev run daemon", {
      cwd: joinOdDir(),
      stdio: "pipe",
      timeout: 30000,
    });
    return true;
  } catch (e: any) {
    process.stderr.write(`OD daemon 启动失败: ${e.message}\n`);
    return false;
  }
}

function joinOdDir(): string {
  return join(process.cwd(), "..", "open-design");
}
