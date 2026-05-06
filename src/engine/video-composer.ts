/**
 * video-composer.ts — ffmpeg 视频合成引擎
 *
 * 职责：
 * 1. WebM → MP4/H.264 转码
 * 2. WebM → GIF（palette 优化）
 * 3. 添加 BGM 音轨
 * 4. 添加水印
 * 5. 裁剪/淡入淡出
 */

import { execSync } from "node:child_process";
import { existsSync, unlinkSync, mkdirSync } from "node:fs";
import { dirname, join, basename } from "node:path";

export type VideoFormat = "mp4" | "gif" | "webm";
export type VideoQuality = "high" | "medium" | "low" | "quick";

export interface ComposeOptions {
  /** 输出格式 */
  format: VideoFormat;
  /** 帧率 */
  fps: number;
  /** BGM 文件路径 */
  bgm?: string;
  /** BGM 音量 0-1 */
  bgmVolume?: number;
  /** 淡入秒数 */
  fadeIn?: number;
  /** 淡出秒数 */
  fadeOut?: number;
  /** 品质 */
  quality?: VideoQuality;
  /** 水印图片路径 */
  watermark?: string;
  /** 水印位置 */
  watermarkPosition?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
}

/**
 * 检测 ffmpeg 是否已安装
 */
export function checkFfmpeg(): { installed: boolean; version?: string } {
  try {
    const out = execSync("ffmpeg -version", { stdio: "pipe", timeout: 5000 });
    const match = out.toString().match(/ffmpeg version\s+(\S+)/i);
    return { installed: true, version: match?.[1] ?? "unknown" };
  } catch {
    return { installed: false };
  }
}

/**
 * 根据操作系统返回 ffmpeg 安装指引
 */
export function getFfmpegInstallGuide(): { command: string; detail: string } {
  const os = process.platform;
  if (os === "win32") {
    return {
      command: "winget install ffmpeg",
      detail: "或下载: https://ffmpeg.org/download.html#build-windows",
    };
  }
  if (os === "darwin") {
    return {
      command: "brew install ffmpeg",
      detail: "或: curl -L https://evermeet.cx/ffmpeg/get | bash",
    };
  }
  // Linux
  return {
    command: "sudo apt install ffmpeg",
    detail: "或: sudo dnf install ffmpeg (Fedora) / sudo pacman -S ffmpeg (Arch)",
  };
}

/**
 * ffmpeg 合成视频。
 *
 * 输入: Playwright 录制的 .webm 文件
 * 输出: 指定格式的成品视频文件
 *
 * 转换链:
 *   input.webm
 *     ├──→ MP4: ffmpeg -i input.webm -c:v libx264 ... output.mp4
 *     ├──→ GIF: ffmpeg -i input.webm -vf palettegen ... output.gif
 *     └──→ +BGM: ffmpeg -i output.mp4 -i bgm.mp3 ... output-bgm.mp4
 */
