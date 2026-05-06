/**
 * ux.ts — BWVI 用户界面工具
 *
 * 提供统一的终端输出函数，支持 JSON 模式和中英双语。
 */

import { t, tpl } from "./i18n.js";

const isJson = process.argv.includes("--json") || !process.stdout.isTTY;
const C = {
  reset: "\x1b[0m", bold: "\x1b[1m", dim: "\x1b[2m", green: "\x1b[32m",
  yellow: "\x1b[33m", red: "\x1b[31m", cyan: "\x1b[36m", magenta: "\x1b[35m",
  blue: "\x1b[34m",
};

function out(msg: string, color = ""): void {
  if (isJson) return;
  process.stderr.write(color + msg + C.reset + "\n");
}

export function info(msg: string): void { out(" ℹ  " + msg, C.blue); }
export function success(msg: string): void { out(" ✅ " + msg, C.green); }
export function warn(msg: string): void { out(" ⚠️  " + msg, C.yellow); }
export function error(msg: string): void { out(" ❌ " + msg, C.red); }
export function step(msg: string): void { out(" → " + msg, C.cyan); }
export function title(msg: string): void { out("\n" + msg, C.bold + C.magenta); }
export function data(label: string, val: string): void { out("   " + label + ": " + C.bold + val + C.reset, C.dim); }

/**
 * 显示错误并退出。
 * msg 可以是普通字符串，也可以是 i18n key。
 */
export function errExit(msg: string, code = "UNKNOWN"): never {
  if (isJson) {
    console.error(JSON.stringify({ error: msg, code }));
  } else {
    error(msg);
  }
  process.exit(1);
}

/**
 * 输出 JSON 结果。
 */
export function result(obj: Record<string, unknown>): void {
  if (isJson) {
    console.log(JSON.stringify(obj, null, 2));
  }
}

/**
 * 输出带 i18n 翻译的成功消息。
 */
export function successT(key: string, vars?: Record<string, string | number>): void {
  success(vars ? tpl(key, vars) : t(key));
}

export function infoT(key: string, vars?: Record<string, string | number>): void {
  info(vars ? tpl(key, vars) : t(key));
}

export function warnT(key: string, vars?: Record<string, string | number>): void {
  warn(vars ? tpl(key, vars) : t(key));
}

export function divider(): void { out("", C.dim); }

export { isJson };
