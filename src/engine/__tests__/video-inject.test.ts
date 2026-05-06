import { describe, it, expect } from "vitest";
import { injectForVideo } from "../video-inject.js";

const SAMPLE_HTML = `<!DOCTYPE html><html lang="zh-CN"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>测试</title>
</head><body>
<div class="bwi-anim bwi-fade-up">Hello</div>
</body></html>`;

describe("video-inject", () => {
  it("should inject animation CSS into HTML", () => {
    const result = injectForVideo(SAMPLE_HTML);
    expect(result).toContain("@keyframes bwi-fade-up");
    expect(result).toContain("bwi-anim");
  });

  it("should replace IntersectionObserver with auto-play script", () => {
    const result = injectForVideo(SAMPLE_HTML);
    expect(result).toContain("animationPlayState");
    expect(result).not.toContain("IntersectionObserver");
  });

  it("should add video injection marker", () => {
    const result = injectForVideo(SAMPLE_HTML);
    expect(result).toContain("data-bwi-video-injected");
    expect(result).toContain("bwiVideoReady");
  });

  it("should be idempotent (skip if already injected)", () => {
    const once = injectForVideo(SAMPLE_HTML);
    const twice = injectForVideo(once);
    expect(twice).toBe(once);
  });

  it("should support loop option", () => {
    const result = injectForVideo(SAMPLE_HTML, { loop: 3 });
    expect(result).toContain("maxLoops = 3");
  });

  it("should support autoScroll option", () => {
    const result = injectForVideo(SAMPLE_HTML, { autoScroll: true });
    expect(result).toContain("scroll-behavior");
  });

  it("should not modify HTML that already has video injection", () => {
    const once = injectForVideo(SAMPLE_HTML);
    const twice = injectForVideo(once);
    expect(twice).toBe(once);
  });
});
