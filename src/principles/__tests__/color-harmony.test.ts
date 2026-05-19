import { describe, it, expect } from "vitest";
import {
  hexToHSL, hslToHex, contrastRatio, meetsWCAGAA, meetsWCAGAAA,
  generateHarmonyPalette, generatePaletteFromHues, detectHarmonyMode,
  validatePalette, getHarmonyLabel, getHueRangeForDirection,
  legacyPaletteToSpec,
} from "../color-harmony.js";

describe("hexToHSL", () => {
  it("converts black correctly", () => {
    const hsl = hexToHSL("#000000");
    expect(hsl.l).toBe(0);
  });

  it("converts white correctly", () => {
    const hsl = hexToHSL("#FFFFFF");
    expect(hsl.l).toBe(100);
  });

  it("converts a known color", () => {
    const hsl = hexToHSL("#5E6AD2");
    expect(hsl.h).toBeGreaterThanOrEqual(230);
    expect(hsl.h).toBeLessThanOrEqual(240);
    expect(hsl.s).toBeGreaterThan(50);
  });
});

describe("hslToHex", () => {
  it("roundtrips with hexToHSL", () => {
    const orig = "#5E6AD2";
    const hsl = hexToHSL(orig);
    const hex = hslToHex(hsl);
    const hexUp = hex.toUpperCase();
    // HSL conversion has precision loss; check within tolerance
    const dr = Math.abs(parseInt(hexUp.slice(1,3), 16) - parseInt(orig.slice(1,3), 16));
    const dg = Math.abs(parseInt(hexUp.slice(3,5), 16) - parseInt(orig.slice(3,5), 16));
    const db = Math.abs(parseInt(hexUp.slice(5,7), 16) - parseInt(orig.slice(5,7), 16));
    expect(Math.max(dr, dg, db)).toBeLessThanOrEqual(2);
  });

  it("roundtrips white", () => {
    const hsl = hexToHSL("#FFFFFF");
    expect(hslToHex(hsl).toUpperCase()).toBe("#FFFFFF");
  });

  it("roundtrips black", () => {
    const hsl = hexToHSL("#000000");
    expect(hslToHex(hsl).toUpperCase()).toBe("#000000");
  });
});

describe("contrastRatio", () => {
  it("black on white is high contrast", () => {
    const ratio = contrastRatio("#000000", "#FFFFFF");
    expect(ratio).toBeGreaterThan(10);
  });

  it("white on white is minimum", () => {
    const ratio = contrastRatio("#FFFFFF", "#FFFFFF");
    expect(ratio).toBe(1);
  });
});

describe("meetsWCAGAA", () => {
  it("black on white passes", () => {
    expect(meetsWCAGAA("#000000", "#FFFFFF")).toBe(true);
  });

  it("light gray on white fails", () => {
    expect(meetsWCAGAA("#CCCCCC", "#FFFFFF")).toBe(false);
  });
});

describe("meetsWCAGAAA", () => {
  it("black on white passes AAA", () => {
    expect(meetsWCAGAAA("#000000", "#FFFFFF")).toBe(true);
  });

  it("gray on white fails AAA", () => {
    expect(meetsWCAGAAA("#888888", "#FFFFFF")).toBe(false);
  });
});

