"use client";
import { Panel } from "../Panel";
import { day } from "../../content/day";
import { useNow } from "../../hooks/useNow";

function dayProgress(hh, mm) {
  const total = 24 * 60;
  const elapsed = Number(hh) * 60 + Number(mm);
  return Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
}

export function DayPanel({ index = 0 }) {
  const { start: currentStart, hh, mm } = useNow();
  const pct = dayProgress(hh, mm);

  return (
    <Panel title="day" hint="schedule" status="live" index={index}>
      <div className="mb-3">
        <div className="flex justify-between text-[11px] muted mb-1">
          <span>day progress</span>
          <span className="tabular-nums strong">{pct}%</span>
        </div>
        <div className="bar-track">
          <i className="bar-fill" style={{ width: `${pct}%` }} />
        </div>
      </div>
      <ul className="space-y-0.5">
        {day.map((b) => {
          const active = b.start === currentStart;
          return (
            <li
              key={b.start}
              className={`flex gap-3 items-baseline ${active ? "" : "muted"}`}
              style={{ transition: "color var(--dur-base) var(--ease-out), opacity var(--dur-base) var(--ease-out)" }}
            >
              <span className="tabular-nums w-12 shrink-0">{b.start}</span>
              <span className={active ? "accent" : "muted"}>{active ? "▸" : "│"}</span>
              <span
                className={active ? "strong" : ""}
                style={{ transition: "color var(--dur-base) var(--ease-out)" }}
              >
                {b.label}
              </span>
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}
