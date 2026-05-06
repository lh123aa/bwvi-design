/**
 * video.ts — 已废弃，请使用 `bwvi animate --record`
 *
 * 保留此文件仅用于向后兼容。
 * 所有功能已迁移到 animate.ts。
 */

import { existsSync } from "node:fs";
import { warn, result } from "./ux.js";
import { animateCommand } from "./animate.js";

export async function videoCommand(args: string[]) {
  if (args.includes("--help") || args.includes("-h")) {
    console.log(`bwvi video <file.html> [options]

⚠️  此命令已废弃，请使用 bwvi animate --record

迁移:
  bwvi video page.html --fps=30
  → bwvi animate page.html --record --fps=30

  bwvi video page.html --fps=15 --format=gif
  → bwvi animate page.html --record --fps=15 --format=gif
`);
    return;
  }

  warn("'bwvi video' 已废弃，请使用 'bwvi animate --record'");
  warn("自动跳转到 bwvi animate --record ...\n");

  // 将 --record 插入参数列表并转发
  const forwarded = [...args, "--record"];
  await animateCommand(forwarded);
}
