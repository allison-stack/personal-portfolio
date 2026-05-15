# Portfolio v2 — Operator Console

**Status:** approved (brainstorm)
**Date:** 2026-05-15
**Owner:** Allison Zhao

## Goal

Redesign the personal portfolio as a single-page operator console. The whole site is a TUI: status bar on top, panels in the middle, persistent ask bar pinned to the bottom. Visitors learn who Allison is by asking the AMA panel, not by reading a static About page.

The redesign is intentional and visibly UI/UX-driven, with one strong aesthetic POV (direction D · operator console) carried consistently across every element.

## Non-goals (v1)

The following are explicitly **not** in v1. They're in the v2 backlog.

- Blog / long-form posts (`/posts/*` reserved but not implemented)
- Spotify OAuth, WakaTime, Calendly, LeetCode challenge mode
- Light mode / theme toggle
- Analytics, cookie banner
- Comprehensive automated test suite (one smoke test for the AMA route only)
- Multi-page navigation

## Visual system

Single dark theme. No alternates.

| Token | Value | Use |
|---|---|---|
| `--bg` | `#0d1014` | page background |
| `--fg` | `#d9d4c7` | body text |
| `--fg-strong` | `#f3ecd8` | headings, identity |
| `--muted` | `#7e8a99` | labels, secondary |
| `--accent` | `#f0b76b` | amber — prompts, focus, current |
| `--ok` | `#92d27a` | health indicators, success |
| `--border` | `#2a2f36` | panel borders, dividers |
| `--err` | `#c44a1a` | error tone, sparingly |

Typography:
- **IBM Plex Mono** — body, panels, all UI text. Weights 300/400/500/600.
- **Instrument Serif** (italic) — used sparingly for decorative section taglines, tooltips, and error/empty-state copy. Adds a single human note against the monospace grid.

Borders, motion, density:
- 1px solid borders on panels, 1px dashed for nested groupings.
- No rounded corners > 0px on panels. AskBar input is 1px (intentional break).
- No shadows. No glassmorphism. No gradients except a 4% amber wash inside the AMA panel.
- Motion: panels fade in with a 40ms stagger on mount; cursor blink in AskBar; smooth-scroll to AMA panel after submit. **No** parallax, scroll-jacking, or hover-juggling.
- Box-drawing characters (`─ │ ┌ ┐`) may appear as decoration in headers but are never used for actual structural layout (CSS borders are).

## Information architecture

One page. The grid is responsive:

- ≥1024px: 3-column grid
- 640-1023px: 2-column
- <640px: stack

Panels and their column spans on the 3-col grid:

```
+-----------------+-----------------+-----------------+
|         AMA panel (col-span 2)    |  Now            |
+-----------------+-----------------+-----------------+
| Latest commit   | Day timeline    | LeetCode        |
+-----------------+-----------------+-----------------+
|              Projects (col-span 3)                  |
+-----------------+-----------------+-----------------+
```

Persistent AskBar is `position: fixed; bottom: 0` across the entire viewport. Focus shortcut: ⌘K (or Ctrl+K on non-Mac).

## Component tree

```
app/
  page.js                       // <Console/>
  layout.js                     // font preloads, body bg, metadata
  globals.css                   // CSS vars, font @imports, baseline resets
  components/console/
    Console.jsx                 // root layout
    TopBar.jsx                  // host string · uptime fake · live clock
    Identity.jsx                // ~/ allison + role
    Panels.jsx                  // grid wrapper
    AmaPanel.jsx                // conversation list, auto-intro, prompt chips
    NowPanel.jsx                // activity (derived) · day % · curated track
    LatestPanel.jsx             // GitHub latest commit (server component)
    DayPanel.jsx                // vertical timeline with current row highlight
    LeetCodePanel.jsx           // solved · week · streak · fav
    ProjectsPanel.jsx           // 4-6 cards
    AskBar.jsx                  // fixed-bottom input, ⌘K focus, slash menu
  content/
    bio.js                      // intro text + facts used by /whoami, /help
    qa.js                       // Q&A bank (30-50 entries)
    qa-embeddings.json          // generated at build time
    projects.js                 // [{ name, blurb, tags, links }]
    day.js                      // [{ start: "07:30", label: "wake" }, …]
    leetcode.js                 // { solved, weekDelta, streak, fav }
    links.js                    // { github, email, linkedin, resume }
  hooks/
    useNow.js                   // single source of truth for current time
    useTypewriter.js            // typewriter effect for AMA responses
  api/
    ama/route.js                // command dispatch + embedding retrieval
  lib/
    similarity.js               // cosine similarity
    rate-limit.js               // in-memory token bucket per IP
    commands.js                 // slash command registry
scripts/
  embed-qa.mjs                  // build-time embedding generator
public/
  Allison_Zhao_Resume_SWE.pdf   // kept
  // remove: next.svg, vercel.svg, window.svg, globe.svg, file.svg
  // keep photos for v2 blog
```

