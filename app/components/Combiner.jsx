"use client";

import { useEffect, useRef, useState } from "react";

const SEED_ELEMENTS = [
  { name: "water", emoji: "💧" },
  { name: "fire", emoji: "🔥" },
  { name: "earth", emoji: "🌍" },
  { name: "air", emoji: "💨" },
];
const STORE_KEY = "playground-elements-v1";

export function Combiner() {
  const [elements, setElements] = useState(SEED_ELEMENTS);
  const [selected, setSelected] = useState([]); // element names, max 2
  const [busy, setBusy] = useState(false);
  const [last, setLast] = useState(null); // {a, b, combo|null, isNew, cooldown}
  const dragFrom = useRef(null);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORE_KEY) ?? "null");
      if (Array.isArray(saved) && saved.length >= SEED_ELEMENTS.length) {
        setElements(saved);
      }
    } catch {
      /* corrupted storage — fall back to seeds */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(elements));
    } catch {
      /* storage full/blocked — discoveries just won't persist */
    }
  }, [elements]);

  async function combine(aName, bName) {
    const a = elements.find((e) => e.name === aName);
    const b = elements.find((e) => e.name === bName);
    if (!a || !b || busy) return;
    setBusy(true);
    setLast(null);
    let next = null;
    try {
      const res = await fetch("/api/combine", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ a: a.name, b: b.name }),
      });
      const data = await res.json().catch(() => null);
      const combo = data?.combo ?? null;
      if (combo) {
        const isNew = !elements.some((e) => e.name === combo.result);
        if (isNew) {
          setElements((prev) => [...prev, { name: combo.result, emoji: combo.emoji }]);
        }
        next = { a, b, combo, isNew };
      } else {
        next = { a, b, combo: null, cooldown: res.status === 429 };
      }
    } catch {
      next = { a, b, combo: null };
    }
    setLast(next);
    setSelected([]);
    setBusy(false);
  }

  function tapChip(name) {
    if (busy) return;
    setSelected((prev) => {
      if (prev.includes(name)) return prev.filter((n) => n !== name);
      const next = [...prev, name];
      if (next.length === 2) {
        combine(next[0], next[1]);
        return next;
      }
      return next;
    });
  }

  return (
    <div className="cmb">
      <div className="cmb-tray" role="list">
        {elements.map((el) => (
          <button
            key={el.name}
            type="button"
            role="listitem"
            className={
              "cmb-chip" +
              (selected.includes(el.name) ? " is-selected" : "") +
              (last?.isNew && last.combo?.result === el.name ? " is-new" : "")
            }
            disabled={busy}
            draggable={!busy}
            onClick={() => tapChip(el.name)}
            onDragStart={() => { dragFrom.current = el.name; }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const from = dragFrom.current;
              dragFrom.current = null;
              if (from && from !== el.name) combine(from, el.name);
            }}
          >
            <span aria-hidden="true">{el.emoji}</span> {el.name}
          </button>
        ))}
      </div>

      <div className="cmb-stage" aria-live="polite">
        {busy && <p className="cmb-hint">combining…</p>}
        {!busy && !last && (
          <p className="cmb-hint">
            pick two elements (tap them, or drag one onto another)
          </p>
        )}
        {!busy && last && !last.combo && (
          <p className="cmb-hint">
            {last.cooldown
              ? "the lab needs a breather — try again in a minute"
              : "hmm, nothing happened"}
          </p>
        )}
        {!busy && last?.combo && (
          <div className="cmb-result">
            <p className="cmb-eq">
              {last.a.emoji} {last.a.name} + {last.b.emoji} {last.b.name} ={" "}
              <b>
                {last.combo.emoji} {last.combo.result}
              </b>
              {last.isNew && <span className="cmb-new"> new!</span>}
            </p>
            <p className="cmb-fact">
              <span className="cmb-fact-label">fun fact</span>
              {last.combo.fact}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
