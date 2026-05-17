"use client";
import { useEffect, useState } from "react";

function randomHex(len = 7) {
  const chars = "0123456789abcdef";
  let s = "";
  for (let i = 0; i < len; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

export function SystemFooter() {
  const [session, setSession] = useState("·······");

  useEffect(() => {
    setSession(randomHex(7));
  }, []);

  return (
    <div className="border-t dashline px-4 sm:px-6 py-2 flex items-center justify-between text-[10.5px] muted tabular-nums">
      <span>
        build <span className="strong">v2026.05</span> · session <span className="strong">{session}</span>
      </span>
      <span className="hidden sm:inline">
        ↑ scroll · <span className="accent">›</span> ask · ⌘K focus
      </span>
    </div>
  );
}
