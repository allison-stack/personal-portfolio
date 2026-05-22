// localStorage-backed REPL history. Capped at 100 entries.

const KEY = "portfolio.repl.history";
const CAP = 100;

function safeLoad() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function safeSave(arr) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(arr.slice(-CAP)));
  } catch {}
}

export function load() {
  return safeLoad();
}

export function push(entry) {
  if (!entry) return;
  const cur = safeLoad();
  if (cur[cur.length - 1] === entry) return;
  cur.push(entry);
  safeSave(cur);
}

export function len() {
  return safeLoad().length;
}

export function at(idx) {
  const h = safeLoad();
  if (idx < 0 || idx >= h.length) return null;
  return h[idx];
}

// "!N" expansion: 1-indexed, matches bash convention.
export function expandBang(input) {
  const m = /^!(\d+)$/.exec(input.trim());
  if (!m) return null;
  const idx = parseInt(m[1], 10) - 1;
  return at(idx);
}

export function format() {
  const h = safeLoad();
  if (!h.length) return "(history is empty)";
  return h.map((e, i) => `${String(i + 1).padStart(4, " ")}  ${e}`).join("\n");
}
