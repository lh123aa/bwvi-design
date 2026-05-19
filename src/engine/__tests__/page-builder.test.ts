import { describe, it, expect } from "vitest";
import { buildPage } from "../page-builder.js";

describe("page-builder", () => {
  it("should generate HTML for a basic task", () => {
    const result = buildPage({ task: "coffee brand landing page" });
    expect(result.html).toBeTruthy();
    expect(result.html.length).toBeGreaterThan(500);
    expect(result.html).toContain("<!DOCTYPE html>");
    expect(result.html).toContain("</html>");
    expect(result.blueprintId).toBeTruthy();
    expect(result.direction).toBeTruthy();
  });

  it("should apply a specific direction", () => {
    const result = buildPage({ task: "test page", direction: "dark-luxury" });
    expect(result.direction).toBe("dark-luxury");
    expect(result.html).toContain("--color-primary:");
    expect(result.html).toContain("--color-accent:");
  });

  it("should apply device frame when specified", () => {
    const result = buildPage({ task: "test page", device: "iphone" });
    expect(result.html).toContain("bwvi-iphone");
  });

  it("should apply dark mode when specified", () => {
    const result = buildPage({ task: "test page", dark: true });
    expect(result.html).toContain('data-theme="dark"');
  });

  it("should embed state machine script when interactive", () => {
    const result = buildPage({ task: "test page", interactive: true });
    expect(result.html).toContain("data-bwvi-toggle");
  });

  it("should apply a visual style when styleId is provided", () => {
    const result = buildPage({ task: "test page", styleId: "glassmorphism" });
    expect(result.html).toContain("--color-primary:");
    expect(result.html.length).toBeGreaterThan(500);
  });

  it("should match blueprint and provide match confidence", () => {
    const result = buildPage({ task: "SaaS platform landing page for developer tools" });
    expect(result.matchConfidence).toBeGreaterThan(0);
    expect(result.matchConfidence).toBeLessThanOrEqual(1);
    expect(result.blueprintId).toBeTruthy();
  });

  it("should handle empty task gracefully", () => {
    const result = buildPage({ task: "" });
    expect(result.html).toBeTruthy();
    expect(result.html.length).toBeGreaterThan(100);
  });

  // ─── 海报模式 ──────────────────────────────────────────────────
  it("should generate poster with A3 dimensions when --poster", () => {
    const result = buildPage({ task: "tech conference poster", poster: true });
    expect(result.html).toContain("poster-canvas");
    expect(result.html).toContain("3508px"); // A3 宽度
    expect(result.html).toContain("4961px"); // A3 高度
    expect(result.blueprintId).toBe("poster");
    expect(result.matchConfidence).toBe(1);
  });

  it("should generate poster with A2 size", () => {
    const result = buildPage({ task: "fashion poster", poster: true, posterSize: "a2" });
    expect(result.html).toContain("4961px"); // A2 宽度
    expect(result.html).toContain("7016px"); // A2 高度
  });

  it("should handle transparent palette colors in poster mode", () => {
    // glassmorphism 使用 rgba 半透明色值
    const result = buildPage({ task: "poster", poster: true, styleId: "glassmorphism" });
    expect(result.html).toContain(".poster-title");
    expect(result.html).toContain(":root{--color-primary:rgba(255,255,255,0.1)"); // Design Token 存储半透明
    // 标题色应回退为实色 text 值（#1A1A2E），而非使用半透明
    expect(result.html).toContain(".poster-title");
    // .poster-title 的 color 应使用实色（isSolidColor 回退）
    expect(result.html).not.toMatch(/\.poster-title[\s\S]*?rgba\(/);
    expect(result.html).not.toMatch(/\.poster-title[\s\S]*?color:\s*var\(--color-primary\)/);
  });

  // ─── Design Token 系统 ────────────────────────────────────────
  it("should include CSS Design Tokens in output", () => {
    const result = buildPage({ task: "test page" });
    expect(result.html).toContain("--shadow-md");
    expect(result.html).toContain("--radius-lg");
    expect(result.html).toContain("--transition");
    expect(result.html).toContain("--radius-md");
  });

  it("should include hover interaction classes in CSS", () => {
    const result = buildPage({ task: "test page" });
    expect(result.html).toContain(".bwvi-card:hover");
    expect(result.html).toContain(".bwvi-btn:hover");
    expect(result.html).toContain(".bwvi-nav-link");
    expect(result.html).toContain(".bwvi-icon-wrap");
  });

  it("should include responsive breakpoint in output", () => {
    const result = buildPage({ task: "test page" });
    expect(result.html).toContain("@media (max-width: 768px)");
    expect(result.html).toContain(".bwvi-hero");
    expect(result.html).toContain(".bwvi-split");
  });

  // ─── generateFontsLink ────────────────────────────────────────
  it("should return empty string for system-only font stacks", async () => {
     const { generateFontsLink } = await import("../page-builder.js");
     expect(generateFontsLink("system-ui, -apple-system, sans-serif")).toBe("");
     expect(generateFontsLink("Georgia, 'Times New Roman', serif")).toBe("");
   });

   it("should generate Google Fonts link for custom font names", async () => {
     const { generateFontsLink } = await import("../page-builder.js");
     const link = generateFontsLink("'Playfair Display', Georgia, serif");
    expect(link).toContain("fonts.googleapis.com");
    expect(link).toContain("Playfair+Display");
    expect(link).toContain("wght@400;500;600;700");
    expect(link).toContain("<link");
  });

  it("should include Google Fonts link in generated HTML", () => {
    const result = buildPage({ task: "SaaS platform landing page for developer tools" });
    // 验证方向选择了带 Google Fonts 的字体堆栈
    const html = result.html;
    expect(html).toContain("fonts.googleapis.com");
    expect(html).toContain("Inter");
  });
});
