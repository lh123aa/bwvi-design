import { describe, it, expect } from "vitest";
import { getBrand, searchBrands, listBrands, getBrandsByCategory } from "../brand-loader.js";

describe("brand-loader", () => {
  it("should list all brands (115)", () => {
    const brands = listBrands();
    expect(brands.length).toBe(115);
    expect(brands[0]).toHaveProperty("name");
    expect(brands[0]).toHaveProperty("category");
    expect(brands[0]).toHaveProperty("tags");
  });

  it("should get a specific brand by name", () => {
    const linear = getBrand("linear");
    expect(linear).not.toBeNull();
    expect(linear!.name).toBe("linear");
    expect(linear!.colors.primary).toBe("#5E6AD2");
    expect(linear!.typography.display).toBe("'Inter',sans-serif");
  });

  it("should search brands by tag keyword", () => {
    const results = searchBrands("payment");
    expect(results.length).toBeGreaterThanOrEqual(5);
    results.forEach(b => {
      expect(b.tags.some(t => t.includes("payment")) || b.name.includes("payment")).toBe(true);
    });
  });

  it("should search brands by category", () => {
    const results = searchBrands("fintech");
    expect(results.length).toBeGreaterThanOrEqual(10);
    results.forEach(b => {
      expect(b.category === "fintech" || b.tags.some(t => t.includes("fintech"))).toBe(true);
    });
  });

  it("should filter brands by category", () => {
    const gaming = getBrandsByCategory("gaming");
    expect(gaming.length).toBeGreaterThanOrEqual(5);
    gaming.forEach(b => expect(b.category).toBe("gaming"));
  });

  it("should return null for unknown brand", () => {
    expect(getBrand("nonexistent-brand-xyz")).toBeNull();
  });

  it("should handle case-insensitive name lookup", () => {
    const apple = getBrand("Apple");
    expect(apple).not.toBeNull();
    expect(apple!.name).toBe("apple");
  });

  it("should cover all 12 categories", () => {
    const brands = listBrands();
    const categories = new Set(brands.map(b => b.category));
    expect(categories.size).toBeGreaterThanOrEqual(12);
    expect(categories.has("tech")).toBe(true);
    expect(categories.has("fintech")).toBe(true);
    expect(categories.has("enterprise")).toBe(true);
    expect(categories.has("retail")).toBe(true);
    expect(categories.has("food")).toBe(true);
  });
});
