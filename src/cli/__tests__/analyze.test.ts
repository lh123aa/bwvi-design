import { describe, it, expect } from "vitest";
import { recommendDirections, inferTaskType } from "../../engine/analyzer.js";

describe("CLI analyze", () => {
  it("should recommend 3 directions for coffee brand", () => {
    const dirs = recommendDirections("咖啡品牌 landing page", 3);
    expect(dirs).toHaveLength(3);
    expect(dirs.some(d => d.name === "warm-minimal")).toBe(true);
  });
  it("should detect landing page", () => {
    expect(inferTaskType("SaaS landing page")).toBe("landing_page");
  });
  it("should detect mobile app", () => {
    expect(inferTaskType("iOS app prototype")).toBe("mobile_app");
  });
  it("should detect dashboard", () => {
    expect(inferTaskType("admin dashboard analytics")).toBe("dashboard");
  });
  it("should default to general", () => {
    expect(inferTaskType("something random")).toBe("general");
  });
});
