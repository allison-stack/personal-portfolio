# Fish-Brain X-Ray Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A toggleable overlay on the homepage pond that draws each fish's live decision vectors (separation, alignment, cohesion, cursor influence) straight from the boids sim.

**Architecture:** `stepSchool` gains an optional `trace` out-param that captures per-fish force components with zero cost when omitted (single source of truth for the force math). FishCanvas passes a preallocated trace array only while the x-ray is on and draws sqrt-scaled line segments in a second pass over the fish. A new scrap (rendered as a `<button>`) and the secret word `think` toggle the mode; four scoped CSS tokens color the arrows and a legend pill.

**Tech Stack:** Next.js 15 app router (plain JS/JSX), canvas 2D, vitest (`test/` dir), CSS custom properties scoped under `.pond`/`.pond--night`.

## Global Constraints

- Free tier only — nothing here calls any API.
- `/about` untouched by construction: all new tokens live under `.pond` / `.pond--night`, never `:root`.
- `app/globals.css` is append-only — new rules go at the end of the file; never edit existing blocks.
- All visitor-facing copy lowercase/warm.
- Commits: conventional prefix with the reason in parentheses when non-obvious. **No AI attribution trailer** — plain 1–2 line message.
- The sim (`app/lib/boids.js`) stays pure and DOM-free; when `trace` is omitted there must be no extra writes, allocation, or behavior change.
- Trace field names, exactly: `sepX, sepY, aliX, aliY, cohX, cohY, youX, youY`. All eight overwritten every traced step.
- Token names/values, exactly: `--xray-sep` `#e07b2f`/`#ffa25c`, `--xray-ali` `#2f6fb2`/`#6db8ff`, `--xray-coh` `#3f8f5f`/`#6fe0a8`, `--xray-you` `#c2273d`/`#ff6b81` (day `.pond` / night `.pond--night`).
- Arrow drawing: skip magnitude < 0.01; length `Math.min(18, 22 * Math.sqrt(mag))`; `lineWidth 1.2`; `globalAlpha 0.85`; no arrowheads.
- Existing test suite (27 tests across 6 files) must stay green throughout. Run: `npx vitest run`.
- Side effects never go inside React state updaters (StrictMode double-invokes them — known past bug in this repo). Toggle side effects run in event scope.

---

### Task 1: `stepSchool` trace out-param

**Files:**
- Modify: `app/lib/boids.js:44-114` (the per-fish force loop)
- Test: `test/boids.test.js`

**Interfaces:**
- Consumes: existing `stepSchool(fish, { w, h, predators, params, rand })`.
- Produces: `stepSchool(fish, { w, h, predators, params, rand, trace })` — when `trace` (an array) is passed, slot `i` becomes/reuses an object and gets all eight numeric fields `sepX, sepY, aliX, aliY, cohX, cohY, youX, youY` overwritten every call. Task 4 relies on exactly these names and on object reuse (`trace[i] || (trace[i] = {})`).

- [ ] **Step 1: Write the failing tests**

Append to `test/boids.test.js` (inside the file, after the existing `describe("stepSchool", …)` block):

