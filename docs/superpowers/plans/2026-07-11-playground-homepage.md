# Playground Homepage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the homepage with an interactive playground — a full-page boids fish simulation (cursor = predator) plus an Infinite-Craft-style fact combiner — and move the current scrapbook page intact to `/about`.

**Architecture:** One fixed full-viewport canvas (`FishCanvas`) renders behind a scrolling column of paper cards. Boids math lives in a pure, DOM-free module (`app/lib/boids.js`) so it's unit-testable. The combiner resolves combos through a chain: curated seed file → in-memory cache → one Gemini flash call, behind the existing per-IP rate limiter. Pure resolution/validation logic lives in `app/lib/combine-core.js`.

**Tech Stack:** Next.js 15 (app router, JS not TS in this repo), React 19, plain Canvas 2D, Gemini REST API (free tier), vitest (new devDependency) for pure-logic tests.

**Spec:** `docs/superpowers/specs/2026-07-11-playground-homepage-design.md`

## Global Constraints

- **Free tier only.** The only external API is Gemini via the existing `GEMINI_API_KEY`. Every Gemini call MUST be behind `checkRate` from `app/lib/rate-limit.js`. No new paid services, no database.
- **Degrade gracefully.** No `GEMINI_API_KEY` / rate-limited / bad model output → the combiner shows "hmm, nothing happened"; the page never errors.
- **`/about` content is a move, not a rewrite.** The current `app/page.js` JSX moves verbatim except for one added "→ come play" link and a metadata export.
- **Aesthetic:** reuse the existing palette custom properties (`--bg: #f9f5ee`, `--ink`, `--muted`, `--accent: #a65f3c`, `--line`) and font variables (`--f-serif`, `--f-sans`, `--f-mono`, `--f-hand`) from `app/globals.css`. Copy is lowercase, warm, first-person (her voice).
- **Accessibility/perf:** `prefers-reduced-motion` → static school; animation pauses when `document.hidden`; `devicePixelRatio` capped at 2; canvas has `pointer-events: none`.
- **Commits:** conventional prefixes (`feat:`, `test:`, `chore:`), reason in parentheses when non-obvious. NO `Co-Authored-By` trailer (user preference). One concern per commit.
- This repo uses **JavaScript** (`.js`/`.jsx`), not TypeScript. Components in `app/components/` use named exports (match `Clock.jsx` style).

## File Structure

- `app/about/page.js` — **create**: current scrapbook homepage, moved.
- `app/page.js` — **replace**: playground page (server component).
- `app/lib/boids.js` — **create**: pure boids simulation (createFish, stepSchool, DEFAULTS).
- `app/components/FishCanvas.jsx` — **create**: client component; canvas + feed-the-fish toggle.
- `app/lib/combine-core.js` — **create**: pure logic (normalizeName, comboKey, validateCombo).
- `app/content/combos.json` — **create**: ~40 curated seed combos with facts.
- `app/api/combine/route.js` — **create**: edge route, seed → cache → Gemini.
- `app/components/Combiner.jsx` — **create**: client component; tray, workspace, fact card, localStorage.
- `app/globals.css` — **modify**: append playground styles.
- `test/boids.test.js`, `test/combine-core.test.js`, `test/combos.test.js` — **create**.
- `package.json` — **modify**: add `vitest` devDependency + `test` script (folded into Task 2).

---

### Task 1: Move the scrapbook page to /about

**Files:**
- Create: `app/about/page.js`
- Modify: `app/page.js` (temporarily becomes a stub; replaced for real in Task 3)

**Interfaces:**
- Produces: route `/about` rendering today's homepage; `/` renders a placeholder `<main>` so the build stays green until Task 3.

- [ ] **Step 1: Create `app/about/page.js`**

Copy the ENTIRE current contents of `app/page.js` into `app/about/page.js`, then make exactly three edits:

1. Add a metadata export at the top (after imports):

```js
export const metadata = {
  title: "about · allison zhao",
};
```

2. Rename the default export component from `Home` to `About`.

3. Add the "come play" line inside the hero, immediately after the closing `</div>` of `<div className="now">…</div>`:

```jsx
            <p className="p" style={{ marginTop: 10 }}>
              <a className="ul" href="/">→ come play</a>
            </p>
```

Note: `Clock` and `NowPlaying` imports change from `"./components/Clock"` to `"../components/Clock"` and `"../components/NowPlaying"` (one directory deeper).

- [ ] **Step 2: Stub `app/page.js`**

Replace the whole file with:

```jsx
export default function Home() {
  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
      <p>
        playground under construction — <a className="ul" href="/about">about me</a>
      </p>
    </main>
  );
}
```

- [ ] **Step 3: Verify the build and both routes**

Run: `npm run build`
Expected: build succeeds, routes `/` and `/about` both listed in output.

Run: `npm run dev` and open `http://localhost:3000/about`
Expected: page looks identical to the old homepage (photo, tape, chips, experience, notes folder), plus the "→ come play" link under the clock line. `http://localhost:3000/` shows the stub.

- [ ] **Step 4: Commit**

```bash
git add app/about/page.js app/page.js
git commit -m "feat(playground): move scrapbook homepage to /about (playground takes over /)"
```

---

### Task 2: Boids simulation core (pure logic + vitest setup)

**Files:**
- Create: `app/lib/boids.js`
- Create: `test/boids.test.js`
- Modify: `package.json` (add vitest + test script)