describe("generateHarmonyPalette", () => {
  it("monochromatic returns single hue", () => {
    const hues = generateHarmonyPalette(200, "monochromatic");
    expect(hues).toHaveLength(1);
    expect(hues[0]).toBe(200);
  });

  it("complementary adds 180°", () => {
    const hues = generateHarmonyPalette(200, "complementary");
    expect(hues).toContain(200);
    expect(hues).toContain(20);
    expect(hues).toHaveLength(2);
  });

  it("triadic returns 3 hues 120° apart", () => {
    const hues = generateHarmonyPalette(0, "triadic");
    expect(hues).toHaveLength(3);
    expect(hues).toContain(0);
    expect(hues).toContain(120);
    expect(hues).toContain(240);
  });

  it("tetradic returns 4 hues", () => {
    const hues = generateHarmonyPalette(0, "tetradic");
    expect(hues).toHaveLength(4);
    expect(hues).toContain(0);
    expect(hues).toContain(90);
    expect(hues).toContain(180);
    expect(hues).toContain(270);
  });

  it("analogous returns hues within 30°", () => {
    const hues = generateHarmonyPalette(200, "analogous");
    expect(hues).toHaveLength(3);
    for (const h of hues) {
      const diff = Math.abs(h - 200);
      expect(Math.min(diff, 360 - diff)).toBeLessThanOrEqual(35);
    }
  });
});

describe("generatePaletteFromHues", () => {
  it("produces valid hex strings", () => {
    const p = generatePaletteFromHues([200, 20], 50, 40);
    expect(p.primary).toMatch(/^#[0-9A-F]{6}$/i);
    expect(p.accent).toMatch(/^#[0-9A-F]{6}$/i);
    expect(p.surface).toMatch(/^#[0-9A-F]{6}$/i);
    expect(p.text).toMatch(/^#[0-9A-F]{6}$/i);
  });

  it("surface is lighter than primary", () => {
    const p = generatePaletteFromHues([200], 40, 40);
    const sL = hexToHSL(p.surface).l;
    const pL = hexToHSL(p.primary).l;
    expect(sL).toBeGreaterThan(pL);
  });
});

describe("detectHarmonyMode", () => {
  it("detects monochromatic", () => {
    expect(detectHarmonyMode([200])).toBe("monochromatic");
  });

  it("detects complementary", () => {
    expect(detectHarmonyMode([0, 180])).toBe("complementary");
  });

  it("detects triadic", () => {
    expect(detectHarmonyMode([0, 120, 240])).toBe("triadic");
  });

  it("detects analogous", () => {
    expect(detectHarmonyMode([200, 220, 240])).toBe("analogous");
  });
});

describe("validatePalette", () => {
  it("passes valid palette", () => {
    const result = validatePalette("#1E1E2E", "#0055FF", "#FAFBFC", "#24292E");
    expect(result.passed).toBe(true);
    expect(result.issues).toHaveLength(0);
  });

  it("fails on low contrast", () => {
    const result = validatePalette("#FFFFFF", "#FFFFFF", "#FFFFFF", "#EEEEEE");
    expect(result.passed).toBe(false);
    expect(result.issues.length).toBeGreaterThan(0);
  });
});

describe("getHarmonyLabel", () => {
  it("returns descriptions for all modes", () => {
    const modes = ["monochromatic", "analogous", "complementary", "split-complementary", "triadic", "tetradic"];
    for (const mode of modes) {
      const label = getHarmonyLabel(mode as any);
      expect(label.length).toBeGreaterThan(5);
    }
  });
});

describe("getHueRangeForDirection", () => {
  it("returns warm range for warm-minimal", () => {
    const range = getHueRangeForDirection("warm-minimal");
    expect(range.min).toBeLessThanOrEqual(35);
  });

  it("returns cool range for tech-utility", () => {
    const range = getHueRangeForDirection("tech-utility");
    expect(range.min).toBeGreaterThanOrEqual(220);
  });

  it("returns fallback for unknown", () => {
    const range = getHueRangeForDirection("unknown");
    expect(range.min).toBe(220);
    expect(range.max).toBe(260);
  });
});

describe("legacyPaletteToSpec", () => {
  it("converts a legacy palette", () => {
    const spec = legacyPaletteToSpec({ primary: "#1E1E2E", accent: "#00E698", surface: "#FAFBFC", text: "#24292E" });
    expect(spec.primary.h).toBeGreaterThanOrEqual(220);
    expect(spec.harmonyMode).toBeTruthy();
  });
});
