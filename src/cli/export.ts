import { existsSync, readFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { exportOffice } from "../engine/office-export.js";
import { info, success, errExit, result } from "./ux.js";

export async function exportCommand(args: string[]) {
  const filePath = args.find(a => !a.startsWith("--"));
  if (!filePath || !existsSync(filePath)) {
    errExit("请提供 HTML 文件路径", "FILE_NOT_FOUND");
  }

  const formatFlag = args.find(a => a.startsWith("--format="));
  const format = (formatFlag ? formatFlag.split("=")[1] : "pdf") as "pdf" | "png" | "pptx" | "docx";

  const outFlag = args.find(a => a.startsWith("--output="));
  const output = outFlag ? outFlag.split("=")[1] : filePath.replace(/\.html$/i, `.${format}`);

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

  const html = readFileSync(filePath, "utf-8");
  const inlineHtml = html.includes("<style") ? html : `<!DOCTYPE html><html><head><meta charset="utf-8"><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:system-ui,sans-serif;padding:40px;max-width:1200px;margin:0 auto}</style></head><body><pre style="white-space:pre-wrap;word-break:break-word">${escapeHtml(html)}</pre></body></html>`;

  const tmpHtml = filePath.replace(/\.html$/i, ".export.html");
  require("fs").writeFileSync(tmpHtml, inlineHtml, "utf-8");

  try {
    execSync("npx playwright --version", { stdio: "pipe", timeout: 5000 });
  } catch {
    console.log(JSON.stringify({
      status: "error", error: "Playwright not installed",
      fix: "npm install -D @playwright/test && npx playwright install chromium",
    }, null, 2));
    return;
  }

  const script = format === "pdf"
    ? generatePdfScript(tmpHtml, output)
    : generatePngScript(tmpHtml, output);

  const scriptPath = filePath.replace(/\.html$/i, ".export.mjs");
  require("fs").writeFileSync(scriptPath, script, "utf-8");

  try {
    execSync(`node "${scriptPath}"`, { timeout: 30000, stdio: "pipe" });
    console.log(JSON.stringify({ status: "ok", file: output, format, size_bytes: existsSync(output) ? require("fs").statSync(output).size : 0 }, null, 2));
  } catch (e: any) {
    console.error(JSON.stringify({ error: `Export failed: ${e.message}` }));
  }
}

function generatePdfScript(htmlPath: string, output: string): string {
  return `import {chromium} from 'playwright';
(async()=>{const b=await chromium.launch();const p=await b.newPage();await p.goto('file:///${htmlPath.replace(/\\/g,'/')}',{waitUntil:'networkidle'});await p.pdf({path:'${output.replace(/\\/g,'/')}',format:'A4',printBackground:true});await b.close()})();`;
}

function generatePngScript(htmlPath: string, output: string): string {
  return `import {chromium} from 'playwright';
(async()=>{const b=await chromium.launch();const p=await b.newPage();await p.goto('file:///${htmlPath.replace(/\\/g,'/')}',{waitUntil:'networkidle'});await p.screenshot({path:'${output.replace(/\\/g,'/')}',fullPage:true});await b.close()})();`;
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
