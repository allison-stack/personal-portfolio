# Learning Log — personal-portfolio

## Concepts covered
| Date | Concept | Where it came up |
|---|---|---|
| 2026-07-11 | Boids (separation/alignment/cohesion + flee) | app/lib/boids.js — fish school with cursor as predator |
| 2026-07-11 | Spatial hash grid (O(n) neighbor search) | boids stepSchool — grid cell = perception radius, only 9 cells checked per fish; same idea as a DB index |
| 2026-07-11 | next/link vs raw `<a>` for internal nav | no-html-link-for-pages is a build error; `<a>` full-reloads and drops client routing |
| 2026-07-11 | React StrictMode double-invokes state updaters | Combiner tapChip — async fetch inside setSelected fired twice in dev; moved side effect to event scope |
| 2026-07-11 | Edge runtime in-memory cache semantics | /api/combine module-scope Map — per-instance, resets on cold start, fine because seeds cover the hot path |
| 2026-07-11 | Input validation as injection defense (blast radius) | normalizeName's [a-z0-9 -]/40-char cap bounds the Gemini prompt; payload lives in the cache key, so poisoning only hits the attacker's own pair |
| 2026-07-11 | Gemini 2.5 thinking tokens count against maxOutputTokens | /api/combine — 200-token cap would be eaten by default thinking; thinkingBudget: 0 |
| 2026-07-11 | Data-level tests can't catch interaction-level bugs | reachability test passed while the UI made 30/41 combos unreachable (self-combos blocked by tap-toggle + drag guard) |
| 2026-07-11 | Canvas resize clears the bitmap | FishCanvas reduced-motion path went blank on window resize until redraw added |
| 2026-07-12 | Canvas CSS size vs bitmap size are independent (replaced elements don't stretch from inset:0) | fish only fled at tab edges — element rendered at dpr×viewport, so sim/mouse coords were misaligned 2:1; fix = width/height 100% |
| 2026-07-15 | Scoped CSS custom properties as a theming mechanism | .pond re-declares --bg/--accent/--fish-* locally; /about never has the class, so it's safe by construction — no conditional styling logic anywhere |
| 2026-07-15 | getComputedStyle(element) vs (documentElement) for CSS vars | FishCanvas read vars off documentElement, which never sees .pond overrides; inherited custom props must be read from an element inside the scope |
| 2026-07-15 | React commit ordering: DOM mutations flush before passive effects | PondTheme's class swap is on the DOM before FishCanvas's [night] effect re-reads colors — same-commit re-read is race-free; two independent hourly timers would not have been |
| 2026-07-15 | CSS specificity ties break by source order | .pond--night .pg-card (0,2,0) beats .pond .pg-card (0,2,0) only because the night block is appended after the day block |
| 2026-07-15 | Trace out-param (pay-per-use instrumentation) | stepSchool fills caller-owned trace array only when passed — observability costs nothing while nobody observes; same idea as a profiler's debug flag |
| 2026-07-15 | Reused out-param objects must be fully overwritten | trace objects persist across frames; writing only non-zero forces would leave stale arrows pointing at predators that left — every field written every step |
| 2026-07-16 | Perceived affordance: controls must borrow the page's established control language | think-scrap was a real button but read as decoration; fix was reusing .feed-toggle's pill look, not adding "tap me" hints |
| 2026-07-16 | Exposing an effect-scoped closure via ref | toggleXray closes over fish/W/H/draw inside the mount effect; JSX onClick can't reach it, so the effect writes it to toggleXrayRef (nulled on cleanup) |

## Predictions
| Date | Decision | Her pick | Verdict |
|---|---|---|---|
| 2026-07-11 | Playground architecture (living page vs exhibits vs one-screen) | A: one living page, fixed canvas behind scroll | Agreed — ambient layer makes the fish the connective tissue, and new sections join the same scroll |
| 2026-07-12 | How do taps/cat-swipes coexist with the mouse predator? | A: predator list with TTLs | Agreed — generalize an interface when the second consumer appears; B special-cases, C re-implements physics per scare type |
| 2026-07-11 | Combiner mechanic | New element + fun fact per discovery | Agreed — the fact payout is what makes it hers, not an Infinite Craft clone |
| 2026-07-11 | Old homepage | Move intact to /about | Agreed — recruiters lose nothing, playground stays uncompromised |
| 2026-07-15 | How does the x-ray get force vectors out of stepSchool? | A: optional trace out-param | Agreed — though "the backend already did the work" isn't quite it (forces are computed then discarded); the concepts are single source of truth for the force math + pay-per-use trace hook |

## Re-quiz queue
| Concept | Missed on | Next review | Passes |
|---|---|---|---|
| All-pairs O(n²) cost vs spatial hash (why 120 fish = ~14k pair checks, not 120) | 2026-07-15 | 2026-07-16 | 0/3 |
