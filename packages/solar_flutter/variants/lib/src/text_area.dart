import 'package:flutter/material.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'icon_button.dart';
import 'probes.dart';

/// SolarTextArea in one oracle variant, every part shown with Figma's own words: holding Figma's
/// placeholder where it is filled (the oracle's content), and showing it as the placeholder
/// otherwise; its count against Figma's 500; both Icon Buttons as Figma draws them (built as the
/// Icon Button check builds one); forced into a state through [states].
Widget buildTextArea(
  Map<String, dynamic> v,
  WidgetStatesController states, [
  Map<String, dynamic>? _,
]) {
  final props = v['props'] as Map<String, dynamic>;
  final layers = v['layers'] as Map<String, dynamic>;
  final content = ((v['content'] as List?) ?? const []).cast<String>();
  Widget button(String layer) {
    final b =
        (layers[layer] as Map<String, dynamic>)['variant']
            as Map<String, dynamic>;
    return buildIconButton({
      'props': {
        'size': b['size'],
        'shape': b['shape'],
        'prio': b['prio'],
        'disabled': b['state'] == 'disabled',
        'loading': false,
      },
    }, WidgetStatesController());
  }

  return SolarTextArea(
    size: enumNamed(SolarTextAreaSize.values, props['size'] as String),
    enabled: !(props['disabled'] as bool),
    error: props['error'] as bool,
    label: 'Label',
    mandatory: true,
    helper: 'Helper text',
    charCount: true,
    maxLength: 500,
    cta: button('cta'),
    attachment: button('attachment'),
    controller: TextEditingController(
      text: content.contains('value') ? 'Enter text...' : '',
    ),
    placeholder: 'Enter text...',
    statesController: states,
  );
}
