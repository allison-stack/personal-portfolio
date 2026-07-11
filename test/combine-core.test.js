import { describe, it, expect } from "vitest";
import { normalizeName, comboKey, validateCombo } from "../app/lib/combine-core.js";

describe("normalizeName", () => {
  it("lowercases, trims, and collapses whitespace", () => {
    expect(normalizeName("  Flying   Fish ")).toBe("flying fish");
  });
  it("rejects empty, too-long, and non [a-z0-9 -] input", () => {
    expect(normalizeName("")).toBeNull();
    expect(normalizeName("x".repeat(41))).toBeNull();
    expect(normalizeName("steam ♨️")).toBeNull();
    expect(normalizeName("<script>")).toBeNull();
  });
});

describe("comboKey", () => {
  it("is order-independent", () => {
    expect(comboKey("water", "fire")).toBe("fire+water");
    expect(comboKey("fire", "water")).toBe("fire+water");
  });
});

describe("validateCombo", () => {
  const good = { result: "steam", emoji: "♨️", fact: "geysers are natural steam engines with no moving parts." };
  it("accepts a well-formed combo and normalizes the result", () => {
    expect(validateCombo({ ...good, result: " Steam " })).toEqual({ ...good, result: "steam" });
  });
  it("rejects missing/invalid fields", () => {
    expect(validateCombo(null)).toBeNull();
    expect(validateCombo({ ...good, result: "" })).toBeNull();
    expect(validateCombo({ ...good, emoji: "" })).toBeNull();
    expect(validateCombo({ ...good, emoji: "steam" })).toBeNull(); // letters are not an emoji
    expect(validateCombo({ ...good, fact: "too short" })).toBeNull();
    expect(validateCombo({ ...good, fact: "x".repeat(301) })).toBeNull();
  });
});
