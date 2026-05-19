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

  const script = format === "pdf"
    ? generatePdfScript(tmpHtml, output)
    : generatePngScript(tmpHtml, output, scale, transparent);
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

function generatePngScript(htmlPath: string, output: string, scale: number = 1, transparent: boolean = false): string {
  const scaleOpt = scale > 1 ? `,deviceScaleFactor:${scale}` : "";
  const bgOpt = transparent ? ",omitBackground:true" : "";
  return `import {chromium} from 'playwright';
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1920,height:1080${scaleOpt}}});await p.goto('file:///${htmlPath.replace(/\\/g,'/')}',{waitUntil:'networkidle'});await p.screenshot({path:'${output.replace(/\\/g,'/')}',fullPage:true${bgOpt}});await b.close()})();`;
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
