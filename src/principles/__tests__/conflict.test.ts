import { describe, it, expect } from "vitest";
import {
  getStyleProfile, calcStyleDistance, analyzeConflict, findBestMix,
} from "../conflict.js";

describe("getStyleProfile", () => {
  it("returns known profiles for all directions", () => {
    const dirs = ["editorial-monocle", "warm-minimal", "tech-utility", "dark-luxury", "playful-color", "corporate-trust", "luxury-premium", "nature-organic", "tech-gradient", "minimal-white"];
    for (const d of dirs) {
      const p = getStyleProfile(d);
      expect(p.attributes.length).toBeGreaterThanOrEqual(2);
      expect(p.temperature).toBeGreaterThanOrEqual(0);
      expect(p.temperature).toBeLessThanOrEqual(1);
    }
  });

  it("returns fallback for unknown", () => {
    const p = getStyleProfile("unknown");
    expect(p.attributes.length).toBeGreaterThanOrEqual(2);
    expect(p.temperature).toBe(0.3);
  });

  it("minimal-white is coldest", () => {
    const p = getStyleProfile("minimal-white");
    expect(p.temperature).toBe(0.1);
  });

  it("playful-color is hottest", () => {
    const p = getStyleProfile("playful-color");
    expect(p.temperature).toBe(0.9);
  });
});

describe("calcStyleDistance", () => {
  it("identical profiles have high distance", () => {
    const a = getStyleProfile("tech-utility");
    const d = calcStyleDistance(a, a);
    expect(d).toBeGreaterThan(0.8);
  });

  it("similar profiles have high distance", () => {
    const a = getStyleProfile("tech-utility");
    const b = getStyleProfile("corporate-trust");
    const d = calcStyleDistance(a, b);
    expect(d).toBeGreaterThan(0.3);
  });

  it("opposite profiles have low distance", () => {
    const a = getStyleProfile("minimal-white");
    const b = getStyleProfile("playful-color");
    const d = calcStyleDistance(a, b);
    expect(d).toBeLessThan(0.5);
  });
});

describe("analyzeConflict", () => {
  it("compatible directions have no conflicts", () => {
    const r = analyzeConflict("tech-utility", "corporate-trust", { palette: true, typography: true, layout: true });
    expect(r.compatible).toBe(true);
    expect(r.distance).toBeGreaterThan(0.5);
  });

  it("opposite directions have conflicts", () => {
    const r = analyzeConflict("minimal-white", "playful-color", { palette: true, typography: false, layout: false });
    expect(r.conflicts.length).toBeGreaterThanOrEqual(0);
    expect(r.distance).toBeLessThanOrEqual(0.6);
  });

  it("reports suggestions for conflicts", () => {
    const r = analyzeConflict("minimal-white", "playful-color", { palette: true, typography: true, layout: false });
    expect(r.suggestions.length).toBeGreaterThanOrEqual(0);
  });
});

describe("findBestMix", () => {
  it("returns sorted list of compatible directions", () => {
    const allDirs = ["editorial-monocle", "warm-minimal", "tech-utility", "dark-luxury", "playful-color", "corporate-trust", "luxury-premium", "nature-organic", "tech-gradient", "minimal-white"];
    const results = findBestMix("tech-utility", allDirs);
    expect(results).toHaveLength(allDirs.length - 1);
    for (const r of results) {
      expect(r.distance).toBeGreaterThanOrEqual(0);
      expect(r.distance).toBeLessThanOrEqual(1);
    }
  });

  it("excludes source direction", () => {
    const results = findBestMix("tech-utility", ["tech-utility", "warm-minimal"]);
    expect(results.find(r => r.direction === "tech-utility")).toBeUndefined();
  });

  it("most compatible is first in results", () => {
    const allDirs = ["editorial-monocle", "warm-minimal", "tech-utility", "corporate-trust", "minimal-white"];
    const results = findBestMix("tech-utility", allDirs);
    for (let i = 1; i < results.length; i++) {
      expect(results[i - 1].distance).toBeGreaterThanOrEqual(results[i].distance);
    }
  });
});
