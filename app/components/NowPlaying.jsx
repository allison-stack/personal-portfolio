"use client";
import { useEffect, useState, useCallback } from "react";

const TZ = "America/Toronto";

const SCHEDULE = [
  { start: 0,    label: "asleep" },
  { start: 450,  label: "breakfast" },
  { start: 480,  label: "commute" },
  { start: 600,  label: "work" },
  { start: 1080, label: "commute home" },
  { start: 1200, label: "build stuff" },
];

function timeLabel() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const hh = Number(parts.find((p) => p.type === "hour").value);
  const mm = Number(parts.find((p) => p.type === "minute").value);
  const now = hh * 60 + mm;
  let current = SCHEDULE[SCHEDULE.length - 1];
  for (const block of SCHEDULE) {
    if (block.start <= now) current = block;
    else break;
  }
  return current.label;
}

export function NowPlaying() {
  const [text, setText] = useState("");

  const refresh = useCallback(() => {
    fetch("/api/now-playing")
      .then((r) => r.json())
      .then((d) => {
        if (d.isPlaying && d.track) {
          setText(`listening to ${d.track.name} — ${d.track.artist}`);
        } else {
          setText(timeLabel());
        }
      })
      .catch(() => setText(timeLabel()));
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 30_000);
    return () => clearInterval(id);
  }, [refresh]);

  if (!text) return null;
  return <span className="now-act">{text}</span>;
}
