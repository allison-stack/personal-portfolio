import seeds from "../../content/combos.json";
import { normalizeName, comboKey, validateCombo } from "../../lib/combine-core";
import { checkRate } from "../../lib/rate-limit";

export const runtime = "edge";

const MODEL = "gemini-2.5-flash";
const CACHE_MAX = 500;
const cache = new Map();

function clientKey(req) {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "anon"
  );
}

function prompt(a, b) {
  return [
    "You are the combination engine for a science-themed crafting game (like Infinite Craft).",
    `Combine: "${a}" + "${b}".`,
    'Reply with ONLY a JSON object: {"result": string, "emoji": string, "fact": string}',
    "Rules:",
    "- result: the most intuitive real concept the two make together - a common noun, lowercase, 1-3 words, letters only. Never invent nonsense words.",
    "- emoji: exactly one emoji that best represents the result.",
    "- fact: a TRUE, verifiable, delightful science fun fact about the result, under 220 characters, plain sentence, no markdown. If unsure a fact is true, pick a different fact you are sure of.",
  ].join("\n");
}

async function askGemini(a, b, apiKey) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt(a, b) }] }],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.9,
        maxOutputTokens: 200,
        thinkingConfig: { thinkingBudget: 0 },
      },
    }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) return null;
  try {
    return validateCombo(JSON.parse(text));
  } catch {
    return null;
  }
}

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "bad json" }, { status: 400 });
  }
  const a = normalizeName(body?.a);
  const b = normalizeName(body?.b);
  if (!a || !b) {
    return Response.json({ error: "bad elements" }, { status: 400 });
  }

  const key = comboKey(a, b);
  if (seeds[key]) return Response.json({ combo: seeds[key] });
  if (cache.has(key)) return Response.json({ combo: cache.get(key) });

  const rate = checkRate("combine:" + clientKey(req));
  if (!rate.ok) {
    return Response.json(
      { combo: null, retryAfterSec: rate.retryAfterSec },
      { status: 429, headers: { "retry-after": String(rate.retryAfterSec) } }
    );
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return Response.json({ combo: null });

  let combo = null;
  try {
    combo = await askGemini(a, b, apiKey);
  } catch {
    combo = null;
  }
  if (combo) {
    if (cache.size >= CACHE_MAX) cache.delete(cache.keys().next().value);
    cache.set(key, combo);
  }
  return Response.json({ combo });
}
