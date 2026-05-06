/**
 * animate.ts — BWVI 动画与视频录制命令
 *
 * 命令: bwvi animate <file.html> [options]
 *
 * 子命令:
 *   --embed      注入动画 CSS + scroll-trigger（默认行为）
 *   --record     录制视频（需 Playwright + ffmpeg）
 */

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { getAnimationCSS, getStageScript } from "../engine/animation-engine.js";
import { info, success, warn, errExit, result } from "./ux.js";
import { checkFfmpeg, composeVideo, type VideoFormat, type VideoQuality } from "../engine/video-composer.js";
import { captureVideo, checkPlaywright, type ScrollBehavior, type CaptureOptions } from "../engine/video-capture.js";
import { detectInteractions, executeInteractions } from "../engine/interaction-capture.js";
import { getDemoDir } from "./demo.js";

const BGM_LIST = ["tech", "corporate", "warm", "energetic", "ambient"] as const;
type BgmName = (typeof BGM_LIST)[number];

export async function animateCommand(args: string[]) {
  // ---- help ----
  if (args.includes("--help") || args.includes("-h")) {
    printHelp();
    return;
  }

  const filePath = args.find(a => !a.startsWith("--"));
  if (!filePath || !existsSync(filePath)) {
    errExit("请提供 HTML 文件路径", "FILE_NOT_FOUND");
  }

  // ---- 解析参数 ----
  const embed = args.includes("--embed");
  const record = args.includes("--record");
  const fpsFlag = args.find(a => a.startsWith("--fps="));
  const fps = fpsFlag ? parseInt(fpsFlag.split("=")[1]) : 25;
  const bgmFlag = args.find(a => a.startsWith("--bgm="));
  const bgm = bgmFlag ? bgmFlag.split("=")[1] as BgmName : undefined;
  const outFlag = args.find(a => a.startsWith("--output="));
  const output = outFlag ? outFlag.split("=")[1] : filePath.replace(/\.html$/i, ".mp4");
  const formatFlag = args.find(a => a.startsWith("--format="));
  const format = (formatFlag ? formatFlag.split("=")[1] : "mp4") as VideoFormat;
  const durationFlag = args.find(a => a.startsWith("--duration="));
  const duration = durationFlag ? parseInt(durationFlag.split("=")[1]) : undefined;
  const scrollFlag = args.find(a => a.startsWith("--scroll="));
  const scroll = (scrollFlag ? scrollFlag.split("=")[1] : "auto") as ScrollBehavior;
  const quick = args.includes("--quick");
  const quality: VideoQuality = quick ? "quick" : "high";
  const watermarkFlag = args.find(a => a.startsWith("--watermark="));
  const watermark = watermarkFlag ? watermarkFlag.split("=")[1] : undefined;
  const interactive = args.includes("--interactive");

  // 默认行为: --embed（无 --record 时）
  if (!record) {
    await doEmbed(filePath, fps);
    return;
  }

  // ---- --record: 视频录制 ----
  await doRecord(filePath, output, {
    fps, bgm, format, duration, scroll, quality, watermark, quick, interactive,
  });
}

// ============================================================
// 内部实现
// ============================================================

/**
 * 模式 1: 仅注入动画 CSS + scroll-trigger（原 --embed 行为）
 */
async function doEmbed(filePath: string, fps: number) {
  let html = readFileSync(filePath, "utf-8");
  const css = getAnimationCSS();
  const script = getStageScript();

  if (!html.includes("bwi-anim")) {
    html = html.replace("</head>", `<style>${css}</style></head>`);
    html = html.replace("</body>", `${script}</body>`);
    html = html.replace(/<body[^>]*>/i, (m) => `${m} class="bwi-stagger"`);
    writeFileSync(filePath, html, "utf-8");
    success(`动画已注入: ${filePath}`);
  } else {
    info("动画已存在，跳过注入");
  }

  result({ status: "ok", file: filePath, action: "embedded" });
}

interface RecordOptions {
  fps: number;
  bgm?: BgmName;
  format: VideoFormat;
  duration?: number;
  scroll: ScrollBehavior;
  quality: VideoQuality;
  watermark?: string;
  quick: boolean;
  interactive?: boolean;
}

/**
 * 模式 2: 录制视频
 */
