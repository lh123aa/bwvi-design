import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { existsSync, mkdirSync, rmSync, writeFileSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { measureCapabilities, diagnoseWeakest, generateLearningReport, recordImprovement } from "../capability-graph.js";
import type { ImprovementEntry } from "../../types/learning.js";

describe("capability-graph", () => {
  describe("measureCapabilities", () => {
    it("should return all 12 capability nodes", () => {
      const caps = measureCapabilities();
      expect(caps).toHaveLength(12);
    });

    it("each node should have required fields", () => {
      const caps = measureCapabilities();
      for (const c of caps) {
        expect(c.id).toBeTruthy();
        expect(c.name).toBeTruthy();
        expect(typeof c.currentLevel).toBe("number");
        expect(typeof c.maxLevel).toBe("number");
        expect(typeof c.diagnosis).toBe("string");
        expect(typeof c.bottleneck).toBe("string");
        expect(c.currentLevel).toBeGreaterThanOrEqual(0);
        expect(c.currentLevel).toBeLessThanOrEqual(c.maxLevel);
        expect(Array.isArray(c.improvementHistory)).toBe(true);
      }
    });

    it("overall level should be between 0 and 10", () => {
      const caps = measureCapabilities();
      const overall = caps.reduce((sum, c) => sum + c.currentLevel, 0) / caps.length;
      expect(overall).toBeGreaterThanOrEqual(0);
      expect(overall).toBeLessThanOrEqual(10);
    });
  });

  describe("diagnoseWeakest", () => {
    it("should return the node with lowest level", () => {
      const caps = measureCapabilities();
      const weakest = diagnoseWeakest(caps);
      const minLevel = Math.min(...caps.map(c => c.currentLevel));
      expect(weakest.currentLevel).toBe(minLevel);
    });

    it("should have a bottleneck description", () => {
      const caps = measureCapabilities();
      const weakest = diagnoseWeakest(caps);
      expect(weakest.bottleneck.length).toBeGreaterThan(0);
    });
  });

  describe("generateLearningReport", () => {
    it("should return a complete report", () => {
      const report = generateLearningReport();
      expect(report.capabilities).toHaveLength(12);
      expect(typeof report.overallLevel).toBe("number");
      expect(report.weakest).toBeDefined();
      expect(report.weakest.id).toBeTruthy();
      expect(report.strongest).toBeDefined();
      expect(report.strongest.id).toBeTruthy();
      expect(report.totalImprovements).toBeGreaterThanOrEqual(0);
      expect(report.knowledgeChunks).toBeGreaterThanOrEqual(0);
    });

    it("should accept pre-measured capabilities", () => {
      const caps = measureCapabilities();
      const report = generateLearningReport(caps);
      expect(report.capabilities).toHaveLength(12);
      expect(report.overallLevel).toBeGreaterThan(0);
    });

    it("weakest and strongest should be different when possible", () => {
      const report = generateLearningReport();
      // If all levels are not equal, weakest and strongest differ
      const levels = report.capabilities.map(c => c.currentLevel);
      const uniqueLevels = new Set(levels);
      if (uniqueLevels.size > 1) {
        expect(report.weakest.id).not.toBe(report.strongest.id);
      }
    });
  });

  describe("recordImprovement", () => {
    const testDir = join(process.cwd(), ".bwvi-test-capabilities");
    const originalCwd = process.cwd();

    beforeEach(() => {
      if (!existsSync(testDir)) mkdirSync(testDir, { recursive: true });
      mkdirSync(join(testDir, ".bwvi"), { recursive: true });
      writeFileSync(join(testDir, ".bwvi", "fingerprint.yaml"), JSON.stringify({ version: "1.0.0" }), "utf-8");
      process.chdir(testDir);
    });

    afterEach(() => {
      process.chdir(originalCwd);
      if (existsSync(testDir)) rmSync(testDir, { recursive: true });
    });

    it("should persist an improvement entry", async () => {
      const entry: ImprovementEntry = {
        id: "test-improve-001",
        timestamp: new Date().toISOString(),
        previousLevel: 3,
        newLevel: 4,
        method: "algorithm-upgrade",
        description: "Test upgrade",
        source: "unit-test",
        verified: false,
      };

      await recordImprovement("palette-generation", entry);

      const histPath = join(testDir, ".bwvi", "capabilities", "palette-generation.json");
      expect(existsSync(histPath)).toBe(true);
      const stored = JSON.parse(readFileSync(histPath, "utf-8"));
      expect(stored).toHaveLength(1);
      expect(stored[0].id).toBe("test-improve-001");
      expect(stored[0].newLevel).toBe(4);
    });

    it("should append to existing history", async () => {
      const e1: ImprovementEntry = {
        id: "test-1", timestamp: new Date().toISOString(),
        previousLevel: 3, newLevel: 4,
        method: "algorithm-upgrade", description: "First", source: "test", verified: false,
      };
      const e2: ImprovementEntry = {
        id: "test-2", timestamp: new Date().toISOString(),
        previousLevel: 4, newLevel: 5,
        method: "algorithm-upgrade", description: "Second", source: "test", verified: false,
      };

      await recordImprovement("palette-generation", e1);
      await recordImprovement("palette-generation", e2);

      const histPath = join(testDir, ".bwvi", "capabilities", "palette-generation.json");
      const stored = JSON.parse(readFileSync(histPath, "utf-8"));
      expect(stored).toHaveLength(2);
      expect(stored[0].id).toBe("test-1");
      expect(stored[1].id).toBe("test-2");
    });
  });
});
