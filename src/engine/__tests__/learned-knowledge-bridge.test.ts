import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { existsSync, mkdirSync, rmSync, writeFileSync, mkdtempSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { saveLearnedDirection, getLearnedDirection, getLearnedPalette, getLearnedFonts, getLearnedDirectionsSummary } from "../learned-knowledge-bridge.js";

describe("learned-knowledge-bridge", () => {
  const testDir = join(process.cwd(), ".bwvi-test-bridge");
  const originalCwd = process.cwd();

  beforeEach(() => {
    if (!existsSync(testDir)) mkdirSync(testDir, { recursive: true });
    mkdirSync(join(testDir, ".bwvi"), { recursive: true });
    process.chdir(testDir);
  });

  afterEach(() => {
    process.chdir(originalCwd);
    if (existsSync(testDir)) rmSync(testDir, { recursive: true });
  });

  it("should save and retrieve a learned direction", () => {
    saveLearnedDirection({
      direction: "warm-minimal",
      confidence: 0.85,
      source: "https://example.com/cafe",
      palette: { primary: "#D97757", accent: "#8C6E5D", surface: "#FDF8F5", text: "#3D3D3D" },
      displayFont: "'Playfair Display', serif",
      bodyFont: "'Inter', sans-serif",
      learnedAt: new Date().toISOString(),
    });

    const summary = getLearnedDirectionsSummary();
    expect(summary).toHaveLength(1);
    expect(summary[0].direction).toBe("warm-minimal");
    expect(summary[0].confidence).toBe(0.85);
  });

  it("should retrieve palette by direction name", () => {
    saveLearnedDirection({
      direction: "tech-utility",
      confidence: 0.9,
      source: "https://linear.app",
      palette: { primary: "#1E1E2E", accent: "#00E698", surface: "#FAFBFC", text: "#24292E" },
      displayFont: "'Inter', sans-serif",
      bodyFont: "'Inter', sans-serif",
      learnedAt: new Date().toISOString(),
    });

    const palette = getLearnedPalette("tech-utility");
    expect(palette).not.toBeNull();
    expect(palette!.primary).toBe("#1E1E2E");
    expect(palette!.accent).toBe("#00E698");
  });

  it("should retrieve fonts by direction name", () => {
    saveLearnedDirection({
      direction: "editorial-monocle",
      confidence: 0.7,
      source: "https://nytimes.com",
      palette: { primary: "#1A1A2E", accent: "#C44536", surface: "#FAF8F5", text: "#2D2D2D" },
      displayFont: "'Georgia', serif",
      bodyFont: "'Georgia', serif",
      learnedAt: new Date().toISOString(),
    });

    const fonts = getLearnedFonts("editorial-monocle");
    expect(fonts).not.toBeNull();
    expect(fonts!.display).toContain("Georgia");
  });

  it("should update existing direction on re-save", () => {
    saveLearnedDirection({
      direction: "warm-minimal",
      confidence: 0.8,
      source: "https://old.com",
      palette: { primary: "#000", accent: "#fff", surface: "#eee", text: "#111" },
      displayFont: "Arial",
      bodyFont: "Arial",
      learnedAt: "2024-01-01",
    });

    let summary = getLearnedDirectionsSummary();
    expect(summary).toHaveLength(1);
    expect(summary[0].confidence).toBe(0.8);

    saveLearnedDirection({
      direction: "warm-minimal",
      confidence: 0.95,
      source: "https://updated.com",
      palette: { primary: "#111", accent: "#222", surface: "#333", text: "#444" },
      displayFont: "Helvetica",
      bodyFont: "Helvetica",
      learnedAt: "2025-01-01",
    });

    summary = getLearnedDirectionsSummary();
    expect(summary).toHaveLength(1);
    expect(summary[0].confidence).toBe(0.95);
    expect(summary[0].source).toBe("https://updated.com");
  });

  it("should return null for unknown direction", () => {
    const palette = getLearnedPalette("nonexistent-direction");
    expect(palette).toBeNull();

    const fonts = getLearnedFonts("nonexistent-direction");
    expect(fonts).toBeNull();
  });

  it("should return empty array when no project dir", () => {
    const tmpDir = mkdtempSync(join(tmpdir(), "bwvi-test-noproj-"));
    process.chdir(tmpDir);
    const summary = getLearnedDirectionsSummary();
    expect(summary).toEqual([]);
    process.chdir(testDir);
    rmSync(tmpDir, { recursive: true });
  });

  it("should match task keywords to learned direction", () => {
    saveLearnedDirection({
      direction: "warm-minimal",
      confidence: 0.85,
      source: "https://cafe.com",
      palette: { primary: "#D97757", accent: "#8C6E5D", surface: "#FDF8F5", text: "#3D3D3D" },
      displayFont: "'Playfair Display', serif",
      bodyFont: "'Inter', sans-serif",
      learnedAt: new Date().toISOString(),
    });

    const matched = getLearnedDirection("coffee brand landing warm cafe");
    expect(matched).not.toBeNull();
    expect(matched!.direction).toBe("warm-minimal");
  });

  it("should return null when nothing matches task", () => {
    const matched = getLearnedDirection("completely unrelated query xyz");
    expect(matched).toBeNull();
  });
});
