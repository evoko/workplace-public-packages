import 'package:flutter/material.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'probes.dart';

/// SolarAgendaRow in one oracle variant, named as the web case is: each state and density with
/// Figma's words and times, its dot in the recipe's colour (Figma binds it to
/// data/category/06/strong, which follows the mode where a sampled colour would not), and the
/// attendee Figma draws (an md Avatar with initials, in the purple its own check samples),
/// pressable so a hover is reached as a user reaches it, in Figma's 560 (it fills its list).
Widget buildAgendaRow(
  Map<String, dynamic> v,
  WidgetStatesController states, [
  Map<String, dynamic>? _,
]) {
  final props = v['props'] as Map<String, dynamic>;
  return SizedBox(
    width: 560,
    child: SolarAgendaRow(
      selected: props['selected'] == true,
      density: enumNamed(
        SolarAgendaRowDensity.values,
        props['density'] as String,
      ),
      title: 'Team standup',
      start: '9:00',
      end: '10:00',
      meta: 'Conference room A · 6 attendees',
      attendee: const SolarAvatar(
        size: SolarAvatarSize.md,
        type: SolarAvatarType.text,
        color: Color(0xFFF4EDFF),
        name: 'Dana Scully',
      ),
      onPressed: () {},
      statesController: states,
    ),
  );
}
