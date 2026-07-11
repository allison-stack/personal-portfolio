# Playground Homepage — Design Spec

**Date:** 2026-07-11
**Status:** approved (spec + wireframe)
**Wireframe:** https://claude.ai/code/artifact/656f67c9-96fb-420c-a402-3e1f32163347

## Goal

Make allisonzhao.vercel.app more than a "colorful resume." The homepage becomes a
fun, interactive playground — a boids fish simulation where the visitor's cursor
is a predator, plus an Infinite-Craft-style fun-fact combiner. Deliberately
non-technical in tone: the resume content stays available but moves to `/about`.

## Page structure

- **`/` (new):** the playground. Single scrolling page, same warm paper/grain
  aesthetic as the current site. Sections top to bottom:
  1. Intro card — playful one-liner ("hi, i'm allison. i collect fun facts.
     the fish are scared of your mouse."), quiet links to `/about` and the
     resume PDF.
  2. Fact combiner — the centerpiece (see below).
  3. Footer — thanks-for-playing note + about link.
- **`/about` (new route, old content):** the current `app/page.js` scrapbook
  page moves here **intact** — hero, photo, chips, about, experience,
  extracurriculars, projects, say-hi, notes folder, footer. Add a small
  "→ come play" link back to `/`.
- Metadata/layout updated so both pages have sensible titles.

## Fish layer (boids)

- `FishCanvas.jsx` — client component; one fixed, full-viewport `<canvas>`
  behind all content (`z-index` below content, `pointer-events: none`; mouse
  tracked via a `window` listener so the canvas never blocks clicks).
- ~120 fish rendered as small ink-dash fish in the site's paper palette.
- Behavior per frame (classic Reynolds boids + predator):
  - **separation** — steer away from neighbors that are too close
  - **alignment** — steer toward neighbors' average heading
  - **cohesion** — steer toward neighbors' center of mass
  - **wander** — small noise so the school never goes static
  - **flee** — strong repulsion from the cursor within ~150px (inverse-square);
    on touch devices the last touch point is the predator
- **Performance:** spatial hash grid for neighbor lookups (O(n) per frame),
  fixed timestep, `devicePixelRatio` capped at 2, animation paused when
  `document.hidden`.
- **Accessibility:** `prefers-reduced-motion` → render a static school
  (no animation).
- **Stretch delight:** a "🍞 feed the fish" toggle that flips the cursor force
  from repulsion to attraction so the school chases the visitor.

## Fact combiner

Infinite-Craft-style crafting where every discovery also teaches a real science
fun fact.

### Interaction

- A tray of element chips (emoji + name) and a workspace area.
- Desktop: drag one element onto another. Mobile: tap two elements to combine.
- Combining yields a **new element chip** plus a **fun-fact card**, e.g.
  shark + tree → 🦕 *ancient life* — "sharks are older than trees by ~50
  million years."
- Starting elements: 💧 water, 🔥 fire, 🌍 earth, 💨 air.
- Discovered elements persist in `localStorage`. No accounts, no global
  "first discovery" tracking (would need a DB — out of scope).
- If a combination can't be resolved (rate limit, API down): show a gentle
  "hmm, nothing happened" like Infinite Craft does.

### Backend — `app/api/combine/route.js` (edge)

Input: two element names (order-normalized into a cache key, length-capped).
Resolution order:

1. **Seed graph** — `app/content/combos.json`, ~40 hand-curated combos with
   Allison's favorite facts. Guarantees the early game is high quality.
2. **In-memory cache** of previously generated combos (per edge instance).
3. **Gemini flash** call (existing free-tier `GEMINI_API_KEY`) with a prompt
   that returns strict JSON `{result, emoji, fact}`; response validated before
   use.

Constraints (hard rules):

- Free tier only — reuse the existing `checkRate` per-IP rate limiter from the
  AMA; the quota must be protected.
- No new paid services, no database.
- Degrades gracefully to seed-graph-only when `GEMINI_API_KEY` is absent.

## Error handling summary

| Failure | Behavior |
|---|---|
| Combine API rate-limited / down / bad JSON from Gemini | "hmm, nothing happened" in the UI |
| No `GEMINI_API_KEY` | seed combos still work; novel combos "nothing happened" |
| Reduced motion | static fish, page fully usable |
| Tab hidden | animation paused, resumes on focus |

## Verification

- Fish flee the cursor; behavior holds while scrolling and after tab switches.
- Combiner: seed combos work, novel combos hit Gemini, rate limiting kicks in,
  localStorage persistence survives reload, mobile tap-to-combine works.
- `/about` renders the old homepage identically; links between pages work.
- `prefers-reduced-motion` respected; no horizontal scroll on mobile.

## Out of scope (future scroll sections)

- Fact gumball machine / fact-of-the-day
- Personal SRE-style status page
- Wiring the existing AMA chat into a page
- Global first-discovery tracking (needs a DB)