**Interfaces:**
- Produces: `createFish(count, w, h, rand?) -> Array<{x,y,vx,vy}>`; `stepSchool(fish, {w, h, predator, mode?, params?, rand?})` mutates the array in place; `DEFAULTS` params object. `predator` is `{x, y, active}`; `mode` is `"flee"` (default) or `"feed"`.
- Consumed by: `FishCanvas.jsx` (Task 3).

- [ ] **Step 1: Install vitest and add the test script**

```bash
npm install -D vitest
```

In `package.json` scripts, add:

```json
"test": "vitest run"
```

- [ ] **Step 2: Write the failing tests**

Create `test/boids.test.js`:

```js
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
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `npm test`
Expected: FAIL — cannot resolve `../app/lib/boids.js`.

- [ ] **Step 4: Implement `app/lib/boids.js`**

```js
// Pure boids simulation — no DOM. Spatial hash keeps neighbor search O(n)
// per frame (grid cell = perception radius, so neighbors live in 9 cells).
export const DEFAULTS = {
  perception: 50,
  separationDist: 16,
  cohesionForce: 0.005,
  alignForce: 0.07,
  separationForce: 1.8,
  fleeForce: 3.4,
  feedForce: 1.1,
  fleeRadius: 150,
  wander: 0.12,
  maxSpeed: 2.6,
  minSpeed: 0.8,
  margin: 12,
};

export function createFish(count, w, h, rand = Math.random) {
  const fish = [];
  for (let i = 0; i < count; i++) {
    const a = rand() * Math.PI * 2;
    fish.push({
      x: rand() * w,
      y: rand() * h,
      vx: Math.cos(a) * 1.5,
      vy: Math.sin(a) * 1.5,
    });
  }
  return fish;
}

