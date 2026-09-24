import 'package:flutter/material.dart';

/// A time typed on either clock (`9:30 AM`, `9.30pm`, `21:30`, `2130`, `9`), with the locale's
/// words for morning and afternoon ([MaterialLocalizations.anteMeridiemAbbreviation]) or
/// English's, to its time, or null where it is no time. MaterialLocalizations writes a time
/// ([MaterialLocalizations.formatTimeOfDay]) but reads none back; this is the time pickers' reading.
///
/// Hand written, like [SolarLayers]; the web's twin is `parseTimeWords` in the components'
/// `internal/clock.ts`.
TimeOfDay? parseSolarTime(String text, MaterialLocalizations l) {
  String plain(String s) => s.toLowerCase().replaceAll(RegExp(r'[.\s]'), '');
  // Dots and spaces go: `9.30 p.m.` is `930pm`, which reads as 9:30 in the afternoon.
  var rest = plain(text);
  bool? afternoon;
  for (final (words, after) in [
    (plain(l.anteMeridiemAbbreviation), false),
    (plain(l.postMeridiemAbbreviation), true),
    ('am', false),
    ('pm', true),
    ('a', false),
    ('p', true),
  ]) {
    if (words.isEmpty) continue;
    if (rest.endsWith(words)) {
      rest = rest.substring(0, rest.length - words.length);
    } else if (rest.startsWith(words)) {
      rest = rest.substring(words.length);
    } else {
      continue;
    }
    afternoon = after;
    break;
  }
  final m =
      RegExp(r'^(\d{1,2})(?:[:h](\d{2}))?$').firstMatch(rest) ??
      RegExp(r'^(\d{1,2})(\d{2})$').firstMatch(rest);
  if (m == null) return null;
  var hour = int.parse(m.group(1)!);
  final minute = m.group(2) == null ? 0 : int.parse(m.group(2)!);
  if (minute > 59) return null;
  if (afternoon == null) {
    return hour < 24 ? TimeOfDay(hour: hour, minute: minute) : null;
  }
  if (hour < 1 || hour > 12) return null;
  hour = hour % 12 + (afternoon ? 12 : 0);
  return TimeOfDay(hour: hour, minute: minute);
}

/// The times from [first] to [last] (the whole day by default), every [step] minutes from
/// [first]: a time picker's rows.
List<TimeOfDay> solarTimesOf(int step, {TimeOfDay? first, TimeOfDay? last}) {
  final end = last == null ? 24 * 60 - 1 : last.hour * 60 + last.minute;
  return [
    for (
      var m = first == null ? 0 : first.hour * 60 + first.minute;
      m <= end;
      m += step < 1 ? 1 : step
    )
      TimeOfDay(hour: m ~/ 60, minute: m % 60),
  ];
}