```js
describe("stepSchool trace", () => {
  const FIELDS = ["sepX", "sepY", "aliX", "aliY", "cohX", "cohY", "youX", "youY"];

  it("fills all eight numeric fields per fish when trace is passed", () => {
    const fish = [
      { x: 100, y: 100, vx: 0, vy: 1 },
      { x: 120, y: 100, vx: 1, vy: 0 },
    ];
    const trace = [];
    stepSchool(fish, { w: 800, h: 600, rand: noRand, trace });
    expect(trace).toHaveLength(2);
    for (const t of trace) {
      for (const k of FIELDS) expect(typeof t[k]).toBe("number");
    }
  });

  it("is observation-only: identical positions with and without trace", () => {
    const a = [
      { x: 100, y: 100, vx: 0, vy: 1 },
      { x: 130, y: 110, vx: 1, vy: 0 },
    ];
    const b = a.map((f) => ({ ...f }));
    const predators = [{ x: 150, y: 100, kind: "flee" }];
    for (let i = 0; i < 20; i++) stepSchool(a, { w: 800, h: 600, predators, rand: noRand });
    const trace = [];
    for (let i = 0; i < 20; i++) stepSchool(b, { w: 800, h: 600, predators, rand: noRand, trace });
    expect(b).toEqual(a);
  });

  it("you* points away from a flee predator and toward a feed point", () => {
    const flee = [{ x: 100, y: 100, vx: 0, vy: 1 }];
    const feed = [{ x: 100, y: 100, vx: 0, vy: 1 }];
    const t1 = [];
    const t2 = [];
    stepSchool(flee, { w: 800, h: 600, predators: [{ x: 130, y: 100, kind: "flee" }], rand: noRand, trace: t1 });
    stepSchool(feed, { w: 800, h: 600, predators: [{ x: 130, y: 100, kind: "feed" }], rand: noRand, trace: t2 });
    expect(t1[0].youX).toBeLessThan(0); // pushed left, away
    expect(t2[0].youX).toBeGreaterThan(0); // pulled right, toward
  });

  it("isolated fish with no predators traces zero on every channel", () => {
    const fish = [{ x: 400, y: 300, vx: 1, vy: 0 }];
    const trace = [];
    stepSchool(fish, { w: 800, h: 600, rand: noRand, trace });
    for (const k of FIELDS) expect(trace[0][k]).toBe(0);
  });

  it("reuses trace objects and fully overwrites stale values", () => {
    const fish = [
      { x: 100, y: 100, vx: 0, vy: 1 },
      { x: 106, y: 100, vx: 0, vy: 1 },
    ];
    const trace = [];
    stepSchool(fish, {
      w: 800, h: 600,
      predators: [{ x: 120, y: 100, kind: "flee" }],
      rand: noRand,
      trace,
    });
    expect(Math.hypot(trace[0].sepX, trace[0].sepY)).toBeGreaterThan(0);
    expect(Math.hypot(trace[0].youX, trace[0].youY)).toBeGreaterThan(0);
    const ref0 = trace[0];
    // second step: neighbor teleported far away, predator gone
    fish[1].x = 700;
    fish[1].y = 500;
    stepSchool(fish, { w: 800, h: 600, rand: noRand, trace });
    expect(trace[0]).toBe(ref0); // same object, reused
    expect(trace[0].sepX).toBe(0);
    expect(trace[0].sepY).toBe(0);
    expect(trace[0].youX).toBe(0);
    expect(trace[0].youY).toBe(0);
  });
});
```

- [ ] **Step 2: Run the new tests to verify they fail**

Run: `npx vitest run test/boids.test.js`
Expected: the 5 new tests FAIL (`trace` is ignored, so `trace` stays empty / fields undefined); the existing 9 boids tests still PASS.

- [ ] **Step 3: Implement the trace capture**

In `app/lib/boids.js`, replace the body of the per-fish loop (currently lines 44–114, from `const f = fish[i];` through the speed clamp) so force components accumulate separately and sum at the end. The full replacement for the `stepSchool` function body after the grid build:

```js
  const trace = opts.trace;

  for (let i = 0; i < fish.length; i++) {
    const f = fish[i];
    let sx = 0, sy = 0; // separation
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
            sx -= (dx / d) * push;
            sy -= (dy / d) * push;
          }
        }
      }
    }

    let chx = 0, chy = 0, alx = 0, aly = 0; // cohesion, alignment
    if (n > 0) {
      chx = (cx / n - f.x) * p.cohesionForce;
      chy = (cy / n - f.y) * p.cohesionForce;
      alx = (avx / n - f.vx) * p.alignForce;
      aly = (avy / n - f.vy) * p.alignForce;
    }

    let yx = 0, yy = 0; // net predator/feed influence ("you")
    for (const pr of predators) {
      if (!pr || pr.active === false) continue;
      const px = f.x - pr.x;
      const py = f.y - pr.y;
      const pd2 = px * px + py * py;
      if (pd2 < p.fleeRadius * p.fleeRadius && pd2 > 0.0001) {
        const pd = Math.sqrt(pd2);
        const strength = pr.strength ?? 1;
        if (pr.kind === "feed") {
          const pull = p.feedForce * strength * (1 - pd / p.fleeRadius);
          yx -= (px / pd) * pull;
          yy -= (py / pd) * pull;
        } else {
          const push = p.fleeForce * strength * (1 - pd / p.fleeRadius);
          yx += (px / pd) * push;
          yy += (py / pd) * push;
        }
      }
    }

    if (trace) {
      const t = trace[i] || (trace[i] = {});
      t.sepX = sx; t.sepY = sy;
      t.aliX = alx; t.aliY = aly;
      t.cohX = chx; t.cohY = chy;
      t.youX = yx; t.youY = yy;
    }

    let ax = sx + chx + alx + yx;
    let ay = sy + chy + aly + yy;
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
```

