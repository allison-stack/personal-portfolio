import { Panel } from "../Panel";
import { links } from "../../content/links";

async function fetchLatestCommit() {
  try {
    const res = await fetch(
      `https://api.github.com/users/${links.github}/events/public?per_page=10`,
      {
        next: { revalidate: 300 },
        headers: { "User-Agent": "personal-portfolio" },
      }
    );
    if (!res.ok) return null;
    const events = await res.json();
    const push = events.find((e) => e.type === "PushEvent" && e.payload?.commits?.length);
    if (!push) return null;
    const commit = push.payload.commits[push.payload.commits.length - 1];
    return {
      repo: push.repo.name,
      message: commit.message.split("\n")[0],
      url: `https://github.com/${push.repo.name}/commit/${commit.sha}`,
      when: push.created_at,
    };
  } catch {
    return null;
  }
}

function relative(when) {
  const diff = Date.now() - new Date(when).getTime();
  const m = Math.round(diff / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  return `${d}d ago`;
}

export async function LatestPanel() {
  const latest = await fetchLatestCommit();
  return (
    <Panel title="latest" hint="github · 5m cache">
      {latest ? (
        <div className="space-y-1">
          <div className="flex gap-3 items-baseline">
            <span className="muted w-16 shrink-0">repo</span>
            <a
              href={`https://github.com/${latest.repo}`}
              target="_blank"
              rel="noreferrer"
              className="strong hover:accent truncate"
            >
              {latest.repo}
            </a>
          </div>
          <div className="flex gap-3 items-baseline">
            <span className="muted w-16 shrink-0">commit</span>
            <a href={latest.url} target="_blank" rel="noreferrer" className="hover:accent truncate">
              {latest.message}
            </a>
          </div>
          <div className="flex gap-3 items-baseline">
            <span className="muted w-16 shrink-0">when</span>
            <span className="muted">{relative(latest.when)}</span>
          </div>
        </div>
      ) : (
        <p className="muted">no recent public commits.</p>
      )}
    </Panel>
  );
}
