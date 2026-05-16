"use client";
import { useEffect, useRef, useState } from "react";
import { matchSlash, SLASH_COMMANDS } from "../../lib/commands";

export function AskBar({ onSubmit, disabled }) {
  const [value, setValue] = useState("");
  const [menuIdx, setMenuIdx] = useState(0);
  const inputRef = useRef(null);

  const showMenu = value.trim().startsWith("/");
  const candidates = showMenu ? matchSlash(value) : [];

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => { setMenuIdx(0); }, [value]);

  function submit(text) {
    const t = (text ?? value).trim();
    if (!t || disabled) return;
    onSubmit(t);
    setValue("");
  }

  function handleKey(e) {
    if (showMenu && candidates.length) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setMenuIdx((i) => (i + 1) % candidates.length);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setMenuIdx((i) => (i - 1 + candidates.length) % candidates.length);
        return;
      }
      if (e.key === "Tab") {
        e.preventDefault();
        setValue(candidates[menuIdx].cmd + " ");
        return;
      }
    }
    if (e.key === "Enter") {
      e.preventDefault();
      if (showMenu && candidates.length === 1) {
        submit(candidates[0].cmd);
      } else if (showMenu && candidates.length > 1 && value.trim() !== candidates[menuIdx].cmd) {
        submit(candidates[menuIdx].cmd);
      } else {
        submit();
      }
    }
  }

  return (
    <div className="fixed inset-x-0 bottom-0 border-t hairline bg-[var(--color-bg)]/95 backdrop-blur supports-[backdrop-filter]:bg-[var(--color-bg)]/80">
      {showMenu && candidates.length > 0 && (
        <ul className="max-w-3xl mx-auto px-4 sm:px-6 pt-2 text-[12px]">
          {candidates.map((c, i) => (
            <li
              key={c.cmd}
              onMouseDown={(e) => { e.preventDefault(); submit(c.cmd); }}
              className={`flex justify-between px-2 py-0.5 cursor-pointer ${
                i === menuIdx ? "accent" : "muted hover:strong"
              }`}
            >
              <span>{c.cmd}</span>
              <span className="muted">{c.desc}</span>
            </li>
          ))}
        </ul>
      )}
      <form
        onSubmit={(e) => { e.preventDefault(); submit(); }}
        className="max-w-3xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-2"
      >
        <span className="accent shrink-0">›</span>
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKey}
          disabled={disabled}
          spellCheck={false}
          autoComplete="off"
          placeholder="ask anything · /help · ⌘K to focus"
          className="flex-1 bg-transparent outline-none placeholder:text-[var(--color-muted)] strong disabled:opacity-50"
        />
        <span className="muted text-[11px] hidden sm:inline">enter</span>
      </form>
    </div>
  );
}

export { SLASH_COMMANDS };