export function stepSchool(fish, { w, h, predator, mode = "flee", params, rand = Math.random }) {
  const p = { ...DEFAULTS, ...params };
  const cell = p.perception;

  const grid = new Map();
  for (let i = 0; i < fish.length; i++) {
    const k = Math.floor(fish[i].x / cell) + "," + Math.floor(fish[i].y / cell);
    const bucket = grid.get(k);
    if (bucket) bucket.push(i);
    else grid.set(k, [i]);
  }

  for (let i = 0; i < fish.length; i++) {
    const f = fish[i];
    let ax = 0, ay = 0;
    let cx = 0, cy = 0, avx = 0, avy = 0, n = 0;

    const gx = Math.floor(f.x / cell);
    const gy = Math.floor(f.y / cell);
    for (let ox = -1; ox <= 1; ox++) {
      for (let oy = -1; oy <= 1; oy++) {
        const bucket = grid.get(gx + ox + "," + (gy + oy));
        if (!bucket) continue;
        for (const j of bucket) {
          if (j === i) continue;
          const o = fish[j];
          const dx = o.x - f.x;
          const dy = o.y - f.y;
          const d2 = dx * dx + dy * dy;
          if (d2 >= p.perception * p.perception) continue;
          n++;
          cx += o.x; cy += o.y; avx += o.vx; avy += o.vy;
          if (d2 < p.separationDist * p.separationDist && d2 > 0.0001) {
            const d = Math.sqrt(d2);
            const push = p.separationForce * (1 - d / p.separationDist);
            ax -= (dx / d) * push;
            ay -= (dy / d) * push;
          }
        }
      }
    }

    if (n > 0) {
      ax += (cx / n - f.x) * p.cohesionForce;
      ay += (cy / n - f.y) * p.cohesionForce;
      ax += (avx / n - f.vx) * p.alignForce;
      ay += (avy / n - f.vy) * p.alignForce;
    }

    if (predator?.active) {
      const px = f.x - predator.x;
      const py = f.y - predator.y;
      const pd2 = px * px + py * py;
      if (pd2 < p.fleeRadius * p.fleeRadius && pd2 > 0.0001) {
        const pd = Math.sqrt(pd2);
        if (mode === "feed") {
          const pull = p.feedForce * (1 - pd / p.fleeRadius);
          ax -= (px / pd) * pull;
          ay -= (py / pd) * pull;
        } else {
          const push = p.fleeForce * (1 - pd / p.fleeRadius);
          ax += (px / pd) * push;
          ay += (py / pd) * push;
        }
      }
    }

    ax += (rand() - 0.5) * p.wander;
    ay += (rand() - 0.5) * p.wander;

    f.vx += ax;
    f.vy += ay;
    const sp = Math.hypot(f.vx, f.vy) || 0.001;
    if (sp > p.maxSpeed) {
      f.vx = (f.vx / sp) * p.maxSpeed;
      f.vy = (f.vy / sp) * p.maxSpeed;
    } else if (sp < p.minSpeed) {
      f.vx = (f.vx / sp) * p.minSpeed;
      f.vy = (f.vy / sp) * p.minSpeed;
    }
  }

  for (const f of fish) {
    f.x += f.vx;
    f.y += f.vy;
    const m = p.margin;
    if (f.x < -m) f.x = w + m;
    else if (f.x > w + m) f.x = -m;
    if (f.y < -m) f.y = h + m;
    else if (f.y > h + m) f.y = -m;
  }
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npm test`
Expected: PASS — 7 tests.

- [ ] **Step 6: Commit**

```bash
git add app/lib/boids.js test/boids.test.js package.json package-lock.json
git commit -m "feat(playground): pure boids core with spatial hash + vitest setup"
```

---

### Task 3: FishCanvas component + playground page skeleton

**Files:**
- Create: `app/components/FishCanvas.jsx`
- Replace: `app/page.js` (the Task 1 stub)
- Modify: `app/globals.css` (append styles at end of file)

**Interfaces:**
- Consumes: `createFish`, `stepSchool` from `app/lib/boids.js` (Task 2).
- Produces: `<FishCanvas />` (no props) — fixed background canvas + its own feed-the-fish toggle button. Page exposes a `.pg-col` column that Task 7 adds `<Combiner />` into.

- [ ] **Step 1: Create `app/components/FishCanvas.jsx`**

```jsx
"use client";

import { useEffect, useRef, useState } from "react";
import { createFish, stepSchool } from "../lib/boids";

const COUNT = 120;

export function FishCanvas() {
  const canvasRef = useRef(null);
  const [feeding, setFeeding] = useState(false);
  const modeRef = useRef("flee");

  useEffect(() => {
    modeRef.current = feeding ? "feed" : "flee";
  }, [feeding]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const predator = { x: -9999, y: -9999, active: false };
    let W = 0;
    let H = 0;
    let raf = 0;

    const styles = getComputedStyle(document.documentElement);
    const inkColor = styles.getPropertyValue("--muted").trim() || "#928979";
    const koiColor = styles.getPropertyValue("--accent").trim() || "#a65f3c";

    function resize() {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    const fish = createFish(COUNT, W, H);

    function draw() {
      ctx.clearRect(0, 0, W, H);
      ctx.lineWidth = 2.2;
      ctx.lineCap = "round";
      ctx.globalAlpha = 0.55;
      for (let i = 0; i < fish.length; i++) {
        const f = fish[i];
        const sp = Math.hypot(f.vx, f.vy) || 0.001;
        const ux = f.vx / sp;
        const uy = f.vy / sp;
        ctx.strokeStyle = i % 9 === 0 ? koiColor : inkColor;
        ctx.beginPath();
        ctx.moveTo(f.x + ux * 4, f.y + uy * 4);
        ctx.lineTo(f.x - ux * 4, f.y - uy * 4);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }

    function frame() {
      if (!document.hidden) {
        stepSchool(fish, { w: W, h: H, predator, mode: modeRef.current });
        draw();
      }
      raf = requestAnimationFrame(frame);
    }

    function onPointerMove(e) {
      predator.x = e.clientX;
      predator.y = e.clientY;
      predator.active = true;
    }
    function onPointerGone() {
      predator.active = false;
    }

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerdown", onPointerMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", onPointerGone);
    window.addEventListener("resize", resize);

    if (reduced) {
      // settle into a school, then hold a single static frame
      for (let i = 0; i < 240; i++) {
        stepSchool(fish, { w: W, h: H, predator, mode: "flee" });
      }
      draw();
    } else {
      raf = requestAnimationFrame(frame);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerMove);
      document.documentElement.removeEventListener("mouseleave", onPointerGone);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <>
      <canvas ref={canvasRef} className="fish-canvas" aria-hidden="true" />
      <button
        type="button"
        className="feed-toggle"
        aria-pressed={feeding}
        onClick={() => setFeeding((f) => !f)}
      >
        {feeding ? "🍞 feeding — they like you" : "🍞 feed the fish"}
      </button>
    </>
  );
}
```

- [ ] **Step 2: Replace `app/page.js` with the playground skeleton**

```jsx
import { FishCanvas } from "./components/FishCanvas";

export default function Home() {
  return (
    <>
      <FishCanvas />
      <div className="pg">
        <div className="grain" />
        <main className="pg-col">
          <section className="pg-card">
            <h1 className="title">
              hi, i&apos;m <span className="nm">allison</span>.
            </h1>
            <p className="p">
              i collect fun facts. the fish are scared of your mouse.
            </p>
            <p className="p pg-links">
              <a className="ul" href="/about">about me</a> ·{" "}
              <a className="ul" href="/Allison-Zhao-Resume.pdf">resume</a>
            </p>
          </section>

          {/* combiner section arrives in Task 7 */}

          <footer className="pg-card pg-foot">
            <p className="p">
              thanks for playing <span className="star">✦</span> ·{" "}
              <a className="ul" href="/about">who made this? → about me</a>
            </p>
          </footer>
        </main>
      </div>
    </>
  );
}
```

- [ ] **Step 3: Append playground styles to `app/globals.css`**

Add at the very end of the file:

```css
/* ---------- playground (/) ---------- */
.fish-canvas {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}
.pg {
  position: relative;
  z-index: 1;
  min-height: 100vh;
}
.pg-col {
  max-width: 560px;
  margin: 0 auto;
  padding: 22vh 24px 26vh;
  display: flex;
  flex-direction: column;
  gap: 42vh;
}
.pg-card {
  background: rgba(249, 245, 238, 0.9);
  border: 1px solid var(--line);
  border-radius: 10px;
  padding: 26px 28px;
  box-shadow: 0 2px 14px rgba(34, 29, 22, 0.05);
}
.pg-links {
  font-family: var(--f-mono);
  font-size: 13px;
}
.pg-foot {
  text-align: center;
}
.feed-toggle {
  position: fixed;
  left: 18px;
  bottom: 18px;
  z-index: 2;
  font-family: var(--f-mono);
  font-size: 12px;
  color: var(--muted);
  background: rgba(249, 245, 238, 0.9);
  border: 1px solid var(--line);
  border-radius: 999px;
  padding: 7px 13px;
  cursor: pointer;
  transition: color 0.15s ease, border-color 0.15s ease;
}
.feed-toggle:hover,
.feed-toggle[aria-pressed="true"] {
  color: var(--accent);
  border-color: var(--accent);
}
```

- [ ] **Step 4: Verify in the browser**

Run: `npm run dev`, open `http://localhost:3000/`

Checklist:
- Fish (ink dashes, occasional terracotta "koi") school together and scatter away from the cursor.
- Fish keep swimming behind the cards while scrolling; cards float above.
- Clicking links still works everywhere (canvas never intercepts).
- "🍞 feed the fish" flips the behavior: the school chases the cursor.
- Switch tabs for 10s, come back: animation resumes, no fish teleport-explosion.
- macOS: System Settings → Accessibility → Display → Reduce Motion ON, reload: static school, no animation.

- [ ] **Step 5: Commit**

```bash
git add app/components/FishCanvas.jsx app/page.js app/globals.css
git commit -m "feat(playground): fish canvas layer + playground page skeleton"
```

---

### Task 4: Combine-core pure logic

**Files:**
- Create: `app/lib/combine-core.js`
- Create: `test/combine-core.test.js`

**Interfaces:**
- Produces: `normalizeName(raw) -> string|null`; `comboKey(a, b) -> string` (sorted, `"a+b"`); `validateCombo(obj) -> {result, emoji, fact}|null`.
- Consumed by: `app/api/combine/route.js` (Task 6) and `test/combos.test.js` (Task 5).

- [ ] **Step 1: Write the failing tests**

Create `test/combine-core.test.js`:

```js
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test`
Expected: FAIL — cannot resolve `../app/lib/combine-core.js` (boids tests still pass).

- [ ] **Step 3: Implement `app/lib/combine-core.js`**

```js
// Pure combiner logic shared by the API route and the seed-file tests.

export function normalizeName(raw) {
  const s = (raw ?? "").toString().toLowerCase().trim().replace(/\s+/g, " ");
  if (!s || s.length > 40) return null;
  if (!/^[a-z0-9 \-]+$/.test(s)) return null;
  return s;
}

export function comboKey(a, b) {
  return [a, b].sort().join("+");
}

export function validateCombo(obj) {
  if (!obj || typeof obj !== "object") return null;
  const result = normalizeName(obj.result);
  if (!result) return null;
  const emoji = (obj.emoji ?? "").toString().trim();
  if (!emoji || emoji.length > 8 || /[a-z0-9]/i.test(emoji)) return null;
  const fact = (obj.fact ?? "").toString().trim();
  if (fact.length < 10 || fact.length > 300) return null;
  return { result, emoji, fact };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test`
Expected: PASS — all boids + combine-core tests.

- [ ] **Step 5: Commit**

```bash
git add app/lib/combine-core.js test/combine-core.test.js
git commit -m "feat(playground): combine-core validation and key normalization"
```

---

### Task 5: Seed combo graph

**Files:**
- Create: `app/content/combos.json`
- Create: `test/combos.test.js`

**Interfaces:**
- Produces: JSON object keyed by `comboKey` → `{result, emoji, fact}`. Consumed by the API route (Task 6).
- **Note for Allison:** these 41 facts are drafted for your review — swap any for favorites from your fun-fact books. The tests only check structure, not taste.

- [ ] **Step 1: Write the failing test**

Create `test/combos.test.js`:

```js
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — cannot resolve `../app/content/combos.json`.

- [ ] **Step 3: Create `app/content/combos.json`**

```json
{
  "fire+water": { "result": "steam", "emoji": "♨️", "fact": "geysers are natural steam engines with no moving parts — old faithful has kept a rough eruption schedule for over a century." },
  "earth+water": { "result": "mud", "emoji": "🟤", "fact": "mudskippers are fish that walk on mud — they can drown if they're held underwater too long." },
  "air+water": { "result": "mist", "emoji": "🌫️", "fact": "fog is just a cloud that touches the ground — same physics, lower altitude." },
  "earth+fire": { "result": "lava", "emoji": "🌋", "fact": "runny basaltic lava can flow faster than you can run — nyiragongo's 2002 flows hit ~60 km/h." },
  "air+fire": { "result": "smoke", "emoji": "🌬️", "fact": "smoke rings are vortex rings — dolphins make the same shape underwater by blowing bubble rings for fun." },
  "air+earth": { "result": "dust", "emoji": "🌪️", "fact": "part of your household dust is cosmic — about 5,000 tonnes of micrometeorite dust fall to earth every year." },
  "water+water": { "result": "ocean", "emoji": "🌊", "fact": "we have better high-resolution maps of mars than of our own ocean floor." },
  "fire+fire": { "result": "sun", "emoji": "☀️", "fact": "the sun is 99.86% of the solar system's mass — everything else is a rounding error." },
  "earth+earth": { "result": "mountain", "emoji": "⛰️", "fact": "everest gets about 4 mm taller every year as india keeps pushing into asia." },
  "air+air": { "result": "wind", "emoji": "🍃", "fact": "all wind is solar-powered — uneven heating of the earth's surface is what drives it." },
  "air+steam": { "result": "cloud", "emoji": "☁️", "fact": "an average cumulus cloud weighs around a million pounds — it floats because that mass is spread over a huge volume." },
  "cloud+cloud": { "result": "storm", "emoji": "⛈️", "fact": "a thunderstorm can hold more energy than an atomic bomb — most of it spent lifting water." },
  "cloud+water": { "result": "rain", "emoji": "🌧️", "fact": "raindrops aren't teardrop-shaped — small ones are spheres and big ones flatten like hamburger buns." },
  "rain+sun": { "result": "rainbow", "emoji": "🌈", "fact": "no two people ever see the same rainbow — it depends on the exact position of your eyes." },
  "fire+mud": { "result": "brick", "emoji": "🧱", "fact": "fired clay bricks from 5,000 years ago are still standing — one of the oldest manufactured materials we have." },
  "lava+water": { "result": "obsidian", "emoji": "🪨", "fact": "obsidian blades can be sharper than steel scalpels — some surgeons have actually used them." },
  "earth+storm": { "result": "lightning", "emoji": "⚡", "fact": "lightning strikes earth about 100 times every second — roughly 8 million bolts a day." },
  "lightning+ocean": { "result": "life", "emoji": "🧬", "fact": "in 1952 the miller-urey experiment zapped a 'primordial soup' with sparks and made amino acids — building blocks of life." },
  "life+water": { "result": "fish", "emoji": "🐟", "fact": "fish sense the world through a lateral line — a pressure-sensing organ that feels the water move." },
  "fish+fish": { "result": "school", "emoji": "🐠", "fact": "a fish school has no leader — every fish follows a few simple local rules, and the swirl emerges on its own. (that's what the fish on this page are doing.)" },
  "earth+life": { "result": "plant", "emoji": "🌱", "fact": "experiments suggest plant roots can grow toward the sound of running water — even with no moisture present." },
  "earth+plant": { "result": "tree", "emoji": "🌳", "fact": "sharks are older than trees — sharks go back ~450 million years, trees only ~385 million." },
  "tree+tree": { "result": "forest", "emoji": "🌲", "fact": "forest trees trade nutrients through underground fungal networks — nicknamed the wood wide web." },
  "air+life": { "result": "bird", "emoji": "🐦", "fact": "birds are living dinosaurs — a hummingbird and a t. rex share a common ancestor." },
  "bird+ocean": { "result": "penguin", "emoji": "🐧", "fact": "emperor penguins can dive over 500 metres deep and hold their breath for around 20 minutes." },
  "fire+life": { "result": "firefly", "emoji": "✨", "fact": "firefly light is nearly 100% efficient — almost no energy is wasted as heat, unlike a lightbulb." },
  "life+life": { "result": "cell", "emoji": "🦠", "fact": "you replace roughly 330 billion cells every day — about 1% of your body, daily." },
  "earth+sun": { "result": "desert", "emoji": "🏜️", "fact": "the sahara feeds the amazon — its dust blows across the atlantic and fertilizes the rainforest." },
  "air+desert": { "result": "sand", "emoji": "⏳", "fact": "some sand dunes 'sing' — avalanching grains hum loud enough to hear from kilometres away." },
  "ocean+wind": { "result": "wave", "emoji": "🌊", "fact": "the tallest wave ever recorded was 524 metres — a 1958 megatsunami in lituya bay, alaska." },
  "lava+ocean": { "result": "island", "emoji": "🏝️", "fact": "the island of surtsey didn't exist before 1963 — it erupted out of the sea near iceland and is still there." },
  "air+sun": { "result": "sky", "emoji": "🌅", "fact": "the sky is blue because air scatters blue light more than red — sunsets are red for the same reason, just a longer path." },
  "sun+sun": { "result": "star", "emoji": "⭐", "fact": "there are more stars in the universe than grains of sand on all of earth's beaches." },
  "star+star": { "result": "galaxy", "emoji": "🌌", "fact": "the milky way and andromeda will merge in ~4.5 billion years — and almost no stars will actually collide." },
  "earth+star": { "result": "meteor", "emoji": "☄️", "fact": "most shooting stars are the size of a grain of sand, burning up at around 60 km per second." },
  "fish+lightning": { "result": "electric eel", "emoji": "🔌", "fact": "electric eels deliver shocks up to 600 volts — and they aren't eels, they're knifefish." },
  "air+fish": { "result": "flying fish", "emoji": "🛫", "fact": "flying fish can glide 400 metres in one go — longer than four football fields." },
  "life+mud": { "result": "worm", "emoji": "🪱", "fact": "earthworms have five pairs of heart-like structures pumping their blood." },
  "plant+sun": { "result": "flower", "emoji": "🌸", "fact": "a single sunflower head is actually up to 2,000 tiny flowers packed in a spiral." },
  "flower+life": { "result": "bee", "emoji": "🐝", "fact": "one honeybee makes about 1/12 of a teaspoon of honey in its entire lifetime." },
  "earth+steam": { "result": "geyser", "emoji": "⛲", "fact": "geysers need a rare plumbing accident of heat, water, and a pressure-tight rock throat — fewer than a thousand exist on earth." }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test`
Expected: PASS — including the reachability test (every combo's inputs derive from water/fire/earth/air).

- [ ] **Step 5: Commit**

```bash
git add app/content/combos.json test/combos.test.js
git commit -m "feat(playground): curated seed combo graph with 41 fun facts"
```

---

### Task 6: /api/combine edge route

**Files:**
- Create: `app/api/combine/route.js`

**Interfaces:**
- Consumes: `combos.json` (Task 5), `combine-core` (Task 4), `checkRate` from `app/lib/rate-limit.js` (existing).
- Produces: `POST /api/combine` with body `{"a": string, "b": string}` → `200 {"combo": {result, emoji, fact}}` or `200 {"combo": null}` (unresolvable) or `429 {"combo": null, "retryAfterSec": n}` or `400` (bad input). Consumed by `Combiner.jsx` (Task 7).

- [ ] **Step 1: Implement `app/api/combine/route.js`**

Follows the same shape as `app/api/ama/route.js` (edge runtime, same client-key logic, same rate limiter — prefixed so the two features don't share buckets).

```js
import seeds from "../../content/combos.json";
import { normalizeName, comboKey, validateCombo } from "../../lib/combine-core";
import { checkRate } from "../../lib/rate-limit";

export const runtime = "edge";

const MODEL = "gemini-2.5-flash";
const CACHE_MAX = 500;
const cache = new Map();

function clientKey(req) {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "anon"
  );
}

function prompt(a, b) {
  return [
    "You are the combination engine for a science-themed crafting game (like Infinite Craft).",
    `Combine: "${a}" + "${b}".`,
    'Reply with ONLY a JSON object: {"result": string, "emoji": string, "fact": string}',
    "Rules:",
    "- result: the most intuitive real concept the two make together - a common noun, lowercase, 1-3 words, letters only. Never invent nonsense words.",
    "- emoji: exactly one emoji that best represents the result.",
    "- fact: a TRUE, verifiable, delightful science fun fact about the result, under 220 characters, plain sentence, no markdown. If unsure a fact is true, pick a different fact you are sure of.",
  ].join("\n");
}

async function askGemini(a, b, apiKey) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt(a, b) }] }],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.9,
        maxOutputTokens: 200,
      },
    }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) return null;
  try {
    return validateCombo(JSON.parse(text));
  } catch {
    return null;
  }
}

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "bad json" }, { status: 400 });
  }
  const a = normalizeName(body?.a);
  const b = normalizeName(body?.b);
  if (!a || !b) {
    return Response.json({ error: "bad elements" }, { status: 400 });
  }

  const key = comboKey(a, b);
  if (seeds[key]) return Response.json({ combo: seeds[key] });
  if (cache.has(key)) return Response.json({ combo: cache.get(key) });

  const rate = checkRate("combine:" + clientKey(req));
  if (!rate.ok) {
    return Response.json(
      { combo: null, retryAfterSec: rate.retryAfterSec },
      { status: 429, headers: { "retry-after": String(rate.retryAfterSec) } }
    );
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return Response.json({ combo: null });

  let combo = null;
  try {
    combo = await askGemini(a, b, apiKey);
  } catch {
    combo = null;
  }
  if (combo) {
    if (cache.size >= CACHE_MAX) cache.delete(cache.keys().next().value);
    cache.set(key, combo);
  }
  return Response.json({ combo });
}
```

- [ ] **Step 2: Verify with curl against the dev server**

Run: `npm run dev`, then in another terminal:

```bash
# seed hit (no API call, no rate-limit consumption)
curl -s -X POST http://localhost:3000/api/combine \
  -H 'content-type: application/json' -d '{"a":"Water","b":"fire"}'
