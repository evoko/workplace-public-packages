import 'package:flutter/material.dart';
import 'package:solar_flutter/solar_flutter.dart';

/// SolarCalendarDayCell in one oracle variant, named as the web case is: each state with Figma's
/// date and its three sample chips (blue, green and yellow), in Figma's 160 (it fills its column).
Widget buildCalendarDayCell(
  Map<String, dynamic> v,
  WidgetStatesController _, [
  Map<String, dynamic>? _,
]) {
  final props = v['props'] as Map<String, dynamic>;
  return SizedBox(
    width: 160,
    child: SolarCalendarDayCell(
      day: '15',
      today: props['today'] == true,
      selected: props['selected'] == true,
      todayColumn: props['todayColumn'] == true,
      otherMonth: props['otherMonth'] == true,
      children: [
        for (final category in [
          SolarEventChipCategory.blue,
          SolarEventChipCategory.green,
          SolarEventChipCategory.yellow,
        ])
          SolarEventChip(category: category, title: 'Event title'),
      ],
    ),
  );
}
