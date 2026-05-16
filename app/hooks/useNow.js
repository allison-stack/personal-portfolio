"use client";
import { useEffect, useState } from "react";
import { day } from "../content/day";
import { links } from "../content/links";

function toMinutes(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

function currentBlock(date) {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: links.timezone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = fmt.formatToParts(date);
  const hh = parts.find((p) => p.type === "hour").value;
  const mm = parts.find((p) => p.type === "minute").value;
  const nowMin = toMinutes(`${hh}:${mm}`);

  let current = day[day.length - 1];
  for (const block of day) {
    if (toMinutes(block.start) <= nowMin) current = block;
    else break;
  }
  return { ...current, hh, mm };
}

export function useNow() {
  const [now, setNow] = useState(() => currentBlock(new Date()));

  useEffect(() => {
    const tick = () => setNow(currentBlock(new Date()));
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, []);

  return now;
}
