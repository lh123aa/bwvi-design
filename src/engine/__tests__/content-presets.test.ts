import { describe, it, expect } from "vitest";
import { findBlueprint, fillBlueprint } from "../../templates/content-presets.js";

describe("findBlueprint", () => {
  it("should match cafe for coffee keywords", () => {
    const result = findBlueprint("premium coffee brand landing page");
    expect(result.blueprint.id).toBe("landing-cafe");
    expect(result.confidence).toBeGreaterThan(0);
  });

  it("should match SaaS for tech keywords", () => {
    const result = findBlueprint("SaaS enterprise B2B cloud platform");
    expect(result.blueprint.id).toBe("landing-saas");
  });

  it("should match dashboard for analytics keywords", () => {
    const result = findBlueprint("analytics dashboard metrics");
    expect(result.blueprint.id).toBe("dashboard-analytics");
  });

  it("should fallback to SaaS for unknown", () => {
    const result = findBlueprint("something completely random");
    expect(result.blueprint).toBeDefined();
    expect(result.confidence).toBeLessThanOrEqual(0.1);
  });

  it("should match cosmetics for beauty keywords", () => {
    const result = findBlueprint("Blush & Bloom cosmetics beauty brand");
    expect(result.blueprint.id).toBe("landing-cosmetics");
  });
});

describe("fillBlueprint", () => {
  it("should replace brand/tagline/description placeholders", () => {
    const bp = findBlueprint("coffee brand").blueprint;
    const filled = fillBlueprint(bp, "TestBrand", "TestTagline", "TestDescription");
    const sectionData = filled.sections[0]?.data;
    const str = JSON.stringify(sectionData);
    expect(str).not.toContain("{brand}");
    expect(str).not.toContain("{tagline}");
    expect(str).not.toContain("{description}");
  });
});
