export function torontoHour() {
  return Number(
    new Intl.DateTimeFormat("en-CA", {
      hour: "numeric",
      hour12: false,
      timeZone: "America/Toronto",
    }).format(new Date())
  );
}

export function isNightHour(h) {
  return h >= 23 || h < 7;
}