```
Expected: `{"combo":{"result":"steam","emoji":"♨️","fact":"geysers are natural steam engines…"}}`

```bash
# novel combo (hits Gemini; requires GEMINI_API_KEY in .env.local)
curl -s -X POST http://localhost:3000/api/combine \
  -H 'content-type: application/json' -d '{"a":"steam","b":"obsidian"}'
```
Expected: `{"combo":{...}}` with a plausible result + fact, OR `{"combo":null}` if the model returns junk — never a 500.

```bash
# bad input
curl -s -X POST http://localhost:3000/api/combine \
  -H 'content-type: application/json' -d '{"a":"<script>","b":"fire"}'
```
Expected: HTTP 400 `{"error":"bad elements"}`

Repeat the novel-combo curl 11+ times quickly: the 11th distinct combo within 5 minutes returns HTTP 429 with `retryAfterSec` (seed hits never consume quota).

- [ ] **Step 3: Run the test suite (regression)**

Run: `npm test`
Expected: PASS — nothing broken.

- [ ] **Step 4: Commit**

```bash
git add app/api/combine/route.js
git commit -m "feat(playground): /api/combine route (seeds -> cache -> gemini, rate-limited)"
```

---

### Task 7: Combiner component + page integration

**Files:**
- Create: `app/components/Combiner.jsx`
- Modify: `app/page.js` (add the combiner section between intro and footer)
- Modify: `app/globals.css` (append combiner styles)

**Interfaces:**
- Consumes: `POST /api/combine` (Task 6 shape).
- Produces: `<Combiner />`, self-contained (localStorage key `playground-elements-v1`).

- [ ] **Step 1: Create `app/components/Combiner.jsx`**

Interaction model: click/tap selects a chip (two selected → combine). Desktop can also drag one chip onto another. Both paths call the same `combine(a, b)`.

```jsx
"use client";

