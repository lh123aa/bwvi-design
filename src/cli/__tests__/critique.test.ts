import { describe, it, expect } from "vitest";
import { analyzeHtml } from "../../critique/objective.js";
import { buildReport } from "../../critique/self-review.js";

const GOOD_HTML = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Test</title><style>:root{--color-primary:#1E1E2E;--color-accent:#00E698;--font-display:'Inter',sans-serif}</style></head><body><header><nav><a href="/">Home</a></nav></header><main><section><h1>Title</h1><p>Content</p></section></main><footer><p>Footer</p></footer></body></html>`;

describe("CLI critique", () => {
  it("should analyze HTML and return all 10 metrics", () => {
    const m = analyzeHtml(GOOD_HTML);
    expect(m).toHaveProperty("color_compliance");
    expect(m).toHaveProperty("font_compliance");
    expect(m).toHaveProperty("asset_authenticity");
    expect(m).toHaveProperty("accent_overuse");
    expect(m).toHaveProperty("token_efficiency");
    expect(m).toHaveProperty("accessibility");
    expect(m).toHaveProperty("semantic_html");
    expect(m).toHaveProperty("responsive");
    expect(m).toHaveProperty("seo_score");
    expect(m).toHaveProperty("html_validity");
  });

  it("should build full critique report with score", () => {
    const m = analyzeHtml(GOOD_HTML);
    const r = buildReport(GOOD_HTML, m);
    expect(r.score).toBeGreaterThanOrEqual(0);
    expect(r.weighted_score).toBeGreaterThanOrEqual(0);
    expect(typeof r.passed).toBe("boolean");
  });

  it("should generate issues for poor HTML", () => {
    const m = analyzeHtml("<html><body><div>bad</div></body></html>");
    const r = buildReport("<html><body><div>bad</div></body></html>", m);
    expect(r.issues.length).toBeGreaterThanOrEqual(1);
  });
});
