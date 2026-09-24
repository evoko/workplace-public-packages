/**
 * A month's weeks and the ISO dates (`2026-04-24`) the date pickers take and give, which carry no
 * time zone: a date is a day, not an instant. Hand written, from the platform's own calendar
 * (Date, Intl), not a picker library.
 */

/** A day: its year, month (1–12) and day of the month. */
export interface Day {
  year: number;
  month: number;
  day: number;
}

/** `2026-04-24` to its day, or null where it is no date. */
export function parseIso(iso: string | null | undefined): Day | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso ?? '');
  if (!m) return null;
  const d = { year: Number(m[1]), month: Number(m[2]), day: Number(m[3]) };
  return isoOf(dateOf(d)) === iso ? d : null;
}

/** A day as the local Date of its midnight, for the platform's calendar. */
export const dateOf = (d: Day) => new Date(d.year, d.month - 1, d.day);

/** A local Date's day. */
export const dayOf = (date: Date): Day => ({
  year: date.getFullYear(),
  month: date.getMonth() + 1,
  day: date.getDate(),
});

const pad = (n: number, width = 2) => String(n).padStart(width, '0');

/** A day as ISO, `2026-04-24`. */
export const isoOf = (date: Date) =>
  `${pad(date.getFullYear(), 4)}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

/** The day n days on (or back). */
export const addDays = (d: Day, n: number): Day =>
  dayOf(new Date(d.year, d.month - 1, d.day + n));

/** The same day n months on, kept inside a shorter month (31 January + 1 is 28 February). */
export function addMonths(d: Day, n: number): Day {
  const first = new Date(d.year, d.month - 1 + n, 1);
  const last = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  return { ...dayOf(first), day: Math.min(d.day, last) };
}

/**
 * The locale's first day of the week, 0 for Sunday to 6 for Saturday, where the platform knows it
 * (Intl.Locale's week info), and Monday otherwise, as Figma draws the week.
 */
export function firstWeekday(locale?: string): number {
  try {
    const l = new Intl.Locale(locale ?? navigator.language) as Intl.Locale & {
      getWeekInfo?: () => { firstDay: number };
      weekInfo?: { firstDay: number };
    };
    const first = (l.getWeekInfo?.() ?? l.weekInfo)?.firstDay;
    if (first !== undefined) return first % 7;
  } catch {
    // No locale to read: Monday.
  }
  return 1;
}

/** A month's weeks: every day from the week its first day is in to the week its last is in. */
export function weeksOf(
  year: number,
  month: number,
  weekStartsOn: number,
): Day[][] {
  const first = new Date(year, month - 1, 1);
  const lead = (first.getDay() - weekStartsOn + 7) % 7;
  const days = new Date(year, month, 0).getDate();
  const count = Math.ceil((lead + days) / 7) * 7;
  const weeks: Day[][] = [];
  for (let i = 0; i < count; i++) {
    if (i % 7 === 0) weeks.push([]);
    weeks[weeks.length - 1].push(
      dayOf(new Date(year, month - 1, 1 - lead + i)),
    );
  }
  return weeks;
}

/** The weekday names, from the week's first day, as the locale writes them short, two letters. */
export function weekdayNames(weekStartsOn: number, locale?: string): string[] {
  const f = new Intl.DateTimeFormat(locale, { weekday: 'short' });
  // 2026-09-06 is a Sunday.
  return Array.from({ length: 7 }, (_, i) =>
    f.format(new Date(2026, 8, 6 + ((weekStartsOn + i) % 7))).slice(0, 2),
  );
}

/** A month as the locale writes it, `April 2026`. */
export const monthName = (year: number, month: number, locale?: string) =>
  new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(
    new Date(year, month - 1, 1),
  );

/** A day as the locale writes it whole, `Friday, 24 April 2026`, for a screen reader. */
export const fullDate = (d: Day, locale?: string) =>
  new Intl.DateTimeFormat(locale, { dateStyle: 'full' }).format(dateOf(d));

/** A day as the locale writes it in figures, `24/04/2026`, a field's words. */
export const shortDate = (d: Day, locale?: string) =>
  new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(dateOf(d));

/**
 * Figures typed in the locale's order (`24/04/2026`, `04/24/2026` in the US, `2026-04-24`),
 * with any separator, to their day, or null where they are no date.
 */
export function parseShortDate(text: string, locale?: string): Day | null {
  const figures = text
    .trim()
    .split(/[^0-9]+/)
    .filter(Boolean)
    .map(Number);
  if (figures.length !== 3) return null;
  const order = new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
    .formatToParts(new Date(2026, 3, 24))
    .map((p) => p.type)
    .filter((t) => t === 'day' || t === 'month' || t === 'year');
  const got: Record<string, number> = {};
  order.forEach((t, i) => (got[t] = figures[i]));
  const d = { year: got.year, month: got.month, day: got.day };
  if (d.year < 100) d.year += 2000;
  // A date the calendar has: 31 April is none.
  const date = dateOf(d);
  return date.getFullYear() === d.year &&
    date.getMonth() === d.month - 1 &&
    date.getDate() === d.day
    ? d
    : null;
}
