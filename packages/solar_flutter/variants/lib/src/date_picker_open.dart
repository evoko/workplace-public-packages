import 'package:flutter/material.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'probes.dart';

/// The days Figma draws in each grid (`dayGrid`, a double's two), in its order, with their
/// variant.
Map<String, List<(String, Map<String, dynamic>)>> _grids(
  Map<String, dynamic> layers,
) {
  final out = <String, List<(String, Map<String, dynamic>)>>{};
  for (final MapEntry(key: name, value: l) in layers.entries) {
    if ((l as Map<String, dynamic>)['component'] != 'Date Picker Day Cell') {
      continue;
    }
    final grid = name.replaceFirst(RegExp(r'DayCell\d*$'), '');
    (out[grid] ??= []).add((name, l['variant'] as Map<String, dynamic>));
  }
  return out;
}

/// SolarDatePickerOpen in one oracle variant, named as the web case is: Figma's month, April
/// 2026, its weeks from Monday as Figma's start, and May beside it in a double. Each day is keyed
/// by its layer and drawn in the state and range role Figma draws that layer in: a double's May is
/// a copy of April's grid in Figma, not May's days, and its range is Figma's, drawn by the cells'
/// own prop, as the calendar chooses one date.
Widget buildDatePickerOpen(
  Map<String, dynamic> v,
  WidgetStatesController states, [
  Map<String, dynamic>? _,
]) {
  final props = v['props'] as Map<String, dynamic>;
  final layers = (v['layers'] as Map<String, dynamic>?) ?? const {};
  final days = _grids(layers);
  final type = enumNamed(
    SolarDatePickerOpenType.values,
    props['type'] as String,
  );
  final double = type == SolarDatePickerOpenType.double;
  return SolarDatePickerOpen(
    inline: props['inline'] as bool,
    type: type,
    initialMonth: DateTime(2026, 4),
    weekStartsOn: 1,
    onChanged: (_) {},
    dayBuilder: (day, month, cell) {
      final grid = month.month == 5
          ? 'container2DayGrid'
          : double
          ? 'containerDayGrid'
          : 'dayGrid';
      final lead = (month.weekday - 1) % 7;
      final at = DateTime.utc(
        day.year,
        day.month,
        day.day,
      ).difference(DateTime.utc(month.year, month.month, 1 - lead)).inDays;
      final list = days[grid] ?? const [];
      if (at >= list.length) return cell;
      final (layer, variant) = list[at];
      final state = variant['state'];
      return KeyedSubtree(
        key: ValueKey(layer),
        child: SolarDatePickerDayCell(
          label: cell.label,
          semanticLabel: cell.semanticLabel,
          selected: state == 'selected',
          today: state == 'today',
          disabled: state == 'disabled',
          rangeRole: enumNamed(
            SolarDatePickerDayCellRangeRole.values,
            variant['range-role'] as String,
            (r) => r.figma,
          ),
          focusNode: cell.focusNode,
          onPressed: cell.onPressed,
        ),
      );
    },
  );
}
