export function formatRelativeTime(value: string | null | undefined, fallback = "—"): string {
  if (!value) return fallback;

  const target = new Date(value);
  if (Number.isNaN(target.getTime())) {
    return fallback;
  }

  const diffMs = target.getTime() - Date.now();
  const absMs = Math.abs(diffMs);

  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  if (absMs < minute) {
    return formatter.format(Math.round(diffMs / 1000), "second");
  }
  if (absMs < hour) {
    return formatter.format(Math.round(diffMs / minute), "minute");
  }
  if (absMs < day) {
    return formatter.format(Math.round(diffMs / hour), "hour");
  }
  return formatter.format(Math.round(diffMs / day), "day");
}