async function doRecord(htmlPath: string, outputPath: string, opts: RecordOptions) {
  // 1. 检测依赖
  info("检测依赖...");

  const ffmpeg = checkFfmpeg();
  if (!ffmpeg.installed) {
    errExit(
      "ffmpeg 未安装。请安装 ffmpeg 后重试:\n" +
      "  winget install ffmpeg   (Windows)\n" +
      "  brew install ffmpeg     (macOS)\n" +
      "  sudo apt install ffmpeg (Linux)",
      "FFMPEG_NOT_FOUND"
    );
  }

  const pw = checkPlaywright();
  if (!pw.installed) {
    errExit(
      "Playwright 未安装。请安装后重试:\n" +
      "  npm install -D playwright\n" +
      "  npx playwright install chromium",
      "PLAYWRIGHT_NOT_FOUND"
    );
  }

  success(`ffmpeg ${ffmpeg.version ?? ""} — ✓`);
  success(`Playwright — ✓`);

  // 2. 解析 BGM 路径
  let bgmPath: string | undefined;
  if (opts.bgm) {
    // 尝试本地缓存目录
    const cacheDir = getCacheDir();
    const localBgm = join(cacheDir, `${opts.bgm}.mp3`);
    const bundledBgm = join(dirname(process.cwd()), "assets", "bgm", `${opts.bgm}.mp3`);

    if (existsSync(localBgm)) {
      bgmPath = localBgm;
    } else if (existsSync(bundledBgm)) {
      bgmPath = bundledBgm;
    } else {
      warn(`BGM "${opts.bgm}" 未找到本地文件，将不添加背景音乐`);
      warn(`  可用 BGM: ${BGM_LIST.join(", ")}`);
      warn(`  放置 MP3 到: ${cacheDir}`);
    }
  }

  // 3. 检测交互（可选）
  let interactionSteps;
  if (opts.interactive) {
    info("检测交互元素...");
    const html = readFileSync(htmlPath, "utf-8");
    const plan = detectInteractions(html);
    if (plan.steps.length > 0) {
      success(`检测到 ${plan.steps.length} 个交互步骤`);
      plan.steps.forEach((s, i) => info(`  ${i + 1}. ${s.label} (${s.selector})`));
      interactionSteps = plan.steps;
    } else {
      info("未检测到交互元素，跳过交互录制");
    }
  }

  // 4. 录制
  info("启动浏览器录制...");
  const outputDir = dirname(outputPath);

  const captureResult = await captureVideo(htmlPath, outputDir, {
    fps: opts.fps,
    width: 1920,
    height: 1080,
    scrollBehavior: opts.scroll,
    duration: opts.duration,
    animate: true,
    loop: 1,
    interactionSteps,
  });

  if (!captureResult.success) {
    errExit(`录制失败: ${captureResult.error ?? "未知错误"}`, "CAPTURE_FAILED");
  }

  success(`录制完成: ${captureResult.outputPath}`);
  info(`  时长: ${captureResult.duration}s @ ${opts.fps}fps`);

  // 4. 合成（转码 + BGM + 水印）
  info("合成视频...");

  const composeResult = composeVideo(captureResult.outputPath, outputPath, {
    format: opts.format,
    fps: opts.fps,
    bgm: bgmPath,
    bgmVolume: 0.4,
    fadeIn: 0.5,
    fadeOut: 0.5,
    quality: opts.quality,
    watermark: opts.watermark,
  });

  if (!composeResult.success) {
    warn("ffmpeg 合成失败，原始 WebM 文件保留在: " + captureResult.outputPath);
    errExit("视频合成失败", "COMPOSE_FAILED");
  }

  // 清理临时文件
  const { cleanupTempFiles } = await import("../engine/video-composer.js");
  const cleaned = cleanupTempFiles(outputPath);
  if (cleaned.removed > 0) {
    info(`清理 ${cleaned.removed} 个临时文件`);
  }

  // 清理录制的 WebM（合成成功后不再需要）
  try {
    const { unlinkSync } = await import("node:fs");
    if (existsSync(captureResult.outputPath) && captureResult.outputPath !== outputPath) {
      unlinkSync(captureResult.outputPath);
    }
  } catch { /* ignore */ }

  success(`视频已生成: ${outputPath}`);
  info(`  格式: ${opts.format.toUpperCase()}`);
  info(`  大小: ${await getFileSize(outputPath)}`);

  result({
    status: "ok",
    file: outputPath,
    format: opts.format,
    fps: opts.fps,
    duration: captureResult.duration,
  });
}

// ============================================================
// 辅助函数
// ============================================================

function printHelp() {
  console.log(`bwvi animate <file.html> [options]

Embed animations or record video from HTML.

Animation (default):
  --embed               Inject animation CSS + scroll-trigger JS

Video recording (requires Playwright + ffmpeg):
  --record              Record browser video (default: 1080p 25fps MP4)
  --fps=<n>             Frame rate: 15|25|30|60 (default: 25)
  --format=<fmt>        Output format: mp4|gif|webm (default: mp4)
  --duration=<n>        Video duration in seconds (default: auto to bottom)
  --scroll=<mode>       Scroll behavior: auto|section|none (default: auto)
  --bgm=<name>          Background music: ${BGM_LIST.join("|")}
  --watermark=<file>    Watermark image overlay
  --quick               Quick mode: 720p 15fps lower quality
  --interactive         Auto-detect and record interactive elements (modal/tab/carousel)
  --output=<file>       Output file path

Examples:
  bwvi animate page.html                          # Inject animations
  bwvi animate page.html --record                 # Record video (default)
  bwvi animate page.html --record --fps=60        # 60fps HD
  bwvi animate page.html --record --format=gif    # GIF export
  bwvi animate page.html --record --bgm=tech      # With BGM
  bwvi animate page.html --record --quick         # Quick preview
  bwvi animate page.html --record --duration=10     # 10s fixed duration
  bwvi animate page.html --record --scroll=section  # Per-section scroll
  bwvi animate page.html --record --interactive     # Record with interaction demo
`);
}

function getCacheDir(): string {
  const home = process.env.USERPROFILE || process.env.HOME || ".";
  const cache = join(home, ".bwvi", "cache", "bgm");
  if (!existsSync(cache)) {
    const { mkdirSync } = require("node:fs") as typeof import("node:fs");
    mkdirSync(cache, { recursive: true });
  }
  return cache;
}

async function getFileSize(filePath: string): Promise<string> {
  try {
    const { statSync } = await import("node:fs");
    const bytes = statSync(filePath).size;
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  } catch {
    return "未知";
  }
}
