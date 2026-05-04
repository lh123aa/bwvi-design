import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { FingerprintTracker } from "../fingerprint/tracker.js";
import { recommendDirections } from "../engine/analyzer.js";

export async function analyzeCommand(args: string[]) {
  const task = args.join(" ");
  if (!task) {
    console.error(JSON.stringify({ error: "请提供任务描述", code: "MISSING_TASK" }));
    process.exit(1);
  }

  const projectDir = findProjectDir();
  let fingerprintInfo = { used: false, confidence: null as string | null };

  if (projectDir) {
    const tracker = new FingerprintTracker(projectDir);
    const fp = await tracker.load();
    if (fp) {
      fingerprintInfo = { used: true, confidence: fp.confidence };
    }
  }

  const directions = recommendDirections(task, 3);

  const result = {
    task_type: inferTaskType(task),
    knowledge_path: ["direction-advisor"],
    recommended_directions: directions.map((d) => ({
      name: d.name,
      label: d.label,
      rationale: `基于任务分析，推荐 ${d.label} 方向`,
      keywords: d.keywords,
    })),
    fingerprint: fingerprintInfo,
    estimated_tokens: 800,
  };

  console.log(JSON.stringify(result, null, 2));
}

function inferTaskType(task: string): string {
  const lower = task.toLowerCase();
  if (/\b(landing|homepage|首页|落地|marketing|营销)\b/.test(lower)) return "landing_page";
  if (/\b(dashboard|admin|后台|管理|analytics)\b/.test(lower)) return "dashboard";
  if (/\b(ppt|deck|slide|presentation|幻灯片|演示)\b/.test(lower)) return "deck";
  if (/\b(mobile|app|ios|android|手机)\b/.test(lower)) return "mobile_app";
  if (/\b(poster|海报|banner|广告)\b/.test(lower)) return "poster";
  return "general";
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
