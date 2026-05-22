"use client";
import { useEffect, useRef, useState } from "react";
import { matchSlash, SLASH_COMMANDS } from "../../lib/commands";
import { complete, apply } from "../../lib/completion";
import * as history from "../../lib/history";
import { pretty } from "../../content/files";

export function AskBar({ onSubmit, onAbort, disabled, cwd = "/", pending = false }) {
  const [value, setValue] = useState("");
  const [menuIdx, setMenuIdx] = useState(0);
  const [histIdx, setHistIdx] = useState(null);
  const [draft, setDraft] = useState("");
  const inputRef = useRef(null);

  const slashOpen = value.trim().startsWith("/");
  const slashCandidates = slashOpen ? matchSlash(value) : [];
  const completion = !slashOpen && value.length > 0 ? complete(value, cwd) : { candidates: [], kind: "none" };
  const showMenu = slashOpen ? slashCandidates.length > 0 : false;

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        return;
      }
      if ((e.ctrlKey) && e.key.toLowerCase() === "c") {
        if (pending) {
          e.preventDefault();
          onAbort?.();
        }
        return;
      }
      if (e.key === "Escape") {
        if (value.length > 0) {
          e.preventDefault();
          setValue("");
        } else {
          window.dispatchEvent(new CustomEvent("ama-clear"));
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [value, pending, onAbort]);

  useEffect(() => { setMenuIdx(0); }, [value]);

  function submit(text) {
    const t = (text ?? value).trim();
    if (!t || disabled) return;
    history.push(t);
    setHistIdx(null);
    setDraft("");
    onSubmit(t);
    setValue("");
  }

  function walkHistory(dir) {
    const len = history.len();
    if (!len) return;
    let idx = histIdx;
    if (dir === "up") {
      if (idx === null) {
        setDraft(value);
        idx = len - 1;
      } else if (idx > 0) {
        idx -= 1;
      }
    } else {
      if (idx === null) return;
      if (idx < len - 1) idx += 1;
      else {
        setHistIdx(null);
        setValue(draft);
        return;
      }
    }
    setHistIdx(idx);
    setValue(history.at(idx) ?? "");
  }

  function handleKey(e) {
    if (showMenu && slashCandidates.length) {
      if (e.key === "ArrowDown") { e.preventDefault(); setMenuIdx((i) => (i + 1) % slashCandidates.length); return; }
      if (e.key === "ArrowUp")   { e.preventDefault(); setMenuIdx((i) => (i - 1 + slashCandidates.length) % slashCandidates.length); return; }
      if (e.key === "Tab")       { e.preventDefault(); setValue(slashCandidates[menuIdx].cmd + " "); return; }
    } else {
      if (e.key === "ArrowUp")   { e.preventDefault(); walkHistory("up"); return; }
      if (e.key === "ArrowDown") { e.preventDefault(); walkHistory("down"); return; }
      if (e.key === "Tab") {
        e.preventDefault();
        const cs = completion.candidates;
        if (cs.length === 1) setValue(apply(value, cs[0]));
        else if (cs.length > 1) {
          // Find common prefix and complete to that, otherwise show menu.
          const names = cs.map((c) => c.label);
          let cp = names[0];
          for (const n of names) {
            let i = 0;
            while (i < cp.length && i < n.length && cp[i] === n[i]) i++;
            cp = cp.slice(0, i);
          }
          if (cp && cp.length > 0) {
            const tokens = value.split(/\s+/);
            const last = tokens[tokens.length - 1];
            const head = last.includes("/") ? last.slice(0, last.lastIndexOf("/") + 1) : "";
            if (head + cp !== last) {
              tokens[tokens.length - 1] = head + cp;
              setValue(tokens.join(" "));
            }
          }
        }
        return;
      }
    }
    if (e.key === "Enter") {
      e.preventDefault();
      if (showMenu && slashCandidates.length === 1) submit(slashCandidates[0].cmd);
      else if (showMenu && slashCandidates.length > 1 && value.trim() !== slashCandidates[menuIdx].cmd) submit(slashCandidates[menuIdx].cmd);
      else submit();
    }
  }

  const promptPrefix = `allison@portfolio:${pretty(cwd)}$`;

  return (
    <div className="border-t hairline">
      <div className="px-3 py-2">
        {showMenu && (
          <ul className="mb-2 border dashline tinted-accent px-2 py-1 text-[12px] fade-in">
            {slashCandidates.map((c, i) => (
              <li
                key={c.cmd}
                onMouseDown={(e) => { e.preventDefault(); submit(c.cmd); }}
                className={`flex justify-between px-2 py-0.5 cursor-pointer ${i === menuIdx ? "accent" : "muted hover:strong"}`}
              >
                <span>{c.cmd}</span>
                <span className="muted">{c.desc}</span>
              </li>
            ))}
          </ul>
        )}
        {!slashOpen && completion.kind === "path" && completion.candidates.length > 1 && (
          <ul className="mb-2 border dashline tinted-accent px-2 py-1 text-[12px] fade-in flex flex-wrap gap-x-3 gap-y-0.5">
            {completion.candidates.slice(0, 12).map((c) => (
              <li key={c.value} className="muted">
                {c.label}<span className="muted">{c.desc ? ` ${c.desc[0]}` : ""}</span>
              </li>
            ))}
          </ul>
        )}
        <form
          onSubmit={(e) => { e.preventDefault(); submit(); }}
          className="ask-form flex items-baseline gap-2"
        >
          <span className="accent shrink-0 tabular-nums hidden sm:inline whitespace-nowrap">{promptPrefix}</span>
          <span className="accent shrink-0 tabular-nums sm:hidden">$</span>
          <input
            ref={inputRef}
            value={value}
            onChange={(e) => { setValue(e.target.value); setHistIdx(null); }}
            onKeyDown={handleKey}
            disabled={disabled}
            spellCheck={false}
            autoComplete="off"
            placeholder={pending ? "thinking… (ctrl+c to interrupt)" : "type a command or ask anything"}
            className="flex-1 min-w-0 bg-transparent outline-none placeholder:text-[var(--color-muted)] strong disabled:opacity-50"
          />
        </form>
      </div>
      <div className="flex justify-between text-[10.5px] muted px-3 pb-1.5 tabular-nums border-t dashline pt-1">
        <span>{pretty(cwd)} · {pending ? "ctrl+c interrupt" : "tab complete · ↑↓ history"}</span>
        <span className="hidden sm:inline">esc clears · ⌘K focuses · /help</span>
      </div>
    </div>
  );
}

export { SLASH_COMMANDS };
