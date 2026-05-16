const WINDOW_MS = 5 * 60 * 1000;
const LIMIT = 10;

const buckets = new Map();

export function checkRate(key) {
  const now = Date.now();
  const arr = buckets.get(key) ?? [];
  const fresh = arr.filter((t) => now - t < WINDOW_MS);
  if (fresh.length >= LIMIT) {
    buckets.set(key, fresh);
    return { ok: false, retryAfterSec: Math.ceil((WINDOW_MS - (now - fresh[0])) / 1000) };
  }
  fresh.push(now);
  buckets.set(key, fresh);
  return { ok: true, remaining: LIMIT - fresh.length };
}
