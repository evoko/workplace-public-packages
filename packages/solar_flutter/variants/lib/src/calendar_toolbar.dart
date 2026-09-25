import 'package:flutter/material.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'controls.dart';

/// SolarCalendarToolbar, named as the web case is: Figma's range, its own previous, next and Today
/// buttons, and what Figma composes on the right: the sm Segmented Control with the six segments
/// its own check draws, and an sm secondary Button; in Figma's 1280 (it spans its view).
Widget buildCalendarToolbar(
  Map<String, dynamic> v,
  WidgetStatesController _, [
  Map<String, dynamic>? _,
]) => SizedBox(
  width: 1280,
  child: SolarCalendarToolbar(
    range: 'October 5 – 11, 2026',
    onPrevious: () {},
    onNext: () {},
    onToday: () {},
    views: segmentedControlOf(
      SolarSegmentedControlSize.sm,
      SolarSegmentedControlItemSize.sm,
    ),
    action: SolarButton(
      onPressed: () {},
      size: SolarButtonSize.sm,
      prio: SolarButtonPrio.secondary,
      child: const Text('New event'),
    ),
  ),
);
