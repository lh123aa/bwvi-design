import { describe, it, expect } from "vitest";
import { renderViaPencil } from "../bridges/pencil-bridge.js";

describe("pencil-bridge", () => {
  it("should return success with batch script when Pencil is unavailable", async () => {
    const result = await renderViaPencil({
      task: "coffee brand landing page",
      direction: "warm-minimal",
      brandName: "TestBrand",
    });
    expect(result.success).toBe(true);
    expect(result.warnings.length).toBeGreaterThanOrEqual(1);
    expect(result.warnings[0]).toContain("Pencil MCP 不可用");
  });

  it("should generate operations for a cafe landing page", async () => {
    const result = await renderViaPencil({
      task: "coffee brand landing page",
      brandName: "CoffeeCo",
    });
    expect(result.operations).toBeDefined();
    expect(result.operations!.length).toBeGreaterThan(0);
    // Should have at least a canvas + navbar + hero + features + cta + footer
    expect(result.operations!.length).toBeGreaterThanOrEqual(4);
  });

  it("should use brand palette when available", async () => {
    const result = await renderViaPencil({
      task: "SaaS landing page",
      brandName: "linear",
    });
    const ops = result.operations || [];
    const updateOps = ops.filter((o) => o.type === "U");
    expect(updateOps.length).toBeGreaterThan(0);
  });

  it("should create canvas with device dimensions", async () => {
    const result = await renderViaPencil({
      task: "app design",
      brandName: "TestApp",
      device: "iphone",
    });
    const ops = result.operations || [];
    const canvasOp = ops[0];
    expect(canvasOp).toBeDefined();
    expect(canvasOp.label).toContain("创建设计画布");
  });

  it("should generate batch script file", async () => {
    const result = await renderViaPencil({
      task: "simple page",
      brandName: "Test",
    });
    expect(result.batchScript).toBeDefined();
    expect(result.batchScript).toContain("pencil-batch-");
  });
});
