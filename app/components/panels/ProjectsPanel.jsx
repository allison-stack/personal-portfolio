import { Panel } from "../Panel";
import { projects } from "../../content/projects";

export function ProjectsPanel({ index = 0 }) {
  return (
    <Panel title="projects" hint={`${projects.length} repos`} status="cached" index={index}>
      <ul className="space-y-3">
        {projects.map((p, i) => {
          const idx = String(i + 1).padStart(2, "0");
          const Title = <span className="strong">{p.name}</span>;
          return (
            <li
              key={p.name}
              className="space-y-1 fade-in project-row"
              style={{ "--delay": `${i * 40}ms` }}
            >
              <div className="flex items-baseline justify-between gap-3">
                <div className="flex items-baseline gap-2 min-w-0">
                  <span className="muted tabular-nums shrink-0">[{idx}]</span>
                  {p.href ? (
                    <a
                      href={p.href}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:accent truncate"
                    >
                      {Title}
                      <span className="muted"> ↗</span>
                    </a>
                  ) : (
                    Title
                  )}
                </div>
                <span className="label truncate shrink-0">{p.tags.join(" · ")}</span>
              </div>
              <p className="muted pl-8">{p.blurb}</p>
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}
