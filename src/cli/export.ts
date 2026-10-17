import { existsSync, readFileSync, writeFileSync, statSync, unlinkSync, mkdirSync } from "node:fs";
import { execSync } from "node:child_process";
import { join } from "node:path";
import { exportOffice } from "../engine/office-export.js";
import { info, success, errExit, result } from "./ux.js";

export async function exportCommand(args: string[]) {
  if (args.includes("--help") || args.includes("-h")) {
    console.log(`bwvi export <file.html> [options]

Export HTML to PDF/PNG/PPTX/DOCX.

Options:
  --format=<fmt>        Output format: pdf|png|pptx|docx (default: pdf)
  --output=<file>       Output file path
  --scale=<n>           PNG 高倍率缩放 (1-5, 默认 1，4 可出印刷级超高清)
  --transparent         PNG 背景透明（仅 format=png）

Examples:
  bwvi export page.html --format=pdf
  bwvi export page.html --format=pptx
  bwvi export page.html --format=png --output=preview.png
  bwvi export poster.html --format=png --scale=4  # 4x 超高清印刷输出
  bwvi export sticker.html --format=png --transparent --output=sticker.png`);
    return;
  }
  const filePath = args.find(a => !a.startsWith("--"));
  if (!filePath || !existsSync(filePath)) {
    errExit("请提供 HTML 文件路径", "FILE_NOT_FOUND");
  }

  const formatFlag = args.find(a => a.startsWith("--format="));
  const format = (formatFlag ? formatFlag.split("=")[1] : "pdf") as "pdf" | "png" | "pptx" | "docx";

  const outFlag = args.find(a => a.startsWith("--output="));
  const output = outFlag ? outFlag.split("=")[1] : filePath.replace(/\.html$/i, `.${format}`);

  // PNG 透明背景
  const transparent = args.includes("--transparent");

  // 高倍率缩放参数（用于印刷级 PNG 导出）
  const scaleFlag = args.find(a => a.startsWith("--scale="));
  const scale = scaleFlag ? parseInt(scaleFlag.split("=")[1]) : 1;

  if (format === "pptx" || format === "docx") {
    info(`正在导出 ${format.toUpperCase()}...`);
    try {
      const officeResult = await exportOffice(filePath, format as any, output);
      success(`已保存: ${officeResult.file}${officeResult.slides ? ' (' + officeResult.slides + ' 页)' : ''}`);
      result({ status: "ok", file: officeResult.file, format, slides: officeResult.slides });
    } catch (e: any) {
      errExit(e.message);
    }
    return;
  }

  // 临时文件写入 _temp/，用完清理
  const tempDir = join(process.cwd(), "_temp");
  if (!existsSync(tempDir)) mkdirSync(tempDir, { recursive: true });
  const tmpId = `bwvi-export-${Date.now()}`;
  const tmpHtml = join(tempDir, `${tmpId}.html`);
  const tmpScript = join(tempDir, `${tmpId}.mjs`);

  const html = readFileSync(filePath, "utf-8");
  const inlineHtml = html.includes("<style") ? html : `<!DOCTYPE html><html><head><meta charset="utf-8"><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:system-ui,sans-serif;padding:40px;max-width:1200px;margin:0 auto}</style></head><body><pre style="white-space:pre-wrap;word-break:break-word">${escapeHtml(html)}</pre></body></html>`;
  writeFileSync(tmpHtml, inlineHtml, "utf-8");

  try {
    execSync("npx playwright --version", { stdio: "pipe", timeout: 5000 });
  } catch {
    // 清理临时文件
    try { unlinkSync(tmpHtml); } catch {}
    console.log(JSON.stringify({
      status: "error", error: "Playwright not installed",
      fix: "npm install -D @playwright/test && npx playwright install chromium",
    }, null, 2));
    return;
  }

  const dims = detectContentDimensions(html);
  const script = format === "pdf"
    ? generatePdfScript(tmpHtml, output)
    : generatePngScript(tmpHtml, output, scale, transparent, dims);
  writeFileSync(tmpScript, script, "utf-8");

  try {
    execSync(`node "${tmpScript}"`, { timeout: 30000, stdio: "pipe" });
    console.log(JSON.stringify({ status: "ok", file: output, format, size_bytes: existsSync(output) ? statSync(output).size : 0 }, null, 2));
  } catch (e: any) {
    console.error(JSON.stringify({ error: `Export failed: ${e.message}` }));
  } finally {
    // 清理临时文件
    try { unlinkSync(tmpHtml); } catch {}
    try { unlinkSync(tmpScript); } catch {}
  }
}

function generatePdfScript(htmlPath: string, output: string): string {
  return `import {chromium} from 'playwright';
(async()=>{const b=await chromium.launch();const p=await b.newPage();await p.goto('file:///${htmlPath.replace(/\\/g,'/')}',{waitUntil:'networkidle'});await p.pdf({path:'${output.replace(/\\/g,'/')}',format:'A4',printBackground:true});await b.close()})();`;
}

function generatePngScript(htmlPath: string, output: string, scale: number = 1, transparent: boolean = false, dims?: { width: number; height: number }): string {
  const { width = 1920, height = 1080 } = dims || {};
  const scaleOpt = scale > 1 ? `,deviceScaleFactor:${scale}` : "";
  const bgOpt = transparent ? ",omitBackground:true" : "";
  return `import {chromium} from 'playwright';
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:${width},height:${height}${scaleOpt}}});await p.goto('file:///${htmlPath.replace(/\\/g,'/')}',{waitUntil:'networkidle'});await p.screenshot({path:'${output.replace(/\\/g,'/')}',fullPage:true${bgOpt}});await b.close()})();`;
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/**
 * 从 HTML 内容中检测实际设计尺寸，用于匹配 viewport 与内容尺寸。
 * 检测优先级: 设备边框类 → 海报 @page 规则 → 浏览器 max-width → 默认 1920×1080
 */
function detectContentDimensions(html: string): { width: number; height: number } | undefined {
  // 1. 设备边框 — 从 CSS class 定义中提取宽高
  const deviceMatch = html.match(/\.bwvi-(iphone|pixel|ipad)\{width:(\d+)px;height:(\d+)px/);
  if (deviceMatch) {
    return { width: parseInt(deviceMatch[2]), height: parseInt(deviceMatch[3]) };
  }

  // 2. MacBook — 特殊处理，screen 高度 + 底座
  const macScreenMatch = html.match(/\.bwvi-macbook-screen\{[^}]*height:(\d+)px/);
  if (macScreenMatch) {
    return { width: 1024, height: parseInt(macScreenMatch[1]) + 40 };
  }

  // 3. 海报 — @page size 规则
  const pageSizeMatch = html.match(/@page\s*\{[^}]*size:\s*(\d+)px\s+(\d+)px/);
  if (pageSizeMatch) {
    return { width: parseInt(pageSizeMatch[1]), height: parseInt(pageSizeMatch[2]) };
  }

  // 4. 浏览器窗口框架 — 提取 max-width
  const browserMatch = html.match(/\.bwvi-browser\{[^}]*max-width:(\d+)px/);
  if (browserMatch) {
    return { width: parseInt(browserMatch[1]), height: 1080 };
  }

  // 未匹配到任何已知模式，返回 undefined 保留原行为 1920×1080
  return undefined;
}
