import { describe, it, expect } from "vitest";
import { buildReport, generateSelfReview, getTaskType } from "../self-review.js";
import { analyzeHtml } from "../objective.js";

const GOOD_HTML = `<!DOCTYPE html><html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Test</title>
<style>:root{--color-primary:#1E1E2E;--color-accent:#00E698;--color-surface:#FAFBFC;--font-display:'Inter',sans-serif;--font-body:system-ui,sans-serif}</style>
</head><body>
<header><nav><a href="/">Home</a></nav></header>
<main><section><h1>Heading</h1><p>Content</p><img src="real.jpg" alt="photo"></section></main>
<footer><p>Footer</p></footer>
</body></html>`;

describe("self-review", () => {
  it("should detect task type from HTML", () => {
    expect(getTaskType("dashboard analytics table")).toBe("dashboard");
    expect(getTaskType("slide deck presentation")).toBe("deck");
    expect(getTaskType("hero features pricing landing")).toBe("landing_page");
    expect(getTaskType("random content")).toBe("default");
  });

  it("should generate self review with valid scores (1-10)", () => {
    const metrics = analyzeHtml(GOOD_HTML);
    const review = generateSelfReview(GOOD_HTML, metrics);
    expect(review.philosophy).toBeGreaterThanOrEqual(1);
    expect(review.philosophy).toBeLessThanOrEqual(10);
    expect(review.hierarchy).toBeGreaterThanOrEqual(1);
    expect(review.hierarchy).toBeLessThanOrEqual(10);
    expect(review.detail).toBeGreaterThanOrEqual(1);
    expect(review.detail).toBeLessThanOrEqual(10);
    expect(review.function).toBeGreaterThanOrEqual(1);
    expect(review.function).toBeLessThanOrEqual(10);
    expect(review.innovation).toBeGreaterThanOrEqual(1);
    expect(review.innovation).toBeLessThanOrEqual(10);
  });

  it("should build complete report with all fields", () => {
    const metrics = analyzeHtml(GOOD_HTML);
    const report = buildReport(GOOD_HTML, metrics);
    expect(report).toHaveProperty("objective");
    expect(report).toHaveProperty("self");
    expect(report).toHaveProperty("weighted_score");
    expect(report).toHaveProperty("score");
    expect(report).toHaveProperty("passed");
    expect(report).toHaveProperty("warnings");
    expect(report).toHaveProperty("issues");
    expect(report).toHaveProperty("summary");
    expect(typeof report.weighted_score).toBe("number");
    expect(typeof report.passed).toBe("boolean");
  });

  it("should pass on good HTML", () => {
    const metrics = analyzeHtml(GOOD_HTML);
    const report = buildReport(GOOD_HTML, metrics);
    expect(report.passed).toBe(true);
    expect(report.weighted_score).toBeGreaterThanOrEqual(5);
  });

  it("should have weighted scores dependent on task type", () => {
    const metrics1 = analyzeHtml(GOOD_HTML);
    const r1 = buildReport(GOOD_HTML, metrics1);
    expect(r1.weighted_score).toBeGreaterThan(0);
  });
});
