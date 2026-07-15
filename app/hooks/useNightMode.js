"use client";

import { useEffect, useState } from "react";
import { isNightHour, torontoHour } from "../lib/night";

export function useNightMode() {
  const [night, setNight] = useState(false);

  useEffect(() => {
    const check = () => setNight(isNightHour(torontoHour()));
    check();
    const id = setInterval(check, 60 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  return night;
}
