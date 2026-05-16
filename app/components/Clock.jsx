"use client";
import { useEffect, useState } from "react";
import { links } from "../content/links";

function fmt(date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: links.timezone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZoneName: "short",
  }).formatToParts(date);
  const hh = parts.find((p) => p.type === "hour").value;
  const mm = parts.find((p) => p.type === "minute").value;
  const tz = parts.find((p) => p.type === "timeZoneName")?.value ?? "";
  return { time: `${hh}:${mm}`, tz };
}

export function Clock() {
  const [t, setT] = useState(() => fmt(new Date()));

  useEffect(() => {
    const id = setInterval(() => setT(fmt(new Date())), 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <span className="tabular-nums">
      <span className="strong">{t.time}</span>
      <span className="muted"> {t.tz}</span>
    </span>
  );
}
