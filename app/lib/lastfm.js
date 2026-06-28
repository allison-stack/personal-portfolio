const ENDPOINT = "https://ws.audioscrobbler.com/2.0/";

function params(method, extra = {}) {
  const apiKey = process.env.LASTFM_API_KEY;
  const user = process.env.LASTFM_USERNAME;
  if (!apiKey || !user) throw new Error("missing lastfm env vars");
  return new URLSearchParams({ method, user, api_key: apiKey, format: "json", ...extra });
}

export async function fetchTopTrack({ period = "7day" } = {}) {
  const res = await fetch(`${ENDPOINT}?${params("user.getTopTracks", { period, limit: "1" })}`);
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

export async function fetchNowPlaying() {
  const res = await fetch(`${ENDPOINT}?${params("user.getRecentTracks", { limit: "1" })}`);
  if (!res.ok) throw new Error(`lastfm ${res.status}`);
  const data = await res.json();
  const track = data?.recenttracks?.track?.[0];
  if (!track) return { isPlaying: false, track: null };
  const isPlaying = track["@attr"]?.nowplaying === "true";
  return {
    isPlaying,
    track: {
      name: track.name,
      artist: track.artist?.["#text"] ?? "",
      url: track.url ?? null,
    },
  };
}