Signature change to make `opts.trace` reachable — the function currently destructures its options; change the declaration line to:

```js
export function stepSchool(fish, opts) {
  const { w, h, predators = [], params, rand = Math.random } = opts;
```

and keep `const p = { ...DEFAULTS, ...params };` and the grid build as-is. Also update the file's header comment (line 1–2) to mention the optional trace, e.g.:

```js
// Pure boids simulation — no DOM. Spatial hash keeps neighbor search O(n)
// per frame (grid cell = perception radius, so neighbors live in 9 cells).
// Pass opts.trace (an array) to capture per-fish force components; omitted,
// the sim does zero extra work.
```

- [ ] **Step 4: Run the full boids suite**

Run: `npx vitest run test/boids.test.js`
Expected: all 14 tests PASS (9 existing + 5 new).

- [ ] **Step 5: Run the whole suite to catch regressions**

Run: `npx vitest run`
Expected: 32 tests PASS (27 existing + 5 new), 0 failures.

- [ ] **Step 6: Commit**

```bash
git add app/lib/boids.js test/boids.test.js
git commit -m "feat(boids): optional trace out-param captures per-fish force components (zero cost when omitted)"
```

---

### Task 2: x-ray color tokens in `readFishColors`

**Files:**
- Modify: `app/lib/fish-colors.js`
- Test: `test/fish-colors.test.js`

**Interfaces:**
- Consumes: existing `readFishColors(getVar)` returning `{ ink, koi, gold, fx, hand }`.
- Produces: same function additionally returning `xsep, xali, xcoh, xyou` (strings), read from `--xray-sep/--xray-ali/--xray-coh/--xray-you` with day-value fallbacks. Task 4 reads `C.xsep`, `C.xali`, `C.xcoh`, `C.xyou`.

- [ ] **Step 1: Update both existing tests to expect the new keys (they use exact `toEqual`)**

Replace the full contents of `test/fish-colors.test.js` with:

```js
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
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run test/fish-colors.test.js`
Expected: both tests FAIL (missing `xsep/xali/xcoh/xyou` keys in the returned object).

- [ ] **Step 3: Add the four tokens**

In `app/lib/fish-colors.js`, extend `TOKENS`:

```js
const TOKENS = {
  ink: ["--fish-ink", "#2e5a5e"],
  koi: ["--fish-koi", "#d1602f"],
  gold: ["--fish-gold", "#c9950c"],
  fx: ["--fx-ink", "rgba(255, 255, 255, 0.9)"],
  hand: ["--f-hand", "cursive"],
  xsep: ["--xray-sep", "#e07b2f"],
  xali: ["--xray-ali", "#2f6fb2"],
  xcoh: ["--xray-coh", "#3f8f5f"],
  xyou: ["--xray-you", "#c2273d"],
};
```

`readFishColors` itself is generic over `TOKENS` — no other change.

- [ ] **Step 4: Run the suite**

Run: `npx vitest run`
Expected: 32 tests PASS, 0 failures.

- [ ] **Step 5: Commit**

```bash
git add app/lib/fish-colors.js test/fish-colors.test.js
git commit -m "feat(fish-colors): read --xray-* tokens with day fallbacks"
```

---

### Task 3: think-scrap button, tokens, and legend CSS

**Files:**
- Modify: `app/content/scraps.js`
- Modify: `app/page.js:6-14` (the `Scrap` component)
- Modify: `app/globals.css` (append at end of file only)

