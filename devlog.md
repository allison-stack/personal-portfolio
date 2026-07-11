# devlog

## 2026-07-11 — playground homepage
- homepage is now a boids fish sim (cursor = predator) + infinite-craft-style fact combiner; old page moved to /about.
- neighbor search was the perf risk: spatial hash grid keeps 120 fish at 60fps (O(n) per frame instead of O(n²) — 14,280 pair checks down to ~1,000).
- 41 hand-curated seed combos; novel combos via gemini flash behind the existing rate limiter, so the free quota stays protected.
