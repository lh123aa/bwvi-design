import { describe, it, expect } from "vitest";
import { getStyle, listStyles, searchStyles, getStylesByTag, recommendStyle } from "../style-systems.js";

describe("style-systems", () => {
  it("should list all styles (56)", () => {
    const styles = listStyles();
    expect(styles.length).toBe(56);
    expect(styles[0]).toHaveProperty("id");
    expect(styles[0]).toHaveProperty("name");
    expect(styles[0]).toHaveProperty("tags");
  });

  it("should get a specific style by id", () => {
    const neo = getStyle("neo-brutalism");
    expect(neo).not.toBeUndefined();
    expect(neo!.name).toBe("新粗野主义");
    expect(neo!.palette.primary).toBe("#FF6B35");
    expect(neo!.borderRadius).toBe("0px");
  });

  it("should return undefined for unknown style", () => {
    expect(getStyle("nonexistent")).toBeUndefined();
  });

  it("should search styles by keyword", () => {
    const results = searchStyles("dark");
    expect(results.length).toBeGreaterThanOrEqual(5);
    results.forEach(s => {
      expect(s.tags.some(t => t.includes("dark")) || s.name.includes("dark") || s.description.toLowerCase().includes("dark")).toBe(true);
    });
  });

  it("should filter styles by tag", () => {
    const results = getStylesByTag("corporate");
    expect(results.length).toBeGreaterThanOrEqual(2);
    results.forEach(s => expect(s.tags).toContain("corporate"));
  });

  it("should recommend a style for industry+direction", () => {
    const style = recommendStyle("tech", "dark");
    expect(style).toBeDefined();
    expect(style.id).toBeDefined();
  });

  it("should have valid palette colors for all styles", () => {
    const styles = listStyles();
    for (const s of styles) {
      const full = getStyle(s.id);
      expect(full).toBeDefined();
      expect(full!.palette.primary).toMatch(/^#|^rgba/);
      expect(full!.palette.accent).toMatch(/^#|^rgba/);
      expect(full!.palette.surface).toMatch(/^#|^rgba/);
      expect(full!.palette.text).toMatch(/^#|^rgba/);
    }
  });

  it("should have typography for all styles", () => {
    const styles = listStyles();
    for (const s of styles) {
      const full = getStyle(s.id);
      expect(full!.typography.display).toBeTruthy();
      expect(full!.typography.body).toBeTruthy();
    }
  });
});
