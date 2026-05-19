import { existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";

let _cachedDir: string | null = null;

export function getDemoDir(): string {
  if (_cachedDir) return _cachedDir;
  const projectDir = findProjectDir();
  const d = projectDir ? join(projectDir, "demo") : join(homedir(), ".bwvi", "demo");
  if (!existsSync(d)) mkdirSync(d, { recursive: true });
  _cachedDir = d;
  return d;
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
