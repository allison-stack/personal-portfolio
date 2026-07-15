# Pond Water Theme Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle the `/` playground as a top-down koi pond (day skin) with a night-tank palette skin from 23:00–06:59 Toronto time, without touching `/about`.

**Architecture:** A client wrapper `PondTheme` owns the night check and applies scoped `.pond` / `.pond--night` classes that re-declare theme tokens locally; `FishCanvas` moves inside it, takes `night` as a prop (single source of truth — no duplicate timers), and reads its colors from its own element via new `--fish-*` tokens instead of `document.documentElement`. All water visuals (depth gradient, caustics, floating cards) are CSS scoped under `.pond`.

**Tech Stack:** Next.js 15 (app router, JS not TS in this repo), Tailwind v4 via `globals.css` custom CSS, canvas 2D, vitest.

**Spec:** `docs/superpowers/specs/2026-07-15-pond-water-theme-design.md`

## Global Constraints

- `/about` must render pixel-identical: never change `:root` values or unscoped selectors in `globals.css`.
- Free tier only: no new APIs, no new dependencies.
- All user-facing copy lowercase, warm.
- Reduced motion: the existing universal `prefers-reduced-motion` block in `globals.css` (animation-duration 0.001ms) must cover every new animation — do not use `animation-play-state` tricks that escape it.
- Commits: conventional prefixes with the reason in parentheses when non-obvious. **No AI attribution trailer.** Push at the end of the session.
- Exact palette values come from the spec tables — do not improvise colors.

## File Structure

- Create: `app/lib/night.js` — pure time helpers (`torontoHour`, `isNightHour`), extracted from FishCanvas so they're testable.
- Create: `app/lib/fish-colors.js` — pure `readFishColors(getVar)` with per-token fallbacks.
- Create: `app/hooks/useNightMode.js` — client hook (mount + hourly re-check) built on `night.js`.
- Create: `app/components/PondTheme.jsx` — client wrapper: applies `.pond`/`.pond--night`, renders the `.water` background div and `FishCanvas`.
- Modify: `app/page.js` — wrap content in `PondTheme`, drop the direct `FishCanvas` render and (in Task 5) the `.grain` div.
- Modify: `app/components/FishCanvas.jsx` — `night` prop, scoped color reads, day fish-shadows, night koi/gold glow, `--fx-ink` recolors.
- Modify: `app/globals.css` — append `.pond` day skin (Task 5) and `.pond--night` skin (Task 6). Append-only; no existing rules edited.
- Test: `test/night.test.js`, `test/fish-colors.test.js`.

---

### Task 1: Night-time helpers (`app/lib/night.js`)

**Files:**
- Create: `app/lib/night.js`
- Test: `test/night.test.js`
- Modify (later, Task 4): `app/components/FishCanvas.jsx` keeps its own copies until Task 4 deletes them.

**Interfaces:**
- Consumes: nothing.
- Produces: `torontoHour(): number` (0–23 in America/Toronto) and `isNightHour(h: number): boolean` (true for h ≥ 23 or h < 7). Task 3's hook imports both.

- [ ] **Step 1: Write the failing test**

```js
// test/night.test.js
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run test/night.test.js`
Expected: FAIL — cannot find module `../app/lib/night.js`.

- [ ] **Step 3: Write the implementation** (bodies copied verbatim from `FishCanvas.jsx:15-27`)

```js
// app/lib/night.js
export function torontoHour() {
  return Number(
    new Intl.DateTimeFormat("en-CA", {
      hour: "numeric",
      hour12: false,
      timeZone: "America/Toronto",
    }).format(new Date())
  );
}

export function isNightHour(h) {
  return h >= 23 || h < 7;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run test/night.test.js`
