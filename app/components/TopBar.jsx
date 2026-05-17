"use client";
import { useEffect, useState } from "react";
import { links } from "../content/links";
import { Clock } from "./Clock";

function formatUptime(ms) {
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  return `${h}h ${m % 60}m`;
}

export function TopBar() {
  const [uptime, setUptime] = useState("0s");

  useEffect(() => {
    const start = Date.now();
    const tick = () => setUptime(formatUptime(Date.now() - start));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="border-b dashline px-4 sm:px-6 py-2 flex items-center justify-between gap-4 text-[11px]">
      <div className="flex items-center gap-3 min-w-0 muted">
        <span className="strong whitespace-nowrap tabular-nums">
          allison@portfolio<span className="muted">:</span><span className="accent">~</span>
        </span>
        <span className="hidden sm:inline">·</span>
        <span className="hidden sm:inline tabular-nums">session {uptime}</span>
        <span className="hidden md:inline">·</span>
        <span className="hidden md:inline">
          <span className="ok">●</span> online
        </span>
      </div>
      <div className="flex items-center gap-3 whitespace-nowrap muted">
        <span className="hidden md:inline">{links.location}</span>
        <span className="hidden md:inline">·</span>
        <Clock />
      </div>
    </header>
  );
}
