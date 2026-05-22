"use client";
import { useEffect, useRef, useState } from "react";

export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = (e) => setReduced(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

export function useTypewriter(text, { speed = 14, enabled = true } = {}) {
  const reduced = usePrefersReducedMotion();
  const active = enabled && !reduced;
  const [out, setOut] = useState(active ? "" : text);
  const [done, setDone] = useState(!active);
  const idxRef = useRef(0);

  useEffect(() => {
    idxRef.current = 0;
    if (!active || !text) {
      setOut(text || "");
      setDone(true);
      return;
    }
    setOut("");
    setDone(false);
    const id = setInterval(() => {
      idxRef.current += 1;
      if (idxRef.current >= text.length) {
        setOut(text);
        setDone(true);
        clearInterval(id);
      } else {
        setOut(text.slice(0, idxRef.current));
      }
    }, speed);
    return () => clearInterval(id);
  }, [text, speed, active]);

  return { out, done };
}
