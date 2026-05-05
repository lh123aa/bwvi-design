import { existsSync, readFileSync } from "node:fs";
import { execSync } from "node:child_process";

interface VideoOptions {
  fps: number;
  format: "mp4" | "gif";
  bgm?: string;
  output?: string;
}

const BGM_MAP: Record<string, string> = {
  tech: "https://example.com/bgm-tech.mp3",
  ad: "https://example.com/bgm-ad.mp3",
  educational: "https://example.com/bgm-educational.mp3",
  tutorial: "https://example.com/bgm-tutorial.mp3",
};

export async function videoCommand(args: string[]) {
  const filePath = args.find(a => !a.startsWith("--"));
  if (!filePath || !existsSync(filePath)) {
    console.error(JSON.stringify({ error: "请提供有效的 HTML 文件路径", code: "FILE_NOT_FOUND" }));
    process.exit(1);
  }

  const fpsFlag = args.find(a => a.startsWith("--fps="));
  const fps = fpsFlag ? parseInt(fpsFlag.split("=")[1]) : 25;

  const formatFlag = args.find(a => a.startsWith("--format="));
  const format = (formatFlag ? formatFlag.split("=")[1] : "mp4") as "mp4" | "gif";

  const bgmFlag = args.find(a => a.startsWith("--bgm="));
  const bgm = bgmFlag ? bgmFlag.split("=")[1] : undefined;

  const outputFlag = args.find(a => a.startsWith("--output="));
  const output = outputFlag ? outputFlag.split("=")[1] : filePath.replace(/\.html$/i, `.${format}`);

  try {
    execSync("ffmpeg -version", { stdio: "pipe", timeout: 5000 });
  } catch {
    console.log(JSON.stringify({
      status: "error",
      error: "ffmpeg not found. Install ffmpeg to use video export.",
      note: "Install via: winget install ffmpeg 或前往 https://ffmpeg.org/download.html",
    }, null, 2));
    return;
  }

  const html = readFileSync(filePath, "utf-8");

  // Create a simple video export script
  const renderScript = createRenderScript(filePath, fps, format);

  console.log(JSON.stringify({
    status: "prepared",
    input: filePath,
    fps,
    format,
    bgm: bgm || null,
    output,
    size_bytes: html.length,
    instructions: `Video export requires Playwright + ffmpeg.

To render:
1. Create a screenshot sequence: npx playwright pdf ${filePath}
2. Convert to video: ffmpeg -framerate ${fps} -i frames/frame-%04d.png -c:v libx264 -pix_fmt yuv420p ${output}

${bgm ? `3. Add BGM: ffmpeg -i ${output} -i "${BGM_MAP[bgm] || 'bgm.mp3'}" -c:v copy -c:a aac -shortest output-with-bgm.mp4` : ''}
    `.trim(),
  }, null, 2));
}

function createRenderScript(htmlPath: string, fps: number, format: string): string {
  return `const {chromium} = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({viewport:{width:1920,height:1080}});
  await page.goto('file://${htmlPath.replace(/\\/g, '/')}', {waitUntil:'networkidle'});
  // Record at ${fps}fps
  // See https://github.com/nicedoc/video-record-playwright for full pipeline
  await browser.close();
})();
`;
}