## Deletions

Remove from current codebase:
- `app/components/About.jsx`, `Contact.jsx`, `Header.jsx`, `Navbar.jsx`, `Projects.jsx` (replaced by console components)
- `app/context/ThemeContext.jsx` (single theme; no toggle)
- `bootstrap` and `react-bootstrap` from `package.json` (no UI framework needed)
- Unused public SVGs (`next.svg`, `vercel.svg`, etc.)

## AMA architecture (the critical piece)

### Authoring

`content/qa.js` is the source of truth for everything the AMA can say. Each entry:

```js
{
  id: "education",
  q: "Where did you go to school?",
  aliases: [
    "what university did you attend",
    "tell me about your education",
    "where do you study"
  ],
  a: "I'm finishing my CS degree at McMaster University in Hamilton, Ontario."
}
```

Target: 30-50 entries covering education, co-ops (Huawei, McMaster compiler research), tech stack, projects, hobbies (climbing, badminton, gym), preferences, contact, and a handful of fun/personality questions.

### Build-time embedding

`scripts/embed-qa.mjs` runs as part of `npm run build`:

1. For each Q&A entry, build a corpus string: `q + " " + aliases.join(" ")`
2. Call Gemini's `text-embedding-004` endpoint (free tier, 1500 req/min)
3. Write `content/qa-embeddings.json` containing `[{ id, vector: [...] }, ...]`
4. Both `qa.js` and `qa-embeddings.json` are committed; embedding regenerates only when `qa.js` changes (build script diffs and skips if unchanged)

This avoids any runtime cost for the answers themselves.

### Runtime request flow

`POST /api/ama` accepts `{ query: string }`. Edge runtime.

1. Rate limit check (token bucket per IP — 10 req / 5 min). If exceeded, return 429 with a friendly TUI-style error message.
2. Length check: reject if `query.length > 500`.
3. **Slash command path** — if `query` starts with `/`:
   - Look up command in `lib/commands.js` registry.
   - Return deterministic output. No embedding call.
4. **Retrieval path** — otherwise:
   - Embed `query` via Gemini `text-embedding-004`
   - Load `qa-embeddings.json`, compute cosine similarity against every vector
   - If top score ≥ **0.72**, return the corresponding `a` string.
   - Else, return a fallback: `"That's outside what I've written about myself. Email me directly at <email> and I'll answer."`
5. Response shape: `{ kind: "answer" | "command" | "fallback" | "error", text: string, meta?: {...} }`

### Slash commands

Registry in `lib/commands.js`:

| Command | Output |
|---|---|
| `/help` | List of available commands |
| `/whoami` | One-paragraph bio block |
| `/now` | Current activity derived from `day.js` + visitor clock |
| `/projects` | Names of projects from `projects.js` |
| `/links` | GitHub, email, LinkedIn, resume URL |
| `/resume` | Inline link to `/Allison_Zhao_Resume_SWE.pdf` |
| `/clear` | Clears the AMA conversation (client-side handles this directly) |

Typing `/` in AskBar opens a small popover listing matching commands.

### Auto-intro on mount

When AmaPanel first mounts, it streams an intro via `useTypewriter` (~600ms total). The intro is assembled from `content/bio.js` and uses `useNow()` to slot the visitor's current time into the activity line — so it stays honest at 3am.

Template:

> Hi — I'm Allison. CS student at McMaster, **{currentActivity}**. Past stints: database research at Huawei, compiler research at McMaster. Ask me anything below — about my work, the projects, or what I do when I'm not coding.

