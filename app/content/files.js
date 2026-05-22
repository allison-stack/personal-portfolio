// Virtual file contents for the in-TUI shell. Each leaf is either a string
// or an async function returning a string. No real fs access; everything is
// inline or pulled from the existing content/*.js + the live API routes.

import { links } from "./links";
import { now } from "./now";
import { day } from "./day";
import { leetcode } from "./leetcode";

const aboutMd = `# allison zhao

cs @ mcmaster. cloud database engineer intern at huawei since may 2025,
continuing through summer 2026. before that, research at mcmaster on a
risc-v formal-semantics project in haskell.

i like having ideas and shipping them fast. agents have been the playground
lately — multi-agent test systems, retrieval over arxiv, dependency graphs
rendered as llm-wikis.

outside the editor: climbing, badminton, gym.
`;

const portfolioMd = `# portfolio · v2026

this site. operator-console redesign with retrieval-based ama — no llm
generation at runtime, every answer is grounded in a pre-embedded q&a set.

stack: next 15 · react 19 · tailwind 4 · gemini embeddings (free tier)
repo:  github.com/${links.github}/personal-portfolio

design notes:
  - dm mono + instrument serif, dark console palette
  - live widgets: github, last.fm, leetcode, day timeline
  - the chat panel doubles as a real shell — try "ls"
`;

const testforgeMd = `# testforge

multi-agent test-quality system. three roles in a loop:

  author      writes tests for a target module
  adversary   mutates the target to break those tests
  judge       critiques which mutations slipped through

the loop converges when the author's tests catch the adversary's mutations
or the judge runs out of meaningful critiques.

stack: python · agents (custom orchestrator) · docker
repo:  github.com/${links.github}/testforge
`;

const arxivRagMd = `# arxiv-rag

retrieval-augmented q&a over arxiv papers. ingest pipeline pulls pdfs,
chunks by section, embeds, indexes. query path retrieves top-k and answers
with citations.

stack: python · rag · vector store
repo:  github.com/${links.github}/arxiv-RAG
`;

const composioOaMd = `# composio-oa

auto-generates a dependency graph of any codebase as an llm-friendly wiki.
nodes are modules; edges are imports. output is markdown viewable in
obsidian's graph view, so the agent can navigate it visually.

stack: agents · llm-wiki · obsidian
repo:  github.com/${links.github}/composio-oa
`;

const riscvMd = `# risc-v · haskell

ra work at mcmaster. formal isa semantic models in haskell + a
qemu-validated interpreter. cross-checked instruction semantics against
qemu's reference implementation on the official compliance suite.

stack: haskell · isa formalization · qemu
(private repo)
`;

const huaweiMd = `# huawei · cloud database engineer intern

may 2025 — present (continuing through summer 2026).

working on query engine internals for a distributed cloud database. small
team, hard problems, slow feedback loops — exactly the pace i want.
specifics covered by nda.

learned: distributed query planning, the shape of "boring" infra problems,
how a real review process feels at scale.
`;

const mcmasterMd = `# mcmaster · ra (risc-v formal semantics)

undergrad ra position in 2024. formalized a subset of the risc-v isa in
haskell and built an interpreter validated against qemu on the official
risc-v compliance suite.

learned: type-driven design, how to debug a spec, why semantics is harder
than syntax.
`;

const readingMd = `# now reading

${now.reading}
`;

const favoriteMd = `# favorite leetcode pattern

${leetcode.fav}

profile: ${leetcode.profile}
`;

async function fetchPlaying() {
  try {
    const r = await fetch("/api/now-playing");
    const d = await r.json();
    if (d?.track) return `${d.track.name} — ${d.track.artists}\n${d.track.url}`;
  } catch {}
  return now.track;
}

async function fetchLeetStats() {
  try {
    const r = await fetch("/api/leetcode");
    const d = await r.json();
    if (d?.stats) {
      return `solved   ${d.stats.solved}\nstreak   ${d.stats.streak}d\nthisweek +${d.stats.weekDelta}\nfav      ${leetcode.fav}`;
    }
  } catch {}
  return `solved   ${leetcode.solved}\nstreak   ${leetcode.streak}d\nthisweek +${leetcode.weekDelta}\nfav      ${leetcode.fav}`;
}

