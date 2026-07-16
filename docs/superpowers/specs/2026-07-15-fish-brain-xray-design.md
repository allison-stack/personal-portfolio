# Fish-Brain X-Ray — Mech-Interp Overlay (Design)

**Date:** 2026-07-15 · extends `2026-07-11-playground-homepage-design.md` + `2026-07-15-pond-water-theme-design.md`
**Decision:** approved approach A — `stepSchool` gains an optional `trace` out-param; no force math
is duplicated (single source of truth) and the normal path pays nothing (pay-per-use trace hook).
**Scope:** `/` only. `/about` untouched. Cat-above-the-pond stays on hold.

## Why

The school looks alive, but it's three rules plus fear. An overlay that draws each fish's live
decision vectors is literal interpretability — the site's mech-interp exhibit, built from numbers
the sim already computes and discards.

## What the visitor sees

- A new field-note scrap (second `.pg-gap`, side `left`, after `networking`):
  - text: `the school isn't thinking. it's three rules — keep apart, match your neighbours, stay together.`
  - fact line: `tap this scrap to x-ray their brains`
- Tapping/clicking the scrap toggles the x-ray. Typing `think` (desktop secret word, same rolling
  buffer as `koi`/`bus`) also toggles it.
- While on: every fish draws up to four short colored line segments from its center — separation,
  alignment, cohesion, and net cursor influence (flee or feed; taps included). Wander is
  deliberately not drawn: it's noise, not a rule.
- While on: a legend pill (styled like `.night-note`, bottom-left) reads
  `separation · alignment · cohesion · you`, each word preceded by a colored dot.
- Toggle off the same ways. State is per-visit (no persistence).

## Sim change — `app/lib/boids.js`

`stepSchool(fish, { w, h, predators, params, rand, trace })`:

- `trace` is an optional array owned by the caller. When present, for each fish `i` the sim does
  `const t = trace[i] || (trace[i] = {})` and writes **all eight** fields every step (stale values
  from reused objects must be overwritten, not accumulated):
  `sepX, sepY, aliX, aliY, cohX, cohY, youX, youY`.
- `sep*` = accumulated separation pushes; `ali*`/`coh*` = the alignment/cohesion terms (zero when
  no neighbors); `you*` = net predator influence — flee pushes and feed pulls summed over all
  active predators (mouse + taps).
- When `trace` is omitted: no writes, no allocation, no behavior change. The sim stays pure and
  DOM-free; wander and the speed clamp are unaffected either way.

## Rendering — `app/components/FishCanvas.jsx`

- New React state `xray` (like `feeding`), mirrored to `xrayRef` for the loop. Toggled by:
  1. the existing `keydown` buffer: `keyBuffer.endsWith("think")`;
  2. the existing window `pointerdown` handler: if `e.target.closest('[data-scrap="think"]')`,
     toggle and return (this check goes **before** the interactive-element early return; the scrap
     is a `<button>`, so it never ripples either way).
- A `trace` array preallocated in the main effect (alongside `taps`/`ripples`, length `COUNT`) is
  passed to `stepSchool` only while `xrayRef.current` is true.
- Drawing: a second pass after all fish bodies (arrows sit on top). For each fish and each of the
  four vectors: skip if magnitude < 0.01; otherwise draw a line segment from the fish center along
  the vector, length `Math.min(18, 22 * Math.sqrt(mag))` (sqrt keeps weak forces visible, cap keeps
  strong ones local), `lineWidth 1.2`, `globalAlpha 0.85`. No arrowheads — origin-at-fish plus
  motion carries direction.
- Colors come from four new tokens via the existing `readFishColors` mechanism (same element-scoped
  `getComputedStyle`, re-read on `night` flips).
- Reduced motion: toggling runs one traced `stepSchool` + `draw` so the static frame gains/loses
  arrows (the school shifts one imperceptible step per toggle — accepted).

## Tokens — `app/globals.css` (append-only) + `app/lib/fish-colors.js`

| token | day (`.pond`) | night (`.pond--night`) |
|---|---|---|
| `--xray-sep` | `#e07b2f` | `#ffa25c` |
| `--xray-ali` | `#2f6fb2` | `#6db8ff` |
| `--xray-coh` | `#3f8f5f` | `#6fe0a8` |
| `--xray-you` | `#c2273d` | `#ff6b81` |

`readFishColors` returns four new keys (`xsep`, `xali`, `xcoh`, `xyou`) with the day values as
fallbacks. The legend pill's dots use the same tokens via CSS (so it recolors at night for free).

## Content + markup

- `app/content/scraps.js`: new entry `{ id: "think", text: "the school isn't thinking. it's three rules — keep apart, match your neighbours, stay together.", fact: "tap this scrap to x-ray their brains", side: "left", action: "think" }`.
- `app/page.js` `Scrap`: when `action` is present, render a `<button type="button">` with the same
  scrap classes plus `data-scrap="think"` and `aria-pressed` unmanaged (the button is a dumb
  dispatcher; FishCanvas owns the state — no cross-component state wiring).
- Legend pill: rendered by FishCanvas when `xray` is true, `aria-hidden="true"` (decorative,
  matches night-note), class `.xray-legend`.

## Constraints carried over

Free tier (no APIs) · all copy lowercase/warm · `/about` untouched by construction (tokens scoped
under `.pond`) · globals.css append-only · commits conventional with reason in parens, no AI
trailer · existing 27 tests stay green.

## Verification

- vitest (`test/boids.test.js` additions): trace filled with all 8 numeric fields; identical fish
  positions with/without `trace` under the same seeded `rand`; stale-value reset (reused trace
  object re-zeroed when neighbors/predators leave); `you*` points away from a flee predator and
  toward a feed predator; isolated fish → sep/ali/coh all zero.
- vitest (`test/fish-colors.test.js` additions): four new token fallbacks.
- build + lint green.
- Human pass: overlay on/off via scrap tap and `think`, both skins, flee vectors bloom away from
  cursor, feed mode pulls toward, 375px layout, reduced-motion single-frame toggle, legend
  contrast at night.
