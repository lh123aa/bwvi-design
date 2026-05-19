/**
 * config-loader.ts — BWVI 项目配置加载
 *
 * 统一从 .bwvi/config.json 读取项目配置，
 * 并为所有命令提供默认值。
 *
 * 优先级链: CLI 参数 > config.json 默认值 > 硬编码默认值
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

export interface ProjectConfig {
  name: string;
  created_at: string;
  last_used: string;
  decisions_count: number;
  completed: boolean;
  default_direction: string;
  default_device: string;
  default_brand: string | null;
  default_style: string | null;
  dark_mode: boolean;
  language: string;
  [key: string]: unknown;
}

const DEFAULT_CONFIG: ProjectConfig = {
  name: "my-project",
  created_at: new Date().toISOString(),
  last_used: new Date().toISOString(),
  decisions_count: 0,
  completed: false,
  default_direction: "tech-utility",
  default_device: "none",
  default_brand: null,
  default_style: null,
  dark_mode: false,
  language: "zh-CN",
};

/**
 * 向上遍历目录树，查找 .bwvi 项目目录。
 * 最多向上 5 层，返回找到的目录路径，或 null。
 */
export function findProjectDir(startDir?: string): string | null {
  let dir = startDir || process.cwd();
  for (let i = 0; i < 5; i++) {
    if (existsSync(join(dir, ".bwvi"))) return dir;
    const parent = join(dir, "..");
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

/**
 * 加载项目配置，如果文件不存在则返回默认配置。
 */
export function loadProjectConfig(projectDir?: string): ProjectConfig {
  const dir = projectDir || findProjectDir();
  if (!dir) return { ...DEFAULT_CONFIG };

  const configPath = join(dir, ".bwvi", "config.json");
  if (!existsSync(configPath)) return { ...DEFAULT_CONFIG };

  try {
    const raw = readFileSync(configPath, "utf-8");
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_CONFIG, ...parsed };
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

/**
 * 解析 CLI 参数中的 flag，如果未提供则从配置中读取默认值。
 *
 * 用法:
 *   const direction = getFlagWithDefault(args, "--direction=", config.default_direction, "tech-utility");
 *
 * @param args        CLI 参数数组
 * @param flagPrefix  flag 前缀，如 "--direction="
 * @param configVal   配置中的默认值（可为 undefined）
 * @param fallback    最终 fallback
 */
export function getFlagWithDefault(
  args: string[],
  flagPrefix: string,
  configVal: string | null | undefined,
  fallback: string,
): string {
  const flag = args.find(a => a.startsWith(flagPrefix));
  if (flag) return flag.split("=")[1];
  if (configVal && configVal !== "none") return configVal;
  return fallback;
}
