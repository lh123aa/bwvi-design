/**
 * video-capture.ts — Playwright 录屏引擎
 *
 * 核心流程:
 * 1. 注入动画（video-inject.ts）
 * 2. Playwright 打开 HTML
 * 3. 自动滚动触发所有动画
 * 4. Playwright context.recordVideo 原生录屏
 * 5. 输出 WebM 文件
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { injectForVideo } from "./video-inject.js";
import type { InteractionStep } from "./interaction-capture.js";

export type ScrollBehavior = "auto" | "section" | "none";

export interface CaptureOptions {
  /** 输出帧率（默认 25） */
  fps?: number;
  /** 视口宽度（默认 1920） */
  width?: number;
  /** 视口高度（默认 1080） */
  height?: number;
  /** 滚动模式 */
  scrollBehavior?: ScrollBehavior;
  /** 视频时长（秒），不指定则滚动到页底 */
  duration?: number;
  /** 是否注入动画 */
  animate?: boolean;
  /** 动画循环次数 */
  loop?: number;
  /** 交互步骤（录制过程中自动执行） */
  interactionSteps?: InteractionStep[];
}

export interface CaptureResult {
  success: boolean;
  outputPath: string;
  /** Playwright 原始输出的 WebM 路径 */
  rawWebmPath: string;
  duration: number;
  error?: string;
}

/**
 * 检测 Playwright 是否已安装
 */
export function checkPlaywright(): {
  installed: boolean;
  version?: string;
  chromiumInstalled?: boolean;
} {
  try {
    // 尝试导入 playwright 来判断是否安装
    const info = { installed: false };
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const pw = require("playwright");
      info.installed = true;
    } catch {
      return { installed: false };
    }
    return { installed: true };
  } catch {
    return { installed: false };
  }
}

/**
 * 核心录制函数。
 *
 * @param htmlPath - 输入的 HTML 文件路径
 * @param outputDir - 输出目录
 * @param opts - 录制选项
 * @returns 录制结果
 */
export async function captureVideo(
  htmlPath: string,
  outputDir: string,
  opts: CaptureOptions = {}
): Promise<CaptureResult> {
  const {
    fps = 25,
    width = 1920,
    height = 1080,
    scrollBehavior = "auto",
    duration,
    animate = true,
    loop = 1,
  } = opts;

  // 确保输出目录存在
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  // 1. 读取并注入动画
  let html = readFileSync(htmlPath, "utf-8");
  if (animate) {
    html = injectForVideo(html, { loop, autoScroll: scrollBehavior !== "none" });
  }

  // 2. 写入临时 HTML
  const timestamp = Date.now();
  const tmpHtmlPath = join(outputDir, `bwvi-capture-${timestamp}.html`);
  writeFileSync(tmpHtmlPath, html, "utf-8");

  // 3. 输出路径：Playwright 会生成 .webm
  const rawWebmPath = join(outputDir, `bwvi-capture-${timestamp}.webm`);

  try {
    // 4. 动态导入 Playwright（可选依赖，运行时检测是否安装）
    // @ts-ignore — playwright 可能未安装，由 checkPlaywright() 在调用前检测
    const { chromium } = await import("playwright");

    const browser = await chromium.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
      ],
    });

    // 5. 创建上下文并开启录屏
    const context = await browser.newContext({
      viewport: { width, height },
      deviceScaleFactor: 1,
      recordVideo: {
        dir: outputDir,
        size: { width, height },
      },
    });

    const page = await context.newPage();

    // 6. 加载 HTML
    await page.goto(`file://${tmpHtmlPath.replace(/\\/g, "/")}`, {
      waitUntil: "networkidle",
      timeout: 30000,
    });

    // 等待动画就绪
    try {
      await page.waitForFunction(
        () => document.body?.dataset?.bwiVideoReady === "true",
        { timeout: 5000 }
      );
    } catch {
      // 如果无动画标记，继续执行
    }

    // 6.5. 执行交互步骤（如果有）
    if (opts.interactionSteps && opts.interactionSteps.length > 0) {
      try {
        const { executeInteractions } = await import("./interaction-capture.js");
        await executeInteractions(page, {
          steps: opts.interactionSteps,
          detectedCount: opts.interactionSteps.length,
          typeCount: {},
        });
      } catch (e) {
        // 交互失败不阻塞录制
        console.warn("[BWVI] 交互执行失败:", e);
      }
    }

    // 7. 计算录制时长
    const totalDuration = duration ?? await estimateScrollDuration(page, fps, scrollBehavior);

    // 8. 执行滚动
    if (scrollBehavior !== "none" && !duration) {
      await performScroll(page, scrollBehavior, totalDuration, fps);
    } else if (duration) {
      // 固定时长：等待指定时间
      await page.waitForTimeout(duration * 1000);
    } else {
      // 不滚动：等待一小段时间让动画播放
      await page.waitForTimeout(2000);
    }

    // 9. 关闭上下文（这一步 Playwright 才真正写入视频文件）
    await context.close();
    await browser.close();

    // 10. 查找 Playwright 生成的视频文件
    const webmFile = await findRecordedVideo(outputDir, timestamp);

    if (!webmFile || !existsSync(webmFile)) {
      return {
        success: false,
        outputPath: rawWebmPath,
        rawWebmPath,
        duration: totalDuration,
        error: "Playwright 未能生成视频文件",
      };
    }

    return {
      success: true,
      outputPath: webmFile,
      rawWebmPath: webmFile,
      duration: totalDuration,
    };
  } catch (e: any) {
    return {
      success: false,
      outputPath: rawWebmPath,
      rawWebmPath,
      duration: 0,
      error: e.message,
    };
  } finally {
    // 清理临时 HTML
    try {
      const { unlinkSync } = await import("node:fs");
      if (existsSync(tmpHtmlPath)) unlinkSync(tmpHtmlPath);
    } catch { /* ignore */ }
  }
}

