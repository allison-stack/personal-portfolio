import { describe, it, expect } from "vitest";
import { isNightHour, torontoHour } from "../app/lib/night.js";

describe("isNightHour", () => {
  it("is night from 23:00 through 06:59", () => {
    expect(isNightHour(23)).toBe(true);
    expect(isNightHour(0)).toBe(true);
    expect(isNightHour(6)).toBe(true);
  });
  it("is day from 07:00 through 22:59", () => {
    expect(isNightHour(7)).toBe(false);
    expect(isNightHour(12)).toBe(false);
    expect(isNightHour(22)).toBe(false);
  });
});

describe("torontoHour", () => {
  it("returns an integer hour 0-23", () => {
    const h = torontoHour();
    expect(Number.isInteger(h)).toBe(true);
    expect(h).toBeGreaterThanOrEqual(0);
    expect(h).toBeLessThanOrEqual(23);
  });
});
