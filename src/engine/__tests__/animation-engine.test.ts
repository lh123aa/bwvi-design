import { describe, it, expect } from "vitest";
import { getAnimationCSS, getStageScript, animAttr } from "../animation-engine.js";

describe("animation-engine", () => {
  it("should generate valid CSS with all 12 animation types", () => {
    const css = getAnimationCSS();
    expect(css).toContain("bwi-fade-in");
    expect(css).toContain("bwi-fade-up");
    expect(css).toContain("bwi-scale-in");
    expect(css).toContain("bwi-slide-left");
    expect(css).toContain("bwi-slide-right");
    expect(css).toContain("bwi-bounce-in");
    expect(css).toContain("bwi-rotate-in");
    expect(css).toContain("bwi-flip-in");
    expect(css).toContain("bwi-shimmer");
    expect(css).toContain("bwi-float");
    expect(css).toContain("bwi-glow");
    expect(css).toContain("bwi-typewriter");
  });

  it("should include all 7 easing classes", () => {
    const css = getAnimationCSS();
    expect(css).toContain("bwi-ease-linear");
    expect(css).toContain("bwi-ease-out");
    expect(css).toContain("bwi-ease-in");
    expect(css).toContain("bwi-ease-bounce");
    expect(css).toContain("bwi-ease-elastic");
    expect(css).toContain("bwi-ease-spring");
  });

  it("should include duration classes (1-5)", () => {
    const css = getAnimationCSS();
    expect(css).toContain("bwi-dur-1");
    expect(css).toContain("bwi-dur-2");
    expect(css).toContain("bwi-dur-3");
    expect(css).toContain("bwi-dur-4");
    expect(css).toContain("bwi-dur-5");
  });

  it("should generate delay classes without floating point issues", () => {
    const css = getAnimationCSS();
    // Check that no floating point artifacts exist
    expect(css).not.toContain("00000000004");
    expect(css).not.toContain("0000000001");
  });

  it("should generate stagger children (1-8)", () => {
    const css = getAnimationCSS();
    expect(css).toContain("bwi-stagger");
    expect(css).toContain("nth-child(8)");
  });

  it("generates animAttr with correct classes", () => {
    const attr = animAttr({ type: "fade-up", duration: 0.5, delay: 0.24, easing: "bounce" });
    expect(attr).toContain("bwi-anim");
    expect(attr).toContain("bwi-fade-up");
    expect(attr).toContain("bwi-dur-2");
    expect(attr).toContain("bwi-ease-bounce");
  });

  it("generates stage script with IntersectionObserver", () => {
    const script = getStageScript();
    expect(script).toContain("IntersectionObserver");
    expect(script).toContain("animationPlayState");
    expect(script).toContain("DOMContentLoaded");
  });
});
