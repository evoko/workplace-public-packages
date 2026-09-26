// The pickers' Playground words, read and written the same on both platforms (the web's
// stories/playground/dates.ts): a date control holds `YYYY-MM-DD`, a time control `HH:MM` on the
// 24-hour clock, and a month control a month's English name and its year (`April 2026`), as Figma
// writes them. Words that are none of these read as nothing, so the widget shows no choice rather
// than failing.

import 'package:flutter/material.dart';

String _pad(int n, [int width = 2]) => '$n'.padLeft(width, '0');

/// A real date, at midnight, from `YYYY-MM-DD`; null where the words are no date (`2026-02-30` is
/// none).
DateTime? dateOf(String text) {
  final m = RegExp(r'^(\d{4})-(\d{2})-(\d{2})$').firstMatch(text.trim());
  if (m == null) return null;
  final [year, month, day] = [for (var i = 1; i <= 3; i++) int.parse(m[i]!)];
  final date = DateTime(year, month, day);
  return date.year == year && date.month == month && date.day == day
      ? date
      : null;
}

/// A date's `YYYY-MM-DD`.
String isoOf(DateTime date) =>
    '${_pad(date.year, 4)}-${_pad(date.month)}-${_pad(date.day)}';

/// A time from `HH:MM` or `H:MM` on the 24-hour clock, or `H:MM AM` on the 12-hour one (Figma's
/// `12:00 AM` is 00:00); null where the words are no time.
TimeOfDay? timeOf(String text) {
  final m = RegExp(r'^(\d{1,2}):(\d{2})(?:\s*([AaPp])\.?[Mm]\.?)?$')
      .firstMatch(text.trim());
  if (m == null) return null;
  var hour = int.parse(m[1]!);
  final minute = int.parse(m[2]!);
  if (minute > 59) return null;
  if (m[3] case final period?) {
    if (hour < 1 || hour > 12) return null;
    hour = hour % 12 + (period.toLowerCase() == 'p' ? 12 : 0);
  } else if (hour > 23) {
    return null;
  }
  return TimeOfDay(hour: hour, minute: minute);
}

/// A time's `HH:MM`, on the 24-hour clock.
String hhmmOf(TimeOfDay time) => '${_pad(time.hour)}:${_pad(time.minute)}';

const _months = [
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

/// A month's first day from its English name, whole or its first three letters, and its year
/// (`April 2026`, `Apr 2026`); null where the words are no month.
DateTime? monthOf(String text) {
  final m = RegExp(r'^([A-Za-z]+)\.?\s+(\d{4})$').firstMatch(text.trim());
  if (m == null) return null;
  final name = m[1]!.toLowerCase();
  final index = _months.indexWhere(
    (month) => month == name || (name.length == 3 && month.startsWith(name)),
  );
  return index < 0 ? null : DateTime(int.parse(m[2]!), index + 1);
}
