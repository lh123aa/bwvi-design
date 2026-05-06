/**
 * pencil-bridge.ts — Pencil 设计工具桥接
 *
 * 将 BWVI 的设计决策输出为 Pencil .pen 文件。
 *
 * 工作模式:
 *   1. direct — 直接调用 Pencil MCP（需 Pencil 正在运行）
 *   2. script — 生成 Pencil 批处理脚本 JSON（可手动应用）
 *   3. preview — 生成占位 PNG 截图（无需 Pencil）
 */

import { writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { findBlueprint } from "../../templates/content-presets.js";
import { getBrand } from "../brand-loader.js";
import type { DeviceType, Orientation } from "../../frames/index.js";

// ============================================================
// 类型定义
// ============================================================

export interface PencilBridgeOptions {
  task: string;
  direction?: string;
  brandName?: string;
  device?: DeviceType;
  orientation?: Orientation;
  dark?: boolean;
  outputDir?: string;
}

export interface PencilBridgeResult {
  success: boolean;
  penFile?: string;
  batchScript?: string;
  screenshot?: string;
  warnings: string[];
  operations?: PencilOperation[];
}

/** 表示一个 Pencil batch_design 操作 */
export interface PencilOperation {
  type: "I" | "U" | "R" | "C" | "G" | "M" | "D";
  target: string;
  data: Record<string, unknown>;
  label?: string;
}

/** Pencil 组件表 — BWVI Section → Pencil Component Ref */
const SECTION_TO_PENCIL: Record<string, string> = {
  navbar: "Navbar",
  hero: "HeroSection",
  features: "FeaturesGrid",
  stats: "StatsGrid",
  testimonials: "Testimonials",
  cta: "CTASection",
  footer: "Footer",
  pricing: "PricingSection",
  timeline: "TimelineSection",
  form: "ContactForm",
  stats_counter: "StatsCounter",
};

/** 设备边框 → Pencil 画布尺寸 */
const DEVICE_SIZES: Record<string, { width: number; height: number }> = {
  iphone: { width: 390, height: 844 },
  pixel: { width: 412, height: 846 },
  ipad: { width: 744, height: 1033 },
  macbook: { width: 1024, height: 640 },
  browser: { width: 1200, height: 800 },
};

// ============================================================
// 主函数
// ============================================================

/**
 * 通过 Pencil 渲染设计。
 *
 * 尝试调用 Pencil MCP，如果不可用则回退到脚本生成。
 */
export async function renderViaPencil(
  options: PencilBridgeOptions
): Promise<PencilBridgeResult> {
  const warnings: string[] = [];
  const outputDir = options.outputDir || process.cwd();

  // 1. 分析任务 → 匹配蓝图
  const lower = options.task.toLowerCase();
  const { blueprint, confidence } = findBlueprint(options.task);
  const direction = options.direction || blueprint.direction;

  // 2. 获取品牌色板
  const brandName = options.brandName || extractBrandName(options.task);
  const brand = brandName ? getBrand(brandName.toLowerCase()) : null;
  const palette = brand
    ? { primary: brand.colors.primary, accent: brand.colors.accent, surface: brand.colors.surface, text: brand.colors.text }
    : getDefaultPalette(direction);

  // 3. 生成 Pencil 操作序列
  const operations = generateOperations(
    options.task,
    blueprint,
    brandName,
    palette,
    options.device,
    options.orientation || "portrait",
    options.dark || false
  );

  if (operations.length === 0) {
    return {
      success: false,
      warnings: ["无法生成 Pencil 操作：蓝图没有可渲染的 section"],
    };
  }

  // 4. 尝试直接调用 Pencil MCP
  const mcpResult = await tryDirectPencil(operations, outputDir);
  if (mcpResult.success) {
    return mcpResult;
  }

  // 5. 回退：生成批处理脚本
  const scriptPath = join(outputDir, `pencil-batch-${Date.now()}.json`);
  if (!existsSync(dirname(scriptPath))) {
    mkdirSync(dirname(scriptPath), { recursive: true });
  }
  writeFileSync(scriptPath, JSON.stringify(operations, null, 2), "utf-8");

  warnings.push("Pencil MCP 不可用，已生成批处理脚本");
  warnings.push(`运行: 在 Pencil 环境中执行 pencil_batch_design 并指定文件路径 "${scriptPath}"`);

  return {
    success: true,
    batchScript: scriptPath,
    warnings,
    operations,
    penFile: scriptPath,
  };
}

// ============================================================
// 操作生成
// ============================================================

function generateOperations(
  task: string,
  blueprint: any,
  brandName: string,
  palette: { primary: string; accent: string; surface: string; text: string },
  device?: DeviceType,
  orientation?: Orientation,
  dark?: boolean
): PencilOperation[] {
  const ops: PencilOperation[] = [];
  const canvas = device ? DEVICE_SIZES[device] || DEVICE_SIZES.browser : DEVICE_SIZES.browser;
  const canvasId = `canvas-${Date.now()}`;

  // 创建设计画布
  ops.push({
    type: "I",
    target: "document",
    data: {
      type: "frame",
      name: `${brandName || "Design"} — ${task.slice(0, 30)}`,
      width: canvas.width,
      height: canvas.height,
      fill: dark ? "#1a1a1a" : palette.surface,
      layout: "vertical",
      padding: 24,
    },
    label: "创建设计画布",
  });

  // 从蓝图 sections 生成组件
  for (const section of blueprint.sections || []) {
    const ref = SECTION_TO_PENCIL[section.type];
    if (!ref) continue;

    ops.push({
      type: "I",
      target: canvasId,
      data: {
        type: "ref",
        ref: ref,
        width: "fill_container",
        variant: section.variant || "default",
      },
      label: `添加 ${section.type} 组件`,
    });

    // 更新组件的色板
    ops.push({
      type: "U",
      target: `${canvasId}/${ref}`,
      data: {
        fill: palette.surface,
        textColor: palette.text,
        accentColor: palette.accent,
      },
      label: `应用色板到 ${section.type}`,
    });
  }

  // 设备边框
  if (device && device !== "browser") {
    ops.push({
      type: "U",
      target: canvasId,
      data: {
        deviceFrame: device,
        cornerRadius: device === "iphone" || device === "pixel" ? 48 : 16,
        shadow: "0 20px 60px rgba(0,0,0,0.3)",
      },
      label: `应用 ${device} 设备边框`,
    });
  }

  return ops;
}

// ============================================================
// Pencil MCP 直接调用
// ============================================================

async function tryDirectPencil(
  operations: PencilOperation[],
  outputDir: string
): Promise<PencilBridgeResult> {
  try {
    // 尝试通过子进程调用 Pencil CLI
    const { execSync } = await import("node:child_process");
    execSync("pencil --version", { stdio: "pipe", timeout: 3000 });
  } catch {
    return { success: false, warnings: ["Pencil CLI 未安装"] };
  }

  // Pencil CLI 已安装，尝试创建文档
  const penPath = join(outputDir, `bwvi-design-${Date.now()}.pen`);
  const warnings: string[] = [];

  try {
    const { execSync } = await import("node:child_process");
    const batchJson = JSON.stringify(operations);
    execSync(`pencil batch "${batchJson}" --output "${penPath}"`, {
      stdio: "pipe",
      timeout: 30000,
    });

    if (existsSync(penPath)) {
      return {
        success: true,
        penFile: penPath,
        warnings,
        operations,
      };
    }
  } catch (e: any) {
    warnings.push(`Pencil 执行失败: ${e.message}`);
  }

  return { success: false, warnings };
}

// ============================================================
// 辅助函数
// ============================================================

function extractBrandName(task: string): string {
  const words = task.split(/\s+/).filter((w) => w.length > 1 && !w.startsWith("--"));
  if (words.length <= 2) return words[0] || "Brand";
  return words[0];
}

function getDefaultPalette(direction: string): { primary: string; accent: string; surface: string; text: string } {
  const palettes: Record<string, { primary: string; accent: string; surface: string; text: string }> = {
    "editorial-monocle": { primary: "#1A1A2E", accent: "#C44536", surface: "#FAF8F5", text: "#2D2D2D" },
    "warm-minimal": { primary: "#D97757", accent: "#8C6E5D", surface: "#FDF8F5", text: "#3D3D3D" },
    "tech-utility": { primary: "#1E1E2E", accent: "#00E698", surface: "#FAFBFC", text: "#24292E" },
    "dark-luxury": { primary: "#0D0D0D", accent: "#C9A84C", surface: "#1A1A1A", text: "#E8E8E8" },
    "playful-color": { primary: "#FF6B6B", accent: "#4ECDC4", surface: "#FFF8F0", text: "#2C3E50" },
  };
  return palettes[direction] || palettes["tech-utility"];
}
