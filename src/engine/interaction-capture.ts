/**
 * interaction-capture.ts — 交互检测与自动录制
 *
 * 自动扫描 HTML 中的交互元素（data-bwvi-toggle 等），
 * 生成 Playwright 点击步骤，在视频录制过程中自动模拟用户操作。
 */

import { readFileSync } from "node:fs";

// ============================================================
// 交互步骤定义
// ============================================================

export type InteractionAction =
  | "click"
  | "scrollTo"
  | "type"
  | "wait"
  | "hover"
  | "screenshot";

export interface InteractionStep {
  /** 交互类型 */
  action: InteractionAction;
  /** CSS 选择器 */
  selector: string;
  /** 操作后的等待时间（ms） */
  pauseAfter: number;
  /** 标签/描述 */
  label: string;
  /** 额外参数（如 type 的输入值） */
  value?: string;
  /** 点击前的滚动偏移 */
  scrollOffset?: number;
}

export interface InteractionPlan {
  /** 交互步骤列表 */
  steps: InteractionStep[];
  /** 检测到的交互元素数量 */
  detectedCount: number;
  /** 交互类型统计 */
  typeCount: Record<string, number>;
}

// ============================================================
// 交互检测
// ============================================================

/** data-bwvi-* 交互属性列表 */
const INTERACTION_SELECTORS = [
  '[data-bwvi-toggle="modal"]',
  '[data-bwvi-toggle="dialog"]',
  '[data-bwvi-toggle="tab"]',
  '[data-bwvi-toggle="accordion"]',
  '[data-bwvi-toggle="darkmode"]',
  '[data-bwvi-toggle="toast"]',
  '[data-bwvi-carousel]',
  '[data-bwvi-form]',
  'form[data-bwvi-form]',
];

/** 可交互元素的标签名 */
const INTERACTIVE_TAGS = ["a", "button", "input", "select", "textarea"];

/**
 * 扫描 HTML 中的交互元素，生成录制步骤。
 */
export function detectInteractions(html: string): InteractionPlan {
  const steps: InteractionStep[] = [];
  const typeCount: Record<string, number> = {};
  const seen = new Set<string>();

  // 1. 扫描 data-bwvi-toggle 元素
  for (const selector of INTERACTION_SELECTORS) {
    const attrName = selector.match(/data-bwvi-\w+/)?.[0] || "";

    // 判断是否有属性值：selector 可能是 [attr] 或 [attr="val"]
    const hasValue = selector.includes('="');
    const attrValue = hasValue ? selector.match(/"(.*?)"/)?.[1] || "" : "";

    // 构建正则：有值则匹配 attr="val"，无值则匹配 attr 存在即可
    const regex = hasValue
      ? new RegExp(`${attrName}=["']${attrValue}["']`, "gi")
      : new RegExp(`${attrName}=["']([^"']+)["']`, "gi");

    let match: RegExpExecArray | null;

    while ((match = regex.exec(html)) !== null) {
      const actualValue = hasValue ? attrValue : (match[1] || "");
      const pos = match.index;

      const key = `${selector}:${pos}`;
      if (seen.has(key)) continue;
      seen.add(key);

      const step = createStepForInteraction(hasValue ? attrValue : "carousel", html, pos);
      if (step) {
        steps.push(step);
        typeCount[actualValue || "carousel"] = (typeCount[actualValue || "carousel"] || 0) + 1;
      }
    }
  }

  // 2. 扫描可点击的链接和按钮（无 data 属性但有交互行为）
  const clickableCount = detectClickableElements(html, steps, seen);

  // 3. 去重并排序
  const uniqueSteps = deduplicateSteps(steps);

  return {
    steps: uniqueSteps,
    detectedCount: uniqueSteps.length,
    typeCount,
  };
}

/**
 * 为特定交互类型创建步骤。
 */
