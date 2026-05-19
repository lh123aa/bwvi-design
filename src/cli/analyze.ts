import { FingerprintTracker } from "../fingerprint/tracker.js";
import { recommendDirections, inferTaskType } from "../engine/analyzer.js";
import { findProjectDir } from "../engine/config-loader.js";
import { errExit, result } from "./ux.js";

export async function analyzeCommand(args: string[]) {
  const task = args.join(" ");
  if (!task) {
    errExit("请提供任务描述", "MISSING_TASK");
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

  const taskType = inferTaskType(task);
  const directions = recommendDirections(task, 3);

  const output = {
    task_type: taskType,
    knowledge_path: ["direction-advisor"],
    recommended_directions: directions.map((d) => ({
      name: d.name,
      label: d.label,
      school: d.school,
      rationale: `基于任务分析，推荐 ${d.label} 方向（${d.school} 学派，${d.palette_hint}）`,
      keywords: d.keywords,
    })),
    fingerprint: fingerprintInfo,
    estimated_tokens: 800,
  };

  result(output);
}
