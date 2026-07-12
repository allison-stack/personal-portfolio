# Pond Life — Playground Additions (Design Addendum)

**Date:** 2026-07-12 · extends `2026-07-11-playground-homepage-design.md`
**Scope (this session):** gold koi · field-note scraps · tap-the-glass · night mode · secret words · fortune bubbles
**Deferred (next session):** the cat (perched on fact-lab card, tracks fish, paw-swipe = predator entry), polaroid drift (needs Allison's photo picks)

## Sim interface change (approved prediction: option A)

`stepSchool(fish, {w, h, predators, params, rand})` — `predators` is an array of
`{x, y, kind: "flee"|"feed", strength?}` replacing the single `predator` + `mode`.
The mouse is a permanent entry (kind follows the feed toggle); taps are transient
entries with a TTL managed by FishCanvas (boids stays time-free/pure). Cat swipes
join the same array next session.

## Features

1. **Gold koi** — fish index 0 draws gold (#c9950c-ish); tiny muted footnote under
   the footer: "one of the 120 fish is gold. finding it is good luck." Secret word
   `koi` gives it a 2s halo glint.
2. **Field-note scraps** — `app/content/scraps.js`, rendered in `.pg-gap`
   containers between cards (column gap shrinks; gaps become structured
   containers ~38vh with scraps alternating left/right). Caveat handwriting,
   tape corner, ±3° tilt, slow bob (off under reduced-motion). Optional smaller
   `fact` second line. Six scraps at launch: workaround-maxxing, GO bus skill
   tree, learning how to learn, chipotle (+ "smoked chili" fact), Ai Mori
   (height + world-class climber), networking is underrated.
3. **Tap the glass** — floating sign "do not tap the glass"; pointerdown on
   non-interactive space (not a/button/.pg-card/.cmb) spawns an expanding ripple
   ring pair on the canvas plus a 900ms flee predator (strength 1.5) at the
   point. Works on mobile (replaces hover as the primary scare there).
4. **Night mode** — 23:00–06:59 America/Toronto: fish slower (maxSpeed ~1.4),
   calmer (wander ~0.06), dimmer (alpha 0.35), tiny caption bottom-right:
   "it's {h} in toronto — the fish are tired". Checked at mount + hourly.
5. **Secret words** — rolling keystroke buffer: `koi` → koi glint; `bus` → a 🚌
   crosses the pond once (~8s). `cat` reserved for next session.
6. **Fortune bubbles** — every ~2–3 min a random fish releases a bubble that
   rises and pops near the surface into "today's luck: …" (Caveat, fades ~4s).
   Fortune is deterministic per date: pure `fortuneForDate(dateStr)` in
   `app/lib/fortune.js` (tested).

## Constraints carried over

Free tier only (nothing here calls any API); reduced-motion: no bob, no ripples,
static school unchanged; pointer-events: canvas stays non-interactive (tap
detection via window listener + closest() filter); all copy lowercase/warm;
commits conventional, no AI trailer.

## Verification

vitest: boids predators-array forces (flee/feed/strength/multiple), fortune
determinism; build + lint green; human browser pass on preview for ripples,
night mode (system clock), secret words, scraps layout at 375px.
