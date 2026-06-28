"use client";
import { useEffect, useState } from "react";
import { Panel } from "../Panel";
import { now } from "../../content/now";
import { useNow } from "../../hooks/useNow";

export function NowPanel({ index = 0 }) {
  const { activity, hh, mm } = useNow();
  const [track, setTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const poll = () =>
      fetch("/api/now-playing")
        .then((r) => r.json())
        .then((d) => {
          if (cancelled) return;
          if (d?.track) setTrack(d.track);
          setIsPlaying(!!d?.isPlaying);
        })
        .catch(() => {});
    poll();
    const id = setInterval(poll, 30_000);
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  const trackText = track
    ? `${track.name} — ${track.artist ?? track.artists ?? ""}`
    : now.track;
  const trackHref = track?.url ?? null;
  const trackLabel = isPlaying ? "playing" : "top · 7d";

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
          <dt className="muted w-20 shrink-0">{trackLabel}</dt>
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
