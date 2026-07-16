import { describe, it, expect } from "vitest";
import { readFishColors } from "../app/lib/fish-colors.js";

describe("readFishColors", () => {
  it("returns trimmed values from the style source", () => {
    const vars = {
      "--fish-ink": "  #111 ",
      "--fish-koi": "#222",
      "--fish-gold": "#333",
      "--fx-ink": "#444",
      "--f-hand": "Caveat",
      "--xray-sep": "#555",
      "--xray-ali": "#666",
      "--xray-coh": "#777",
      "--xray-you": " #888 ",
    };
    expect(readFishColors((n) => vars[n])).toEqual({
      ink: "#111",
      koi: "#222",
      gold: "#333",
      fx: "#444",
      hand: "Caveat",
      xsep: "#555",
      xali: "#666",
      xcoh: "#777",
      xyou: "#888",
    });
  });

  it("falls back per-token when a var is missing or empty", () => {
    expect(readFishColors(() => "")).toEqual({
      ink: "#2e5a5e",
      koi: "#d1602f",
      gold: "#c9950c",
      fx: "rgba(255, 255, 255, 0.9)",
      hand: "cursive",
      xsep: "#e07b2f",
      xali: "#2f6fb2",
      xcoh: "#3f8f5f",
      xyou: "#c2273d",
    });
  });
});
