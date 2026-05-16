// Regenerates app/content/qa-embeddings.json from app/content/qa.js.
// Usage: GEMINI_API_KEY=... node scripts/embed-qa.mjs

import { writeFile, readFile } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const MODEL = "gemini-embedding-001";

function loadDotEnv() {
  for (const name of [".env.local", ".env"]) {
    const path = resolve(ROOT, name);
    if (!existsSync(path)) continue;
    for (const line of readFileSync(path, "utf8").split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/i);
      if (!m) continue;
      const [, k, raw] = m;
      if (process.env[k]) continue;
      process.env[k] = raw.replace(/^['"]|['"]$/g, "");
    }
  }
}
loadDotEnv();

async function loadQa() {
  const src = await readFile(resolve(ROOT, "app/content/qa.js"), "utf8");
  const mod = await import("data:text/javascript," + encodeURIComponent(src));
  return mod.qa;
}

async function embedText(text, apiKey) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:embedContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      model: `models/${MODEL}`,
      content: { parts: [{ text }] },
    }),
  });
  if (!res.ok) {
    throw new Error(`embed failed ${res.status}: ${await res.text()}`);
  }
  const data = await res.json();
  return data.embedding.values;
}

async function main() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("missing GEMINI_API_KEY");
    process.exit(1);
  }

  const qa = await loadQa();
  console.log(`embedding ${qa.length} entries...`);

  const entries = [];
  for (const row of qa) {
    const text = [row.q, ...(row.aliases ?? [])].join(" · ");
    process.stdout.write(`  ${row.id} ... `);
    const vector = await embedText(text, apiKey);
    entries.push({ id: row.id, text, vector });
    console.log(`ok (${vector.length}d)`);
    await new Promise((r) => setTimeout(r, 50));
  }

  const out = {
    model: MODEL,
    generatedAt: new Date().toISOString(),
    entries,
  };
  await writeFile(
    resolve(ROOT, "app/content/qa-embeddings.json"),
    JSON.stringify(out, null, 2) + "\n",
  );
  console.log(`wrote app/content/qa-embeddings.json (${entries.length} entries)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
