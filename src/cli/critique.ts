import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { analyzeHtml } from "../critique/objective.js";
import { buildReport } from "../critique/self-review.js";
import { FingerprintTracker } from "../fingerprint/tracker.js";
import { generateReport } from "../report/generator.js";

export async function critiqueCommand(args: string[]) {
  const filePath = args[0];
  if (!filePath) {
    console.error(JSON.stringify({ error: "请提供 HTML 文件路径", code: "MISSING_FILE" }));
    process.exit(1);
  }

  let html: string;
  const resolved = filePath.includes(":\\") || filePath.startsWith("/")
    ? filePath
    : join(process.cwd(), filePath);
  try {
    html = await readFile(resolved, "utf-8");
  } catch {
    console.error(JSON.stringify({ error: `无法读取文件: ${resolved}`, code: "FILE_NOT_FOUND" }));
    process.exit(1);
  }

  if (!/<body/i.test(html)) {
    console.error(JSON.stringify({ error: "HTML 缺少 <body> 标签", code: "INVALID_HTML" }));
    process.exit(1);
  }

  const brandColors = args.includes("--brand-colors")
    ? args[args.indexOf("--brand-colors") + 1]?.split(",").map((c) => c.trim())
    : undefined;

  const startTime = Date.now();
  const metrics = analyzeHtml(html, brandColors);
  const report = buildReport(html, metrics);

  // Find project: --project flag > parent of file > CWD
  let projectDir: string | null = null;
  const projectFlag = args.find((a) => a.startsWith("--project="));
  if (projectFlag) {
    projectDir = projectFlag.split("=")[1];
  } else {
    projectDir = findProjectDir(join(resolved, "..")) || findProjectDir(process.cwd());
  }

  if (projectDir) {
    try {
      const { CheckpointManager } = await import("../checkpoint/manager.js");
      const cp = new CheckpointManager(projectDir);
      const decisions = await cp.allDecisions();
      const tracker = new FingerprintTracker(projectDir);
      await tracker.recordProject(decisions, report);
      const name = projectDir.split(/[\\/]/).pop() || "unknown";
      await generateReport(projectDir, name, decisions, report, startTime);
    } catch {}
  }

  const output: any = { ...report };
  if (projectDir) output.project = projectDir;
  else output.note = "未关联项目，仅做评审不记录指纹（使用 --project=<dir> 关联）";

  console.log(JSON.stringify(output, null, 2));
}

function findProjectDir(startDir: string): string | null {
  let dir = startDir;
  for (let i = 0; i < 5; i++) {
    if (existsSync(join(dir, ".bwvi"))) return dir;
    const p = join(dir, "..");
    if (p === dir) break;
    dir = p;
  }
  return null;
}
