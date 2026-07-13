# The Cat Above the Pond — Design

**Date:** 2026-07-13
**Status:** approved (wireframe + live demo reviewed by Allison)
**Supersedes:** the "cat perched on the fact-lab card" sketch in `2026-07-12-pond-life-design.md` (deferred-features addendum). That version is dead; this is the cat.

## Concept

The homepage is a pond seen from above. The cat is on the visitor's side of reality, peeking over the pond's edge — rendered with the existing pencil sketch `public/cat-peeking-right.jpg` (735×544, 34 KB). The wall the cat peeks around in the drawing becomes the **left edge of the viewport**.

Scrolling is movement above the pond, and movement is what cats hunt: the cat is scroll-summoned, watches while you move, swipes on a hard flick, and loses interest when you stop.

## State machine

Lives in a new pure module `app/lib/cat.js` — DOM-free, same pattern as `boids.js`. All constants exported.

| State | Visual | Transition out |
|---|---|---|
| `idle` | no cat | any scroll → `appearing` |
| `appearing` | slides + fades in from the left edge, ~600 ms (`FADE_MS`) | fade complete → `watching` |
| `watching` | head leans toward nearest fish; water-sway | flick > 1500 px/s (`FLICK_PXS`) and cooldown elapsed → `swiping`; no scroll for 4 s (`IDLE_MS`) → fade → `idle` |
| `swiping` | slight lunge; ink paw print darts to the nearest fish cluster over 700 ms (`SWIPE_MS`); splash ripple at strike | swipe complete → `watching` (2 s `COOLDOWN_MS` before next swipe) |

Interface:

```js
stepCat(cat, { now, scrollVelocity, fish })
// mutates cat, returns { presence, lean, swipe }
// presence: 0..1 (drives opacity + slide-in offset)
// lean: radians, small (±0.06) — whole-head lean toward nearest fish
// swipe: null | { x, y, k } — current paw position + progress 0..1
```

Scroll velocity is computed in the component (px/s over a ~120 ms sample window of `scrollY`), not in the module. Trackpad, wheel, and touch flicks all produce the same signal, so mobile gets swipes naturally.

Swipe target: the fish with the most neighbors within ~60 px (densest cluster), chosen at swipe start; the paw eases out (cubic) from beside the cat's face to that point.

## Visual treatment

- **The sketch ships as-is.** No cutout: the element uses `mix-blend-mode: multiply`, so the JPG's white paper vanishes against the fixed cream background (`--bg`) and only pencil strokes remain. The site's palette never goes dark, so multiply is always safe.
- **Crop:** the drawn wall strip (left ~118 px of the source) is cropped out (via `object-position`/background-position) so the viewport edge plays the wall.
- **Placement:** fixed position, flush left, upper area (top ≈ 90 px); width ≈ `min(240px, 28vw)`. Same stacking layer as the canvas (z-index 0, `pointer-events: none`) — cards float above it like everything else in the pond.
- **Motion:** a rAF-driven `transform` = slide-in X (from `presence`) + water-sway Y (±3 px, ~0.9 s sine) + `lean` rotation (transform-origin: left center) + swipe lunge (±0.05 rad over the swipe). Opacity = `presence × 0.9`; dims with the fish in Toronto night mode.
- **Paw + splash** are drawn on the existing canvas by FishCanvas: ink paw print (pad + 3 toes) along the swipe path, splash reusing the tap-the-glass ripple at the strike point.

## Physics integration

The paw is a **moving entry in the existing predators array**: `{ x, y, kind: "flee", strength: 2 }`, updated each frame while the swipe runs (TTL = swipe duration). The scatter is real boids physics. **`app/lib/boids.js` is unchanged** — the predator-list interface was designed for exactly this second consumer.

## Interactions with existing features

- **Secret word `"cat"`** (already reserved in the keydown buffer): summons the cat instantly + triggers one swipe (bypasses the flick threshold; still respects the 2 s swipe cooldown so it can't be spammed).
- **Tap-the-glass:** taps and swipes coexist in the same predators array; no interaction needed.
- **Night mode:** cat opacity scales down with the fish alpha.
- **Reduced motion:** the cat never appears. The static pond stays serene.

## Files

| File | Change |
|---|---|
| `app/lib/cat.js` | new — pure state machine + exported constants |
| `app/components/FishCanvas.jsx` | scroll-velocity sampling, cat layer element + rAF transform, paw predator entry, paw/splash drawing, secret word hookup |
| `app/lib/boids.js` | none |
| `public/cat-peeking-right.jpg` | already present, served as-is |
| `test/cat.test.js` | new — vitest on the pure module |

## Testing

Vitest on `app/lib/cat.js` (no DOM):
- idle → appearing on scroll activity
- appearing → watching when presence completes
- watching → swiping on velocity > `FLICK_PXS`; not during cooldown
- watching → idle after `IDLE_MS` without scroll
- swipe emits a correctly-shaped moving predator (`kind: "flee"`, `strength: 2`) and ends after `SWIPE_MS`
- lean is bounded (±0.06 rad)

Visual QA (Allison, on the preview deploy): flick threshold feel, boredom timeout feel, mobile flick behavior, night-mode dimming.

## Tuning knobs (defaults, adjust during QA)

`FADE_MS 600 · IDLE_MS 4000 · SWIPE_MS 700 · COOLDOWN_MS 2000 · FLICK_PXS 1500 · lean ±0.06 rad · sway ±3px/0.9s · opacity 0.9 · width min(240px, 28vw)`

## Open item

The sketch carries an artist's signature. Before this ships publicly, Allison confirms she has rights to publish it (or swaps in a rights-safe/own drawing). The implementation is identical either way — the asset is a drop-in file.

## Out of scope

Origami crane, polaroid drift, tourbillon clock, game-theory cat — all logged in earlier specs/idea notes. Fact-lab seed chains for tourbillon/game theory/origami may ride along a future content commit.
