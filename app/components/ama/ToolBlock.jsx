"use client";

const COLLAPSE_AFTER = 12;

export function ToolBlock({ name, args = [], body = "", ok = true }) {
  const argStr = args.join(", ");
  const lines = body.split("\n");
  const long = lines.length > COLLAPSE_AFTER;
  const head = lines.slice(0, COLLAPSE_AFTER);
  const tail = lines.slice(COLLAPSE_AFTER);

  return (
    <div className="font-mono leading-snug fade-in">
      <div className="flex items-baseline gap-2">
        <span className={ok ? "ok" : "err"}>⏺</span>
        <span className="strong">{name}</span>
        <span className="muted">({argStr})</span>
      </div>
      <div className="pl-[14px]">
        {head.length > 0 && (
          <div className="flex">
            <span className="muted shrink-0 pr-2 select-none">⎿</span>
            <pre className="whitespace-pre-wrap break-words m-0 flex-1">{head.join("\n")}</pre>
          </div>
        )}
        {long && (
          <details className="pl-4 mt-0.5">
            <summary className="muted cursor-pointer hover:strong list-none">
              [+{tail.length} more line{tail.length === 1 ? "" : "s"}]
            </summary>
            <pre className="whitespace-pre-wrap break-words m-0 mt-1">{tail.join("\n")}</pre>
          </details>
        )}
      </div>
    </div>
  );
}
