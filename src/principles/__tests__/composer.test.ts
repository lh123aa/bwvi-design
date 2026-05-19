import { describe, it, expect } from "vitest";
import { generateMixOptions, explainComposition } from "../composer.js";
import { hslToHex } from "../color-harmony.js";

describe("generateMixOptions", () => {
  it("returns requested number of mix options", () => {
    const results = generateMixOptions("coffee brand landing page", 3);
    expect(results).toHaveLength(3);
  });

  it("each option has required fields", () => {
    const results = generateMixOptions("SaaS tech platform", 3);
    for (const r of results) {
      expect(r.option.id).toBeTruthy();
      expect(r.option.name).toBeTruthy();
      expect(r.option.rationale.length).toBeGreaterThan(10);
      expect(r.option.palette).toBeDefined();
      expect(r.option.typography).toBeDefined();
      expect(r.option.layout).toBeDefined();
      expect(r.option.style).toBeDefined();
      expect(typeof r.principleScore).toBe("number");
      expect(r.recipe.directionForPalette).toBeTruthy();
      expect(r.recipe.directionForLayout).toBeTruthy();
    }
  });

  it("palette colors are valid hex strings", () => {
    const results = generateMixOptions("fashion brand", 2);
    for (const r of results) {
      const hexP = hslToHex(r.option.palette.primary);
      expect(hexP).toMatch(/^#[0-9A-F]{6}$/i);
    }
  });

  it("different tasks produce different mixes", () => {
    const r1 = generateMixOptions("coffee warm minimal", 1);
    const r2 = generateMixOptions("tech SaaS dark", 1);
    expect(r1[0].option.name).not.toBe(r2[0].option.name);
  });

  it("handles short task gracefully", () => {
    const results = generateMixOptions("AI", 2);
    expect(results.length).toBe(2);
    for (const r of results) {
      expect(r.principleScore).toBeGreaterThan(0);
    }
  });
});

describe("explainComposition", () => {
  it("returns human-readable explanation lines", () => {
    const results = generateMixOptions("coffee brand", 1);
    const lines = explainComposition(results[0].option);
    expect(lines.length).toBeGreaterThanOrEqual(5);
    for (const line of lines) {
      expect(typeof line).toBe("string");
      expect(line.length).toBeGreaterThan(0);
    }
  });
});
