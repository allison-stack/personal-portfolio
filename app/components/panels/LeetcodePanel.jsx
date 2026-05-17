"use client";
import { useEffect, useState } from "react";
import { Panel } from "../Panel";
import { leetcode } from "../../content/leetcode";

const WEEKLY_GOAL = 5;

export function LeetcodePanel() {
  const [live, setLive] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/leetcode")
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled && d?.stats) setLive(d.stats);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const solved = live?.solved ?? leetcode.solved;
  const weekDelta = live?.weekDelta ?? leetcode.weekDelta;
  const streak = live?.streak ?? leetcode.streak;
  const pct = Math.min(100, Math.round((weekDelta / WEEKLY_GOAL) * 100));

  return (
    <Panel
      title="leetcode"
      status={live ? "live" : "cached"}
      hint={
        <a
          className="hover:strong"
          href={leetcode.profile}
          target="_blank"
          rel="noreferrer"
        >
          profile ↗
        </a>
      }
    >
      <dl className="grid grid-cols-2 gap-y-1.5 gap-x-3 mb-3">
        <dt className="muted">solved</dt>
        <dd className="strong tabular-nums">{solved}</dd>
        <dt className="muted">streak</dt>
        <dd className="strong tabular-nums">{streak}d</dd>
        <dt className="muted">favorite</dt>
        <dd className="strong truncate col-span-1">{leetcode.fav}</dd>
        <dt className="muted">this week</dt>
        <dd className="ok tabular-nums">+{weekDelta}</dd>
      </dl>
      <div>
        <div className="flex justify-between text-[11px] muted mb-1">
          <span>week / {WEEKLY_GOAL}</span>
          <span className="tabular-nums strong">{pct}%</span>
        </div>
        <div className="bar-track">
          <i className="bar-fill" style={{ width: `${pct}%` }} />
        </div>
      </div>
    </Panel>
  );
}
