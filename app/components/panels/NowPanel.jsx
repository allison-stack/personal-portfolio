"use client";
import { useEffect, useState } from "react";
import { Panel } from "../Panel";
import { now } from "../../content/now";
import { useNow } from "../../hooks/useNow";

export function NowPanel({ index = 0 }) {
  const { activity, hh, mm } = useNow();
  const [track, setTrack] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/now-playing")
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled && d?.track) setTrack(d.track);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const trackText = track ? `${track.name} — ${track.artists}` : now.track;
  const trackHref = track?.url ?? null;

  return (
    <Panel title="now" hint="local" status="live" index={index}>
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
          <dt className="muted w-20 shrink-0">top · 7d</dt>
          <dd key={track?.url ?? "fallback"} className="strong truncate fade-in">
            {trackHref ? (
              <a href={trackHref} target="_blank" rel="noreferrer" className="hover:accent">
                {trackText} ↗
              </a>
            ) : (
              trackText
            )}
          </dd>
        </div>
        <div className="flex gap-3">
          <dt className="muted w-20 shrink-0">reading</dt>
          <dd className="strong truncate">{now.reading}</dd>
        </div>
      </dl>
    </Panel>
  );
}
