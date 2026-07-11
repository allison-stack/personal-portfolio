// Pure combiner logic shared by the API route and the seed-file tests.

export function normalizeName(raw) {
  const s = (raw ?? "").toString().toLowerCase().trim().replace(/\s+/g, " ");
  if (!s || s.length > 40) return null;
  if (!/^[a-z0-9 \-]+$/.test(s)) return null;
  return s;
}

export function comboKey(a, b) {
  return [a, b].sort().join("+");
}

export function validateCombo(obj) {
  if (!obj || typeof obj !== "object") return null;
  const result = normalizeName(obj.result);
  if (!result) return null;
  const emoji = (obj.emoji ?? "").toString().trim();
  if (!emoji || emoji.length > 8 || /[a-z0-9]/i.test(emoji)) return null;
  const fact = (obj.fact ?? "").toString().trim();
  if (fact.length < 10 || fact.length > 300) return null;
  return { result, emoji, fact };
}
