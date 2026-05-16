export function cosine(a, b) {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

export function bestMatch(qVec, entries) {
  let best = { score: -Infinity, entry: null };
  for (const e of entries) {
    const s = cosine(qVec, e.vector);
    if (s > best.score) best = { score: s, entry: e };
  }
  return best;
}
