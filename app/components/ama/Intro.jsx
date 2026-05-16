"use client";
import { bio, suggestedPrompts } from "../../content/bio";
import { useNow } from "../../hooks/useNow";
import { useTypewriter } from "../../hooks/useTypewriter";

export function Intro({ onPrompt }) {
  const { activity } = useNow();
  const intro = bio.intro.replace("{activity}", activity);
  const { out, done } = useTypewriter(intro, { speed: 12 });

  return (
    <div className="space-y-3">
      <p className={`serif text-xl strong leading-snug ${done ? "" : "caret"}`}>
        {out}
      </p>
      {done && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {suggestedPrompts.map((p) => (
            <button
              key={p}
              onClick={() => onPrompt(p)}
              className="border hairline px-2 py-1 text-[12px] muted hover:accent hover:border-[var(--color-accent)] transition-colors"
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
