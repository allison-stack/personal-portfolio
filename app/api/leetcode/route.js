import { fetchLeetcodeStats } from "../../lib/leetcode";
import { links } from "../../content/links";

export const runtime = "edge";
export const revalidate = 1800;

export async function GET() {
  try {
    const stats = await fetchLeetcodeStats(links.leetcode);
    return Response.json(
      { stats },
      {
        headers: {
          "Cache-Control": "s-maxage=1800, stale-while-revalidate=3600",
        },
      }
    );
  } catch (err) {
    return Response.json(
      { stats: null, error: String(err?.message ?? err) },
      { status: 200 }
    );
  }
}
