"use client";
import { useEffect, useState } from "react";

const TZ = "America/Toronto";

function fmt(date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date).toLowerCase();
}

export function Clock() {
  const [time, setTime] = useState("");

  useEffect(() => {
    setTime(fmt(new Date()));
    const id = setInterval(() => setTime(fmt(new Date())), 30_000);
    return () => clearInterval(id);
  }, []);

  if (!time) return null;
  return <span className="now-time">{time}</span>;
}
