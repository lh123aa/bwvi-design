import { describe, it, expect } from "vitest";
import {
  classifyFont, getFontStack, generateTypeScale, getScaleForDensity,
  getPairingCompatibility, generateFontPairing, getRecommendedPairings,
  getFontNameForDirection, TYPEOGRAPHIC_SCALES,
} from "../typography.js";

describe("classifyFont", () => {
  it("classifies serif fonts", () => {
    expect(classifyFont("Georgia")).toBe("serif");
    expect(classifyFont("Times New Roman")).toBe("serif");
    expect(classifyFont("Merriweather")).toBe("serif");
  });

  it("classifies sans-serif fonts", () => {
    expect(classifyFont("Inter")).toBe("sans-serif");
    expect(classifyFont("Helvetica")).toBe("sans-serif");
    expect(classifyFont("system-ui")).toBe("sans-serif");
  });

  it("classifies display fonts", () => {
    expect(classifyFont("Playfair Display")).toBe("display");
    expect(classifyFont("Fraunces")).toBe("display");
  });

  it("classifies monospace fonts", () => {
    expect(classifyFont("JetBrains Mono")).toBe("monospace");
    expect(classifyFont("Fira Code")).toBe("monospace");
    expect(classifyFont("Consolas")).toBe("monospace");
  });
});

describe("getFontStack", () => {
  it("returns fallback stacks for each category", () => {
    for (const cat of ["serif", "sans-serif", "display", "monospace", "handwriting"] as const) {
      const stack = getFontStack(cat);
      expect(stack.length).toBeGreaterThan(10);
    }
  });

  it("includes custom font name when provided", () => {
    const stack = getFontStack("sans-serif", "CustomFont");
    expect(stack).toContain("CustomFont");
  });
});

describe("TYPEOGRAPHIC_SCALES", () => {
  it("contains all expected scales", () => {
    const names = ["minor-second", "major-second", "minor-third", "major-third", "perfect-fourth", "augmented-fourth", "perfect-fifth", "golden-ratio"];
    for (const name of names) {
      expect(TYPEOGRAPHIC_SCALES[name]).toBeDefined();
      expect(TYPEOGRAPHIC_SCALES[name]).toBeGreaterThan(1);
    }
  });
});

describe("generateTypeScale", () => {
  it("generates correct proportions", () => {
    const scale = generateTypeScale(16, 1.25);
    expect(scale.sizes.body).toBe(16);
    expect(scale.sizes.h1).toBeGreaterThan(scale.sizes.h2);
    expect(scale.sizes.h2).toBeGreaterThan(scale.sizes.h3);
    expect(scale.sizes.small).toBeLessThan(scale.sizes.body);
    expect(scale.sizes.caption).toBeLessThan(scale.sizes.small);
  });

  it("produces practical sizes for minor third", () => {
    const scale = generateTypeScale(16, 1.2);
    expect(scale.sizes.h1).toBeGreaterThanOrEqual(35);
    expect(scale.sizes.h1).toBeLessThanOrEqual(45);
    expect(scale.sizes.body).toBe(16);
    expect(scale.name).toBe("minor-third");
  });

  it("produces larger range for perfect fourth", () => {
    const scale = generateTypeScale(16, 1.333);
    expect(scale.sizes.h1).toBeGreaterThan(50);
    expect(scale.sizes.h3).toBeGreaterThan(30);
  });
});

describe("getScaleForDensity", () => {
  it("sparse uses larger ratio and base", () => {
    const s = getScaleForDensity("sparse");
    expect(s.ratio).toBeGreaterThanOrEqual(1.3);
    expect(s.baseSize).toBeGreaterThanOrEqual(18);
  });

  it("dense uses smaller ratio and base", () => {
    const d = getScaleForDensity("dense");
    expect(d.ratio).toBeLessThanOrEqual(1.2);
    expect(d.baseSize).toBeLessThanOrEqual(14);
  });

  it("moderate is in between", () => {
    const m = getScaleForDensity("moderate");
    expect(m.ratio).toBeGreaterThanOrEqual(1.15);
    expect(m.ratio).toBeLessThanOrEqual(1.25);
    expect(m.baseSize).toBe(16);
  });
});

describe("getPairingCompatibility", () => {
  it("serif + sans-serif is excellent", () => {
    const rule = getPairingCompatibility("serif", "sans-serif");
    expect(rule.compatibility).toBe("excellent");
  });

  it("handwriting + serif is poor", () => {
    const rule = getPairingCompatibility("handwriting", "serif");
    expect(rule.compatibility).toBe("poor");
  });

  it("handwriting + sans-serif is fair", () => {
    const rule = getPairingCompatibility("handwriting", "sans-serif");
    expect(rule.compatibility).toBe("fair");
  });
});

describe("generateFontPairing", () => {
  it("produces a complete pairing", () => {
    const pair = generateFontPairing("serif", "sans-serif", "moderate");
    expect(pair.display.category).toBe("serif");
    expect(pair.body.category).toBe("sans-serif");
    expect(pair.scale.sizes.body).toBe(16);
    expect(pair.rationale.length).toBeGreaterThan(5);
  });

  it("adjusts scale for density", () => {
    const sparse = generateFontPairing("sans-serif", "sans-serif", "sparse");
    const dense = generateFontPairing("sans-serif", "sans-serif", "dense");
    expect(sparse.scale.sizes.body).toBeGreaterThan(dense.scale.sizes.body);
  });

  it("supports custom font names", () => {
    const pair = generateFontPairing("display", "sans-serif", "sparse", "Fraunces", "Inter");
    expect(pair.display.name).toBe("Fraunces");
    expect(pair.body.name).toBe("Inter");
  });
});

describe("getRecommendedPairings", () => {
  it("returns recommendations for known directions", () => {
    const recs = getRecommendedPairings("warm-minimal");
    expect(recs.length).toBeGreaterThanOrEqual(1);
    expect(recs[0].displayCat).toBeTruthy();
    expect(recs[0].bodyCat).toBeTruthy();
  });

  it("returns fallback for unknown direction", () => {
    const recs = getRecommendedPairings("unknown");
    expect(recs).toHaveLength(1);
    expect(recs[0].displayCat).toBe("sans-serif");
  });
});

describe("getFontNameForDirection", () => {
  it("returns display font for luxury-premium", () => {
    const font = getFontNameForDirection("luxury-premium", "display");
    expect(font).toContain("Playfair");
  });

  it("returns body font for tech-utility", () => {
    const font = getFontNameForDirection("tech-utility", "body");
    expect(font).toBe("Inter");
  });

  it("returns fallback for unknown", () => {
    const font = getFontNameForDirection("unknown", "display");
    expect(font).toBe("Inter");
  });
});
