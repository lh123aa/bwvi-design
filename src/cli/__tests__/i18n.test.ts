import { describe, it, expect } from "vitest";
import { t, tpl } from "../i18n.js";

describe("CLI i18n", () => {
  it("should return Chinese by default", () => {
    expect(t("task_required")).toBe("请提供任务描述");
  });

  it("should return English when set", () => {
    const old = process.env.BWVI_LANG;
    process.env.BWVI_LANG = "en";
    expect(t("task_required")).toBe("Please provide a task description");
    process.env.BWVI_LANG = old;
  });

  it("should return fallback for missing keys", () => {
    expect(t("nonexistent_key", "Fallback")).toBe("Fallback");
  });

  it("should interpolate template strings", () => {
    expect(tpl("style_count", { n: 56 })).toBe("56 种内置风格");
  });

  it("should interpolate English templates", () => {
    const old = process.env.BWVI_LANG;
    process.env.BWVI_LANG = "en";
    expect(tpl("style_count", { n: 56 })).toBe("56 built-in styles");
    process.env.BWVI_LANG = old;
  });

  it("should have all 82 messages", () => {
    const { MESSAGES } = await import("../i18n.js");
    const zhCount = Object.keys(MESSAGES["zh-CN"]).length;
    const enCount = Object.keys(MESSAGES["en"]).length;
    expect(zhCount).toBe(82);
    expect(enCount).toBe(82);
  });
});
