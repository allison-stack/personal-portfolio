"use client";
import { Panel } from "../Panel";
import { now } from "../../content/now";
import { useNow } from "../../hooks/useNow";

export function NowPanel() {
  const { activity, hh, mm } = useNow();
  return (
    <Panel title="now" hint="local" status="live">
      <dl className="space-y-1.5">
        <div className="flex gap-3">
          <dt className="muted w-20 shrink-0">activity</dt>
          <dd className="strong truncate">{activity}</dd>
        </div>
        <div className="flex gap-3">
          <dt className="muted w-20 shrink-0">clock</dt>
          <dd className="strong tabular-nums">{hh}:{mm}</dd>
        </div>
        <div className="flex gap-3">
          <dt className="muted w-20 shrink-0">track</dt>
          <dd className="strong truncate">{now.track}</dd>
        </div>
        <div className="flex gap-3">
          <dt className="muted w-20 shrink-0">reading</dt>
          <dd className="strong truncate">{now.reading}</dd>
        </div>
      </dl>
    </Panel>
  );
}
