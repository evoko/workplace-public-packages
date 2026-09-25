import 'package:flutter/material.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'probes.dart';

/// SolarTokenInput in one oracle variant: Figma's words, and as many entries as the variant
/// draws Tags, one more where it draws the Counter of the rest; typing Figma's words where it
/// draws it active; forced into a state through [states].
Widget buildTokenInput(
  Map<String, dynamic> v,
  WidgetStatesController states, [
  Map<String, dynamic>? _,
]) {
  final props = v['props'] as Map<String, dynamic>;
  final layers = v['layers'] as Map<String, dynamic>;
  final content = ((v['content'] as List?) ?? const []).cast<String>();
  bool drawn(String layer) =>
      layers[layer] != null &&
      (layers[layer] as Map<String, dynamic>)['hidden'] != true;
  final tags = ['tag', 'tag2'].where(drawn).length;
  return SolarTokenInput(
    size: enumNamed(SolarTokenInputSize.values, props['size'] as String),
    enabled: !(props['disabled'] as bool),
    error: props['error'] as bool,
    readonly: props['readonly'] as bool,
    label: 'Label',
    mandatory: true,
    helper: 'Helper text',
    value: [
      for (var i = 0; i < tags; i++) 'Label',
      if (drawn('counter')) 'More',
    ],
    maxVisible: tags,
    onChanged: (_) {},
    controller: TextEditingController(
      text: content.contains('inputValue') ? 'Add items…' : '',
    ),
    placeholder: 'Add items…',
    statesController: states,
  );
}
