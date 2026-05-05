import { describe, it, expect } from "vitest";
import { recommendDirections, inferTaskType } from "../analyzer.js";

describe("recommendDirections", () => {
  it("should return 3 directions for a task", () => {
    const dirs = recommendDirections("coffee brand landing page", 3);
    expect(dirs).toHaveLength(3);
    expect(dirs[0]).toHaveProperty("name");
    expect(dirs[0]).toHaveProperty("label");
  });

  it("should return unique direction names", () => {
    const dirs = recommendDirections("SaaS tech dashboard", 5);
    const names = new Set(dirs.map(d => d.name));
    expect(names.size).toBe(dirs.length);
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