import { useEffect, useRef, useState } from "react";

const SEED_ELEMENTS = [
  { name: "water", emoji: "💧" },
  { name: "fire", emoji: "🔥" },
  { name: "earth", emoji: "🌍" },
  { name: "air", emoji: "💨" },
];
const STORE_KEY = "playground-elements-v1";

export function Combiner() {
  const [elements, setElements] = useState(SEED_ELEMENTS);
  const [selected, setSelected] = useState([]); // element names, max 2
  const [busy, setBusy] = useState(false);
  const [last, setLast] = useState(null); // {a, b, combo|null, isNew, cooldown}
  const dragFrom = useRef(null);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORE_KEY) ?? "null");
      if (Array.isArray(saved) && saved.length >= SEED_ELEMENTS.length) {
        setElements(saved);
      }
    } catch {
      /* corrupted storage — fall back to seeds */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(elements));
    } catch {
      /* storage full/blocked — discoveries just won't persist */
    }
  }, [elements]);

  async function combine(aName, bName) {
    const a = elements.find((e) => e.name === aName);
    const b = elements.find((e) => e.name === bName);
    if (!a || !b || busy) return;
    setBusy(true);
    setLast(null);
    let next = null;
    try {
      const res = await fetch("/api/combine", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ a: a.name, b: b.name }),
      });
      const data = await res.json().catch(() => null);
      const combo = data?.combo ?? null;
      if (combo) {
        const isNew = !elements.some((e) => e.name === combo.result);
        if (isNew) {
          setElements((prev) => [...prev, { name: combo.result, emoji: combo.emoji }]);
        }
        next = { a, b, combo, isNew };
      } else {
        next = { a, b, combo: null, cooldown: res.status === 429 };
      }
    } catch {
      next = { a, b, combo: null };
    }
    setLast(next);
    setSelected([]);
    setBusy(false);
  }

  function tapChip(name) {
    if (busy) return;
    setSelected((prev) => {
      if (prev.includes(name)) return prev.filter((n) => n !== name);
      const next = [...prev, name];
      if (next.length === 2) {
        combine(next[0], next[1]);
        return next;
      }
      return next;
    });
  }

  return (
    <div className="cmb">
      <div className="cmb-tray" role="list">
        {elements.map((el) => (
          <button
            key={el.name}
            type="button"
            role="listitem"
            className={
              "cmb-chip" +
              (selected.includes(el.name) ? " is-selected" : "") +
              (last?.isNew && last.combo?.result === el.name ? " is-new" : "")
            }
            disabled={busy}
            draggable={!busy}
            onClick={() => tapChip(el.name)}
            onDragStart={() => { dragFrom.current = el.name; }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const from = dragFrom.current;
              dragFrom.current = null;
              if (from && from !== el.name) combine(from, el.name);
            }}
          >
            <span aria-hidden="true">{el.emoji}</span> {el.name}
          </button>
        ))}
      </div>

      <div className="cmb-stage" aria-live="polite">
        {busy && <p className="cmb-hint">combining…</p>}
        {!busy && !last && (
          <p className="cmb-hint">
            pick two elements (tap them, or drag one onto another)
          </p>
        )}
        {!busy && last && !last.combo && (
          <p className="cmb-hint">
            {last.cooldown
              ? "the lab needs a breather — try again in a minute"
              : "hmm, nothing happened"}
          </p>
        )}
        {!busy && last?.combo && (
          <div className="cmb-result">
            <p className="cmb-eq">
              {last.a.emoji} {last.a.name} + {last.b.emoji} {last.b.name} ={" "}
              <b>
                {last.combo.emoji} {last.combo.result}
              </b>
              {last.isNew && <span className="cmb-new"> new!</span>}
            </p>
            <p className="cmb-fact">
              <span className="cmb-fact-label">fun fact</span>
              {last.combo.fact}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Add the combiner section to `app/page.js`**

Add the import at the top:

```jsx
import { Combiner } from "./components/Combiner";
```

Replace the `{/* combiner section arrives in Task 7 */}` comment with:

```jsx
          <section className="pg-card">
            <h2 className="sh">the fact lab</h2>
            <p className="p">
              combine two elements. every discovery comes with a real fun fact
              — there&apos;s a lot to find.
            </p>
            <Combiner />
          </section>
```

- [ ] **Step 3: Append combiner styles to `app/globals.css`**

```css
/* ---------- fact combiner ---------- */
.cmb {
  margin-top: 14px;
}
.cmb-tray {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.cmb-chip {
  font-family: var(--f-mono);
  font-size: 13px;
  color: var(--ink);
  background: var(--bg);
  border: 1.5px solid var(--line);
  border-radius: 999px;
  padding: 6px 13px;
  cursor: pointer;
  transition: border-color 0.15s ease, transform 0.15s ease;
}
.cmb-chip:hover {
  border-color: var(--accent);
}
.cmb-chip.is-selected {
  border-color: var(--accent);
  color: var(--accent);
  transform: scale(1.05);
}
.cmb-chip.is-new {
  animation: cmb-pop 0.45s ease;
  border-color: var(--accent);
}
.cmb-chip:disabled {
  opacity: 0.55;
  cursor: wait;
}
@keyframes cmb-pop {
  0% { transform: scale(0.6); }
  60% { transform: scale(1.15); }
  100% { transform: scale(1); }
}
@media (prefers-reduced-motion: reduce) {
  .cmb-chip.is-new { animation: none; }
  .cmb-chip.is-selected { transform: none; }
}
.cmb-stage {
  margin-top: 16px;
  min-height: 86px;
  border: 1.5px dashed var(--line);
  border-radius: 10px;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.cmb-hint {
  font-family: var(--f-mono);
  font-size: 12.5px;
  color: var(--muted);
  margin: 0;
}
.cmb-eq {
  font-family: var(--f-mono);
  font-size: 14px;
  margin: 0 0 8px;
}
.cmb-new {
  color: var(--accent);
  font-weight: 700;
}
.cmb-fact {
  font-size: 14px;
  color: var(--body);
  margin: 0;
  line-height: 1.55;
}
.cmb-fact-label {
  display: inline-block;
  font-family: var(--f-mono);
  font-size: 10.5px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--accent);
  border: 1px solid var(--accent);
  border-radius: 4px;
  padding: 1px 6px;
  margin-right: 8px;
  vertical-align: 1px;
}
```

- [ ] **Step 4: Verify in the browser**

Run: `npm run dev`, open `http://localhost:3000/`

Checklist:
- Tap 💧 then 🔥 → chip pops in with "♨️ steam — new!", fact card shows the geyser fact.
- Drag 🌍 onto 💧 → mud appears. Repeating a combo shows the fact again without a duplicate chip.
- Novel combo (e.g. steam + mud) → Gemini result appears, or "hmm, nothing happened".
- Reload the page → discovered elements are still in the tray (localStorage).
- Burn through the rate limit → "the lab needs a breather — try again in a minute".
- DevTools device emulation (touch): tap-two-chips works without drag.
- Fish still swim behind the combiner; clicking chips never disturbs scrolling.

- [ ] **Step 5: Run the test suite (regression)**

Run: `npm test`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add app/components/Combiner.jsx app/page.js app/globals.css
git commit -m "feat(playground): fact combiner UI with localStorage persistence"
```

---

### Task 8: Final verification, docs, and ship

**Files:**
- Modify: `README.md` (replace the create-next-app boilerplate)
- Create or append: `devlog.md`

- [ ] **Step 1: Full verification pass**

```bash
npm test        # expected: all tests pass
npm run lint    # expected: no errors
npm run build   # expected: clean build; routes /, /about, /api/combine listed
```

Then `npm run dev` and walk the spec's verification list:
- `/` — fish flee cursor; scroll + tab-switch don't break the sim; feed toggle works; reduced-motion → static school; no horizontal scroll at 375px width.
- combiner — seed combos, novel combos, rate limit, persistence, mobile tap.
- `/about` — identical to the old homepage + "→ come play" link; header/footer links between the two pages all work.

- [ ] **Step 2: Replace README boilerplate**

Replace `README.md` contents with:

```markdown
# personal-portfolio

my corner of the internet — [allisonzhao.vercel.app](https://allisonzhao.vercel.app)

- `/` — the playground: a boids fish school that treats your cursor as a predator
  (or a feeder, if you toggle the bread), plus a fact combiner — combine two
  elements, discover a new one, learn a real science fun fact.
- `/about` — the actual about-me: experience, projects, contact.

## stack

next.js 15 (app router) · react 19 · canvas 2d · gemini free tier for novel
combos (seed combos are hand-curated in `app/content/combos.json`)

## develop

npm run dev     # local dev
npm test        # vitest (boids math, combine logic, seed graph)
npm run build   # production build

needs `GEMINI_API_KEY` in `.env.local` for the AMA + novel combos; without it,
seed combos still work.
```

- [ ] **Step 3: Devlog entry**

Append to `devlog.md` (create the file if missing):

```markdown
## 2026-07-11 — playground homepage
- homepage is now a boids fish sim (cursor = predator) + infinite-craft-style fact combiner; old page moved to /about.
- neighbor search was the perf risk: spatial hash grid keeps 120 fish at 60fps (O(n) per frame instead of O(n²) — 14,280 pair checks down to ~1,000).
- 41 hand-curated seed combos; novel combos via gemini flash behind the existing rate limiter, so the free quota stays protected.
```

- [ ] **Step 4: Commit and push**

```bash
git add README.md devlog.md
git commit -m "docs: playground README + devlog entry"
git push
```

---

## Self-Review Notes

- **Spec coverage:** /about move (Task 1), fish layer incl. reduced-motion/hidden-tab/dpr/pointer-events (Tasks 2–3), feed-the-fish stretch (Task 3), combiner UI + localStorage + tap/drag + failure states (Task 7), seed graph ≥35 with reachability guarantee (Task 5), API chain seed→cache→Gemini with rate limit + no-key degradation (Task 6), verification (Task 8). Intro/footer copy and links (Task 3). No gaps found.
- **Type consistency:** `stepSchool(fish, {w, h, predator, mode, params, rand})` used identically in Tasks 2, 3. Combo shape `{result, emoji, fact}` identical across Tasks 4, 5, 6, 7. API response `{combo}` consistent between Tasks 6 and 7. Storage key `playground-elements-v1` appears only in Task 7.
- **Facts disclaimer:** seed facts are drafted from well-known science trivia; Allison reviews/edits them in Task 5 (flagged in the task).
