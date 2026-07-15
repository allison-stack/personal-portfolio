"use client";

import { FishCanvas } from "./FishCanvas";
import { useNightMode } from "../hooks/useNightMode";

// single owner of the night check: the theme class and the canvas must flip
// together, so night is decided here and passed down
export function PondTheme({ children }) {
  const night = useNightMode();
  return (
    <div className={night ? "pond pond--night" : "pond"}>
      <div className="water" aria-hidden="true" />
      <FishCanvas night={night} />
      {children}
    </div>
  );
}
