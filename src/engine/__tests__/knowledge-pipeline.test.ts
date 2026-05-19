import { describe, it, expect } from "vitest";
import { chunkIdFromUrl, listKnowledgeChunks, getKnowledgeStats } from "../knowledge-pipeline.js";

describe("knowledge-pipeline", () => {
  describe("chunkIdFromUrl", () => {
    it("should generate a valid chunk ID from URL", () => {
      const id = chunkIdFromUrl("https://linear.app");
      expect(id).toBe("learned-linear-app");
      expect(id).not.toContain("://");
      expect(id).not.toContain(".");
    });

    it("should handle URLs with paths", () => {
      const id = chunkIdFromUrl("https://stripe.com/design/colors");
      expect(id).toContain("stripe");
      expect(id).not.toContain(".");
    });

    it("should truncate long URLs", () => {
      const longUrl = "https://example.com/" + "a".repeat(100);
      const id = chunkIdFromUrl(longUrl);
      expect(id.length).toBeLessThan(60);
    });

    it("should handle http URLs", () => {
      const id = chunkIdFromUrl("http://localhost:3000");
      expect(id).toBe("learned-localhost-3000");
    });
  });

  describe("listKnowledgeChunks", () => {
    it("should return empty array when no project exists", async () => {
      const chunks = await listKnowledgeChunks();
      expect(Array.isArray(chunks)).toBe(true);
    });
  });

  describe("getKnowledgeStats", () => {
    it("should return zero stats when no project exists", async () => {
      const stats = await getKnowledgeStats();
      expect(stats.totalChunks).toBe(0);
      expect(stats.totalTokens).toBe(0);
      expect(stats.totalSources).toBe(0);
      expect(typeof stats.sourcesByType).toBe("object");
    });
  });
});
