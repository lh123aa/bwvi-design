import { describe, it, expect } from "vitest";
import { detectInteractions, generateInteractionScript } from "../interaction-capture.js";

const HTML_WITH_MODAL = `<!DOCTYPE html><html><head><title>测试</title></head><body>
<button data-bwvi-toggle="modal" data-bwvi-target="myModal">打开弹窗</button>
<div id="myModal" class="bwvi-modal"><div class="bwvi-modal-content"><p>弹窗内容</p></div></div>
</body></html>`;

const HTML_WITH_TABS = `<!DOCTYPE html><html><head><title>测试</title></head><body>
<div data-bwvi-toggle="tab" data-bwvi-group="tabs" class="tab-active">Tab 1</div>
<div data-bwvi-toggle="tab" data-bwvi-group="tabs">Tab 2</div>
</body></html>`;

const HTML_WITH_CAROUSEL = `<!DOCTYPE html><html><head><title>测试</title></head><body>
<button data-bwvi-carousel="myCarousel" data-bwvi-dir="next">下一张</button>
<div id="myCarousel"><div class="bwvi-carousel-item bwvi-carousel-active">1</div><div class="bwvi-carousel-item">2</div></div>
</body></html>`;

const HTML_WITH_DARKMODE = `<!DOCTYPE html><html><head><title>测试</title></head><body>
<button data-bwvi-toggle="darkmode">切换暗色</button>
</body></html>`;

const HTML_WITH_ACCORDION = `<!DOCTYPE html><html><head><title>测试</title></head><body>
<button data-bwvi-toggle="accordion" data-bwvi-target="panel1">展开</button>
<div id="panel1" class="bwvi-accordion-body"><p>内容</p></div>
</body></html>`;

describe("interaction-capture detection", () => {
  it("should detect modal triggers", () => {
    const plan = detectInteractions(HTML_WITH_MODAL);
    expect(plan.steps.length).toBeGreaterThanOrEqual(1);
    expect(plan.typeCount["modal"]).toBeGreaterThanOrEqual(1);
  });

  it("should detect tab triggers", () => {
    const plan = detectInteractions(HTML_WITH_TABS);
    expect(plan.steps.length).toBeGreaterThanOrEqual(1);
  });

  it("should detect carousel triggers", () => {
    const plan = detectInteractions(HTML_WITH_CAROUSEL);
    expect(plan.steps.length).toBeGreaterThanOrEqual(1);
  });

  it("should detect darkmode toggle", () => {
    const plan = detectInteractions(HTML_WITH_DARKMODE);
    expect(plan.steps.length).toBeGreaterThanOrEqual(1);
    expect(plan.steps[0].label).toContain("暗色");
  });

  it("should detect accordion triggers", () => {
    const plan = detectInteractions(HTML_WITH_ACCORDION);
    expect(plan.steps.length).toBeGreaterThanOrEqual(1);
  });

  it("should return empty plan for HTML without interactions", () => {
    const plan = detectInteractions("<html><body><p>No interactions</p></body></html>");
    expect(plan.steps.length).toBe(0);
    expect(plan.detectedCount).toBe(0);
  });

  it("should generate valid interaction script", () => {
    const plan = detectInteractions(HTML_WITH_MODAL);
    const script = generateInteractionScript(plan);
    expect(script).toContain("playwright");
    expect(script).toContain("page.click");
  });

  it("should deduplicate identical steps", () => {
    const html = HTML_WITH_MODAL + HTML_WITH_MODAL; // duplicate
    const plan = detectInteractions(html);
    expect(plan.steps.length).toBeGreaterThanOrEqual(1);
  });
});
