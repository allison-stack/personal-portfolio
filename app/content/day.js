// Daily schedule. `start` is a 24h "HH:MM" string in the OWNER's local timezone
// (links.js#timezone). Each block runs until the next one's start time. Order
// matters — sorted by start time within a day.
export const day = [
  { start: "00:00", label: "asleep",            activity: "asleep right now" },
  { start: "07:30", label: "wake",              activity: "just woken up"     },
  { start: "08:00", label: "commute · in",      activity: "on my morning commute" },
  { start: "10:00", label: "work",              activity: "in a deep work block" },
  { start: "18:00", label: "commute · home",    activity: "on my commute home" },
  { start: "20:00", label: "building stuff",    activity: "tinkering on side projects" },
  { start: "23:30", label: "winding down",      activity: "winding down for the day" },
];
