# Polaroid Drift — Design

**Date:** 2026-07-17
**Status:** approved (wireframe reviewed by Allison; shadow-on-water detail added at her request)
**Extends:** `2026-07-11-playground-homepage-design.md` · resolves the "polaroid drift" deferral in `2026-07-12-pond-life-design.md`

## Concept

Someone dropped a handful of polaroids on the pond. They float on the surface — above the water and caustics, below the glass cards — drifting on a slow current among the fish. Click one and it lifts out of the water toward you; drop it back and it splashes, scattering the school. It's the "who made this?" answer told in the pond's own language.

Decisions made during brainstorming:

- **Drift model:** photos float freely across the whole viewport (not tucked in the `.pg-gap` zones, not a one-at-a-time drift-by).
- **Interaction:** click/tap picks a polaroid up (enlarge + caption); dropping it back splashes via the existing predators array.
- **Captions:** Allison writes one handwritten-style line per photo in `app/content/polaroids.js`.
- **Content:** 9 original photos ship. `IMG_5500.jpg` (a screenshot of someone else's Reddit post) is dropped — not hers to publish.
- **Architecture:** real DOM elements driven by a pure, DOM-free drift module — the `boids.js` pattern. Canvas is only involved for the drop splash.

## Drift model — `app/lib/drift.js` (pure, DOM-free)

Each floating photo: `{ i, x, y, rot, vx, vy, vrot }` where `i` indexes the photo pool.

```js
stepDrift(floats, { w, h, dt, rand })
// mutates floats: position += velocity·dt, slow wander steering,
// returns indices that wrapped this step (crossed an edge + margin)
```

- A gentle shared current (≈8 px/s, direction set per page load from `rand`) plus per-photo sinusoidal wander so the photos don't march in formation. Slow continuous rotation, ±0.02 rad/s.
- Wrap with margin: a photo exits fully off one edge and the **next pool photo not currently visible** re-enters from the opposite edge — a rotating window of `VISIBLE = 4` over the 9-photo pool, so a patient visitor sees them all.
- A picked-up photo is removed from stepping (its float slot freezes); on drop it resumes from where it was.
- All constants exported: `VISIBLE 4 · CURRENT_PXS 8 · WANDER · ROT_RADS 0.02 · WRAP_MARGIN`.

## Component — `app/components/Polaroids.jsx`

- Renders the 4 floats as absolutely-positioned `<button class="polaroid">` wrappers (fixed layer; z-order: water < caustics < fish < polaroids < cards), each containing `next/image` + a Caveat caption strip (visually hidden until picked up, but always present as the accessible name).
- One `requestAnimationFrame` loop applies `transform: translate(x,y) rotate(rot)`; only pick-up/drop changes React state, so drifting costs zero re-renders (same discipline as FishCanvas).
- **Pick-up:** `.polaroid--held` — CSS transition to viewport center, straighten to 0 rad, scale to `min(420px, 80vw)` wide, drop shadow on the photo itself. Lifted **above** the cards. Backdrop click, second click, or Esc drops it.
- **Water shadow while held:** a faint natural shadow stays on the water at the float's frozen position — a soft blurred dark ellipse (~60% photo width, low opacity, `filter: blur`), fading in as the photo lifts and out as it drops. Sells the "hovering above the pond" read; sways ±2 px with the water. Lives on the polaroid layer, `pointer-events: none`.
- **Drop:** pushes a transient `{ x, y, kind: "flee", strength: 2 }` into the existing predators array (tap-the-glass plumbing, same pattern the cat spec uses) and reuses the tap ripple at that point.
- Photo metadata in `app/content/polaroids.js`: `{ src, alt, caption }` × 9.

## Wireframe (reviewed)

```
drifting                                picked up
▛▀▀▀▜↻  ~120px, tilted, drifts          ▛▀▀▀▀▀▀▀▀▜  centered, straight,
▌ 📷 ▐  ~8px/s, wraps at edges,         ▌   📷    ▐  above cards,
▙▄▄▄▟   4 visible from pool of 9        ▌         ▐  min(420px, 80vw)
                                        ▙▄▄▄▄▄▄▄▄▟
                                        "caption in caveat"
                                            ⬫  ← faint blurred shadow
                                               left on the water below
click → lift · click again/Esc/outside → drop → splash ripple, fish flee
```

## Existing-feature interactions

- **Night mode:** polaroids dim with the fish (opacity scales under `.pond--night`).
- **Reduced motion:** no drift, no rAF — the 4 photos render at static scattered positions; click still enlarges (fade only, no fly-to-center); drop causes no splash; no water shadow.
- **Fish:** ignore floating photos (they swim under them); the only physics coupling is the drop splash.
- **Mobile:** tap picks up, tap again drops; drifting width shrinks to ~90px.
- **Styling scope:** all new CSS scoped under `.pond` — `/about` stays untouched (pond-water-theme invariant).

## Assets

Current files are raw iPhone exports (1–4.8 MB, up to 4032px; ~28 MB total). One-time prep: downscale longest edge to 1200px (~150–250 KB each), rename descriptively (`polaroid-daisies.jpg`, `polaroid-lake-ontario.jpg`, …), delete the `IMG_*.jpg` originals from `public/` — including `IMG_5500.jpg`, which is cut entirely. `next/image` handles responsive sizing from there.

## Files

| File | Change |
|---|---|
| `app/lib/drift.js` | new — pure drift stepper + exported constants |
| `app/components/Polaroids.jsx` | new — DOM layer, pick-up state, water shadow, rAF |
| `app/content/polaroids.js` | new — `{ src, alt, caption }` × 9 (Allison writes captions) |
| `app/page.js` | mount `<Polaroids />` inside `PondTheme` |
| `app/globals.css` | `.polaroid`, `.polaroid--held`, `.polaroid-shadow`, night/reduced-motion rules, scoped under `.pond` |
| FishCanvas / predators plumbing | expose the existing "add transient predator" hook to Polaroids (tiny) |
| `public/polaroid-*.jpg` | 9 optimized images replacing the `IMG_*.jpg` originals |
| `test/drift.test.js` | new — vitest on the pure module |

## Testing

Vitest on `drift.js` (deterministic via injected `rand`):

- positions advance by current × dt; wander stays bounded
- wrap detection fires at edge + margin, re-entry from the opposite edge
- pool rotation always picks a non-visible photo and cycles through all 9
- frozen (held) floats don't move; resume where they were

Visual QA (Allison, preview deploy): drift speed feel, pick-up transition, water-shadow subtlety, splash, night dimming, mobile taps.

## Tuning knobs (defaults, adjust during QA)

`VISIBLE 4 · CURRENT_PXS 8 · ROT_RADS 0.02 · drift width 120px (90px mobile) · held width min(420px, 80vw) · shadow ~60% width, blur ~10px, opacity ~0.15`

## Out of scope

Captions as fact-lab seeds, a "shake the pond" reshuffle, polaroids interacting with the future cat — none of it now. YAGNI.
