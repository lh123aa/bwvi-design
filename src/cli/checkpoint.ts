import { existsSync } from "node:fs";
import { join } from "node:path";
import { CheckpointManager } from "../checkpoint/manager.js";

export async function checkpointCommand(args: string[]) {
  const sub = args[0];
  const projectDir = findProjectDir();

  if (!projectDir) {
    console.error(JSON.stringify({ error: "未找到 .bwvi 项目目录，请先运行 bwvi init <项目名> 创建项目", code: "NO_PROJECT", hint: "bwvi init my-project" }));
    process.exit(1);
  }

  const cp = new CheckpointManager(projectDir);

  if (sub === "list" || !sub) {
    const decisions = await cp.allDecisions();
    if (decisions.length === 0) {
      console.log(JSON.stringify({ decisions: [], count: 0 }));
      return;
    }
    const list = decisions.map((d) => ({
      id: d.id,
      type: d.type,
      rationale: d.rationale.slice(0, 80),
      confirmed_by: d.confirmed_by,
      created_at: d.created_at,
    }));
    console.log(JSON.stringify({ decisions: list, count: list.length }, null, 2));
    return;
  }

  if (sub === "restore" || sub === "rollback") {
    const targetId = args[1];
    if (!targetId) {
      console.error(JSON.stringify({ error: "请提供要恢复到的决策 ID", code: "MISSING_ID" }));
      process.exit(1);
    }
    const target = await cp.load(targetId);
    if (!target) {
      console.error(JSON.stringify({ error: `决策 ${targetId} 不存在`, code: "NOT_FOUND" }));
      process.exit(1);
    }
    const removed = await cp.rollback(targetId);
    console.log(JSON.stringify({
      status: "ok",
      restored_to: targetId,
      decision_type: target.type,
      rationale: target.rationale.slice(0, 80),
      removed_count: removed,
    }, null, 2));
    return;
  }

  if (sub === "show") {
    const id = args[1];
    if (!id) {
      console.error(JSON.stringify({ error: "请提供决策 ID", code: "MISSING_ID" }));
      process.exit(1);
    }
    const d = await cp.load(id);
    if (!d) {
      console.error(JSON.stringify({ error: `决策 ${id} 不存在`, code: "NOT_FOUND" }));
      process.exit(1);
    }
    console.log(JSON.stringify(d, null, 2));
    return;
  }

  console.error(JSON.stringify({ error: `未知子命令: ${sub}，可用: list, show, restore` }));
  process.exit(1);
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
