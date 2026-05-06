import { describe, it, expect } from "vitest";
import { analyzeHtml } from "../objective.js";

const GOOD_HTML = `<!DOCTYPE html><html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Test Page</title>
<style>:root{--color-primary:#1E1E2E;--color-accent:#00E698;--color-surface:#FAFBFC;--font-display:'Inter',sans-serif;--font-body:system-ui,sans-serif}</style>
</head><body>
<header><nav><a href="/">Home</a></nav></header>
<main><section><h1>Heading</h1><p>Content with <img src="https://example.com/photo.jpg" alt="photo"></p></section></main>
<footer><p>Footer</p></footer>
</body></html>`;

const BAD_HTML = `<html><head></head><body>
<div>No semantic tags</div>
<div><img src="data:image/png,base64,abc"></div>
</body>`;

describe("critique objective metrics", () => {
  it("should score good HTML highly", () => {
    const m = analyzeHtml(GOOD_HTML);
    expect(m.color_compliance).toBeGreaterThanOrEqual(0.3);
    expect(m.font_compliance).toBeGreaterThanOrEqual(0.5);
    expect(m.asset_authenticity).toBe(1);
    expect(m.accessibility).toBeGreaterThanOrEqual(0.25);
    expect(m.semantic_html).toBeGreaterThanOrEqual(0.7);
    expect(m.responsive).toBeGreaterThanOrEqual(0.3);
    expect(m.seo_score).toBeGreaterThanOrEqual(0.5);
    expect(m.html_validity).toBeGreaterThanOrEqual(0.8);
  });

  it("should score poor HTML lower", () => {
    const m = analyzeHtml(BAD_HTML);
    expect(m.semantic_html).toBeLessThan(0.5);
    expect(m.accessibility).toBeLessThan(0.5);
    expect(m.seo_score).toBeLessThan(0.5);
  });

  it("detects brand color compliance", () => {
    const m = analyzeHtml(GOOD_HTML, ["#1E1E2E", "#00E698", "#FAFBFC"]);
    expect(m.color_compliance).toBeGreaterThan(0);
  });

  it("validates accent overuse detection", () => {
    const overused = `<div style="color:var(--color-accent)">A</div><div style="color:var(--color-accent)">B</div><div style="color:var(--color-accent)">C</div><div style="color:var(--color-accent)">D</div><div style="color:var(--color-accent)">E</div>`;
    const m = analyzeHtml(overused);
    expect(m.accent_overuse).toBeLessThan(0.5);
  });

  it("validates token efficiency", () => {
    const bloated = `<body>` + `<!-- comment --><div style="color:red;background:blue;font-size:16px;padding:8px;margin:4px">x</div>`.repeat(100) + `</body>`;
    const m = analyzeHtml(bloated);
    expect(m.token_efficiency).toBeDefined();
    expect(typeof m.token_efficiency).toBe("number");
  });

  it("counts semantic tags correctly", () => {
    const m = analyzeHtml(GOOD_HTML);
    expect(m.semantic_html).toBeGreaterThanOrEqual(0.7);
  });
});
