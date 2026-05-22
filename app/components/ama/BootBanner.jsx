"use client";
import { bio, suggestedPrompts } from "../../content/bio";

export function BootBanner({ onPrompt }) {
  return (
    <div className="space-y-3 fade-in">
      <div>
        <h1 className="serif text-3xl sm:text-4xl strong leading-[1.05] tracking-tight">
          <span className="muted">~/</span> <span className="accent">{bio.name.toLowerCase()}</span>
        </h1>
        <p className="muted italic mt-1">
          <span className="accent">//</span> {bio.role}
        </p>
      </div>

      <div className="border-t dashline" />

      <div className="muted text-[12px] space-y-0.5">
        <div><span className="accent">›</span> type <span className="strong">help</span> to list commands, or just ask a question.</div>
        <div><span className="accent">›</span> try <span className="strong">ls</span>, <span className="strong">cat about.md</span>, <span className="strong">tree</span>, <span className="strong">top</span>.</div>
      </div>

      <div className="flex flex-wrap gap-1.5 pt-1">
        {suggestedPrompts.slice(0, 4).map((p, i) => (
          <button
            key={p}
            onClick={() => onPrompt(p)}
            className="border dashline px-2 py-1 text-[12px] muted hover:strong hover:border-[var(--color-accent)] hover:tinted-accent transition-colors fade-in"
            style={{ "--delay": `${i * 50}ms` }}
          >
            <span className="muted">›</span> {p}
          </button>
        ))}
      </div>
    </div>
  );
}
