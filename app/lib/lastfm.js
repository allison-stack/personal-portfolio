const ENDPOINT = "https://ws.audioscrobbler.com/2.0/";

export async function fetchTopTrack({ period = "7day" } = {}) {
  const apiKey = process.env.LASTFM_API_KEY;
  const user = process.env.LASTFM_USERNAME;
  if (!apiKey || !user) throw new Error("missing lastfm env vars");

  const url =
    ENDPOINT +
    "?" +
    new URLSearchParams({
      method: "user.getTopTracks",
      user,
      api_key: apiKey,
      period,
      limit: "1",
      format: "json",
    }).toString();

  const res = await fetch(url);
  if (!res.ok) throw new Error(`lastfm ${res.status}`);
  const data = await res.json();
  const track = data?.toptracks?.track?.[0];
  if (!track) return null;
  return {
    name: track.name,
    artists: track.artist?.name ?? "",
    url: track.url ?? null,
    playcount: Number(track.playcount ?? 0),
  };
}