function createStepForInteraction(
  type: string,
  html: string,
  position: number
): InteractionStep | null {
  // 找到最近的完整标签
  const tag = extractTagAtPosition(html, position);
  if (!tag) return null;

  const selector = buildSelector(tag);

  switch (type) {
    case "modal":
    case "dialog":
      return {
        action: "click",
        selector,
        pauseAfter: 1200,
        label: "打开 Modal",
      };

    case "tab":
      return {
        action: "click",
        selector,
        pauseAfter: 800,
        label: "切换 Tab",
      };

    case "accordion":
      return {
        action: "click",
        selector,
        pauseAfter: 600,
        label: "展开手风琴",
      };

    case "darkmode":
      return {
        action: "click",
        selector,
        pauseAfter: 1000,
        label: "切换暗色模式",
      };

    case "toast":
      return {
        action: "click",
        selector,
        pauseAfter: 2000,
        label: "触发 Toast",
      };

    case "carousel":
      return {
        action: "click",
        selector,
        pauseAfter: 1500,
        label: "轮播切换",
      };

    default:
      return null;
  }
}

/**
 * 检测页面中的普通可点击元素。
 */
function detectClickableElements(
  html: string,
  steps: InteractionStep[],
  seen: Set<string>
): number {
  let count = 0;

  // 检测 <a> 标签（排除纯导航链接）
  const aRegex = /<a\s[^>]*href=["'](#[^"']+)["'][^>]*>/gi;
  let match: RegExpExecArray | null;
  while ((match = aRegex.exec(html)) !== null) {
    const key = `a:${match.index}`;
    if (seen.has(key)) continue;
    seen.add(key);

    // 只录制页内锚点跳转
    const text = extractTagContent(html, match.index);
    if (text && text.length < 30) {
      steps.push({
        action: "click",
        selector: `a[href="${match[1]}"]`,
        pauseAfter: 1000,
        label: `点击: ${text.trim().slice(0, 20)}`,
        scrollOffset: 100,
      });
      count++;
    }
  }

  return count;
}

/**
 * 构建唯一选择器。
 */
function buildSelector(tag: string): string {
  // 优先使用 id
  const idMatch = tag.match(/id=["']([^"']+)["']/);
  if (idMatch) return `#${idMatch[1]}`;

  // 使用 data-bwvi-* 属性
  const bwviMatch = tag.match(
    /(data-bwvi-(?:toggle|carousel|form|target|group))=["']([^"']+)["']/
  );
  if (bwviMatch) return `[${bwviMatch[1]}="${bwviMatch[2]}"]`;

  // 使用 class
  const classMatch = tag.match(/class=["']([^"']+)["']/);
  if (classMatch) {
    const cls = classMatch[1].split(/\s+/)[0];
    if (cls) return `.${cls}`;
  }

  return "*";
}

// ============================================================
// Playwright 执行
// ============================================================

/**
 * 生成 Playwright 交互录制脚本。
 * 返回 JavaScript 代码字符串，可在录制时注入执行。
 */
export function generateInteractionScript(
  plan: InteractionPlan,
  options: {
    viewportWidth?: number;
    viewportHeight?: number;
  } = {}
): string {
  const { viewportWidth = 1920, viewportHeight = 1080 } = options;

  const stepScripts = plan.steps
    .map((step, i) => generateStepScript(step, i))
    .join("\n");

  return `
(async () => {
  const { chromium } = require('playwright');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: ${viewportWidth}, height: ${viewportHeight} }
  });
  await page.goto('file://' + process.argv[2], { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // 交互步骤
${stepScripts}

  await page.waitForTimeout(1000);
  await browser.close();
})();
`.trim();
}

function generateStepScript(step: InteractionStep, index: number): string {
  const indent = "  ";
  const lines: string[] = [];
  const label = `Step ${index + 1}: ${step.label}`;

  lines.push(`  // ${label}`);

  if (step.scrollOffset) {
    lines.push(
      `  await page.evaluate(() => window.scrollBy(0, ${step.scrollOffset}));`
    );
    lines.push(`  await page.waitForTimeout(300);`);
  }

  switch (step.action) {
    case "click":
      // 先滚动到元素可见
      lines.push(
        `  await page.waitForSelector('${escapeSelector(step.selector)}', { state: 'visible' });`
      );
      lines.push(
        `  await page.click('${escapeSelector(step.selector)}');`
      );
      break;

    case "scrollTo":
      lines.push(
        `  await page.evaluate(() => { document.querySelector('${escapeSelector(step.selector)}')?.scrollIntoView({ behavior: 'smooth' }); });`
      );
      break;

    case "hover":
      lines.push(
        `  await page.hover('${escapeSelector(step.selector)}');`
      );
      break;

    case "wait":
      lines.push(
        `  await page.waitForTimeout(${step.pauseAfter});`
      );
      break;
  }

  if (step.pauseAfter > 0) {
    lines.push(`  await page.waitForTimeout(${step.pauseAfter});`);
  }

  return lines.join("\n");
}

