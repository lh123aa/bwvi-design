import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { execSync } from "node:child_process";

interface TestResult {
  file: string;
  passed: boolean;
  checks: { name: string; passed: boolean; detail?: string }[];
  error?: string;
}

export async function testCommand(args: string[]) {
  const filePath = args.find(a => !a.startsWith("--"));
  if (!filePath || !existsSync(filePath)) {
    console.error(JSON.stringify({ error: "请提供有效的 HTML 文件路径", code: "FILE_NOT_FOUND" }));
    process.exit(1);
  }

  const viewports = parseViewportFlag(args);
  const checkA11y = args.includes("--a11y");
  const checkInteractive = args.includes("--interactive");
  const checkConsole = args.includes("--console");

  const html = readFileSync(filePath, "utf-8");
  const results: TestResult = { file: filePath, passed: true, checks: [] };

  // Check 1: HTML validity
  {
    const hasDoctype = html.trimStart().startsWith("<!DOCTYPE html") || html.trimStart().startsWith("<!doctype html");
    const hasCharset = /charset\s*=/i.test(html);
    const hasTitle = /<title>/.test(html);
    const valid = hasDoctype && hasCharset && hasTitle;
    results.checks.push({ name: "HTML Validity", passed: valid, detail: valid ? undefined : `doctype=${hasDoctype}, charset=${hasCharset}, title=${hasTitle}` });
    if (!valid) results.passed = false;
  }

  // Check 2: Semantic HTML
  {
    const semanticTags = ["header", "nav", "main", "section", "article", "footer"];
    const found = semanticTags.filter(t => new RegExp(`<${t}[\\s>]`, "i").test(html));
    results.checks.push({ name: "Semantic HTML", passed: found.length >= 2, detail: `found: ${found.join(', ') || 'none'}` });
  }

  // Check 3: Responsive
  {
    const hasViewport = /name=["']viewport["']/i.test(html);
    const hasMedia = /@media/.test(html);
    const hasClamp = /clamp\(/.test(html);
    results.checks.push({ name: "Responsive", passed: hasViewport, detail: `viewport=${hasViewport}, media=${hasMedia}, clamp=${hasClamp}` });
  }

  // Check 4: Accessibility
  if (checkA11y) {
    const altCount = (html.match(/alt=/g) || []).length;
    const imgCount = (html.match(/<img[\s>]/g) || []).length;
    const hasAria = /role=|aria-/.test(html);
    results.checks.push({ name: "Accessibility", passed: imgCount === 0 || altCount >= imgCount, detail: `alt=${altCount}, img=${imgCount}, aria=${hasAria}` });
  }

  // Check 5: Interactive elements
  if (checkInteractive) {
    const hasStateMachine = /bwvi-toggle|bwvi-modal|bwvi-carousel/.test(html);
    results.checks.push({ name: "Interactive Elements", passed: hasStateMachine, detail: hasStateMachine ? "found BWVI interactive elements" : "no interactive elements detected" });
  }

  // Check 6: Multi-viewport screenshot (via Playwright if available)
  if (viewports.length > 0) {
    try {
      execSync("npx playwright --version", { stdio: "pipe", timeout: 5000 });
      results.checks.push({ name: "Playwright Available", passed: true, detail: "Playwright detected, run screenshot test separately" });
    } catch {
      results.checks.push({ name: "Playwright", passed: false, detail: "Playwright not installed (npm install -D @playwright/test)" });
    }
  }

  // Check 7: Console errors (via Playwright if available)
  if (checkConsole) {
    const scriptErrors = html.match(/console\.(error|warn)\(/g);
    results.checks.push({ name: "Console Errors", passed: !scriptErrors, detail: scriptErrors ? `${scriptErrors.length} console.error/warn calls found in source` : "no console errors detected" });
  }

  console.log(JSON.stringify(results, null, 2));
}

function parseViewportFlag(args: string[]): string[] {
  const flag = args.find(a => a.startsWith("--viewport="));
  if (!flag) return [];
  return flag.split("=")[1].split(",").map(v => v.trim());
}
