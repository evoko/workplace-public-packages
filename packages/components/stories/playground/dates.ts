/**
 * The pickers' Playground words, read and written the same on both platforms (Flutter's
 * widgetbook/lib/playground/dates.dart): a date control holds `YYYY-MM-DD`, a time control `HH:MM`
 * on the 24-hour clock, and a month control a month's English name and its year (`April 2026`), as
 * Figma writes them. Words that are none of these read as nothing, so the component shows no
 * choice rather than failing.
 */

const pad = (n: number, width = 2) => String(n).padStart(width, '0');

/** A real date's `YYYY-MM-DD`, or null where the words are no date (`2026-02-30` is none). */
export function isoDate(text: string): string | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text.trim());
  if (!m) return null;
  const [year, month, day] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
    ? `${pad(year, 4)}-${pad(month)}-${pad(day)}`
    : null;
}

/**
 * A time's `HH:MM`, from `HH:MM` or `H:MM` on the 24-hour clock or `H:MM AM` on the 12-hour one
 * (Figma's `12:00 AM` is `00:00`); null where the words are no time.
 */
export function hhmm(text: string): string | null {
  const m = /^(\d{1,2}):(\d{2})(?:\s*([AaPp])\.?[Mm]\.?)?$/.exec(text.trim());
  if (!m) return null;
  let hour = Number(m[1]);
  const minute = Number(m[2]);
  if (minute > 59) return null;
  if (m[3]) {
    if (hour < 1 || hour > 12) return null;
    hour = (hour % 12) + (m[3].toLowerCase() === 'p' ? 12 : 0);
  } else if (hour > 23) return null;
  return `${pad(hour)}:${pad(minute)}`;
}

const MONTHS = [
  'january',
  'february',
  'march',
  'april',
  'may',
  'june',
  'july',
  'august',
  'september',
  'october',
  'november',
  'december',
];

/**
 * A month's first day, `YYYY-MM-01`, from its English name, whole or its first three letters, and
 * its year (`April 2026`, `Apr 2026`); null where the words are no month.
 */
export function monthStart(text: string): string | null {
  const m = /^([A-Za-z]+)\.?\s+(\d{4})$/.exec(text.trim());
  if (!m) return null;
  const name = m[1].toLowerCase();
  const index = MONTHS.findIndex(
    (month) => month === name || (name.length === 3 && month.startsWith(name)),
  );
  return index < 0 ? null : `${m[2]}-${pad(index + 1)}-01`;
}