Where `{currentActivity}` is derived from `day.js` and the visitor's clock (e.g., "currently in a deep work block", "asleep right now", "on my commute home"). The intro is otherwise static, so no API call is made.

After the intro completes, 4-5 suggested prompt chips fade in.

### Streaming UX

Even though embedding retrieval returns the full answer in one shot, AmaPanel renders it via the same `useTypewriter` hook — ~30-50ms per character — so it visually matches a streaming LLM. This is purely cosmetic and reinforces the operator-console feel.

## Other data sources

### GitHub latest commit (`LatestPanel`)

Server component. Fetches `https://api.github.com/users/{links.github}/events/public` (username sourced from `content/links.js`) with `next: { revalidate: 300 }` (5 min ISR). Parses for the most recent `PushEvent` and renders sha, message, repo, relative time.

Unauthenticated GitHub API limit is 60 req/hr/IP — well within the 12 req/hr we'll make with 5-min revalidation.

If the call fails, panel renders an empty state with `Instrument Serif` italic: *"git ghost — try again in a minute"*.

### Day timeline (`DayPanel`)

Pure client. `day.js` exports schedule blocks. `useNow()` returns current time, recomputed every 60s. Component finds the block containing the current minute and applies `data-current="true"` styling (amber accent + progress bar within that block).

### LeetCode (`LeetCodePanel`)

Manual JSON in `content/leetcode.js`. Updated by hand. No API.

### Now panel

Derived from `day.js` (current activity) + manually-curated `nowPlaying` field in `content/now.js` (no Spotify OAuth in v1).

## Rate limiting

`lib/rate-limit.js` — in-memory `Map<ip, { count, resetAt }>`. Token bucket: 10 requests per 5 minutes per IP. On 429, the response includes `Retry-After` and a TUI-styled error message.

This is sufficient for a personal portfolio and Vercel's edge runtime. If abuse becomes an issue, swap to Vercel KV without changing the call site.

## Stack changes

`package.json`:
- **Remove:** `bootstrap`, `react-bootstrap`
- **Add:** `@google/generative-ai` (used only by the build-time embedding script and the runtime embedding call)
- **Keep:** `next`, `react`, `react-dom`, `react-icons`, `tailwindcss`

Environment:
- `.env.local` adds `GEMINI_API_KEY` (used for embeddings only; name kept generic for future flexibility)
- Vercel project gets the same env var

## Testing

One automated test:

- `app/api/ama/__tests__/route.test.js` — mocks the embedding call and asserts:
  - Slash commands return deterministic output
  - Retrieval path returns the highest-scoring answer above threshold
  - Below-threshold queries return the fallback
  - Rate limiter blocks the 11th request in a window

Manual QA checklist (lives in this spec, executed before each deploy):

- [ ] Home renders at 375 / 768 / 1024 / 1440
- [ ] AskBar focuses on page load and on ⌘K from anywhere
- [ ] AMA auto-intro types out within 1s of mount
- [ ] Suggested prompt chip fills AskBar and submits
- [ ] `/help` lists all commands
- [ ] A known question (e.g., "where did you go to school") returns the matching answer
- [ ] An off-topic question ("what's the weather") returns the fallback
- [ ] GitHub latest commit panel renders with real data
- [ ] Day panel highlights the correct block for the current time
- [ ] No console errors at any breakpoint
- [ ] Lighthouse: Performance ≥ 90, Accessibility ≥ 95

## Deployment

- Host: Vercel (existing project, `personal-portfolio`)
- API routes: edge runtime for `/api/ama`
- Static + ISR everywhere else
- Env: `GEMINI_API_KEY`
- Cost target: $0/month

## v2 backlog

Tracked here so we don't lose them:

- **Blog** — `/posts/[slug]` with MDX, project deep-dives in krish.gg/arian.gg style
- **Spotify OAuth** — real "now playing" with refresh token
- **WakaTime** — coding time per language strip in Now panel
- **Calendly** — embedded booking
- **LeetCode challenge mode** — visitor solves a problem, sees Allison's solution + timing
- **AMA history persistence** — save conversation across reloads (localStorage)
- **Photo gallery** — re-add the carousel from v1 as its own panel or route
