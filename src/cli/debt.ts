import { readFile, writeFile, mkdir } from "node:fs/promises";

import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export async function debtCommand(args: string[]) {
  const sub = args[0];
  const projectDir = findProjectDir();
  if (!projectDir) { console.error(JSON.stringify({ error: "未找到 .bwvi 项目，请先运行 bwvi init <项目名> 创建项目", hint: "bwvi init my-project" })); process.exit(1); }
  const debtDir = join(projectDir, ".bwvi", "debt");
  if (!existsSync(debtDir)) await mkdir(debtDir, { recursive: true });

  if (sub === "list" || !sub) {
    const files = readdirSync(debtDir).filter(f => f.endsWith(".json"));
    const items = files.map(f => { try { return JSON.parse(readFileSync(join(debtDir, f), "utf-8")); } catch { return null; } }).filter(Boolean);
    console.log(JSON.stringify({ items, count: items.length }, null, 2));
    return;
  }

  if (sub === "add") {
    const desc = args.slice(1).join(" ");
    if (!desc) { console.error(JSON.stringify({ error: "请提供债描述" })); process.exit(1); }
    const item = { id: "debt_" + Date.now(), description: desc, severity: "medium", status: "open", created_at: new Date().toISOString() };
    writeFileSync(join(debtDir, item.id + '.json'), JSON.stringify(item, null, 2), 'utf-8');
    console.log(JSON.stringify({ status: "ok", item }, null, 2));
    return;
  }

  if (sub === "resolve") {
    const id = args[1];
    if (!id) { console.error(JSON.stringify({ error: "请提供债 ID" })); process.exit(1); }
    const fp = join(debtDir, id + ".json");
    if (!existsSync(fp)) { console.error(JSON.stringify({ error: "未找到: " + id })); process.exit(1); }
    const item = JSON.parse(readFileSync(fp, 'utf-8'));
    item.status = "resolved"; item.resolved_at = new Date().toISOString();
    writeFileSync(fp, JSON.stringify(item, null, 2), 'utf-8');
    console.log(JSON.stringify({ status: "ok", resolved: id }, null, 2));
    return;
  }
  console.error(JSON.stringify({ error: "未知子命令", available: ["list", "add", "resolve"] }));
  process.exit(1);
}
function findProjectDir() { var d = process.cwd(); for (var i = 0; i < 5; i++) { if (existsSync(join(d, ".bwvi"))) return d; var p = join(d, ".."); if (p === d) break; d = p; } return null; }
