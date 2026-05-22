"use client";
import { useEffect, useState } from "react";

function randomHex(len = 7) {
  const chars = "0123456789abcdef";
  let s = "";
  for (let i = 0; i < len; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

function pretty(cwd) {
  if (!cwd || cwd === "/") return "~";
  return "~" + cwd;
}

export function SystemFooter() {
  const [session, setSession] = useState("·······");
  const [cwd, setCwd] = useState("/");

  useEffect(() => {
    setSession(randomHex(7));
    const onCwd = (e) => setCwd(e.detail ?? "/");
    window.addEventListener("portfolio-cwd", onCwd);
    return () => window.removeEventListener("portfolio-cwd", onCwd);
  }, []);

  return (
    <div className="border-t dashline px-1 py-2 flex items-center justify-between text-[10.5px] muted tabular-nums">
      <span>
        build <span className="strong">v2026.05</span> · cwd <span className="strong">{pretty(cwd)}</span> · session <span className="strong">{session}</span>
      </span>
      <span className="hidden sm:inline">
        ↑↓ history · <span className="accent">tab</span> complete · ⌘K focus
      </span>
    </div>
  );
}
