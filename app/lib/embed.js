const MODEL = "gemini-embedding-001";

export async function embedText(text, apiKey) {
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
    const body = await res.text();
    throw new Error(`embed failed: ${res.status} ${body}`);
  }
  const data = await res.json();
  return data.embedding?.values;
}
