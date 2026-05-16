import { qa } from "../../content/qa";
import { embedText } from "../../lib/embed";
import { bestMatch } from "../../lib/similarity";
import { checkRate } from "../../lib/rate-limit";
import embeddings from "../../content/qa-embeddings.json";

export const runtime = "edge";

const THRESHOLD = 0.72;

function clientKey(req) {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "anon"
  );
}

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "bad json" }, { status: 400 });
  }
  const q = (body?.q ?? "").toString().trim().slice(0, 500);
  if (!q) return Response.json({ error: "empty question" }, { status: 400 });

  const rate = checkRate(clientKey(req));
  if (!rate.ok) {
    return Response.json(
      { error: "rate limited", retryAfterSec: rate.retryAfterSec },
      { status: 429, headers: { "retry-after": String(rate.retryAfterSec) } }
    );
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "server not configured" }, { status: 500 });
  }

  let qVec;
  try {
    qVec = await embedText(q, apiKey);
  } catch {
    return Response.json({ error: "embed failed" }, { status: 502 });
  }

  const entries = embeddings.entries.map((e) => ({
    id: e.id,
    vector: e.vector,
    a: qa.find((row) => row.id === e.id)?.a,
  }));

  const { score, entry } = bestMatch(qVec, entries);
  if (!entry || score < THRESHOLD) {
    return Response.json({ answer: null, score });
  }
  return Response.json({ answer: entry.a, id: entry.id, score });
}
