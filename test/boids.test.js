import { describe, it, expect } from "vitest";
import { createFish, stepSchool, DEFAULTS } from "../app/lib/boids.js";

const noRand = () => 0.5; // makes wander force exactly zero
const still = { x: -9999, y: -9999, active: false };

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
  it("flee: a fish near the predator accelerates away", () => {
    const fish = [{ x: 100, y: 100, vx: 0, vy: 1 }];
    const predator = { x: 130, y: 100, active: true }; // predator to the right
    stepSchool(fish, { w: 800, h: 600, predator, rand: noRand });
    expect(fish[0].vx).toBeLessThan(0); // pushed left, away from predator
  });

  it("feed: a fish near the cursor accelerates toward it", () => {
    const fish = [{ x: 100, y: 100, vx: 0, vy: 1 }];
    const predator = { x: 130, y: 100, active: true };
    stepSchool(fish, { w: 800, h: 600, predator, mode: "feed", rand: noRand });
    expect(fish[0].vx).toBeGreaterThan(0); // pulled right, toward cursor
  });

  it("cohesion: two fish within perception drift closer over time", () => {
    const fish = [
      { x: 100, y: 100, vx: 0, vy: 0.8 },
      { x: 140, y: 100, vx: 0, vy: 0.8 },
    ];
    const before = Math.abs(fish[1].x - fish[0].x);
    for (let i = 0; i < 30; i++) {
      stepSchool(fish, { w: 800, h: 600, predator: still, rand: noRand });
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
      stepSchool(fish, { w: 800, h: 600, predator: still, rand: noRand });
    }
    const after = Math.hypot(fish[1].x - fish[0].x, fish[1].y - fish[0].y);
    expect(after).toBeGreaterThan(before);
  });

  it("wraps around the edges", () => {
    const fish = [{ x: 800 + DEFAULTS.margin + 5, y: 300, vx: 1, vy: 0 }];
    stepSchool(fish, { w: 800, h: 600, predator: still, rand: noRand });
    expect(fish[0].x).toBeLessThan(0); // wrapped to the left edge
  });

  it("clamps speed to maxSpeed", () => {
    const fish = [{ x: 400, y: 300, vx: 50, vy: 0 }];
    stepSchool(fish, { w: 800, h: 600, predator: still, rand: noRand });
    expect(Math.hypot(fish[0].vx, fish[0].vy)).toBeLessThanOrEqual(DEFAULTS.maxSpeed + 1e-9);
  });
});
