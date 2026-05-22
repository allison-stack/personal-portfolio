"use client";
import { useTypewriter } from "../../hooks/useTypewriter";
import { pretty } from "../../content/files";

export function UserMessage({ text, cwd = "/" }) {
  return (
    <div className="flex gap-2 items-baseline">
      <span className="accent shrink-0 tabular-nums whitespace-nowrap">{pretty(cwd)}$</span>
      <span className="strong whitespace-pre-wrap break-words">{text}</span>
    </div>
  );
}

export function AssistantMessage({ text, animate = true }) {
  const { out, done } = useTypewriter(text, { enabled: animate, speed: 10 });
  return (
    <div className="flex gap-2 items-baseline">
      <span className="muted shrink-0">·</span>
      <span className={`whitespace-pre-wrap break-words ${done ? "" : "caret"}`}>
        {out}
      </span>
    </div>
  );
}

export function SystemMessage({ text }) {
  return <div className="muted italic whitespace-pre-wrap">{text}</div>;
}
