// Whether calls are taken at a given instant, judged in Asia/Kolkata (business time, D-004) against the
// published "HH:MM" hours (D-024, C-031). Open from `open` inclusive to `close` exclusive.
const clock = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Kolkata",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

// Business dates on screen, in India time: "Wed 8 Oct" or "Wed 8 Oct, 11:59 PM".
const day = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata", weekday: "short", day: "numeric", month: "short" });
const time = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Kolkata", hour: "numeric", minute: "2-digit" });

export function formatIst(at: Date, withTime = false): string {
  const d = day.format(at).replace(",", "");
  return withTime ? `${d}, ${time.format(at)}` : d;
}

export function callsOpenAt(at: Date, hours: { open: string; close: string }): boolean {
  const now = clock.format(at); // "HH:MM" compares correctly as a string
  return now >= hours.open && now < hours.close;
}
