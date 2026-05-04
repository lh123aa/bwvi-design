import { mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";

const DEFAULT_CONFIG = {
  name: "my-project",
  created_at: new Date().toISOString(),
  last_used: new Date().toISOString(),
  decisions_count: 0,
  completed: false,
};

export async function initCommand(args: string[]) {
  const projectName = args[0] || "my-project";
  const projectDir = join(process.cwd(), projectName);

  if (!existsSync(projectDir)) {
    await mkdir(projectDir, { recursive: true });
  }

  const bwviDir = join(projectDir, ".bwvi");
  if (!existsSync(bwviDir)) {
    await mkdir(bwviDir, { recursive: true });
    await mkdir(join(bwviDir, "checkpoints"), { recursive: true });
    await mkdir(join(bwviDir, "reports"), { recursive: true });
  }

  const configPath = join(bwviDir, "config.json");
  if (!existsSync(configPath)) {
    const config = { ...DEFAULT_CONFIG, name: projectName };
    await writeFile(configPath, JSON.stringify(config, null, 2), "utf-8");
  }

  console.log(JSON.stringify({
    status: "ok",
    project: projectName,
    path: projectDir,
    bwvi_dir: bwviDir,
  }, null, 2));
}