Expected: PASS (2 test files' worth of asserts, all green).

- [ ] **Step 5: Commit**

```bash
git add app/lib/night.js test/night.test.js
git commit -m "feat(playground): extract toronto night-hour helpers to a testable lib"
```

---

### Task 2: Fish color reader (`app/lib/fish-colors.js`)

**Files:**
- Create: `app/lib/fish-colors.js`
- Test: `test/fish-colors.test.js`

**Interfaces:**
- Consumes: nothing (pure; caller supplies a `getVar(name) => string` lookup).
- Produces: `readFishColors(getVar): { ink, koi, gold, fx, hand }` — Task 4 calls it with `(name) => getComputedStyle(canvas).getPropertyValue(name)`. Fallbacks are the day-skin values so the canvas still looks right if the CSS tokens are ever missing.

- [ ] **Step 1: Write the failing test**

```js
// test/fish-colors.test.js
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run test/fish-colors.test.js`
Expected: FAIL — cannot find module `../app/lib/fish-colors.js`.

- [ ] **Step 3: Write the implementation**

```js
// app/lib/fish-colors.js
const TOKENS = {
  ink: ["--fish-ink", "#2e5a5e"],
  koi: ["--fish-koi", "#d1602f"],
  gold: ["--fish-gold", "#c9950c"],
  fx: ["--fx-ink", "rgba(255, 255, 255, 0.9)"],
  hand: ["--f-hand", "cursive"],
};

export function readFishColors(getVar) {
  const out = {};
  for (const [key, [name, fallback]] of Object.entries(TOKENS)) {
    const v = (getVar(name) || "").trim();
    out[key] = v || fallback;
  }
  return out;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run test/fish-colors.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/lib/fish-colors.js test/fish-colors.test.js
git commit -m "feat(playground): fish color reader with day-skin fallbacks (canvas will read scoped tokens, not :root)"
```

---

### Task 3: `useNightMode` hook, `PondTheme` wrapper, page wiring

**Files:**
- Create: `app/hooks/useNightMode.js`
- Create: `app/components/PondTheme.jsx`
- Modify: `app/page.js:1-22` and `app/page.js:66-72` (imports, wrapper open/close)
- Test: `npm run build` (structural change; behavior unchanged until Task 4/5)

**Interfaces:**
- Consumes: `isNightHour`, `torontoHour` from Task 1.
- Produces: `useNightMode(): boolean` and `<PondTheme>{children}</PondTheme>` which renders `<div className="pond [pond--night]"><div class="water"/><FishCanvas night={...}/>{children}</div>`. Task 4 changes `FishCanvas` to accept the `night` prop (until then the prop is passed but ignored — harmless). Tasks 5–6 style `.pond`, `.water`, `.pond--night`.

- [ ] **Step 1: Write the hook** (same mount + hourly pattern FishCanvas uses today)

```js
// app/hooks/useNightMode.js
"use client";

import { useEffect, useState } from "react";
import { isNightHour, torontoHour } from "../lib/night";

export function useNightMode() {
  const [night, setNight] = useState(false);

  useEffect(() => {
    const check = () => setNight(isNightHour(torontoHour()));
    check();
    const id = setInterval(check, 60 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  return night;
}
```

- [ ] **Step 2: Write PondTheme**

```jsx
// app/components/PondTheme.jsx
"use client";

import { FishCanvas } from "./FishCanvas";
import { useNightMode } from "../hooks/useNightMode";

// single owner of the night check: the theme class and the canvas must flip
// together, so night is decided here and passed down
export function PondTheme({ children }) {
  const night = useNightMode();
  return (
    <div className={night ? "pond pond--night" : "pond"}>
      <div className="water" aria-hidden="true" />
      <FishCanvas night={night} />
      {children}
    </div>
  );
}
```

- [ ] **Step 3: Rewire `app/page.js`**

Replace the import of `FishCanvas` with `PondTheme`:

```js
import Link from "next/link";
import { PondTheme } from "./components/PondTheme";
import { Combiner } from "./components/Combiner";
import { scraps } from "./content/scraps";
```

Replace the top of the returned JSX (`<FishCanvas />` sibling + `.pg` open) and the closing tags so the whole page sits inside `PondTheme`:

```jsx
export default function Home() {
  return (
    <PondTheme>
      <div className="pg">
        <div className="grain" />
        <main className="pg-col">
          {/* …all existing content between <main> and </main> stays byte-identical… */}
        </main>
      </div>
    </PondTheme>
  );
}
```

(The `.grain` div is removed in Task 5 together with the water CSS so the texture swap is atomic.)

- [ ] **Step 4: Verify build and tests**

Run: `npm run build && npm test`
Expected: build succeeds; all vitest suites pass. Visual behavior of `/` unchanged (classes exist but are unstyled).

- [ ] **Step 5: Commit**

```bash
git add app/hooks/useNightMode.js app/components/PondTheme.jsx app/page.js
git commit -m "feat(playground): PondTheme wrapper owns the night check and scoped theme classes"
```

---

### Task 4: FishCanvas — night prop, scoped colors, shadows, glow

**Files:**
- Modify: `app/components/FishCanvas.jsx`
- Test: `npm test` (existing suites must stay green) + manual dev-server check

**Interfaces:**
- Consumes: `night` prop from `PondTheme` (Task 3); `readFishColors` (Task 2).
- Produces: canvas colors driven by `--fish-ink` / `--fish-koi` / `--fish-gold` / `--fx-ink` read from the canvas element, re-read whenever `night` flips (Tasks 5–6 define the tokens; until then the Task 2 fallbacks paint the day palette).

- [ ] **Step 1: Switch to the night prop and delete the local night machinery**

At `FishCanvas.jsx:1-49`: delete the local `torontoHour` and `isNightHour` functions, delete `useState` for `night` and the hourly-check effect, and change the signature. Imports become:

```js
"use client";

import { useEffect, useRef, useState } from "react";
import { createFish, stepSchool } from "../lib/boids";
import { fortuneForDate } from "../lib/fortune";
import { readFishColors } from "../lib/fish-colors";
```

Component head becomes:

```js
export function FishCanvas({ night = false }) {
  const canvasRef = useRef(null);
  const [feeding, setFeeding] = useState(false);
  const modeRef = useRef("flee");

  useEffect(() => {
    modeRef.current = feeding ? "feed" : "flee";
  }, [feeding]);

  const nightRef = useRef(false);
  useEffect(() => {
    nightRef.current = night;
  }, [night]);
```

- [ ] **Step 2: Add the scoped color read**

Immediately after the `nightRef` effect (and **before** the main sim effect — effect order guarantees colors exist before the first draw), add:

```js
  // colors come from the .pond theme tokens on an ancestor, so read them from
  // the canvas itself — documentElement never sees the scoped overrides.
  // re-read on night flips: PondTheme swaps the class in the same commit.
  const colorsRef = useRef(readFishColors(() => ""));
  useEffect(() => {
    const styles = getComputedStyle(canvasRef.current);
    colorsRef.current = readFishColors((name) => styles.getPropertyValue(name));
  }, [night]);
```

In the main effect, delete the old block at `FishCanvas.jsx:68-72` (`const styles = getComputedStyle(document.documentElement); … const goldColor = "#c9950c";`).

- [ ] **Step 3: Use the colors in `draw()`**

First line of `draw(now)`:

```js
      const C = colorsRef.current;
```

Then replace every old color reference inside `draw`:
- koi glint halo stroke (`ctx.strokeStyle = goldColor`) → `ctx.strokeStyle = C.gold`
- fish color pick → `const color = gold ? C.gold : koi ? C.koi : C.ink;`
- gold patch fill (`ctx.fillStyle = koiColor`) → `ctx.fillStyle = C.koi`
- ripple stroke (`ctx.strokeStyle = inkColor`) → `ctx.strokeStyle = C.fx`
- bubble ring stroke → `ctx.strokeStyle = C.fx`
- fortune text fill → `ctx.fillStyle = C.fx` and font → `ctx.font = `17px ${C.hand}``

- [ ] **Step 4: Day shadows + night glow**

In the per-fish loop, reorder so `bl`/`bw`/`ang` are computed first, then insert the depth pass before the body is drawn. The block from `ctx.globalAlpha = gold ? …` through the body `ctx.fill()` becomes:

```js
        const bl = 5.2 * s; // half-length
        const bw = 2.6 * s; // half-width
        const ang = Math.atan2(uy, ux);

        // top-down depth: a small offset shadow by day, a glow halo for
        // koi/gold by night (shadows read wrong on dark water)
        if (!nightRef.current) {
          ctx.globalAlpha = 0.12;
          ctx.fillStyle = "#123a3e";
          ctx.beginPath();
          ctx.ellipse(f.x + 2, f.y + 4, bl * 0.9, bw * 0.85, ang, 0, Math.PI * 2);
          ctx.fill();
        } else if (gold || koi) {
          const gr = gold ? 16 : 10;
          const halo = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, gr);
          halo.addColorStop(0, "rgba(232, 161, 61, 0.3)");
          halo.addColorStop(1, "rgba(232, 161, 61, 0)");
          ctx.globalAlpha = 1;
          ctx.fillStyle = halo;
          ctx.beginPath();
          ctx.arc(f.x, f.y, gr, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.globalAlpha = gold ? Math.min(baseAlpha + 0.15, 0.8) : baseAlpha;
        ctx.fillStyle = color;

        // body: plain oval, rotated to the swim direction
        ctx.beginPath();
        ctx.ellipse(f.x, f.y, bl, bw, ang, 0, Math.PI * 2);
        ctx.fill();
```

(Keep the existing `wig` line above this block; the tail code after it is unchanged.)

Known accepted limitation (same as today): under `prefers-reduced-motion` the static frame drawn at mount does not repaint when night flips mid-visit.

- [ ] **Step 5: Verify**

Run: `npm test && npm run build`
Expected: all green.
Run: `npm run dev`, open `http://localhost:3000` — fish render in day-fallback colors (#2e5a5e ink, #d1602f koi) with small shadows; in devtools, add class `pond--night` to the wrapper div → nothing changes yet except shadows disappear and koi/gold get amber halos (tokens land in Tasks 5–6).

- [ ] **Step 6: Commit**

```bash
git add app/components/FishCanvas.jsx
git commit -m "feat(playground): fish canvas reads scoped theme tokens from its own element (documentElement never sees .pond overrides); day shadows + night halos"
```

---

### Task 5: Day skin CSS (sunlit koi pond) + grain removal

**Files:**
- Modify: `app/globals.css` (append at end, after the pond-life section)
- Modify: `app/page.js` (remove the `.grain` div)
- Test: `npm run build` + manual visual pass

**Interfaces:**
- Consumes: `.pond`, `.water` markup from Task 3; `--fish-*` / `--fx-ink` reads from Task 4.
- Produces: day tokens exactly per spec table A. Task 6 layers `.pond--night` on the same selectors.

- [ ] **Step 1: Remove the grain from the homepage**

In `app/page.js`, delete the line `<div className="grain" />` (caustics replace it; `/about` keeps its own grain).

- [ ] **Step 2: Append the day-skin CSS to `globals.css`**

```css
/* ---------- pond water theme: day skin (/) ---------- */
.pond {
  --bg: #fdfbf3;         /* paper surfaces floating on the water */
  --accent: #d1602f;     /* koi vermillion */
  --water-line: #63a49c;
  --fish-ink: #2e5a5e;
  --fish-koi: #d1602f;
  --fish-gold: #c9950c;
  --fx-ink: rgba(255, 255, 255, 0.9);
}
.pond ::selection {
  background: var(--accent);
  color: #fdfbf3;
}
.water {
  position: fixed;
  inset: 0;
  z-index: 0;
  background: radial-gradient(120% 100% at 50% 35%, #ddf0e9 0%, #8cc3ba 55%, #63a49c 100%);
  overflow: hidden;
}
.water::after {
  content: "";
  position: absolute;
  inset: -12%;
  background:
    radial-gradient(220px 100px at 20% 25%, rgba(255, 255, 255, 0.32), transparent 70%),
    radial-gradient(260px 120px at 65% 15%, rgba(255, 255, 255, 0.26), transparent 70%),
    radial-gradient(200px 90px at 82% 55%, rgba(255, 255, 255, 0.24), transparent 70%),
    radial-gradient(240px 110px at 35% 72%, rgba(255, 255, 255, 0.26), transparent 70%),
    radial-gradient(200px 90px at 60% 90%, rgba(255, 255, 255, 0.22), transparent 70%);
  animation: caustic-drift 60s ease-in-out infinite alternate;
}
@keyframes caustic-drift {
  from { transform: translate3d(-1.5%, -1%, 0); }
  to { transform: translate3d(1.5%, 1%, 0); }
}
.pond .pg-card {
  background: color-mix(in srgb, var(--bg) 94%, transparent);
  /* surface tension ring + underside depth: the card floats ON the water */
  box-shadow:
    0 0 0 6px rgba(255, 255, 255, 0.22),
    0 10px 24px rgba(15, 60, 60, 0.22);
  animation: card-bob 7s ease-in-out infinite;
}
.pond .pg-col > .pg-card:nth-of-type(2n) {
  animation-delay: -3.5s;
}
@keyframes card-bob {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-2px); }
}
.pond .sh {
  text-decoration-color: var(--water-line);
}
.pond .scrap {
  box-shadow: 0 4px 12px rgba(15, 60, 60, 0.18);
}
```

No `animation-play-state` anywhere: the existing universal reduced-motion block (`globals.css:488-494`) already freezes `caustic-drift` and `card-bob`.

- [ ] **Step 3: Verify**

Run: `npm run build && npm run lint`
Expected: green.
Run: `npm run dev` — `/` shows the aqua radial pond, drifting light blobs, paper cards with tension rings bobbing, teal fish with shadows, vermillion accents. `/about` is pixel-identical to before (cream, grain, terracotta) — verify side by side.

- [ ] **Step 4: Commit**

```bash
git add app/globals.css app/page.js
git commit -m "feat(playground): sunlit-pond day skin — water gradient, caustics replace grain, floating cards, koi-vermillion accent"
```

---

### Task 6: Night skin CSS (night tank)

**Files:**
- Modify: `app/globals.css` (append after the day-skin section)
- Test: manual visual pass with the class forced

**Interfaces:**
- Consumes: `.pond--night` class from Task 3; day-skin selectors from Task 5.
- Produces: night tokens exactly per spec table B; the fish/fx token flip that Task 4's `[night]` effect picks up.

- [ ] **Step 1: Append the night-skin CSS**

```css
/* ---------- pond water theme: night skin (23:00-06:59 toronto) ---------- */
.pond--night {
  --bg: #0e2a34;
  --ink: #e6f3f4;
  --body: #b9cfd3;
  --muted: #8fb4ba;
  --line: rgba(159, 214, 222, 0.28);
  --accent: #6fd6d6;
  --water-line: rgba(159, 214, 222, 0.5);
  --fish-ink: #9fc4c9;
  --fish-koi: #e8a13d;
  --fish-gold: #e8a13d;
  --fx-ink: #6fd6d6;
  color: var(--ink);
}
.pond--night ::selection {
  background: var(--accent);
  color: #071820;
}
.pond--night .water {
  background: radial-gradient(120% 100% at 50% 35%, #10333d 0%, #0b2530 55%, #071820 100%);
}
.pond--night .water::after {
  display: none; /* no sun, no caustics */
}
.pond--night .pg-card {
  background: rgba(255, 255, 255, 0.055);
  border-color: rgba(159, 214, 222, 0.28);
  backdrop-filter: blur(2px);
  box-shadow:
    0 0 0 6px rgba(159, 214, 222, 0.07),
    0 10px 24px rgba(0, 0, 0, 0.35);
}
.pond--night .scrap,
.pond--night .glass-sign {
  background: rgba(255, 255, 255, 0.07);
  border-color: rgba(159, 214, 222, 0.25);
  color: #c5d9db;
}
.pond--night .scrap-tape {
  background: rgba(111, 214, 214, 0.18);
}
```

The feed-toggle, night-note, koi-note, chips, and dashed combiner stage all restyle themselves through the re-declared `--bg`/`--line`/`--muted`/`--accent` tokens — no per-component night rules needed.

- [ ] **Step 2: Verify**

Run: `npm run dev`. In devtools, add `pond--night` to the wrapper div: dark radial water, glass cards, pale fish, amber glowing koi/gold, cyan links/ripples/fortunes ("koi" secret word + a tap are quick ways to see fx colors — note the canvas re-reads tokens on the `night` **prop**, so forcing the class only previews CSS; to preview canvas colors too, temporarily return `true` from `useNightMode`, check, then revert). Text contrast: `#b9cfd3` body on glass over `#0b2530` is ≥ 7:1 — spot-check the scrap-fact mono lines too.
Run: `npm run build && npm run lint && npm test`
Expected: green.

- [ ] **Step 3: Commit**

```bash
git add app/globals.css
git commit -m "feat(playground): night-tank skin — glass cards, pale fish, glowing koi after 11pm toronto"
```

---

### Task 7: Full verification, devlog, sync, push

**Files:**
- Modify: `devlog.md` (append), `README.md` (only if it describes the old look)
- Test: full suite + human browser pass

- [ ] **Step 1: Full check**

Run: `npm test && npm run build && npm run lint`
Expected: all green.

- [ ] **Step 2: Human browser pass (dev server)**

- `/` day skin at 375px and desktop: cards bob, caustics drift, ripples white, fish shadows visible.
- Force night (temporarily return `true` from `useNightMode`, then revert): full night pass including gold-koi halo and cyan fortunes.
- `/about`: unchanged — cream, grain, terracotta accent, polaroid.
- OS reduced-motion on: no bob, no caustic drift, static school, no ripples.

- [ ] **Step 3: Devlog + README**

Append 2–3 lines to `devlog.md`: what changed, the one number that matters (e.g. "0 changed pixels on /about — theme fully scoped under .pond"), and the FishCanvas documentElement gotcha. Check `README.md` for any description/screenshot of the cream homepage; update in the same session if stale.

- [ ] **Step 4: Commit and push**

```bash
git add devlog.md README.md
git commit -m "chore: devlog for pond water theme session"
git push
```

---

## Self-Review Notes

- Spec coverage: scoping (T3/T5), FishCanvas color fix + re-read on toggle (T4), day palette (T5), night palette + glass scraps (T6), depth gradient/caustics/shadows/bob/ring (T4/T5), recolors via `--fx-ink` and `--water-line` (T4/T5/T6), reduced motion (T5 note, T7 check), night sim params retained (untouched in T4), vitest night-boundary + token-fallback tests (T1/T2), `/about` untouched (global constraint + T5/T7 checks). Spec's "FishCanvas consumes the same hook" is refined to a `night` prop from `PondTheme` — single timer, no class-vs-canvas race; spec intent (one shared night source) is preserved.
- Deliberate cut: no `useNightMode` React-render test — the hook is three lines over the tested pure helpers, and the repo has no component-test setup (no jsdom/testing-library); adding one for this is YAGNI.
- The cat spec (`2026-07-13-cat-above-the-pond-design.md`) is unbuilt; nothing here blocks it — its sketch strokes should later use `--fish-ink`.
