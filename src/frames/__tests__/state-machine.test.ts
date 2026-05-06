import { describe, it, expect } from "vitest";
import { getStateMachineScript } from "../state-machine.js";

describe("state-machine", () => {
  it("should generate a script under 5KB", () => {
    const script = getStateMachineScript();
    expect(script.length).toBeLessThan(5000);
    expect(script).toContain("<script");
    expect(script).toContain("</script>");
  });

  it("should include modal functionality", () => {
    const script = getStateMachineScript();
    expect(script).toContain("modal");
    expect(script).toContain("data-bwvi-toggle");
  });

  it("should include tab functionality", () => {
    const script = getStateMachineScript();
    expect(script).toContain("tab");
  });

  it("should include dark mode toggle", () => {
    const script = getStateMachineScript();
    expect(script).toContain("dark");
  });

  it("should include carousel support", () => {
    const script = getStateMachineScript();
    expect(script).toContain("carousel");
  });

  it("should not use external dependencies", () => {
    const script = getStateMachineScript();
    expect(script).not.toContain("import ");
    expect(script).not.toContain("require(");
    expect(script).not.toContain("fetch(");
  });

  it("should handle accordion toggles", () => {
    const script = getStateMachineScript();
    expect(script).toContain("accordion");
  });

  it("should handle toast notifications", () => {
    const script = getStateMachineScript();
    expect(script).toContain("toast");
  });
});