async function fetchActivity() {
  try {
    const r = await fetch(`https://api.github.com/users/${links.github}/events/public?per_page=20`);
    if (!r.ok) return "(github api rate limited)";
    const events = await r.json();
    const lines = [];
    for (const ev of events.slice(0, 12)) {
      const when = new Date(ev.created_at).toISOString().replace("T", " ").slice(0, 16);
      const repo = ev.repo?.name ?? "";
      let msg = ev.type.replace(/Event$/, "").toLowerCase();
      if (ev.type === "PushEvent") {
        const c = ev.payload?.commits?.[ev.payload.commits.length - 1];
        if (c) msg = `push  ${c.sha.slice(0, 7)} ${c.message.split("\n")[0]}`;
      } else if (ev.type === "PullRequestEvent") {
        msg = `pr    #${ev.payload?.pull_request?.number} ${ev.payload?.pull_request?.title}`;
      } else if (ev.type === "WatchEvent") {
        msg = `star  ${repo}`;
      }
      lines.push(`${when}  ${repo.padEnd(28)} ${msg}`);
    }
    return lines.join("\n") || "(no recent activity)";
  } catch {
    return "(network error fetching github)";
  }
}

function currentActivity() {
  const tzNow = new Date().toLocaleTimeString("en-CA", {
    timeZone: links.timezone,
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
  });
  let cur = day[0];
  for (const b of day) if (b.start <= tzNow) cur = b;
  return `${cur.label}  (since ${cur.start}, ${links.timezone})`;
}

// The virtual tree. Each node is either:
//   { kind: "dir",  children: { name: node, ... } }
//   { kind: "file", content: string | () => string | () => Promise<string> }
//   { kind: "live", content: () => Promise<string> }
//   { kind: "url",  href: string }
export const fsRoot = {
  kind: "dir",
  children: {
    "about.md": { kind: "file", content: aboutMd },

    "now": {
      kind: "dir",
      children: {
        "activity":   { kind: "live", content: () => Promise.resolve(currentActivity()) },
        "playing":    { kind: "live", content: fetchPlaying },
        "reading.md": { kind: "file", content: readingMd },
      },
    },

    "projects": {
      kind: "dir",
      children: {
        "portfolio.md":   { kind: "file", content: portfolioMd },
        "testforge.md":   { kind: "file", content: testforgeMd },
        "arxiv-rag.md":   { kind: "file", content: arxivRagMd },
        "composio-oa.md": { kind: "file", content: composioOaMd },
        "risc-v.md":      { kind: "file", content: riscvMd },
      },
    },

    "work": {
      kind: "dir",
      children: {
        "huawei.md":   { kind: "file", content: huaweiMd },
        "mcmaster.md": { kind: "file", content: mcmasterMd },
        "resume.pdf":  { kind: "url",  href: links.resume },
      },
    },

    "leetcode": {
      kind: "dir",
      children: {
        "stats":       { kind: "live", content: fetchLeetStats },
        "favorite.md": { kind: "file", content: favoriteMd },
      },
    },

    "links": {
      kind: "dir",
      children: {
        "email":    { kind: "file", content: links.email },
        "github":   { kind: "url",  href: `https://github.com/${links.github}` },
        "linkedin": { kind: "url",  href: links.linkedin },
      },
    },

    "activity.log": { kind: "live", content: fetchActivity },
  },
};

// Paths are unix-style strings starting with "/". cwd is also absolute. "~" → "/".
export function resolve(input, cwd = "/") {
  if (!input || input === "~") return "/";
  let parts;
  if (input.startsWith("/")) {
    parts = input.split("/").filter(Boolean);
  } else if (input.startsWith("~/")) {
    parts = input.slice(2).split("/").filter(Boolean);
  } else {
    parts = (cwd === "/" ? [] : cwd.split("/").filter(Boolean)).concat(
      input.split("/").filter(Boolean)
    );
  }
  const out = [];
  for (const p of parts) {
    if (p === ".") continue;
    if (p === "..") out.pop();
    else out.push(p);
  }
  return "/" + out.join("/");
}

export function lookup(path) {
  const parts = path.split("/").filter(Boolean);
  let node = fsRoot;
  for (const p of parts) {
    if (node.kind !== "dir") return null;
    node = node.children[p];
    if (!node) return null;
  }
  return node;
}

export function list(path) {
  const node = lookup(path);
  if (!node || node.kind !== "dir") return null;
  return Object.entries(node.children).map(([name, n]) => ({
    name,
    kind: n.kind,
    isDir: n.kind === "dir",
  }));
}

export async function read(path) {
  const node = lookup(path);
  if (!node) return null;
  if (node.kind === "url") return node.href;
  if (node.kind === "file" || node.kind === "live") {
    const c = node.content;
    if (typeof c === "function") return await c();
    return c;
  }
  return null;
}

export function walk(path = "/") {
  const node = lookup(path);
  if (!node || node.kind !== "dir") return [];
  const out = [];
  const recur = (n, prefix) => {
    for (const [name, child] of Object.entries(n.children)) {
      const p = prefix === "/" ? `/${name}` : `${prefix}/${name}`;
      out.push({ path: p, name, kind: child.kind, isDir: child.kind === "dir" });
      if (child.kind === "dir") recur(child, p);
    }
  };
  recur(node, path);
  return out;
}

export function pretty(path) {
  if (path === "/") return "~";
  return "~" + path;
}
