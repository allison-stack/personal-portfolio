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
    };
    expect(readFishColors((n) => vars[n])).toEqual({
      ink: "#111",
      koi: "#222",
      gold: "#333",
      fx: "#444",
      hand: "Caveat",
    });
  });

  it("falls back per-token when a var is missing or empty", () => {
    expect(readFishColors(() => "")).toEqual({
      ink: "#2e5a5e",
      koi: "#d1602f",
      gold: "#c9950c",
      fx: "rgba(255, 255, 255, 0.9)",
      hand: "cursive",
    });
  });
});
