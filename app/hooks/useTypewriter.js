"use client";
import { useEffect, useRef, useState } from "react";

export function useTypewriter(text, { speed = 14, enabled = true } = {}) {
  const [out, setOut] = useState(enabled ? "" : text);
  const [done, setDone] = useState(!enabled);
  const idxRef = useRef(0);

  useEffect(() => {
    idxRef.current = 0;
    if (!enabled || !text) {
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
  }, [text, speed, enabled]);

  return { out, done };
}