export function composeVideo(
  inputPath: string,
  outputPath: string,
  opts: ComposeOptions
): { success: boolean; output: string; commands: string[] } {
  const cmds: string[] = [];
  const tmpDir = dirname(outputPath);
  const basename = outputPath.replace(/\.\w+$/, "");
  const intermediate1 = join(tmpDir, `${basename}-noaudio.mp4`);
  const intermediate2 = opts.bgm ? join(tmpDir, `${basename}-withbgm.mp4`) : "";

  // 获取品质参数
  const quality = getQualityParams(opts.quality ?? "high", opts.format);

  // Step 1: 转码为 MP4（H.264）
  if (opts.format === "mp4" || opts.format === "gif") {
    const filters: string[] = [];
    if (opts.fadeIn) filters.push(`fade=t=in:st=0:d=${opts.fadeIn}`);
    if (opts.fadeOut) {
      // 需要先知道视频时长，用 ffprobe
      const duration = getVideoDuration(inputPath);
      if (duration > 0) {
        filters.push(`fade=t=out:st=${duration - opts.fadeOut}:d=${opts.fadeOut}`);
      }
    }

    const vf = filters.length > 0 ? `-vf "${filters.join(",")}"` : "";
    cmds.push(
      `ffmpeg -y -i "${inputPath}" ${vf} -c:v libx264 -pix_fmt yuv420p ` +
      `-preset ${quality.preset} -crf ${quality.crf} ` +
      `-r ${opts.fps} "${intermediate1}"`
    );
  }

  // Step 2: GIF 优化（palette 模式）
  if (opts.format === "gif") {
    const palettePath = join(tmpDir, `${basename}-palette.png`);
    cmds.push(
      `ffmpeg -y -i "${intermediate1}" -vf "fps=${opts.fps},scale=${quality.gifScale}:-1:flags=lanczos,palettegen=stats_mode=diff" "${palettePath}"`
    );
    cmds.push(
      `ffmpeg -y -i "${intermediate1}" -i "${palettePath}" -lavfi ` +
      `"paletteuse=dither=bayer:bayer_scale=5" -r ${opts.fps} "${outputPath}"`
    );
  } else if (opts.format === "webm") {
    // WebM 直接复制（输入已经是 webm）
    cmds.push(
      `ffmpeg -y -i "${inputPath}" -c:v libvpx-vp9 -crf 30 -b:v 0 -r ${opts.fps} "${outputPath}"`
    );
  }

  // Step 3: 加 BGM
  if (opts.bgm && existsSync(opts.bgm)) {
    const targetInput = opts.format === "gif" ? outputPath : intermediate1;
    const bgmOutput = opts.format === "gif"
      ? outputPath.replace(/\.gif$/, "-with-bgm.gif")
      : intermediate2;

    const volume = opts.bgmVolume != null ? opts.bgmVolume : 0.5;
    cmds.push(
      `ffmpeg -y -i "${targetInput}" -i "${opts.bgm}" ` +
      `-c:v copy -c:a aac -map 0:v:0 -map 1:a:0 -shortest ` +
      `-af "volume=${volume}" "${bgmOutput}"`
    );

    // 如果输出是 mp4，重命名
    if (opts.format === "mp4") {
      cmds.push(`move /y "${bgmOutput}" "${outputPath}"`);
    }
  } else if (opts.format === "mp4") {
    // 无 BGM，直接 rename
    cmds.push(`move /y "${intermediate1}" "${outputPath}"`);
  }

  // Step 4: 水印（仅 MP4）
  if (opts.watermark && existsSync(opts.watermark) && opts.format === "mp4") {
    const pos = getWatermarkPosition(opts.watermarkPosition ?? "bottom-right");
    const wmOutput = join(tmpDir, `${basename}-watermarked.mp4`);
    cmds.push(
      `ffmpeg -y -i "${outputPath}" -i "${opts.watermark}" ` +
      `-filter_complex "overlay=${pos.x}:${pos.y}" -c:a copy "${wmOutput}"`
    );
    cmds.push(`move /y "${wmOutput}" "${outputPath}"`);
  }

  // 执行命令链
  try {
    for (const cmd of cmds) {
      execSync(cmd, { stdio: "pipe", timeout: 120000, shell: true as any });
    }
    return { success: true, output: outputPath, commands: cmds };
  } catch (e: any) {
    return {
      success: false,
      output: outputPath,
      commands: cmds,
    };
  }
}

/**
 * 用 ffprobe 获取视频时长（秒）
 */
function getVideoDuration(filePath: string): number {
  try {
    const out = execSync(
      `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${filePath}"`,
      { stdio: "pipe", timeout: 5000 }
    );
    return parseFloat(out.toString().trim()) || 0;
  } catch {
    return 0;
  }
}

interface QualityParams {
  preset: string;
  crf: number;
  gifScale: number;
}

export function getQualityParams(quality: VideoQuality, format: VideoFormat): QualityParams {
  switch (quality) {
    case "high":
      return { preset: "slow", crf: 18, gifScale: 800 };
    case "medium":
      return { preset: "medium", crf: 23, gifScale: 600 };
    case "low":
      return { preset: "fast", crf: 28, gifScale: 400 };
    case "quick":
      return { preset: "ultrafast", crf: 30, gifScale: 360 };
    default:
      return { preset: "medium", crf: 23, gifScale: 600 };
  }
}

