import { describe, expect, it } from "vitest";
import { healthFromPercent, worstHealth } from "./thresholds";

describe("thresholds", () => {
  it("healthFromPercent respects warn and critical", () => {
    expect(healthFromPercent(50, 75, 90)).toBe("ok");
    expect(healthFromPercent(80, 75, 90)).toBe("warn");
    expect(healthFromPercent(95, 75, 90)).toBe("critical");
    expect(healthFromPercent(null, 75, 90)).toBe("unknown");
  });

  it("worstHealth picks the worst state", () => {
    expect(worstHealth("ok", "warn")).toBe("warn");
    expect(worstHealth("warn", "critical")).toBe("critical");
    expect(worstHealth("ok", "ok")).toBe("ok");
  });
});