/**
 * 根据页面内容估算滚动时长。
 * 按每 800px 内容约 1 秒，最少 3 秒，最多 30 秒。
 */
async function estimateScrollDuration(
  page: any,
  fps: number,
  behavior: ScrollBehavior
): Promise<number> {
  try {
    const scrollHeight: number = await page.evaluate(
      () => document.documentElement.scrollHeight
    );
    const estimated = Math.ceil(scrollHeight / 800);
    return Math.max(3, Math.min(30, estimated));
  } catch {
    return 5;
  }
}

/**
 * 执行自动滚动
 */
async function performScroll(
  page: any,
  behavior: ScrollBehavior,
  durationSec: number,
  fps: number
): Promise<void> {
  const totalFrames = durationSec * fps;
  const frameInterval = 1000 / fps;

  if (behavior === "section") {
    // 按节滚动：找到所有 section，逐个滚动
    const sections: number[] = await page.evaluate(() => {
      const els = document.querySelectorAll("section, .bwvi-section");
      if (els.length === 0) return [];
      return Array.from(els).map((el) => (el as HTMLElement).offsetTop);
    });

    if (sections.length > 0) {
      for (let i = 0; i < sections.length; i++) {
        await page.evaluate((y: number) => window.scrollTo(0, y), sections[i]);
        await page.waitForTimeout(1200); // 每节停留 1.2s
      }
      return;
    }
  }

  // auto 模式：匀速滚动
  if (behavior === "auto") {
    const scrollHeight: number = await page.evaluate(
      () => document.documentElement.scrollHeight - window.innerHeight
    );

    if (scrollHeight <= 0) {
      await page.waitForTimeout(3000);
      return;
    }

    const scrollStep = scrollHeight / totalFrames;
    for (let i = 0; i < totalFrames; i++) {
      await page.evaluate((y: number) => window.scrollTo(0, y), i * scrollStep);
      await page.waitForTimeout(frameInterval);
    }
  }
}

/**
 * 查找 Playwright 录制的视频文件。
 * Playwright 会将视频保存为 {dir}/{some-uuid}.webm
 */
async function findRecordedVideo(outputDir: string, afterTimestamp: number): Promise<string | null> {
  try {
    const fs = await import("node:fs");
    const path = await import("node:path");
    const files = fs.readdirSync(outputDir);
    const webmFiles = files
      .filter((f) => path.extname(f).toLowerCase() === ".webm")
      .filter((f) => {
        // 排除我们自己的临时文件
        return !f.includes("bwvi-capture-");
      })
      .map((f) => join(outputDir, f));

    if (webmFiles.length === 0) return null;

    // 返回最新的 .webm 文件
    return webmFiles.sort().reverse()[0];
  } catch {
    return null;
  }
}
