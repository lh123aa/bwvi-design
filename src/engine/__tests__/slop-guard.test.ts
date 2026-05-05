import { describe, it, expect } from "vitest";
import { checkSlop } from "../slop-guard.js";

describe("checkSlop", () => {
  const clean = "<html><body><header><h1>Good</h1><p>Real content here.</p></header></body></html>";

  it("should pass clean HTML", () => {
    const r = checkSlop(clean);
    expect(r.clean).toBe(true);
  });

  it("should detect lorem ipsum", () => {
    const r = checkSlop("<p>Lorem ipsum dolor sit amet</p>");
    expect(r.clean).toBe(false);
    expect(r.issues.some(i => i.type === "lorem-ipsum")).toBe(true);
  });

  it("should detect purple gradients", () => {
    const r = checkSlop("<div style='background: linear-gradient(purple, pink)'></div>");
    expect(r.issues.some(i => i.type === "purple-gradient")).toBe(true);
  });

  it("should detect lorem ipsum with numbers", () => {
    const r = checkSlop("<p>99% of users 10x growth</p>");
    expect(r.score).toBeLessThan(10);
  });

  it("should score 10 for clean HTML", () => {
    expect(checkSlop(clean).score).toBe(10);
  });

  it("should score lower for bad HTML", () => {
    expect(checkSlop("<p>Lorem ipsum 99% 10x users</p>").score).toBeLessThan(10);
  });
});
