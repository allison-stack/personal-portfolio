# Polaroid Drift Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Polaroid photos drift on the pond homepage among the fish; clicking one lifts it out of the water (enlarged, captioned, with a faint shadow left on the water), and dropping it back splashes and scatters the school.

**Architecture:** A pure, DOM-free drift stepper (`app/lib/drift.js`, the `boids.js` pattern) moves 4 visible polaroids from a 9-photo pool; a client component (`Polaroids.jsx`) renders them as real DOM buttons and applies transforms in a rAF with zero React re-renders while drifting. The drop splash reuses FishCanvas's existing taps/ripples arrays via a `splashRef` handed out of its effect (the `toggleXrayRef` pattern). Spec: `docs/superpowers/specs/2026-07-17-polaroid-drift-design.md`.

**Tech Stack:** Next.js 15 / React 19, plain CSS in `app/globals.css`, `next/image`, vitest 4, `sharp` (devDependency, asset prep only).

## Global Constraints

- All new CSS is scoped under `.pond` — `/about` must not change (pond-water-theme invariant).
- Z-order: water < caustics < fish canvas < polaroids < `.pg` cards < pills (`.feed-toggle`, z-index 2) < held polaroid (z-index 10).
- No new runtime dependencies; `sharp` is dev-only. No paid APIs.
- Commits: conventional prefix with the reason in parentheses when non-obvious. **No Co-Authored-By / AI attribution trailer.**
- `IMG_5500.jpg` (screenshot of someone else's Reddit post) must NOT ship — deleted, never renamed.
- Shipped images must be ≤1200px on the long edge and carry **no EXIF/GPS metadata** (raw iPhone exports have location data; the prep script's `sharp` pipeline strips metadata by default — do not call `.withMetadata()`).
- Caption copy in `app/content/polaroids.js` is drafted in-repo but is **Allison's voice — she reviews/rewrites every caption at QA before this deploys**.
- Test command: `npx vitest run test/drift.test.js` (all tests: `npm test`).

---

### Task 1: Asset prep — rename, downscale, strip metadata, content file

**Files:**
- Create: `scripts/prep-polaroids.mjs`
- Create: `app/content/polaroids.js`
- Delete: `public/IMG_4658.jpg` … `public/IMG_6792.jpg` (all 10 `IMG_*.jpg`, including `IMG_5500.jpg`)
- Create: `public/polaroid-*.jpg` (9 files, named in step 1)

**Interfaces:**
- Consumes: nothing.
- Produces: `POLAROIDS` — `export const POLAROIDS = [{ src: "/polaroid-<name>.jpg", alt: string, caption: string }]` (9 entries). Task 4's component maps over exactly this array.

- [ ] **Step 1: Look at every photo and choose names**

Use the Read tool on each of the 9 files below and pick a short kebab-case name describing the subject, plus a one-line `alt` (literal description) and a draft `caption` (Allison's tone: lowercase, concrete, warm — see `app/content/scraps.js` for the voice). Three are already known from brainstorming:

| Source | Known content | Name |
|---|---|---|
| `IMG_4658.jpg` | lakeside selfie, sunglasses + cap, Lake Ontario | `polaroid-lake-ontario.jpg` |
| `IMG_6063.jpg` | deadpan selfie holding a plush taco in a grocery aisle | `polaroid-taco.jpg` |
| `IMG_6792.jpg` | white daisies from above | `polaroid-daisies.jpg` |
| `IMG_5116.jpg`, `IMG_5262.jpg`, `IMG_5712.jpg`, `IMG_5814.jpg`, `IMG_6078.jpg`, `IMG_6290.jpg` | view and name | `polaroid-<subject>.jpg` |

`IMG_5500.jpg` is NOT on this list — it is deleted in step 5 and never processed.

- [ ] **Step 2: Install sharp and write the prep script**

Run: `npm install --save-dev sharp`

Create `scripts/prep-polaroids.mjs` (fill `MAP` with the names from step 1):

```js
// One-off: turn raw iPhone exports into shippable polaroid assets.
// sharp strips EXIF (incl. GPS) by default; .rotate() bakes in the EXIF
// orientation first so portrait shots don't come out sideways.
import sharp from "sharp";

const MAP = {
  "IMG_4658.jpg": "polaroid-lake-ontario.jpg",
  "IMG_6063.jpg": "polaroid-taco.jpg",
  "IMG_6792.jpg": "polaroid-daisies.jpg",
  // ...6 more from step 1
};

for (const [src, dest] of Object.entries(MAP)) {
  const out = await sharp(`public/${src}`)
    .rotate()
    .resize({ width: 1200, height: 1200, fit: "inside" })
    .jpeg({ quality: 75, mozjpeg: true })
    .toFile(`public/${dest}`);
  console.log(`${dest}: ${out.width}x${out.height}, ${(out.size / 1024).toFixed(0)} KB`);
}
```

- [ ] **Step 3: Run it**

Run: `node scripts/prep-polaroids.mjs`
Expected: 9 lines, every dimension ≤1200, sizes roughly 80–300 KB.

- [ ] **Step 4: Verify metadata is gone**

Run:

```bash
node -e "import('sharp').then(async ({default: sharp}) => { for (const f of (await import('node:fs')).readdirSync('public').filter(f => f.startsWith('polaroid-'))) { const m = await sharp('public/' + f).metadata(); console.log(f, m.width + 'x' + m.height, 'exif:', m.exif ? 'PRESENT' : 'none'); } })"
```

Expected: 9 lines, all `exif: none`. If any says PRESENT, the script has a `.withMetadata()` call that must be removed.

- [ ] **Step 5: Delete the originals (all 10, including the Reddit screenshot)**

Run: `rm public/IMG_*.jpg && ls public/`
Expected: only `Allison-Zhao-Resume.pdf`, `cat-peeking-right.jpg`, `profile-photo.jpg`, and 9 `polaroid-*.jpg` remain.

- [ ] **Step 6: Write the content file**

Create `app/content/polaroids.js` — one entry per photo, real alt text from step 1, draft captions **each prefixed `DRAFT:`** so the QA step can't miss them:

```js
// Polaroids drifting on the pond. src/alt are stable; captions are
// Allison's voice — every line below is a DRAFT until she rewrites or
// approves it at QA (grep DRAFT: must return nothing before deploy).
export const POLAROIDS = [
  { src: "/polaroid-daisies.jpg", alt: "a patch of white daisies seen from above", caption: "DRAFT: daisies on the walk home" },
  { src: "/polaroid-lake-ontario.jpg", alt: "selfie in sunglasses and a cap by lake ontario", caption: "DRAFT: first warm day at the lake" },
  { src: "/polaroid-taco.jpg", alt: "deadpan selfie holding a plush taco in a grocery aisle", caption: "DRAFT: he followed me home" },
  // ...6 more, same shape
];
```

- [ ] **Step 7: Commit**

```bash
git add scripts/prep-polaroids.mjs app/content/polaroids.js public/ package.json package-lock.json
git commit -m "feat(playground): polaroid assets — 9 photos downscaled + EXIF-stripped (raw iphone exports carried GPS; reddit screenshot cut)"
```

---

### Task 2: Pure drift module (TDD)

**Files:**
- Create: `app/lib/drift.js`
- Test: `test/drift.test.js`

**Interfaces:**
- Consumes: nothing.
- Produces (Task 4 relies on these exact names):

```js
export const VISIBLE = 4;        // floats on screen at once
export const CURRENT_PXS = 8;    // shared current speed, px/s
export const WANDER_PXS = 3;     // wander amplitude, px/s
export const ROT_RADS = 0.02;    // max |spin|, rad/s
export const WRAP_MARGIN = 90;   // px past an edge before wrapping
export const DRIFT_W = 120;      // drifting polaroid width in px (CSS mirrors this)

export function createDrift(poolSize, w, h, rand = Math.random)
// → { floats, nextI, cur, t, poolSize }
//   floats: VISIBLE × { i, x, y, rot, vx, vy, vrot, phase }
//     i = pool photo index; floats start showing photos 0..VISIBLE-1
//   nextI: VISIBLE % poolSize   cur: {vx, vy} shared current, |cur| = CURRENT_PXS
//   t: 0 (accumulated seconds)

export function stepDrift(state, { w, h, dt, held = -1 })
// dt in SECONDS. Mutates state. The float at index `held` is frozen.
// A float fully past an edge + WRAP_MARGIN re-enters from the opposite
// edge showing photo state.nextI; nextI then advances to the next pool
// index not currently visible (cycling mod poolSize).
// Returns the array of float indexes whose photo swapped this call.
```

- [ ] **Step 1: Write the failing tests**

Create `test/drift.test.js`:

```js
import { describe, it, expect } from "vitest";
import {
  createDrift, stepDrift,
  VISIBLE, CURRENT_PXS, ROT_RADS, WRAP_MARGIN, DRIFT_W,
} from "../app/lib/drift.js";

const noRand = () => 0.5;

function step(state, opts = {}) {
  return stepDrift(state, { w: 800, h: 600, dt: 0.016, ...opts });
}

describe("createDrift", () => {
  it("creates VISIBLE floats in bounds, showing distinct photos 0..VISIBLE-1", () => {
    const s = createDrift(9, 800, 600, noRand);
    expect(s.floats).toHaveLength(VISIBLE);
    expect(s.floats.map((f) => f.i).sort()).toEqual([0, 1, 2, 3]);
    expect(s.nextI).toBe(VISIBLE % 9);
    for (const f of s.floats) {
      expect(f.x).toBeGreaterThanOrEqual(0);
      expect(f.x).toBeLessThanOrEqual(800);
      expect(f.y).toBeGreaterThanOrEqual(0);
      expect(f.y).toBeLessThanOrEqual(600);
      expect(Math.abs(f.vrot)).toBeLessThanOrEqual(ROT_RADS);
    }
  });

  it("the shared current has speed CURRENT_PXS", () => {
    const s = createDrift(9, 800, 600, noRand);
    expect(Math.hypot(s.cur.vx, s.cur.vy)).toBeCloseTo(CURRENT_PXS, 5);
  });
});

describe("stepDrift", () => {
  it("drifts a float with the current over time", () => {
    const s = createDrift(9, 800, 600, noRand);
    const f = s.floats[0];
    const x0 = f.x, y0 = f.y;
    for (let k = 0; k < 100; k++) step(s); // 1.6s
    const dist = Math.hypot(f.x - x0, f.y - y0);
    expect(dist).toBeGreaterThan(4);   // it moved…
    expect(dist).toBeLessThan(40);     // …but slowly (current ≈ 8 px/s)
  });

  it("a held float does not move or rotate", () => {
    const s = createDrift(9, 800, 600, noRand);
    const f = s.floats[2];
    const { x, y, rot } = f;
    for (let k = 0; k < 50; k++) step(s, { held: 2 });
    expect(f.x).toBe(x);
    expect(f.y).toBe(y);
    expect(f.rot).toBe(rot);
  });

  it("wraps a float past edge+margin to the opposite side and swaps its photo", () => {
    const s = createDrift(9, 800, 600, noRand);
    const f = s.floats[1];
    f.x = 800 + WRAP_MARGIN + 1; // fully off the right edge
    const swapped = step(s);
    expect(swapped).toEqual([1]);
    expect(f.x).toBeLessThan(0);       // came back in from the left
    expect(f.i).toBe(4);               // nextI at creation time
    expect(s.nextI).toBe(5);
  });

  it("never swaps to a photo that is currently visible", () => {
    const s = createDrift(5, 800, 600, noRand); // pool barely bigger than VISIBLE
    for (let n = 0; n < 20; n++) {
      s.floats[0].x = 800 + WRAP_MARGIN + 1;
      step(s);
      const shown = s.floats.map((f) => f.i);
      expect(new Set(shown).size).toBe(VISIBLE); // all distinct ⇒ no dupes
    }
  });

  it("cycles through the whole pool", () => {
    const s = createDrift(9, 800, 600, noRand);
    const seen = new Set(s.floats.map((f) => f.i));
    for (let n = 0; n < 12; n++) {
      s.floats[0].x = -(WRAP_MARGIN + DRIFT_W + 1); // off the left edge
      step(s);
      seen.add(s.floats[0].i);
    }
    expect(seen.size).toBe(9); // every photo got its turn
  });

  it("no wrap, no swap: returns an empty array", () => {
    const s = createDrift(9, 800, 600, noRand);
    expect(step(s)).toEqual([]);
  });
});
```

- [ ] **Step 2: Run to verify they fail**

Run: `npx vitest run test/drift.test.js`
Expected: FAIL — `Cannot find module '../app/lib/drift.js'` (or equivalent).

- [ ] **Step 3: Implement the module**

Create `app/lib/drift.js`:

```js
// Polaroids drifting on the pond surface. Pure and DOM-free like boids.js:
// the component owns the DOM, this owns the motion. dt is in seconds.
export const VISIBLE = 4;
export const CURRENT_PXS = 8;
export const WANDER_PXS = 3;
export const ROT_RADS = 0.02;
export const WRAP_MARGIN = 90;
export const DRIFT_W = 120;

export function createDrift(poolSize, w, h, rand = Math.random) {
  const a = rand() * Math.PI * 2; // current direction, fixed per visit
  const floats = Array.from({ length: VISIBLE }, (_, k) => ({
    i: k,
    x: rand() * w,
    y: rand() * h,
    rot: (rand() - 0.5) * 0.3,
    vx: 0,
    vy: 0,
    vrot: (rand() - 0.5) * 2 * ROT_RADS,
    phase: k * 2.399 + rand() * Math.PI * 2, // golden-angle spread
  }));
  return {
    floats,
    nextI: VISIBLE % poolSize,
    cur: { vx: Math.cos(a) * CURRENT_PXS, vy: Math.sin(a) * CURRENT_PXS },
    t: 0,
    poolSize,
  };
}

// perpendicular wander around the shared current, so the photos meander
// instead of marching in formation
function wander(state, f) {
  const m = Math.hypot(state.cur.vx, state.cur.vy) || 1;
  const px = -state.cur.vy / m;
  const py = state.cur.vx / m;
  const wv = Math.sin(state.t * 0.6 + f.phase) * WANDER_PXS;
  return { wx: px * wv, wy: py * wv };
}

function swapPhoto(state, f) {
  f.i = state.nextI;
  const shown = new Set(state.floats.map((g) => g.i));
  let next = (state.nextI + 1) % state.poolSize;
  for (let guard = 0; shown.has(next) && guard < state.poolSize; guard++) {
    next = (next + 1) % state.poolSize;
  }
  state.nextI = next;
}

export function stepDrift(state, { w, h, dt, held = -1 }) {
  state.t += dt;
  const swapped = [];
  for (let k = 0; k < state.floats.length; k++) {
    if (k === held) continue;
    const f = state.floats[k];
    const { wx, wy } = wander(state, f);
    f.vx = state.cur.vx + wx;
    f.vy = state.cur.vy + wy;
    f.x += f.vx * dt;
    f.y += f.vy * dt;
    f.rot += f.vrot * dt;

    let wrapped = false;
    if (f.x > w + WRAP_MARGIN) { f.x = -DRIFT_W; wrapped = true; }
    else if (f.x < -(WRAP_MARGIN + DRIFT_W)) { f.x = w; wrapped = true; }
    if (f.y > h + WRAP_MARGIN) { f.y = -DRIFT_W; wrapped = true; }
    else if (f.y < -(WRAP_MARGIN + DRIFT_W)) { f.y = h; wrapped = true; }

    if (wrapped) {
      swapPhoto(state, f);
      swapped.push(k);
    }
  }
  return swapped;
}
```

- [ ] **Step 4: Run to verify they pass**

Run: `npx vitest run test/drift.test.js`
Expected: PASS, 8 tests.
Then run the whole suite to prove nothing else broke: `npm test` → all existing tests still pass (27 before this task).

- [ ] **Step 5: Commit**

```bash
git add app/lib/drift.js test/drift.test.js
git commit -m "feat(drift): pure polaroid drift stepper — rotating 4-of-9 pool, wrap+swap at edges"
```

---

### Task 3: Splash hook out of FishCanvas

**Files:**
- Modify: `app/components/FishCanvas.jsx` (prop + ~10 lines inside the main effect)
- Modify: `app/components/PondTheme.jsx`

**Interfaces:**
- Consumes: FishCanvas's private `taps` / `ripples` arrays and `TAP_TTL_MS` (already in the file).
- Produces: `splashRef.current(x, y)` — callable from any sibling; pushes a strength-2 flee predator + ripple at `(x, y)`. No-op before mount, after unmount, and under reduced motion. PondTheme owns the ref and will pass it to `<Polaroids splashRef={...} />` in Task 4.

- [ ] **Step 1: Thread the prop and extend the taps entries**

In `app/components/FishCanvas.jsx`:

1. Signature: `export function FishCanvas({ night = false, splashRef = null })`.
2. In `currentPredators`, honor per-tap strength (taps today are implicit 1.5):

```js
for (const t of taps) {
  if (t.until > now) list.push({ x: t.x, y: t.y, kind: "flee", strength: t.strength ?? 1.5 });
}
```

3. Inside the main `useEffect`, right after `toggleXrayRef.current = toggleXray;`, hand out the splash function the same way:

```js
// polaroid drops splash through the same taps/ripples plumbing as
// tap-the-glass; strength 2 per the drift spec (taps are 1.5)
if (splashRef) {
  splashRef.current = (x, y) => {
    if (reduced) return;
    const now = Date.now();
    taps.push({ x, y, until: now + TAP_TTL_MS, strength: 2 });
    ripples.push({ x, y, start: now });
  };
}
```

4. In the effect's cleanup, alongside `toggleXrayRef.current = null;` add:

```js
if (splashRef) splashRef.current = null;
```

- [ ] **Step 2: Create the ref in PondTheme**

Replace `app/components/PondTheme.jsx` content with:

```jsx
"use client";

import { useRef } from "react";
import { FishCanvas } from "./FishCanvas";
import { useNightMode } from "../hooks/useNightMode";

// single owner of the night check: the theme class and the canvas must flip
// together, so night is decided here and passed down
export function PondTheme({ children }) {
  const night = useNightMode();
  // bridge: FishCanvas fills this inside its effect; Polaroids (task 4)
  // calls it on drop. A ref, not state — no re-render on splash.
  const splashRef = useRef(null);
  return (
    <div className={night ? "pond pond--night" : "pond"}>
      <div className="water" aria-hidden="true" />
      <FishCanvas night={night} splashRef={splashRef} />
      {children}
    </div>
  );
}
```

(`<Polaroids splashRef={splashRef} />` is added between FishCanvas and `{children}` in Task 4 — not now, the component doesn't exist yet.)

- [ ] **Step 3: Verify nothing regressed**

Run: `npm test` → all pass. Run: `npm run lint` → clean.
Functional proof of the splash arrives with Task 4's browser QA (drop → ripple + scatter); there is no component-level test rig in this repo.

- [ ] **Step 4: Commit**

```bash
git add app/components/FishCanvas.jsx app/components/PondTheme.jsx
git commit -m "feat(playground): splashRef hands tap/ripple plumbing out of FishCanvas (polaroid drops reuse it at strength 2)"
```

---

### Task 4: Polaroids component, CSS, and mount

**Files:**
- Create: `app/components/Polaroids.jsx`
- Modify: `app/components/PondTheme.jsx` (mount)
- Modify: `app/globals.css` (append the polaroid block + the `.pg` pointer-events fix)

**Interfaces:**
- Consumes: `POLAROIDS` (Task 1), `createDrift`/`stepDrift`/constants (Task 2), `splashRef` (Task 3).
- Produces: `<Polaroids splashRef={ref} />` — self-contained; no other component reads from it.

- [ ] **Step 1: Write the component**

Create `app/components/Polaroids.jsx`:

```jsx
"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { POLAROIDS } from "../content/polaroids";
import { createDrift, stepDrift, DRIFT_W, VISIBLE } from "../lib/drift";

const DROP_MS = 500; // keep in sync with the .polaroid--dropping transition

export function Polaroids({ splashRef }) {
  const stateRef = useRef(null);
  const nodesRef = useRef([]);
  // slots re-render only on photo swap / pick-up — drifting is pure rAF
  const [slots, setSlots] = useState(() => Array.from({ length: VISIBLE }, (_, k) => k));
  const [held, setHeld] = useState(-1);
  const [dropping, setDropping] = useState(-1);
  const heldRef = useRef(-1);
  const droppingRef = useRef(-1);
  heldRef.current = held;
  droppingRef.current = dropping;

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const state = createDrift(POLAROIDS.length, window.innerWidth, window.innerHeight);
    stateRef.current = state;

    function apply() {
      for (let k = 0; k < state.floats.length; k++) {
        if (k === heldRef.current || k === droppingRef.current) continue;
        const el = nodesRef.current[k];
        const f = state.floats[k];
        if (el) el.style.transform = `translate(${f.x}px, ${f.y}px) rotate(${f.rot}rad)`;
      }
    }

    apply(); // static scatter is the whole show under reduced motion
    if (reduced) return;

    let last = performance.now();
    let raf = 0;
    function frame(now) {
      if (!document.hidden) {
        const dt = Math.min((now - last) / 1000, 0.1); // clamp tab-return jumps
        const swapped = stepDrift(state, {
          w: window.innerWidth,
          h: window.innerHeight,
          dt,
          held: heldRef.current >= 0 ? heldRef.current : droppingRef.current,
        });
        if (swapped.length) setSlots(state.floats.map((f) => f.i));
        apply();
      }
      last = now;
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Esc drops, like closing anything
  useEffect(() => {
    if (held < 0) return;
    const onKey = (e) => e.key === "Escape" && drop();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  function pickUp(k) {
    const el = nodesRef.current[k];
    // clear the rAF's inline transform so the CSS-centered held state wins
    if (el) el.style.transform = "";
    setHeld(k);
  }

  function drop() {
    const k = heldRef.current;
    if (k < 0) return;
    const f = stateRef.current.floats[k];
    if (splashRef?.current) splashRef.current(f.x + DRIFT_W / 2, f.y + DRIFT_W * 0.6);
    const el = nodesRef.current[k];
    if (el) el.style.transform = `translate(${f.x}px, ${f.y}px) rotate(${f.rot}rad)`;
    setHeld(-1);
    setDropping(k);
    setTimeout(() => setDropping(-1), DROP_MS);
  }

  // the water shadow lingers through the drop so it can fade out with it
  const shadowSlot = held >= 0 ? held : dropping;
  const shadowFloat = shadowSlot >= 0 ? stateRef.current?.floats[shadowSlot] : null;

  return (
    <div className="polaroids">
      {held >= 0 && <div className="polaroid-backdrop" onClick={drop} />}
      {shadowFloat && (
        <span
          className={held >= 0 ? "polaroid-shadow" : "polaroid-shadow polaroid-shadow--out"}
          aria-hidden="true"
          style={{
            transform: `translate(${shadowFloat.x + DRIFT_W * 0.2}px, ${shadowFloat.y + DRIFT_W * 0.7}px)`,
          }}
        />
      )}
      {slots.map((poolIdx, k) => {
        const p = POLAROIDS[poolIdx];
        const cls =
          k === held
            ? "polaroid polaroid--held"
            : k === dropping
              ? "polaroid polaroid--dropping"
              : "polaroid";
        return (
          <button
            key={k}
            type="button"
            className={cls}
            ref={(el) => (nodesRef.current[k] = el)}
            onClick={() => (k === held ? drop() : pickUp(k))}
            aria-label={k === held ? `put the photo down: ${p.alt}` : `pick up a photo: ${p.alt}`}
          >
            <span className="polaroid-img">
              <Image src={p.src} alt="" fill sizes="420px" style={{ objectFit: "cover" }} />
            </span>
            <span className="polaroid-cap">{p.caption}</span>
          </button>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Mount it in PondTheme**

In `app/components/PondTheme.jsx`, add the import and mount between the canvas and the children (later sibling ⇒ paints above the canvas; z-index keeps it under `.pg`):

```jsx
import { Polaroids } from "./Polaroids";
// …
      <FishCanvas night={night} splashRef={splashRef} />
      <Polaroids splashRef={splashRef} />
      {children}
```

- [ ] **Step 3: Append the CSS**

In `app/globals.css`, after the `.pond` theme section (end of file is fine — everything here is `.pond`-scoped or new classes used only on the pond page):

```css
/* ---------- polaroid drift ---------- */
/* the page shell spans the viewport above the water layer and would swallow
   every click meant for a polaroid — punch through it, re-enable the column.
   the pills are position:fixed outside .pg and keep their own events. */
.pond .pg { pointer-events: none; }
.pond .pg-col { pointer-events: auto; }

.polaroids {
  position: fixed;
  inset: 0;
  z-index: 0; /* above the canvas (later sibling), below .pg (z-index 1) */
  pointer-events: none;
}
.polaroid {
  position: absolute;
  left: 0;
  top: 0;
  width: 120px; /* = DRIFT_W in app/lib/drift.js */
  padding: 6px 6px 22px;
  background: #fdfcf8;
  border: 1px solid var(--line);
  border-radius: 2px;
  box-shadow: 0 3px 10px rgba(34, 29, 22, 0.18);
  pointer-events: auto;
  cursor: pointer;
  will-change: transform;
}
.polaroid-img {
  display: block;
  position: relative;
  aspect-ratio: 1;
  overflow: hidden;
  background: #e8e4da;
}
.polaroid-cap {
  display: none;
  font-family: var(--f-hand);
  font-size: 19px;
  color: var(--ink);
  padding-top: 8px;
  text-align: center;
}
.polaroid--held {
  /* centered purely via transform — translate % is the element's own box.
     never left/top: those don't transition out through --dropping and
     would snap half a viewport on drop while transform animates */
  transform: translate(calc(50vw - 50%), calc(50vh - 50%)) rotate(0rad);
  width: min(420px, 80vw);
  padding-bottom: 10px;
  z-index: 10; /* out of the water, above the cards */
  box-shadow: 0 18px 50px rgba(34, 29, 22, 0.35);
  cursor: zoom-out;
  transition: transform 0.45s cubic-bezier(0.2, 0.8, 0.2, 1), width 0.45s cubic-bezier(0.2, 0.8, 0.2, 1);
}
.polaroid--held .polaroid-cap {
  display: block;
}
.polaroid--dropping {
  transition: transform 0.5s ease, width 0.5s ease; /* = DROP_MS */
}
.polaroid-backdrop {
  position: fixed;
  inset: 0;
  z-index: 9;
  pointer-events: auto;
}
/* the faint shadow the lifted photo leaves on the water — Allison's ask */
.polaroid-shadow {
  position: absolute;
  width: 72px;
  height: 26px;
  border-radius: 50%;
  background: rgba(18, 58, 62, 0.15);
  filter: blur(10px);
  pointer-events: none;
  animation: polaroid-shadow-in 0.45s ease, polaroid-sway 2.4s ease-in-out infinite alternate;
}
.polaroid-shadow--out {
  animation: polaroid-shadow-in 0.5s ease reverse forwards; /* = DROP_MS */
}
@keyframes polaroid-shadow-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes polaroid-sway {
  from { margin-top: -2px; }
  to { margin-top: 2px; }
}
.pond--night .polaroid {
  opacity: 0.55; /* dim with the fish */
}
.pond--night .polaroid--held {
  opacity: 1; /* lifted out of the dark water, readable */
}
@media (max-width: 640px) {
  .polaroid { width: 90px; padding-bottom: 16px; }
}
@media (prefers-reduced-motion: reduce) {
  .polaroid--held,
  .polaroid--dropping { transition: none; animation: polaroid-shadow-in 0.3s ease; } /* fade, no fly-to-center */
  .polaroid-shadow { display: none; }
}
```

- [ ] **Step 4: Verify in the browser**

Run: `npm run dev`, open `http://localhost:3000`. Check, in order:

1. 4 polaroids drift slowly, tilted, spinning almost imperceptibly; fish swim under them.
2. Cards, links, fact-lab chips, and both pills still click (pointer-events fix didn't break the column).
3. Tapping open water still ripples + scatters (window-level taps unaffected).
4. Click a polaroid → it flies to center, straightens, grows, caption appears; a soft blurred shadow sways on the water where it was.
5. Click it again / click outside / press Esc → it returns, splash ripple fires at its water spot, nearby fish flee.
6. Wait for one to cross an edge → it re-enters opposite side with a different photo.
7. DevTools device toolbar (390px wide): polaroids are 90px, tap to pick up / drop works.
8. DevTools → Rendering → emulate `prefers-reduced-motion`: static scatter, no drift, click still enlarges, no splash, no shadow.
9. Console: zero errors; Performance tab shows no per-frame React renders while drifting.

- [ ] **Step 5: Run checks and commit**

Run: `npm test && npm run lint` → all pass, clean.

```bash
git add app/components/Polaroids.jsx app/components/PondTheme.jsx app/globals.css
git commit -m "feat(playground): polaroid drift — photos float among the fish, click lifts, drop splashes the school"
```

---

### Task 5: QA gate, captions, build, ship

**Files:**
- Modify: `app/content/polaroids.js` (Allison's caption pass)
- Modify: `devlog.md`

- [ ] **Step 1: Caption review gate (Allison, not the implementer)**

Show Allison every entry in `app/content/polaroids.js` next to its photo. She rewrites or approves each caption; remove every `DRAFT:` prefix as she signs off.
Gate: `grep DRAFT: app/content/polaroids.js` → no output. **Do not deploy before this is empty.**

- [ ] **Step 2: Night-mode spot check**

In `app/hooks/useNightMode.js` temporarily hard-code `setNight(true)` (do not commit), reload: polaroids dim to 0.55, held photo goes full opacity, glass cards / glowing koi unaffected. Revert.

- [ ] **Step 3: Production build**

Run: `npm run build`
Expected: clean build, no image or lint errors.

- [ ] **Step 4: Devlog + commit + push**

Append to `devlog.md` under a `## 2026-07-17 — polaroid drift` heading: what shipped (4-of-9 drifting pool, pick-up/drop, water shadow), the pointer-events gotcha (`.pg` was swallowing water-layer clicks; the fix and why), and the numbers (9 photos, ~28 MB of iPhone exports down to a few hundred KB total, EXIF/GPS stripped).

```bash
git add app/content/polaroids.js devlog.md
git commit -m "chore: polaroid captions finalized + devlog for polaroid drift session"
git push
```

- [ ] **Step 5: Visual QA on the preview deploy (Allison)**

On the Vercel preview: drift speed feel, pick-up transition, water-shadow subtlety, splash, night dimming (after 11pm or via the hard-code trick locally), mobile flick/tap. Tuning knobs live at the top of `app/lib/drift.js` and in the `.polaroid-shadow` CSS.
