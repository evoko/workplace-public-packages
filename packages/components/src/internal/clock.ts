/**
 * Times of day as the time pickers take and give them, `HH:mm` (`09:30`, `21:30`), with no date or
 * time zone, written and read on the locale's clock, 12- or 24-hour. Hand written, from the
 * platform's own Intl, not a picker library.
 */

/** A time of day: its hour (0–23) and minute (0–59). */
export interface Time {
  hour: number;
  minute: number;
}

const pad = (n: number) => String(n).padStart(2, '0');

/** `09:30` to its time, or null where it is no time. */
export function parseHhmm(hhmm: string | null | undefined): Time | null {
  const m = /^(\d{2}):(\d{2})$/.exec(hhmm ?? '');
  if (!m) return null;
  const t = { hour: Number(m[1]), minute: Number(m[2]) };
  return t.hour < 24 && t.minute < 60 ? t : null;
}

/** A time as `HH:mm`, `09:30`. */
export const hhmmOf = (t: Time) => `${pad(t.hour)}:${pad(t.minute)}`;

/** Minutes from midnight, to compare and step times by. */
export const minutesOf = (t: Time) => t.hour * 60 + t.minute;

const at = (t: Time) => new Date(2000, 0, 1, t.hour, t.minute);

/** Whether the locale's clock runs to 12, with a morning and an afternoon. */
export const twelveHour = (locale?: string) =>
  ['h11', 'h12'].includes(
    new Intl.DateTimeFormat(locale, { hour: 'numeric' }).resolvedOptions()
      .hourCycle ?? '',
  );

/** A time as the locale writes it, `9:30 AM` or `21:30`: a field's words, a row's. */
export const timeWords = (t: Time, locale?: string) =>
  new Intl.DateTimeFormat(locale, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(at(t));

/** The locale's words for morning and afternoon, `AM` and `PM`, lower-cased and without dots. */
function periods(locale?: string): [string, string] {
  const period = (hour: number) =>
    new Intl.DateTimeFormat(locale, { hour: 'numeric', hour12: true })
      .formatToParts(at({ hour, minute: 0 }))
      .find((p) => p.type === 'dayPeriod')?.value ?? '';
  const plain = (s: string) => s.toLowerCase().replace(/[.\s]/g, '');
  return [plain(period(1)), plain(period(13))];
}

/**
 * A time typed on either clock (`9:30 AM`, `9.30pm`, `21:30`, `2130`, `9`), with the locale's
 * words for morning and afternoon or English's, to its time, or null where it is no time.
 */
export function parseTimeWords(text: string, locale?: string): Time | null {
  // Dots and spaces go: `9.30 p.m.` is `930pm`, which reads as 9:30 in the afternoon.
  let rest = text.toLowerCase().replace(/[.\s]/g, '');
  const [am, pm] = periods(locale);
  let afternoon: boolean | null = null;
  for (const [words, after] of [
    [am, false],
    [pm, true],
    ['am', false],
    ['pm', true],
    ['a', false],
    ['p', true],
  ] as const) {
    if (!words) continue;
    if (rest.endsWith(words) || rest.startsWith(words)) {
      rest = rest.endsWith(words)
        ? rest.slice(0, -words.length)
        : rest.slice(words.length);
      afternoon = after;
      break;
    }
  }
  const m =
    /^(\d{1,2})(?:[:h](\d{2}))?$/.exec(rest) ?? /^(\d{1,2})(\d{2})$/.exec(rest);
  if (!m) return null;
  let hour = Number(m[1]);
  const minute = m[2] === undefined ? 0 : Number(m[2]);
  if (minute > 59) return null;
  if (afternoon === null) return hour < 24 ? { hour, minute } : null;
  if (hour < 1 || hour > 12) return null;
  hour = (hour % 12) + (afternoon ? 12 : 0);
  return { hour, minute };
}

/** The times from `min` to `max` (the whole day by default), every `step` minutes from `min`. */
export function timesOf(
  step: number,
  min?: Time | null,
  max?: Time | null,
): Time[] {
  const out: Time[] = [];
  const last = max ? minutesOf(max) : 24 * 60 - 1;
  for (let m = min ? minutesOf(min) : 0; m <= last; m += Math.max(1, step))
    out.push({ hour: Math.floor(m / 60), minute: m % 60 });
  return out;
}
