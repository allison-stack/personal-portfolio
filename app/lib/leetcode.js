const QUERY = `
  query userPublicProfile($username: String!) {
    matchedUser(username: $username) {
      submitStatsGlobal {
        acSubmissionNum { difficulty count }
      }
      submissionCalendar
    }
  }
`;

const DAY = 86400;

function startOfUtcDay(date = new Date()) {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return Math.floor(d.getTime() / 1000);
}

function deriveWeekDelta(calendar, today) {
  let sum = 0;
  for (let i = 0; i < 7; i++) {
    sum += calendar[today - i * DAY] ?? 0;
  }
  return sum;
}

function deriveStreak(calendar, today) {
  let streak = 0;
  let day = today;
  // today counts only if there's a submission; otherwise the streak still runs
  // up through yesterday — being alive today doesn't break the streak.
  if ((calendar[day] ?? 0) > 0) {
    streak = 1;
    day -= DAY;
  } else {
    day -= DAY;
  }
  while ((calendar[day] ?? 0) > 0) {
    streak += 1;
    day -= DAY;
  }
  return streak;
}

export async function fetchLeetcodeStats(username) {
  const res = await fetch("https://leetcode.com/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": "Mozilla/5.0 (compatible; personal-portfolio)",
      Referer: `https://leetcode.com/u/${username}/`,
    },
    body: JSON.stringify({
      query: QUERY,
      variables: { username },
    }),
  });
  if (!res.ok) throw new Error(`leetcode ${res.status}`);
  const data = await res.json();
  const user = data?.data?.matchedUser;
  if (!user) throw new Error("user not found");

  const all = user.submitStatsGlobal?.acSubmissionNum?.find(
    (s) => s.difficulty === "All"
  );
  const solved = all?.count ?? 0;

  let calendar = {};
  try {
    calendar = JSON.parse(user.submissionCalendar ?? "{}");
  } catch {}

  const today = startOfUtcDay();
  return {
    solved,
    weekDelta: deriveWeekDelta(calendar, today),
    streak: deriveStreak(calendar, today),
  };
}