function getWatermarkPosition(pos: string): { x: number; y: number } {
  switch (pos) {
    case "bottom-right": return { x: -20, y: -20 };
    case "bottom-left": return { x: 20, y: -20 };
    case "top-right": return { x: -20, y: 20 };
    case "top-left": return { x: 20, y: 20 };
    default: return { x: -20, y: -20 };
  }
}

/**
 * 清理合成过程中产生的临时文件。
 * 包括 palette.png、中间 mp4、animated.html 等。
 */
export function cleanupTempFiles(outputPath: string): { removed: number; files: string[] } {
  const base = outputPath.replace(/\.\w+$/, "");
  const dir = dirname(outputPath);
  const patterns = [
    `${base}-noaudio.mp4`,
    `${base}-withbgm.mp4`,
    `${base}-watermarked.mp4`,
    `${base}-palette.png`,
    `${base}.palette.png`,
    join(dir, `${basename(base)}-palette.png`),
    `${dir}\\${basename(base)}-noaudio.mp4`,
  ];

  const removed: string[] = [];
  for (const p of patterns) {
    try {
      if (existsSync(p)) {
        unlinkSync(p);
        removed.push(p);
      }
    } catch { /* ignore */ }
  }

  return { removed: removed.length, files: removed };
}

/**
 * BGM 预设定义。
 * 每个预设是一个音色描述，运行时用 ffmpeg 合成。
 */
export const BGM_PRESETS = {
  tech:       { freq: 440, tempo: "0.5", desc: "科技电子 · 440Hz 脉冲" },
  corporate:  { freq: 392, tempo: "0.3", desc: "企业专业 · 392Hz 沉稳" },
  warm:       { freq: 523, tempo: "0.2", desc: "温暖原声 · 523Hz 明亮" },
  energetic:  { freq: 659, tempo: "0.6", desc: "动感活力 · 659Hz 激昂" },
  ambient:    { freq: 220, tempo: "0.1", desc: "氛围环境 · 220Hz 舒缓" },
} as const;

export type BgmPreset = keyof typeof BGM_PRESETS;

/**
 * 获取 BGM 文件路径。
 * 如果本地不存在，自动用 ffmpeg 合成。
 *
 * @returns BGM 文件路径，或 null（如果 ffmpeg 不可用）
 */
export function ensureBgm(
  name: string,
  durationSec: number = 30
): string | null {
  const preset = (BGM_PRESETS as any)[name];
  if (!preset) return null;

  const cacheDir = getBgmCacheDir();
  const bgmPath = join(cacheDir, `${name}-${durationSec}s.mp3`);

  if (existsSync(bgmPath)) return bgmPath;

  // 使用 ffmpeg 合成 BGM
  try {
    // 检查 ffmpeg
    execSync("ffmpeg -version", { stdio: "pipe", timeout: 3000 });

    const { freq, tempo } = preset;
    // 生成带节奏感的音轨：基础频率 + 谐波 + 节奏脉冲
    const rate = "44100";
    const tmpWav = bgmPath.replace(/\.mp3$/, ".wav");

    // 使用 ffmpeg 的 synth 滤镜生成音频
    // 主音 + 低八度和声 + 节奏脉冲
    execSync(
      `ffmpeg -y -f lavfi -i "sine=frequency=${freq}:duration=${durationSec}" ` +
      `-f lavfi -i "sine=frequency=${freq / 2}:duration=${durationSec}" ` +
      `-filter_complex ` +
      `"[0:a]volume=0.4[a1];[1:a]volume=0.2[a2];` +
      `[a1][a2]amix=inputs=2:duration=first,` +
      `afade=t=in:st=0:d=2,afade=t=out:st=${durationSec - 3}:d=3" ` +
      `-c:a libmp3lame -q:a 2 "${bgmPath}"`,
      { stdio: "pipe", timeout: 30000, shell: true as any }
    );

    if (existsSync(bgmPath)) return bgmPath;
  } catch { /* ffmpeg 不可用 */ }

  return null;
}

function getBgmCacheDir(): string {
  const home = process.env.USERPROFILE || process.env.HOME || ".";
  const cache = join(home, ".bwvi", "cache", "bgm");
  if (!existsSync(cache)) mkdirSync(cache, { recursive: true });
  return cache;
}
