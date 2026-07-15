const TOKENS = {
  ink: ["--fish-ink", "#2e5a5e"],
  koi: ["--fish-koi", "#d1602f"],
  gold: ["--fish-gold", "#c9950c"],
  fx: ["--fx-ink", "rgba(255, 255, 255, 0.9)"],
  hand: ["--f-hand", "cursive"],
};

export function readFishColors(getVar) {
  const out = {};
  for (const [key, [name, fallback]] of Object.entries(TOKENS)) {
    const v = (getVar(name) || "").trim();
    out[key] = v || fallback;
  }
  return out;
}
