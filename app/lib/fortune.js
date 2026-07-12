// Daily fortunes for the pond's bubble. Deterministic per date so every
// visitor sees the same luck on the same day.
export const FORTUNES = [
  "above average",
  "unreasonably good",
  "koi-adjacent",
  "save some for the interview",
  "good enough to ship",
  "high, if you touch grass",
  "compiling… looks promising",
  "better than yesterday's",
  "the fish are rooting for you",
  "lucky enough to find this site",
  "green across the board",
  "rate-limited but recovering",
];

export function fortuneForDate(dateStr) {
  let h = 0;
  for (const ch of dateStr) h = (h * 31 + ch.codePointAt(0)) >>> 0;
  return FORTUNES[h % FORTUNES.length];
}
