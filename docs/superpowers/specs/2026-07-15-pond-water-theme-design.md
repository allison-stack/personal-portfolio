# Pond Water Theme — Homepage Redesign (Design)

**Date:** 2026-07-15 · extends `2026-07-11-playground-homepage-design.md` + `2026-07-12-pond-life-design.md`
**Decision:** direction A ("sunlit koi pond") as the daytime identity; direction B ("night tank")
replaces the current dim-the-fish night mode as a full palette skin. Direction C ("glass & line")
rejected; its placard styling may be borrowed for the do-not-tap sign later (out of scope).
**Scope:** `/` only. `/about` keeps the cream-paper theme untouched. Wireframes:
https://claude.ai/code/artifact/2fd9dd60-a0a1-41b9-ab83-cbe5e9ca6426

## Why

The current cream/terracotta palette reads as stationery — the fish look printed on paper.
The page should read as water viewed from above: an open-top koi pond.

## Theme scoping

- New wrapper class `.pond` on the homepage root div (currently `.pg`). It re-declares the
  theme tokens locally (`--bg`, `--accent`, `--line`, `--muted`, `--body`, `--ink`) plus new
  fish tokens. `:root` keeps the cream values, so `/about` is untouched by construction.
- `.pond--night` re-declares the same tokens with the night-tank palette. The existing
  23:00–06:59 America/Toronto check moves out of FishCanvas into a small client hook
  (`useNightMode`, mount + hourly re-check); a small client component (`PondTheme`) wraps the
  page content and applies the class, and FishCanvas consumes the same hook.
- **FishCanvas color fix:** it currently reads vars via `getComputedStyle(document.documentElement)`,
  which never sees `.pond` overrides. It reads from its own canvas element instead (the canvas
  moves inside the `.pond` wrapper), using dedicated `--fish-ink`, `--fish-koi`, `--fish-gold`.
  Colors re-read when night mode toggles, not just at mount.
- The `.grain` paper texture on `/` is replaced by a `.caustics` overlay (below). `/about`
  keeps grain.

## Day palette (A — sunlit koi pond)

| token | value | note |
|---|---|---|
| water gradient | `#ddf0e9` → `#8cc3ba` → `#63a49c` | radial: bright center, deep edges — sells "top-down" |
| card paper | `#fdfbf3` | cards/scraps stay warm paper, floating on the water |
| accent | `#d1602f` | koi vermillion (from terracotta `#a65f3c`) |
| ink / body | `#221d16` / `#4a443a` | unchanged on cards |
| fish ink | `#2e5a5e` | deep teal-slate silhouettes |
| koi / gold | `#d1602f` / `#c9950c` | gold unchanged |

## Night palette (B — night tank, 23:00–06:59 Toronto)

| token | value | note |
|---|---|---|
| water gradient | `#10333d` → `#0b2530` → `#071820` | |
| cards | `rgba(255,255,255,0.055)` + 1px `rgba(159,214,222,0.28)` border + slight blur | glass panels; scraps become glass too |
| text ink / body | `#e6f3f4` / `#b9cfd3` | |
| accent | `#6fd6d6` | glow cyan — links, borders, ripples, fortunes |
| fish | `#9fc4c9` | pale silhouettes, no shadows |
| koi / gold | `#e8a13d` | both glow (soft radial halo); night keeps slower/calmer sim params |

## Water treatments (both skins)

1. **Depth gradient** — fixed full-viewport radial gradient (tokens above) behind the canvas.
2. **Fish shadows (day only)** — each fish draws a small low-alpha dark ellipse offset a few
   px below before the body (no canvas blur filters — keep the frame budget). Skipped at night.
3. **Floating cards** — `.pg-card` gains a surface-tension ring (extra
   `box-shadow: 0 0 0 6px rgba(255,255,255,0.22)`-style layer; cyan-tinted at night), a deeper
   underside shadow, and a slow bob (±2px, ~7s, staggered). Scraps keep their existing bob.
4. **Caustics overlay** — CSS-only: a handful of soft white radial-gradient highlight blobs
   drifting very slowly (single long `transform` animation on the overlay, opacity ≤ 0.5 day /
   off at night).
5. **Recolors** — ripple rings and fortune-bubble text go white-on-water (glow cyan at night);
   section-header wavy underline recolors to water teal (it now literally means water);
   feed-toggle and night-note pills pick up scoped tokens automatically.

## Reduced motion

Card bob, caustic drift, and koi glow-pulse all gate on `prefers-reduced-motion` (caustics
render static, not removed). Existing sim/ripple/scrap behavior unchanged.

## Compatibility notes

- Cat-above-the-pond (specced, unbuilt): pencil-sketch cat sits on cards, which stay
  paper/glass surfaces — no conflict; its sketch stroke color should use a scoped token.
- Night mode's existing sim changes (maxSpeed ~1.4, wander ~0.06, alpha 0.35) are kept and
  now pair with the palette swap.
- Free tier: everything here is CSS + canvas; no new APIs.

## Verification

- vitest: `useNightMode` hour boundaries (22:59/23:00/06:59/07:00 Toronto), fish-token
  fallbacks when vars missing.
- build + lint green.
- Human pass on preview: day and night skins (system clock forward), `/about` unchanged,
  gold-koi glow at night, reduced-motion pass, 375px layout.
