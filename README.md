# personal-portfolio

my corner of the internet — [allisonzhao.vercel.app](https://allisonzhao.vercel.app)

- `/` — the playground: a boids fish school that treats your cursor as a predator
  (or a feeder, if you toggle the bread), plus a fact combiner — combine two
  elements, discover a new one, learn a real science fun fact.
- `/about` — the actual about-me: experience, projects, contact.

## stack

next.js 15 (app router) · react 19 · canvas 2d · gemini free tier for novel
combos (seed combos are hand-curated in `app/content/combos.json`)

## develop

```bash
npm run dev     # local dev
npm test        # vitest (boids math, combine logic, seed graph)
npm run build   # production build
```

needs `GEMINI_API_KEY` in `.env.local` for the AMA + novel combos; without it,
seed combos still work.
