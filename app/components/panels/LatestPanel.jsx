import { Panel } from "../Panel";
import { links } from "../../content/links";

const MAX_EVENTS = 4;

function relative(when) {
  const diff = Date.now() - new Date(when).getTime();
  const m = Math.round(diff / 60_000);
  if (m < 1) return "now";
  if (m < 60) return `${m}m`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.round(h / 24);
  return `${d}d`;
}

function describe(ev) {
  const repo = ev.repo?.name ?? "";
  const short = (sha) => sha.slice(0, 7);

  switch (ev.type) {
    case "PushEvent": {
      const commits = ev.payload?.commits ?? [];
      const last = commits[commits.length - 1];
      const head = ev.payload?.head;
      const branch = (ev.payload?.ref ?? "").replace(/^refs\/heads\//, "");
      if (last) {
        return {
          kind: "push",
          sha: short(last.sha),
          text: last.message.split("\n")[0],
          url: `https://github.com/${repo}/commit/${last.sha}`,
          repo,
        };
      }
      if (head) {
        return {
          kind: "push",
          sha: short(head),
          text: branch ? `push to ${branch}` : `pushed to ${repo}`,
          url: `https://github.com/${repo}/commit/${head}`,
          repo,
        };
      }
      return null;
    }
    case "PullRequestEvent": {
      const action = ev.payload?.action;
      const pr = ev.payload?.pull_request;
      if (!pr) return null;
      return {
        kind: action === "closed" && pr.merged ? "merge" : "pr",
        sha: `#${pr.number}`,
        text: pr.title,
        url: pr.html_url,
        repo,
      };
    }
    case "IssuesEvent": {
      const issue = ev.payload?.issue;
      if (!issue) return null;
      return {
        kind: "issue",
        sha: `#${issue.number}`,
        text: `${ev.payload.action}: ${issue.title}`,
        url: issue.html_url,
        repo,
      };
    }
    case "PullRequestReviewEvent": {
      const pr = ev.payload?.pull_request;
      if (!pr) return null;
      return {
        kind: "review",
        sha: `#${pr.number}`,
        text: pr.title,
        url: pr.html_url,
        repo,
      };
    }
    case "CreateEvent": {
      const refType = ev.payload?.ref_type ?? "ref";
      const refName = ev.payload?.ref;
      return {
        kind: "create",
        sha: "",
        text: refName ? `${refType} ${refName}` : `new ${refType} in ${repo.split("/").pop()}`,
        url: `https://github.com/${repo}`,
        repo,
      };
    }
    case "ReleaseEvent": {
      const rel = ev.payload?.release;
      if (!rel) return null;
      return {
        kind: "release",
        sha: rel.tag_name ?? "",
        text: rel.name ?? rel.tag_name ?? "release",
        url: rel.html_url,
        repo,
      };
    }
    case "ForkEvent":
      return {
        kind: "fork",
        sha: "",
        text: `forked ${repo}`,
        url: `https://github.com/${repo}`,
        repo,
      };
    case "WatchEvent":
      return {
        kind: "star",
        sha: "",
        text: `starred ${repo}`,
        url: `https://github.com/${repo}`,
        repo,
      };
    default:
      return null;
  }
}

// Stay under GitHub's 60/hr unauthenticated limit even when the page is
// hammered: throttle to one upstream call per minute. Within that window
// all callers share the last fetched result.
const MIN_INTERVAL_MS = 60_000;
let lastFetchAt = 0;
let lastResult = [];

async function fetchActivity() {
  const now = Date.now();
  if (lastResult.length && now - lastFetchAt < MIN_INTERVAL_MS) {
    return lastResult;
  }
  try {
    const res = await fetch(
      `https://api.github.com/users/${links.github}/events/public?per_page=30`,
      {
        cache: "no-store",
        headers: { "User-Agent": "personal-portfolio" },
      }
    );
    if (!res.ok) return lastResult;
    const events = await res.json();
    const parsed = [];
    const seen = new Set();
    for (const ev of events) {
      const d = describe(ev);
      if (!d) continue;
      const dedupeKey = `${d.repo}:${d.kind}:${d.sha || d.text}`;
      if (seen.has(dedupeKey)) continue;
      seen.add(dedupeKey);
      parsed.push({ ...d, when: ev.created_at });
      if (parsed.length >= MAX_EVENTS) break;
    }
    lastFetchAt = now;
    lastResult = parsed;
    return parsed;
  } catch {
    return lastResult;
  }
}

export async function LatestPanel({ index = 0 }) {
  const events = await fetchActivity();
  return (
    <Panel title="activity" hint="github · 1m" status="live" index={index}>
      {events.length ? (
        <ul className="divide-y divide-[var(--color-border)]">
          {events.map((e, i) => (
            <li
              key={i}
              className="grid grid-cols-[2.5rem_1fr_auto] gap-2 items-baseline py-1.5 first:pt-0 last:pb-0 fade-in"
              style={{ "--delay": `${i * 40}ms` }}
            >
              <span className="muted tabular-nums text-[11px]">{relative(e.when)}</span>
              <a
                href={e.url}
                target="_blank"
                rel="noreferrer"
                className="truncate hover:accent"
              >
                {e.sha && <span className="accent tabular-nums mr-1.5">{e.sha}</span>}
                <span className="strong">{e.text}</span>
              </a>
              <span className="label">{e.kind}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="muted">no recent public activity.</p>
      )}
    </Panel>
  );
}
