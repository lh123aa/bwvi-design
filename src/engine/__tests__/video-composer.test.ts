import { describe, it, expect } from "vitest";
import { checkFfmpeg, getQualityParams } from "../video-composer.js";

describe("video-composer", () => {
  it("should detect ffmpeg installation", () => {
    const result = checkFfmpeg();
    expect(result).toHaveProperty("installed");
    expect(typeof result.installed).toBe("boolean");
  });

  it("should return quality params for all presets", () => {
    const high = getQualityParams("high", "mp4");
    expect(high.preset).toBe("slow");
    expect(high.crf).toBe(18);

    const medium = getQualityParams("medium", "mp4");
    expect(medium.preset).toBe("medium");
    expect(medium.crf).toBe(23);

    const low = getQualityParams("low", "mp4");
    expect(low.preset).toBe("fast");
    expect(low.crf).toBe(28);

    const quick = getQualityParams("quick", "mp4");
    expect(quick.preset).toBe("ultrafast");
    expect(quick.crf).toBe(30);
  });

  it("should have lower gifScale for quick mode", () => {
    const high = getQualityParams("high", "gif");
    const quick = getQualityParams("quick", "gif");
    expect(quick.gifScale).toBeLessThan(high.gifScale);
  });
});
