const TOKENS = {
  ink: ["--fish-ink", "#2e5a5e"],
  koi: ["--fish-koi", "#d1602f"],
  gold: ["--fish-gold", "#c9950c"],
  fx: ["--fx-ink", "rgba(255, 255, 255, 0.9)"],
  hand: ["--f-hand", "cursive"],
  xsep: ["--xray-sep", "#e07b2f"],
  xali: ["--xray-ali", "#2f6fb2"],
  xcoh: ["--xray-coh", "#3f8f5f"],
  xyou: ["--xray-you", "#c2273d"],
};

export function readFishColors(getVar) {
  const out = {};
  for (const [key, [name, fallback]] of Object.entries(TOKENS)) {
    const v = (getVar(name) || "").trim();
    out[key] = v || fallback;
  }
  return out;
}
