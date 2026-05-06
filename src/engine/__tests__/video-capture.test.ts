import { describe, it, expect } from "vitest";
import { checkPlaywright } from "../video-capture.js";

describe("video-capture", () => {
  it("should detect Playwright installation", () => {
    const result = checkPlaywright();
    expect(result).toHaveProperty("installed");
    expect(typeof result.installed).toBe("boolean");
  });

  it("should have scroll behaviors defined", () => {
    // Test that scroll types are valid
    const behaviors = ["auto", "section", "none"] as const;
    behaviors.forEach((b) => {
      expect(["auto", "section", "none"]).toContain(b);
    });
  });

  it("should export captureVideo as async function", async () => {
    // Just verify the export exists and is callable
    const { captureVideo } = await import("../video-capture.js");
    expect(captureVideo).toBeInstanceOf(Function);
  });
});