// ============================================================
// 与 video-capture.ts 集成
// ============================================================

/**
 * 在 Playwright 页面中执行交互步骤。
 * 由 video-capture.ts 在录制过程中调用。
 */
export async function executeInteractions(
  page: any,
  plan: InteractionPlan
): Promise<void> {
  for (let i = 0; i < plan.steps.length; i++) {
    const step = plan.steps[i];

    try {
      // 先尝试滚动元素到视口
      try {
        await page.evaluate((sel: string) => {
          const el = document.querySelector(sel);
          if (el) {
            el.scrollIntoView({ behavior: "instant", block: "center" });
            // 如果元素在隐藏容器中，尝试显示其父级 tab/accordion
            let parent = el.closest('[data-bwvi-panel], .bwvi-accordion-body');
            if (parent) {
              (parent as HTMLElement).style.display = 'block';
              (parent as HTMLElement).style.maxHeight = parent.scrollHeight + 'px';
            }
          }
        }, step.selector);
        await page.waitForTimeout(200);
      } catch { /* ignore scroll errors */ }

      switch (step.action) {
        case "click":
          await page.waitForSelector(step.selector, { state: "visible", timeout: 5000 }).catch(() => {});
          // 使用 force:true 绕过可见性检查（处理隐藏面板内的元素）
          await page.click(step.selector, { force: true, timeout: 5000 }).catch(() => {
            // 如果常规点击失败，尝试 JS 点击
            return page.evaluate((sel: string) => {
              const el = document.querySelector(sel) as HTMLElement;
              if (el) el.click();
            }, step.selector);
          });
          break;

        case "scrollTo":
          await page.evaluate((sel: string) => {
            document.querySelector(sel)?.scrollIntoView({ behavior: "smooth" });
          }, step.selector);
          break;

        case "type":
          await page.fill(step.selector, step.value || "").catch(() => {});
          break;

        case "wait":
          break;
      }

      if (step.pauseAfter > 0) {
        await page.waitForTimeout(step.pauseAfter);
      }
    } catch (e) {
      // 交互失败不中断整体录制，打印警告继续
      console.warn(`[BWVI] 交互步骤 ${i + 1} (${step.label}) 失败`);
    }
  }
}

// ============================================================
// 辅助函数
// ============================================================

/**
 * 从 HTML 中提取位置处的完整标签。
 */
function extractTagAtPosition(html: string, position: number): string | null {
  // 向前找到 <
  const start = html.lastIndexOf("<", position);
  if (start === -1) return null;

  // 向后找到 >
  const end = html.indexOf(">", position);
  if (end === -1) return null;

  return html.slice(start, end + 1);
}

/**
 * 提取标签的文本内容。
 */
function extractTagContent(html: string, tagStart: number): string {
  const tagEnd = html.indexOf(">", tagStart);
  if (tagEnd === -1) return "";

  const closeTag = html.indexOf("</", tagEnd);
  if (closeTag === -1) return "";

  return html.slice(tagEnd + 1, closeTag).trim();
}

/**
 * 对步骤去重——同类型同选择器的只保留第一个。
 */
function deduplicateSteps(steps: InteractionStep[]): InteractionStep[] {
  const seen = new Set<string>();
  return steps.filter((s) => {
    const key = `${s.action}:${s.selector}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * 转义 CSS 选择器中的特殊字符。
 */
function escapeSelector(sel: string): string {
  return sel.replace(/"/g, '\\"').replace(/'/g, "\\'");
}
