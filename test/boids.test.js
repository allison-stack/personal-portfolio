import { describe, it, expect } from "vitest";
import { createFish, stepSchool, DEFAULTS } from "../app/lib/boids.js";

const noRand = () => 0.5; // makes wander force exactly zero

describe("createFish", () => {
  it("creates the requested number of fish inside the bounds", () => {
    const fish = createFish(30, 800, 600, noRand);
    expect(fish).toHaveLength(30);
    for (const f of fish) {
      expect(f.x).toBeGreaterThanOrEqual(0);
      expect(f.x).toBeLessThanOrEqual(800);
      expect(f.y).toBeGreaterThanOrEqual(0);
      expect(f.y).toBeLessThanOrEqual(600);
      expect(Math.hypot(f.vx, f.vy)).toBeGreaterThan(0);
    }
  });
});

describe("stepSchool", () => {
  it("flee: a fish near a flee predator accelerates away", () => {
    const fish = [{ x: 100, y: 100, vx: 0, vy: 1 }];
    const predators = [{ x: 130, y: 100, kind: "flee" }]; // predator to the right
    stepSchool(fish, { w: 800, h: 600, predators, rand: noRand });
    expect(fish[0].vx).toBeLessThan(0); // pushed left, away from predator
  });

  it("feed: a fish near a feed point accelerates toward it", () => {
    const fish = [{ x: 100, y: 100, vx: 0, vy: 1 }];
    const predators = [{ x: 130, y: 100, kind: "feed" }];
    stepSchool(fish, { w: 800, h: 600, predators, rand: noRand });
    expect(fish[0].vx).toBeGreaterThan(0); // pulled right, toward the food
  });

  it("multiple predators act simultaneously", () => {
    const fish = [{ x: 100, y: 100, vx: 0, vy: 1 }];
    const predators = [
      { x: 130, y: 100, kind: "flee" }, // pushes left
      { x: 100, y: 130, kind: "flee" }, // pushes up
    ];
    stepSchool(fish, { w: 800, h: 600, predators, rand: noRand });
    expect(fish[0].vx).toBeLessThan(0);
    expect(fish[0].vy).toBeLessThan(1); // upward push counteracts the initial +vy
  });

  it("strength scales the predator force", () => {
    const weak = [{ x: 100, y: 100, vx: 0, vy: 1 }];
    const strong = [{ x: 100, y: 100, vx: 0, vy: 1 }];
    stepSchool(weak, { w: 800, h: 600, predators: [{ x: 130, y: 100, kind: "flee", strength: 0.5 }], rand: noRand });
    stepSchool(strong, { w: 800, h: 600, predators: [{ x: 130, y: 100, kind: "flee", strength: 2 }], rand: noRand });
    expect(strong[0].vx).toBeLessThan(weak[0].vx); // stronger push = more negative vx
  });

  it("no predators: behaves as plain schooling (no throw, no force)", () => {
    const fish = [{ x: 400, y: 300, vx: 1, vy: 0 }];
    stepSchool(fish, { w: 800, h: 600, rand: noRand });
    expect(fish[0].vy).toBeCloseTo(0, 5); // nothing pushed it vertically
  });

  it("cohesion: two fish within perception drift closer over time", () => {
    const fish = [
      { x: 100, y: 100, vx: 0, vy: 0.8 },
      { x: 140, y: 100, vx: 0, vy: 0.8 },
    ];
    const before = Math.abs(fish[1].x - fish[0].x);
    for (let i = 0; i < 30; i++) {
      stepSchool(fish, { w: 800, h: 600, rand: noRand });
    }
    const after = Math.hypot(fish[1].x - fish[0].x, fish[1].y - fish[0].y);
    expect(after).toBeLessThan(before);
  });

  it("separation: two overlapping fish push apart", () => {
    const fish = [
      { x: 100, y: 100, vx: 0.8, vy: 0 },
      { x: 106, y: 100, vx: 0.8, vy: 0 },
    ];
    const before = Math.abs(fish[1].x - fish[0].x);
    for (let i = 0; i < 5; i++) {
      stepSchool(fish, { w: 800, h: 600, rand: noRand });
    }
    const after = Math.hypot(fish[1].x - fish[0].x, fish[1].y - fish[0].y);
    expect(after).toBeGreaterThan(before);
  });

  it("wraps around the edges", () => {
    const fish = [{ x: 800 + DEFAULTS.margin + 5, y: 300, vx: 1, vy: 0 }];
    stepSchool(fish, { w: 800, h: 600, rand: noRand });
    expect(fish[0].x).toBeLessThan(0); // wrapped to the left edge
  });

  it("clamps speed to maxSpeed", () => {
    const fish = [{ x: 400, y: 300, vx: 50, vy: 0 }];
    stepSchool(fish, { w: 800, h: 600, rand: noRand });
    expect(Math.hypot(fish[0].vx, fish[0].vy)).toBeLessThanOrEqual(DEFAULTS.maxSpeed + 1e-9);
  });
});