**Interfaces:**
- Consumes: nothing from earlier tasks (pure markup/CSS; the tokens' consumers arrive in Task 4).
- Produces: a `<button type="button" data-scrap="think">` rendered among the scraps (Task 4's pointerdown handler matches `[data-scrap="think"]`); CSS classes `.xray-legend`, `.xd`, `.xd-sep/.xd-ali/.xd-coh/.xd-you` (Task 4's legend JSX uses them); `--xray-*` tokens under `.pond` and `.pond--night`.

- [ ] **Step 1: Add the scrap entry**

In `app/content/scraps.js`, append to the `scraps` array (after the `networking` entry):

```js
  {
    id: "think",
    text: "the school isn't thinking. it's three rules — keep apart, match your neighbours, stay together.",
    fact: "tap this scrap to x-ray their brains",
    side: "left",
    action: "think",
  },
```

- [ ] **Step 2: Teach `Scrap` to render a button when `action` is present**

In `app/page.js`, replace the `Scrap` component with:

```jsx
function Scrap({ text, fact, side, action }) {
  const inner = (
    <>
      <span className="scrap-tape" aria-hidden="true" />
      <span className="scrap-text">{text}</span>
      {fact && <span className="scrap-fact">{fact}</span>}
    </>
  );
  if (action) {
    return (
      <button type="button" className={`scrap scrap-${side}`} data-scrap={action}>
        {inner}
      </button>
    );
  }
  return <div className={`scrap scrap-${side}`}>{inner}</div>;
}
```

Note the `<p>` → `<span>` swap for text/fact: `<p>` is not valid inside `<button>`, and the CSS added in Step 3 gives both classes `display: block` so nothing moves visually.

- [ ] **Step 3: Append the CSS**

At the very end of `app/globals.css`, append:

```css
/* ---------- fish-brain x-ray ---------- */
.pond {
  --xray-sep: #e07b2f;
  --xray-ali: #2f6fb2;
  --xray-coh: #3f8f5f;
  --xray-you: #c2273d;
}
.pond--night {
  --xray-sep: #ffa25c;
  --xray-ali: #6db8ff;
  --xray-coh: #6fe0a8;
  --xray-you: #ff6b81;
}
/* scrap text was <p>, now <span> so it can live inside the think-button */
.scrap-text,
.scrap-fact {
  display: block;
}
button.scrap {
  appearance: none;
  -webkit-appearance: none;
  text-align: left;
  cursor: pointer;
}
.xray-legend {
  position: fixed;
  left: 18px;
  bottom: 56px; /* stacked above the feed toggle (left/bottom 18px) */
  z-index: 2;
  font-family: var(--f-mono);
  font-size: 11px;
  letter-spacing: 0.04em;
  color: var(--muted);
}
.xray-legend .xd {
  display: inline-block;
  width: 7px;
  height: 7px;
  border-radius: 50%;
}
.xd-sep { background: var(--xray-sep); }
.xd-ali { background: var(--xray-ali); }
.xd-coh { background: var(--xray-coh); }
.xd-you { background: var(--xray-you); }
```

- [ ] **Step 4: Verify build and lint**

Run: `npx next build 2>&1 | tail -5 && npx next lint`
Expected: build succeeds; lint reports no new errors. The scrap renders (visual check happens in Task 5's human pass); tapping it does nothing yet — the handler arrives in Task 4.

- [ ] **Step 5: Run the test suite (no regressions)**

Run: `npx vitest run`
Expected: 32 tests PASS.

- [ ] **Step 6: Commit**

```bash
git add app/content/scraps.js app/page.js app/globals.css
git commit -m "feat(playground): think-scrap button + scoped --xray-* tokens and legend styles"
```

---

### Task 4: FishCanvas x-ray mode

**Files:**
- Modify: `app/components/FishCanvas.jsx`

**Interfaces:**
- Consumes: Task 1's `stepSchool(fish, { …, trace })` writing `sepX…youY`; Task 2's `readFishColors` keys `xsep/xali/xcoh/xyou`; Task 3's `[data-scrap="think"]` button and `.xray-legend`/`.xd-*` classes.
- Produces: the finished feature; nothing downstream.

- [ ] **Step 1: Add the state, ref, and legend JSX**

In `app/components/FishCanvas.jsx`:

1. Next to the existing `feeding` state (line ~18), add:

```js
  const [xray, setXray] = useState(false);
  const xrayRef = useRef(false);
```

(No mirror effect: `xrayRef` is written synchronously in `toggleXray` — event scope, never inside a state updater, which StrictMode double-invokes.)

2. In the returned JSX, after the `night-note` span, add:

```jsx
      {xray && (
        <span className="xray-legend" aria-hidden="true">
          <i className="xd xd-sep" /> separation · <i className="xd xd-ali" /> alignment ·{" "}
          <i className="xd xd-coh" /> cohesion · <i className="xd xd-you" /> you
        </span>
      )}
```

- [ ] **Step 2: Wire the toggle inside the main effect**

Inside the main `useEffect` (the one with `[]` deps):

1. Alongside the other per-mount arrays (`taps`, `ripples`, …), add (zero-initialized so a draw can never see `undefined` fields — `Math.hypot(undefined)` is `NaN` and would slip past the `< 0.01` skip):

```js
    const trace = Array.from({ length: COUNT }, () => ({
      sepX: 0, sepY: 0, aliX: 0, aliY: 0, cohX: 0, cohY: 0, youX: 0, youY: 0,
    }));
```

2. Below `currentPredators`, add the toggle helper (side effects in event scope; the reduced-motion single-frame redraw lives here):

```js
    function toggleXray() {
      const on = !xrayRef.current;
      xrayRef.current = on;
      setXray(on);
      if (reduced) {
        // static frame: one traced step so the arrows appear/disappear
        stepSchool(fish, { w: W, h: H, predators: [], trace: on ? trace : undefined });
        draw(Date.now());
      }
    }
```

3. In `onKeyDown`, after the `bus` check, add:

```js
      if (keyBuffer.endsWith("think")) toggleXray();
```

4. In `onPointerDown`, make the think-scrap check the first thing in the function (before `onPointerMove(e)` and before the interactive-element early return):

```js
    function onPointerDown(e) {
      if (e.target.closest('[data-scrap="think"]')) {
        toggleXray();
        return;
      }
      onPointerMove(e);
      if (e.target.closest("a, button, .pg-card, .scrap")) return;
      // …rest unchanged
```

5. In `frame()`, pass the trace to the sim — replace the `stepSchool` call with:

```js
        stepSchool(fish, {
          w: W,
          h: H,
          predators: currentPredators(now),
          params: nightRef.current ? NIGHT_PARAMS : undefined,
          trace: xrayRef.current ? trace : undefined,
        });
```

- [ ] **Step 3: Draw the arrows as a second pass**

In `draw(now)`, immediately after the `for (let i = 0; i < fish.length; i++) { … }` fish-body loop closes (before the ripples section), add:

```js
      // fish-brain x-ray: decision vectors on top of the school
      if (xrayRef.current) {
        ctx.globalAlpha = 0.85;
        ctx.lineWidth = 1.2;
        const seg = (x, y, dx, dy, color) => {
          const mag = Math.hypot(dx, dy);
          if (mag < 0.01) return;
          const len = Math.min(18, 22 * Math.sqrt(mag));
          ctx.strokeStyle = color;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + (dx / mag) * len, y + (dy / mag) * len);
          ctx.stroke();
        };
        for (let i = 0; i < fish.length; i++) {
          const f = fish[i];
          const t = trace[i];
          seg(f.x, f.y, t.sepX, t.sepY, C.xsep);
          seg(f.x, f.y, t.aliX, t.aliY, C.xali);
          seg(f.x, f.y, t.cohX, t.cohY, C.xcoh);
          seg(f.x, f.y, t.youX, t.youY, C.xyou);
        }
        ctx.lineWidth = 2.2;
      }
```

The zero-initialization in Step 2.1 matters here: `frame()` always steps before drawing and the reduced-motion path steps inside `toggleXray`, so traced draws normally follow traced steps — but zeros make even a missed edge draw nothing instead of `NaN` geometry.

- [ ] **Step 4: Full verification**

Run: `npx vitest run && npx next build 2>&1 | tail -5 && npx next lint`
Expected: 32 tests PASS; build succeeds; no new lint errors.

- [ ] **Step 5: Commit**

```bash
git add app/components/FishCanvas.jsx
git commit -m "feat(playground): fish-brain x-ray — think toggle draws live decision vectors from the sim trace"
```

---

### Task 5: devlog + push

**Files:**
- Modify: `devlog.md` (append)

- [ ] **Step 1: Append the devlog entry**

Append to `devlog.md`:

```markdown
## 2026-07-15 — fish-brain x-ray

- stepSchool now takes an optional `trace` array and fills per-fish force components
  (sep/ali/coh/you) — zero cost when omitted, so the force math stays single-source.
- new think-scrap (a real <button>) and secret word `think` toggle an overlay drawing
  each fish's four decision vectors, sqrt-scaled, capped 18px. legend pill bottom-left.
- the "flee" channel is labeled "you" because feed mode makes the cursor attract —
  the arrow is your influence, not always fear.
```

- [ ] **Step 2: Commit and push**

```bash
git add devlog.md
git commit -m "chore: devlog for fish-brain x-ray session"
git push
```

Expected: push succeeds; `git status` clean (except the pre-existing untracked `public/cat-peeking-right.jpg`, which stays).

---

## Post-plan human gates (not tasks)

- Browser pass: overlay on/off via scrap tap and typing `think`; flee vectors bloom away from cursor; feed mode flips them toward; both skins (force `useNightMode` true to preview night); 375px; reduced-motion single-frame toggle; legend contrast at night; `/about` pixel-identical.
