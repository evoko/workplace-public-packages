import 'package:flutter/material.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'button.dart';
import 'probes.dart';

/// SolarInsightRow in one oracle variant, named as the web case is: Figma's words and its Button,
/// pressable so a hover is forced through [states]; as wide as Figma draws it.
Widget buildInsightRow(
  Map<String, dynamic> v,
  WidgetStatesController states, [
  Map<String, dynamic>? _,
]) {
  final props = v['props'] as Map<String, dynamic>;
  final layers = v['layers'] as Map<String, dynamic>;
  final b =
      ((layers['action'] as Map<String, dynamic>?)?['variant']
          as Map<String, dynamic>?) ??
      const {'size': 'sm', 'prio': 'secondary', 'danger': 'false'};
  return SizedBox(
    width: 480,
    child: SolarInsightRow(
      severity: enumNamed(
        SolarInsightRowSeverity.values,
        props['severity'] as String,
      ),
      loading: props['loading'] as bool,
      title: 'Title',
      meta: 'Detail · Detail · Detail',
      action: buildButton({
        'props': {
          'size': b['size'],
          'prio': b['prio'],
          'danger': b['danger'] == 'true',
          'disabled': false,
          'loading': false,
        },
      }, WidgetStatesController()),
      onPressed: () {},
      statesController: states,
    ),
  );
}
