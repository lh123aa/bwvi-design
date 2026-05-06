import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";

export async function feedbackCommand(args: string[]) {
  const score = parseInt(args[0], 10);
  const comment = args.slice(1).join(" ");

  if (isNaN(score) || score < 1 || score > 10) {
    console.error(JSON.stringify({ error: "请提供 1-10 的评分", code: "INVALID_SCORE" }));
    process.exit(1);
  }

  const projectDir = findProjectDir();
  if (!projectDir) {
    console.error(JSON.stringify({ error: "未找到 .bwvi 项目，请先运行 bwvi init <项目名> 创建项目", code: "NO_PROJECT", hint: "bwvi init my-project" }));
    process.exit(1);
  }

  const feedbackDir = join(projectDir, ".bwvi", "feedback");
  if (!existsSync(feedbackDir)) {
    await mkdir(feedbackDir, { recursive: true });
  }

  const entry = {
    score,
    comment: comment || "",
    timestamp: new Date().toISOString(),
  };

  const filePath = join(feedbackDir, `feedback-${Date.now()}.json`);
  await writeFile(filePath, JSON.stringify(entry, null, 2), "utf-8");

  // Update fingerprint with feedback
  const fpPath = join(projectDir, ".bwvi", "fingerprint.yaml");
  if (existsSync(fpPath)) {
    try {
      const raw = await readFile(fpPath, "utf-8");
      const fp = JSON.parse(raw);
      if (!fp.feedback_history) fp.feedback_history = [];
      fp.feedback_history.push({ score, timestamp: entry.timestamp });
      const scores = fp.feedback_history.map((f: any) => f.score);
      fp.avg_score = scores.reduce((a: number, b: number) => a + b, 0) / scores.length;
      fp.last_updated = new Date().toISOString();
      await writeFile(fpPath, JSON.stringify(fp, null, 2), "utf-8");
    } catch {}
  }

  console.log(JSON.stringify({
    status: "ok",
    score,
    avg_score: null, // will be reported from fingerprint
    file: filePath,
  }, null, 2));
}

function findProjectDir(): string | null {
  let dir = process.cwd();
  for (let i = 0; i < 5; i++) {
    if (existsSync(join(dir, ".bwvi"))) return dir;
    const p = join(dir, "..");
    if (p === dir) break;
    dir = p;
  }
  return null;
}
