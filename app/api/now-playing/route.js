import { fetchNowPlaying } from "../../lib/lastfm";

export const runtime = "edge";

export async function GET() {
  try {
    const { isPlaying, track } = await fetchNowPlaying();
    return Response.json(
      { isPlaying, track },
      {
        headers: {
          "Cache-Control": "s-maxage=30, stale-while-revalidate=60",
        },
      }
    );
  } catch (err) {
    return Response.json(
      { isPlaying: false, track: null, error: String(err?.message ?? err) },
      { status: 200 }
    );
  }
}
