import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";

export async function briefCommand(args: string[]) {
  const task = args.join(" ");
  const projectDir = findProjectDir();
  let existing: any = null;

  // Load existing brief if in project
  if (projectDir) {
    const briefPath = join(projectDir, ".bwvi", "brief.json");
    if (existsSync(briefPath)) {
      try {
        existing = JSON.parse(await readFile(briefPath, "utf-8"));
      } catch {}
    }
  }

  // If task has structured ":" format, parse directly
  const structured = parseStructuredBrief(task);

  if (structured) {
    const brief = { ...structured, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    await saveBrief(projectDir, brief);
    console.log(JSON.stringify({ status: "ok", brief, note: "结构化简报已保存" }, null, 2));
    return;
  }

  // Free-form: create interactive brief
  const brief: any = {
    task: task || existing?.task || "",
    created_at: existing?.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString(),
    status: "draft",
  };

  // Infer from existing + task
  if (task) brief.task = task;
  if (existing) {
    Object.assign(brief, existing);
    brief.updated_at = new Date().toISOString();
  }

  // Add inferred fields
  brief.audience = inferAudience(task);
  brief.output_format = inferFormat(task);
  brief.brand_context = task?.toLowerCase().includes("品牌") ? "有品牌" : "待确认";

  await saveBrief(projectDir, brief);

  console.log(JSON.stringify({
    status: "ok",
    brief,
    next_steps: [
      brief.audience === "待确认" ? "请指定目标受众: --audience <描述>" : null,
      brief.output_format === "待确认" ? "请指定输出格式: landing/dashboard/deck/mobile" : null,
    ].filter(Boolean),
  }, null, 2));
}

function parseStructuredBrief(task: string) {
  // Format: "落地页, 受众:投资人, 语气:专业, 格式:landing"
  const parts: Record<string, string> = { task: "", audience: "", tone: "", format: "" };
  const segments = task.split(",").map((s) => s.trim());

  for (const seg of segments) {
    if (seg.includes(":")) {
      const [k, ...v] = seg.split(":");
      const key = k.trim();
      const val = v.join(":").trim();
      if (/受众|audience/i.test(key)) parts.audience = val;
      else if (/语气|tone|情感/i.test(key)) parts.tone = val;
      else if (/格式|format|output/i.test(key)) parts.format = val;
    } else {
      parts.task = (parts.task ? parts.task + " " : "") + seg;
    }
  }

  if (parts.audience || parts.tone || parts.format) {
    return {
      task: parts.task,
      audience: parts.audience || "待确认",
      tone: parts.tone || "待确认",
      output_format: parts.format || "待确认",
    };
  }
  return null;
}

function inferAudience(task: string): string {
  const l = task?.toLowerCase() || "";
  if (/投资人|investor/.test(l)) return "投资人";
  if (/客户|customer/.test(l)) return "客户/终端用户";
  if (/团队|team/.test(l)) return "内部团队";
  return "待确认";
}

function inferFormat(task: string): string {
  const l = task?.toLowerCase() || "";
  if (/landing|落地|首页/.test(l)) return "landing_page";
  if (/dashboard|后台|管理/.test(l)) return "dashboard";
  if (/deck|ppt|slide|演示/.test(l)) return "deck";
  if (/poster|海报/.test(l)) return "poster";
  if (/mobile|app|ios|手机/.test(l)) return "mobile_app";
  return "待确认";
}

async function saveBrief(projectDir: string | null, brief: any) {
  if (!projectDir) return;
  const bwviDir = join(projectDir, ".bwvi");
  if (!existsSync(bwviDir)) await mkdir(bwviDir, { recursive: true });
  await writeFile(join(bwviDir, "brief.json"), JSON.stringify(brief, null, 2), "utf-8");
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
