import { describe, it, expect } from "vitest";
import { recommendDirections, inferTaskType } from "../analyzer.js";

describe("recommendDirections", () => {
  it("should return 3 directions for a task", () => {
    const dirs = recommendDirections("coffee brand landing page", 3);
    expect(dirs).toHaveLength(3);
    expect(dirs[0]).toHaveProperty("name");
    expect(dirs[0]).toHaveProperty("label");
    expect(dirs[0]).toHaveProperty("score");
  });

  it("should return directions sorted by score descending", () => {
    const dirs = recommendDirections("SaaS tech B2B dashboard", 5);
    for (let i = 1; i < dirs.length; i++) {
      expect(dirs[i].score).toBeLessThanOrEqual(dirs[i - 1].score);
    }
  });

  it("should handle short queries", () => {
    const dirs = recommendDirections("AI", 3);
    expect(dirs.length).toBeGreaterThanOrEqual(1);
  });
});

describe("inferTaskType", () => {
  it("should detect landing page", () => {
    expect(inferTaskType("coffee brand landing page")).toBe("landing_page");
  });
  it("should detect mobile app", () => {
    expect(inferTaskType("iOS app onboarding")).toBe("mobile_app");
  });
  it("should default to general", () => {
    expect(inferTaskType("something random")).toBe("general");
  });
});
