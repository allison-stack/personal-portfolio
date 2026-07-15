# devlog

## 2026-07-11 — playground homepage
- homepage is now a boids fish sim (cursor = predator) + infinite-craft-style fact combiner; old page moved to /about.
- neighbor search was the perf risk: spatial hash grid keeps 120 fish at 60fps (O(n) per frame instead of O(n²) — 14,280 pair checks down to ~1,000).
- 41 hand-curated seed combos; novel combos via gemini flash behind the existing rate limiter, so the free quota stays protected.

## 2026-07-12 — pond life
- filled the playground gaps: field-note scraps (caveat handwriting, one-line commits to add), do-not-tap-the-glass sign, gold koi footnote.
- generalized the sim from one predator to a predator list with TTLs — taps ripple and scare the school now, and next session's cat swipe is just another array entry.
- also: toronto night mode (fish get tired after 11pm), secret words (koi/bus), fortune bubbles every ~2min. all still zero API calls.
- earlier today: shipped the fix for fish only fleeing at tab edges — canvas is a replaced element, inset:0 didn't stretch it, so the retina bitmap rendered at 2x and sim/mouse coords were misaligned. two lines of css.

## 2026-07-15 — pond water theme
- homepage got a real skin: sunlit-pond day mode (water gradient, drifting caustics, floating cards) and a night-tank mode (glass cards, glowing koi) after 11pm toronto, replacing the old dim-only night — both scoped under `.pond`/`.pond--night` so `/about` stays 0 lines changed, untouched by construction.
- the gotcha: FishCanvas was reading its palette via `getComputedStyle(document.documentElement)`, which never sees `.pond`-scoped overrides — it now reads off its own canvas element and re-reads whenever the night prop flips.
- 27 tests passing now (up from 22) — added coverage for the night-hour boundary and the fish-color fallbacks.
