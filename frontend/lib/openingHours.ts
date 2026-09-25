export interface OpeningHour {
  dayOfWeek: number;
  isClosed: boolean;
  openTime: string | null;
  closeTime: string | null;
}

export const WEEK_DAYS: { dayOfWeek: number; label: string; shortLabel: string }[] = [
  { dayOfWeek: 1, label: "Monday", shortLabel: "Mon" },
  { dayOfWeek: 2, label: "Tuesday", shortLabel: "Tue" },
  { dayOfWeek: 3, label: "Wednesday", shortLabel: "Wed" },
  { dayOfWeek: 4, label: "Thursday", shortLabel: "Thu" },
  { dayOfWeek: 5, label: "Friday", shortLabel: "Fri" },
  { dayOfWeek: 6, label: "Saturday", shortLabel: "Sat" },
  { dayOfWeek: 7, label: "Sunday", shortLabel: "Sun" },
];

export function defaultOpeningHours(): OpeningHour[] {
  return WEEK_DAYS.map(({ dayOfWeek }) => {
    const weekend = dayOfWeek >= 6;
    return {
      dayOfWeek,
      isClosed: weekend,
      openTime: weekend ? null : "09:00",
      closeTime: weekend ? null : "17:00",
    };
  });
}

function toHHmm(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (/^\d{2}:\d{2}/.test(trimmed)) {
    return trimmed.slice(0, 5);
  }
  return trimmed;
}

export function normalizeOpeningHours(hours?: OpeningHour[] | null): OpeningHour[] {
  const byDay = new Map<number, OpeningHour>();
  (hours ?? []).forEach((hour) => {
    if (hour?.dayOfWeek >= 1 && hour.dayOfWeek <= 7) {
      byDay.set(hour.dayOfWeek, {
        dayOfWeek: hour.dayOfWeek,
        isClosed: Boolean(hour.isClosed),
        openTime: toHHmm(hour.openTime),
        closeTime: toHHmm(hour.closeTime),
      });
    }
  });

  return defaultOpeningHours().map((fallback) => {
    const existing = byDay.get(fallback.dayOfWeek);
    if (!existing) return fallback;
    if (existing.isClosed) {
      return { ...existing, openTime: existing.openTime ?? "09:00", closeTime: existing.closeTime ?? "17:00" };
    }
    return {
      ...existing,
      openTime: existing.openTime ?? "09:00",
      closeTime: existing.closeTime ?? "17:00",
    };
  });
}

/** ISO weekday: 1 = Monday … 7 = Sunday */
export function currentIsoWeekday(date = new Date()): number {
  const jsDay = date.getDay();
  return jsDay === 0 ? 7 : jsDay;
}

export function formatClockTime(value: string | null | undefined): string {
  const hhmm = toHHmm(value);
  if (!hhmm) return "";
  const [hourStr, minuteStr] = hhmm.split(":");
  const hour = Number(hourStr);
  const minute = Number(minuteStr);
  if (Number.isNaN(hour) || Number.isNaN(minute)) return hhmm;
  const period = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12}:${minute.toString().padStart(2, "0")} ${period}`;
}

export function formatOpeningHourRange(hour: OpeningHour): string {
  if (hour.isClosed) return "Closed";
  const open = formatClockTime(hour.openTime);
  const close = formatClockTime(hour.closeTime);
  if (!open || !close) return "Closed";
  return `${open} – ${close}`;
}

export function validateOpeningHours(hours: OpeningHour[]): string | null {
  if (hours.length !== 7) {
    return "Opening hours must include all 7 days of the week.";
  }

  const seen = new Set<number>();
  for (const hour of hours) {
    if (hour.dayOfWeek < 1 || hour.dayOfWeek > 7 || seen.has(hour.dayOfWeek)) {
      return "Each weekday must appear exactly once.";
    }
    seen.add(hour.dayOfWeek);

    if (hour.isClosed) continue;

    if (!hour.openTime || !hour.closeTime) {
      return "Open and close times are required for days that are open.";
    }
    if (hour.closeTime <= hour.openTime) {
      return "Close time must be after open time.";
    }
  }

  return null;
}

export function toOpeningHoursPayload(hours: OpeningHour[]): OpeningHour[] {
  return hours.map((hour) => ({
    dayOfWeek: hour.dayOfWeek,
    isClosed: hour.isClosed,
    openTime: hour.isClosed ? null : toHHmm(hour.openTime),
    closeTime: hour.isClosed ? null : toHHmm(hour.closeTime),
  }));
}
