"use client";
import { Panel } from "../Panel";
import { day } from "../../content/day";
import { useNow } from "../../hooks/useNow";

export function DayPanel() {
  const { start: currentStart } = useNow();
  return (
    <Panel title="day" hint="local time">
      <ul className="space-y-0.5">
        {day.map((b) => {
          const active = b.start === currentStart;
          return (
            <li
              key={b.start}
              className={`flex gap-3 items-baseline ${active ? "" : "muted"}`}
            >
              <span className="tabular-nums w-12 shrink-0">{b.start}</span>
              <span className={active ? "accent" : ""}>{active ? "▸" : " "}</span>
              <span className={active ? "strong" : ""}>{b.label}</span>
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}
