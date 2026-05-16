import { Panel } from "../Panel";
import { projects } from "../../content/projects";

export function ProjectsPanel() {
  return (
    <Panel title="projects" hint={`${projects.length} repos`}>
      <ul className="space-y-3">
        {projects.map((p) => {
          const Title = (
            <span className="strong">{p.name}</span>
          );
          return (
            <li key={p.name} className="space-y-1">
              <div className="flex items-baseline justify-between gap-3">
                {p.href ? (
                  <a href={p.href} target="_blank" rel="noreferrer" className="hover:accent">
                    {Title}
                    <span className="muted"> ↗</span>
                  </a>
                ) : (
                  Title
                )}
                <span className="muted text-[11px] truncate">
                  {p.tags.join(" · ")}
                </span>
              </div>
              <p className="muted">{p.blurb}</p>
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}
