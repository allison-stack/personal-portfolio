import { describe, it, expect } from "vitest";
import seeds from "../app/content/combos.json";
import { comboKey, validateCombo } from "../app/lib/combine-core.js";

const SEED_ELEMENTS = ["water", "fire", "earth", "air"];

describe("combos.json", () => {
  it("has at least 35 combos", () => {
    expect(Object.keys(seeds).length).toBeGreaterThanOrEqual(35);
  });

  it("every key is a normalized comboKey and every value validates", () => {
    for (const [key, value] of Object.entries(seeds)) {
      const parts = key.split("+");
      expect(parts).toHaveLength(2);
      expect(comboKey(parts[0], parts[1])).toBe(key);
      expect(validateCombo(value)).not.toBeNull();
    }
  });

  it("every combo is reachable from the four starting elements", () => {
    const known = new Set(SEED_ELEMENTS);
    let grew = true;
    while (grew) {
      grew = false;
      for (const [key, value] of Object.entries(seeds)) {
        const [a, b] = key.split("+");
        if (known.has(a) && known.has(b) && !known.has(value.result)) {
          known.add(value.result);
          grew = true;
        }
      }
    }
    for (const [key] of Object.entries(seeds)) {
      const [a, b] = key.split("+");
      expect(known.has(a), `unreachable input "${a}" in ${key}`).toBe(true);
      expect(known.has(b), `unreachable input "${b}" in ${key}`).toBe(true);
    }
  });
});
