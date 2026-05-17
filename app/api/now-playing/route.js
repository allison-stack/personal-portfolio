import { fetchTopTrack } from "../../lib/lastfm";

export const runtime = "edge";
export const revalidate = 1800;

export async function GET() {
  try {
    const track = await fetchTopTrack({ period: "7day" });
    return Response.json(
      { track },
      {
        headers: {
          "Cache-Control": "s-maxage=1800, stale-while-revalidate=3600",
        },
      }
    );
  } catch (err) {
    return Response.json(
      { track: null, error: String(err?.message ?? err) },
      { status: 200 }
    );
  }
}
