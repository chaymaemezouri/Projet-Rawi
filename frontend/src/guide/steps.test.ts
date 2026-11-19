import { describe, expect, it } from "vitest";
import { moveStep, progress, timerTick } from "./steps";

describe("guide steps and timer", () => {
  it("moves only within documented steps", () => {
    expect(moveStep(0, 3, -1)).toBe(0);
    expect(moveStep(0, 3, 1)).toBe(1);
    expect(moveStep(2, 3, 1)).toBe(2);
    expect(moveStep(0, 0, 1)).toBe(0);
    expect(progress(1, 3)).toBe(67);
  });

  it("counts down only while running and never invents time", () => {
    expect(timerTick(10, true)).toBe(9);
    expect(timerTick(10, false)).toBe(10);
    expect(timerTick(0, true)).toBe(0);
  });
});
