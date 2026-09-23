import 'package:flutter/material.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'button.dart';
import 'probes.dart';

/// SolarButtonGroup in one oracle variant, holding the Buttons Figma draws in it, in its order,
/// each built as the Button check builds one (its probes included) and keyed by its layer: every
/// one shown, and every one a prop shows though Figma hides it at rest (the tertiary). A Button's
/// Figma `prio` is its `variant` prop.
Widget buildButtonGroup(
  Map<String, dynamic> v,
  WidgetStatesController states, [
  Map<String, dynamic>? oracle,
]) {
  final props = v['props'] as Map<String, dynamic>;
  final layers = (v['layers'] as Map<String, dynamic>?) ?? const {};
  final slots = ((oracle?['slots'] as Map?) ?? const {}).keys.toSet();
  final atRest =
      ((oracle?['variants'] as List?)?.first
              as Map<String, dynamic>?)?['layers']
          as Map<String, dynamic>?;
  final children = <Widget>[
    for (final MapEntry(key: name, value: l) in layers.entries)
      if ((l as Map<String, dynamic>)['component'] == 'Button' &&
          (l['hidden'] != true ||
              (slots.contains(name) &&
                  (atRest?[name] as Map<String, dynamic>?)?['hidden'] == true)))
        KeyedSubtree(
          key: Key(name),
          child: buildButton({
            'props': {
              'size': l['variant']['size'],
              'variant': l['variant']['prio'],
              'danger': l['variant']['danger'] == 'true',
              'disabled': false,
              'loading': false,
            },
          }, WidgetStatesController()),
        ),
  ];
  // Room for three Buttons with every probe (both icons, a counter): the group fills whatever it is
  // given, and no width of it is compared.
  return SizedBox(
    width: 720,
    child: SolarButtonGroup(
      orientation: enumNamed(
        SolarButtonGroupOrientation.values,
        props['orientation'] as String,
      ),
      fullWidth: props['fullWidth'] as bool,
      children: children,
    ),
  );
}
