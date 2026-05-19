import { describe, it, expect } from "vitest";
import {
  generateGrid, generateRhythm, getDensityForDirection,
  calcVisualWeight, getDensityFromWeight, columnSpan,
  generateLayoutSpec, getSpacingClass, GRID_COLUMNS,
} from "../layout.js";

describe("generateGrid", () => {
  it("sparse uses 12 columns with larger gutters", () => {
    const g = generateGrid("sparse");
    expect(g.columns).toBe(12);
    expect(g.gutter).toBe(32);
    expect(g.margin).toBe(80);
    expect(g.maxWidth).toBe(1200);
  });

  it("moderate uses 12 columns with medium gutters", () => {
    const g = generateGrid("moderate");
    expect(g.columns).toBe(12);
    expect(g.gutter).toBe(24);
  });

  it("dense uses 8 columns with smaller gutters", () => {
    const g = generateGrid("dense");
    expect(g.columns).toBe(8);
    expect(g.gutter).toBe(16);
    expect(g.margin).toBe(24);
  });
});

describe("generateRhythm", () => {
  it("sparse has larger spacing steps", () => {
    const r = generateRhythm("sparse");
    expect(r.baseUnit).toBe(8);
    expect(r.scale[0]).toBeGreaterThanOrEqual(16);
    expect(r.scale[r.scale.length - 1]).toBeGreaterThanOrEqual(128);
    expect(r.rationale.length).toBeGreaterThan(5);
  });

  it("dense has smaller spacing steps", () => {
    const r = generateRhythm("dense");
    expect(r.baseUnit).toBe(8);
    expect(r.scale[0]).toBe(8);
    expect(r.scale[r.scale.length - 1]).toBeLessThanOrEqual(64);
  });

  it("all scales are multiples of base unit", () => {
    for (const d of ["sparse", "moderate", "dense"] as const) {
      const r = generateRhythm(d);
      for (const step of r.scale) {
        expect(step % r.baseUnit).toBe(0);
      }
    }
  });
});

describe("getDensityForDirection", () => {
  it("editorial-monocle is dense", () => {
    expect(getDensityForDirection("editorial-monocle")).toBe("dense");
  });

  it("warm-minimal is sparse", () => {
    expect(getDensityForDirection("warm-minimal")).toBe("sparse");
  });

  it("tech-utility is moderate", () => {
    expect(getDensityForDirection("tech-utility")).toBe("moderate");
  });

  it("returns moderate for unknown", () => {
    expect(getDensityForDirection("unknown")).toBe("moderate");
  });
});

describe("calcVisualWeight", () => {
  it("empty content returns near 0", () => {
    expect(calcVisualWeight(0, 0, 0)).toBe(0);
  });

  it("heavy content returns near 1", () => {
    const w = calcVisualWeight(10000, 20, 16);
    expect(w).toBeGreaterThanOrEqual(0.8);
  });

  it("moderate content returns moderate weight", () => {
    const w = calcVisualWeight(2500, 3, 4);
    expect(w).toBeGreaterThan(0.2);
    expect(w).toBeLessThan(0.8);
  });
});

describe("getDensityFromWeight", () => {
  it("weight <= 0.3 is sparse", () => {
    expect(getDensityFromWeight(0.2)).toBe("sparse");
  });

  it("weight 0.4 is moderate", () => {
    expect(getDensityFromWeight(0.4)).toBe("moderate");
  });

  it("weight 0.7 is dense", () => {
    expect(getDensityFromWeight(0.7)).toBe("dense");
  });

  it("weight 1.0 is dense", () => {
    expect(getDensityFromWeight(1.0)).toBe("dense");
  });
});

describe("columnSpan", () => {
  it("hero spans full width", () => {
    expect(columnSpan("sparse", "hero")).toBe(12);
    expect(columnSpan("dense", "hero")).toBe(8);
  });

  it("content is ~75%", () => {
    expect(columnSpan("sparse", "content")).toBe(9);
    expect(columnSpan("dense", "content")).toBe(6);
  });

  it("sidebar is ~25%", () => {
    expect(columnSpan("sparse", "sidebar")).toBe(3);
    expect(columnSpan("dense", "sidebar")).toBe(2);
  });
});

describe("generateLayoutSpec", () => {
  it("produces a complete layout spec", () => {
    const spec = generateLayoutSpec("warm-minimal", 1000, 3, 5);
    expect(spec.grid.columns).toBeGreaterThanOrEqual(8);
    expect(spec.rhythm.baseUnit).toBe(8);
    expect(typeof spec.visualWeight).toBe("number");
    expect(spec.density).toBeTruthy();
  });
});

describe("getSpacingClass", () => {
  it("small sizes return correct classes", () => {
    expect(getSpacingClass(4)).toBe("xs");
    expect(getSpacingClass(12)).toBe("sm");
    expect(getSpacingClass(24)).toBe("md");
    expect(getSpacingClass(48)).toBe("lg");
    expect(getSpacingClass(96)).toBe("xl");
  });
});
