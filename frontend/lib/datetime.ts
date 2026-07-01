/** Application display timezone (US Eastern — EST/EDT). */
export const APP_TIMEZONE = "America/New_York";
export const APP_LOCALE = "en-US";

export function parseAppDate(value: string | Date | null | undefined): Date | null {
  if (value == null || value === "") return null;
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

const dateFormatter = new Intl.DateTimeFormat(APP_LOCALE, {
  timeZone: APP_TIMEZONE,
  year: "numeric",
  month: "short",
  day: "2-digit",
});

const dateTimeFormatter = new Intl.DateTimeFormat(APP_LOCALE, {
  timeZone: APP_TIMEZONE,
  year: "numeric",
  month: "short",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

const dateLongFormatter = new Intl.DateTimeFormat(APP_LOCALE, {
  timeZone: APP_TIMEZONE,
  month: "long",
  day: "numeric",
  year: "numeric",
});

const timeFormatter = new Intl.DateTimeFormat(APP_LOCALE, {
  timeZone: APP_TIMEZONE,
  hour: "numeric",
  minute: "2-digit",
  timeZoneName: "short",
});

/** Short date in Eastern Time, e.g. `May 22, 2026`. */
export function formatDateET(
  value: string | Date | null | undefined,
  fallback = "—"
): string {
  const d = parseAppDate(value);
  if (!d) return fallback;
  return dateFormatter.format(d);
}

/** Date + time in Eastern Time, e.g. `May 22, 2026, 7:05 PM EST`. */
export function formatDateTimeET(
  value: string | Date | null | undefined,
  fallback = "—"
): string {
  const d = parseAppDate(value);
  if (!d) return fallback;
  return dateTimeFormatter.format(d);
}

/** Long date + time in Eastern Time, e.g. `May 22, 2026 at 7:05 PM EST`. */
export function formatDateTimeLongET(
  value: string | Date | null | undefined,
  fallback = "—"
): string {
  const d = parseAppDate(value);
  if (!d) return fallback;
  return `${dateLongFormatter.format(d)} at ${timeFormatter.format(d)}`;
}

/** Format an existing `Date` in Eastern Time (calendar pickers, ranges). */
export function formatDateObjectET(d: Date, fallback = "—"): string {
  if (Number.isNaN(d.getTime())) return fallback;
  return dateFormatter.format(d);
}

/**
 * Format a `YYYY-MM-DD` calendar value for display in Eastern Time without
 * shifting the selected day (uses noon UTC as anchor).
 */
export function formatYmdAsDateET(ymd: string, fallback = "—"): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(ymd)) return fallback;
  const [y, m, d] = ymd.split("-").map((n) => parseInt(n, 10));
  const anchor = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  return dateFormatter.format(anchor);
}

/** Get the date portion of a timestamp converted to Eastern Time (e.g., `Mon May 22 2026`). */
export function getDateStringInET(value: string | Date | null | undefined): string | null {
  const d = parseAppDate(value);
  if (!d) return null;
  const formatter = new Intl.DateTimeFormat(APP_LOCALE, {
    timeZone: APP_TIMEZONE,
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
  return formatter.format(d);
}

/** Get today's date in Eastern Time as a comparable date string. */
export function getTodayDateStringInET(): string {
  const formatter = new Intl.DateTimeFormat(APP_LOCALE, {
    timeZone: APP_TIMEZONE,
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
  return formatter.format(new Date());
}

/** Get yesterday's date in Eastern Time as a comparable date string. */
export function getYesterdayDateStringInET(): string {
  const formatter = new Intl.DateTimeFormat(APP_LOCALE, {
    timeZone: APP_TIMEZONE,
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return formatter.format(yesterday);
}
