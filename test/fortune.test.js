import { describe, it, expect } from "vitest";
import { fortuneForDate, FORTUNES } from "../app/lib/fortune.js";

describe("fortuneForDate", () => {
  it("is deterministic for the same date", () => {
    expect(fortuneForDate("2026-07-12")).toBe(fortuneForDate("2026-07-12"));
  });

  it("always returns one of the known fortunes", () => {
    for (let d = 1; d <= 28; d++) {
      const f = fortuneForDate(`2026-07-${String(d).padStart(2, "0")}`);
      expect(FORTUNES).toContain(f);
    }
  });

  it("varies across a month of dates", () => {
    const seen = new Set();
    for (let d = 1; d <= 28; d++) {
      seen.add(fortuneForDate(`2026-07-${String(d).padStart(2, "0")}`));
    }
    expect(seen.size).toBeGreaterThan(3);
  });
});
